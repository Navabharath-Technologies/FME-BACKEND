const cron = require('node-cron');
const sql = require('mssql');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const dbConfig = require('./dbConfig');
const { transporter } = require('./emailService'); // We'll need to export transporter from emailService

// Function to generate PDF and send email
const generateAndSendReport = async () => {
    console.log('[CRON] Starting daily report generation...');
    let pool;
    try {
        pool = await sql.connect(dbConfig);
        // Fetch users who haven't been reported yet
        const result = await pool.request().query(`
            SELECT * FROM FME_logins.users 
            WHERE created_at >= CAST(DATEADD(day, -1, GETDATE()) AS DATE)
            AND created_at < CAST(GETDATE() AS DATE)
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
        const headers = ['S.No', 'Name', 'Email', 'Phone', 'Score', 'Location'];
        const colWidths = [30, 90, 130, 80, 40, 150];
        let x = 30;
        let y = doc.y;

        doc.font('Helvetica-Bold');
        headers.forEach((header, i) => {
            doc.text(header, x, y, { width: colWidths[i], ellipsis: true });
            x += colWidths[i];
        });
        doc.moveDown();
        doc.moveTo(30, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        // Table Rows
        doc.font('Helvetica');
        users.forEach((user, index) => {
            // Check for page break
            if (doc.y > 700) {
                doc.addPage();
                y = 30; // Reset y for new page
            }

            y = doc.y;
            x = 30;

            const rowData = [
                String(index + 1), // Serial Number
                user.name || 'N/A',
                user.email || 'N/A',
                user.phone_number || 'N/A',
                user.exam_score !== null ? String(user.exam_score) : '-',
                user.location_link || 'N/A'
            ];

            rowData.forEach((text, i) => {
                doc.text(text, x, y, { width: colWidths[i], ellipsis: true });
                x += colWidths[i];
            });
            doc.moveDown(0.5);
        });

        doc.end();

        // Wait for PDF to finish writing
        stream.on('finish', async () => {
            try {
                // Send Email
                const mailOptions = {
                    from: 'FME App <zedcertifications@navabharathtechnologies.com>',
                    to: 'zedcertifications@navabharathtechnologies.com',
                    subject: 'FME App New Entries Report',
                    text: `Please find attached the PDF report containing ${users.length} new user entries.`,
                    attachments: [
                        {
                            filename: `User_Report_${new Date().toISOString().split('T')[0]}.pdf`,
                            path: filePath
                        }
                    ]
                };

                await transporter.sendMail(mailOptions);
                console.log('[CRON] Report email sent successfully.');

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

// Schedule Cron Job: Run at 00:00 every day
// "0 0 * * *" -> At 00:00 every day
const job = cron.schedule('0 0 * * *', generateAndSendReport, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});

module.exports = { job, generateAndSendReport };
