const cron = require('node-cron');
const sql = require('mssql');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const dbConfig = require('./dbConfig');
// Transporter removed as we are using Resend directly inside the function

// Function to generate PDF and send email
const generateAndSendReport = async () => {
    console.log(`[CRON] Starting daily report generation at ${new Date().toISOString()}...`);
    let pool;
    try {
        pool = await sql.connect(dbConfig);

        // Calculate 'Yesterday' and 'Today' based on IST Timezone
        // We want the report for the previous full day (00:00 to 23:59)
        const now = new Date();

        // Get IST time string
        const istOptions = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };

        // Setup "Yesterday"
        const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Subtract 24 hours
        // Format to YYYY-MM-DD using IST
        // Note: Intl.DateTimeFormat parts can be tricky, let's use a simpler approach if environment allows, 
        // but robust way is getting parts.
        // Actually, since we are moving the execution time to 6 AM, 'now' is Today 6 AM.
        // So 'Yesterday' is strictly Date - 1 Day.

        // Helper to format date as YYYY-MM-DD in IST
        const getISTDateString = (dateObj) => {
            return dateObj.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // en-CA gives YYYY-MM-DD
        };

        const todayIST = getISTDateString(now); // e.g., "2026-01-10"
        const yesterdayIST = getISTDateString(yesterdayDate); // e.g., "2026-01-09"

        console.log(`[CRON] Fetching report for Date Range: ${yesterdayIST} 00:00:00 to ${todayIST} 00:00:00 (IST)`);

        // Fetch users who haven't been reported yet
        // Using string literals for dates ensures server timezone settings don't shift the window
        const result = await pool.request().query(`
            SELECT * FROM FME_logins.users 
            WHERE created_at >= CAST('${yesterdayIST}' AS DATE)
            AND created_at < CAST('${todayIST}' AS DATE)
            AND (is_reported = 0 OR is_reported IS NULL)
            ORDER BY created_at DESC
        `);
        const users = result.recordset;

        if (users.length === 0) {
            console.log('[CRON] No new unreported users found.');
            return;
        }

        const userIds = users.map(u => u.id || u.ID || u.Id).filter(id => id != null);
        console.log('[CRON] User IDs to update:', userIds);

        // Create PDF
        const doc = new PDFDocument({ margin: 30 });
        const filePath = path.join(__dirname, `report_${Date.now()}.pdf`);
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // PDF Header
        doc.fontSize(20).text('FME Application - New User Entries', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()} `, { align: 'right' });
        doc.moveDown();

        // Table Header
        const headers = ['S.No', 'Name', 'Email', 'Phone', 'Final Marks', 'Location'];
        const colWidths = [30, 90, 140, 80, 60, 135];
        let x = 30;
        let y = doc.y;

        doc.font('Helvetica-Bold');
        headers.forEach((header, i) => {
            doc.text(header, x, y, { width: colWidths[i] });
            x += colWidths[i];
        });
        doc.moveDown();
        doc.moveTo(30, doc.y).lineTo(565, doc.y).stroke();
        doc.moveDown(0.5);

        // Table Rows
        doc.font('Helvetica');
        users.forEach((user, index) => {
            // Check for page break
            if (doc.y > 720) {
                doc.addPage();
            }

            const startY = doc.y;
            let maxRowY = startY;
            x = 30;

            const rowData = [
                String(index + 1), // Serial Number
                user.name || 'N/A',
                user.email || 'N/A',
                user.phone_number || 'N/A',
                user.finalMarks !== null && user.finalMarks !== undefined ? String(user.finalMarks) : '-',
                user.location_link || 'N/A'
            ];

            rowData.forEach((text, i) => {
                doc.text(text, x, startY, { width: colWidths[i] });
                if (doc.y > maxRowY) {
                    maxRowY = doc.y;
                }
                x += colWidths[i];
            });

            doc.y = maxRowY;
            doc.moveDown(0.5);
        });

        doc.end();

        // Wait for PDF to finish writing
        stream.on('finish', async () => {
            try {
                // Send Email
                // Send Email via Resend
                const { Resend } = require('resend');
                const resend = new Resend(process.env.RESEND_API_KEY);
                const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'zedcertifications@navabharathtechnologies.com';

                const pdfBuffer = fs.readFileSync(filePath);

                const { error } = await resend.emails.send({
                    from: FROM_EMAIL,
                    to: 'zedcertifications@navabharathtechnologies.com',
                    subject: 'FME App New Entries Report',
                    text: `Please find attached the PDF report containing ${users.length} new user entries.`,
                    attachments: [
                        {
                            filename: `User_Report_${new Date().toISOString().split('T')[0]}.pdf`,
                            content: pdfBuffer
                        }
                    ]
                });

                if (error) {
                    console.error('[CRON] Error sending email via Resend:', error);
                    return;
                }

                console.log('[CRON] Report email sent successfully via Resend.');

                // Mark users as reported
                if (userIds.length > 0) {
                    await pool.request().query(`
                        UPDATE FME_logins.users 
                        SET is_reported = 1 
                        WHERE id IN(${userIds.join(',')})
            `);
                    console.log(`[CRON] Marked ${userIds.length} users as reported.`);
                }

                // Cleanup: Delete local PDF file
                fs.unlink(filePath, (err) => {
                    if (err) console.error('[CRON] Error deleting report file:', err);
                });

            } catch (emailErr) {
                console.error('[CRON] Error sending email:', emailErr);
            }
        });

    } catch (err) {
        console.error('[CRON] Error generating report:', err);
    }
};

// Schedule Cron Job: Run at 06:00 AM every day
// "0 6 * * *" -> At 06:00 AM every day
const job = cron.schedule('0 6 * * *', generateAndSendReport, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});

// Check for missed reports on startup (e.g. if server was sleeping at 6 AM)
const checkMissedReport = async () => {
    try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Kolkata',
            hour: 'numeric',
            hour12: false
        });
        const hour = parseInt(formatter.format(now));

        console.log(`[Startup Check] Current IST Hour: ${hour}`);

        // Only run retry logic if it is 06:00 AM or later
        if (hour >= 6) {
            console.log('[Startup Check] Time is past 6 AM IST. Checking for pending reports...');
            await generateAndSendReport();
        } else {
            console.log('[Startup Check] Too early (before 6 AM IST). No report checks needed.');
        }
    } catch (err) {
        console.error('[Startup Check] Failed:', err);
    }
};

module.exports = { job, generateAndSendReport, checkMissedReport };
