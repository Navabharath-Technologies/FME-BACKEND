const nodemailer = require('nodemailer');
const path = require('path');
const PDFDocument = require('pdfkit');
const fs = require('fs');

// Configure Transporter
// NOTE: For Google Workspace/Gmail, you CANNOT use your login password.
// You MUST generate an "App Password" from your Google Account > Security > 2-Step Verification > App Passwords.
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // use STARTTLS
    auth: {
        user: 'zedcertifications@navabharathtechnologies.com',
        pass: 'nazs czls zfxu urwy'
    },
    // Fix for Cloud/Render timeouts:
    tls: {
        rejectUnauthorized: false
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000,
    network: {
        family: 4 // Force IPv4
    }
});

/**
 * @param {string} email - Recipient's email address
 * @param {string} name - User's name
 * @param {number} score - User's score
 * @param {string} certificateNumber - Pre-generated Certificate Number
 */
const sendCertificateEmail = async (email, name, score, certificateNumber) => {
    try {
        const finalMarks = score * 2;

        // CHECK IF FAILED
        if (finalMarks < 80) {
            // ... (Failure logic remains same, maybe log cert number was not Issued/Used if needed, OR we only Pass certNo if passed)
            // Actually, if failed, we probably didn't generate a certNo or won't use it.
            // Let's keep failure mail same.
            const mailOptions = {
                from: 'FME App <zedcertifications@navabharathtechnologies.com>',
                to: email,
                subject: 'RESULT: ZED Training Certification Scheme',
                html: `
                    <p>Dear Sir/Madam,</p>
                    <p>We regret to inform you that you did not qualify for the ZED Training Program.</p>
                    <p>However, you can participate again in the next training programs and examination by registering at the following link:</p>
                    <p><a href="https://zed.msme.gov.in/">Please click here to Register for Training Programs</a></p>
                    <p>In case of any queries, please feel free to contact us at: <a href="mailto:zedcertifications@navabharathtechnologies.com">zedcertifications@navabharathtechnologies.com</a>.</p>
                    <p>Regards,<br/>FME Team</p>
                `
            };
            await transporter.sendMail(mailOptions);
            console.log(`Failure email sent to ${email} (Score: ${finalMarks})`);
            return;
        }

        const today = new Date();
        const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

        // --- Generate PDF Certificate (ONLY IF PASSED) ---
        // Calculate dimensions to remove excess whitespace
        // We width-constrain to A4 width (595.28) but set height exactly to the content height.
        const pdfWidth = 595.28;
        const originalWidth = 800;
        const originalHeight = 520;
        const ratio = pdfWidth / originalWidth;
        const pdfHeight = originalHeight * ratio;

        const doc = new PDFDocument({
            size: [pdfWidth, pdfHeight], // Custom size to fit content exactly (No excess white page)
            margin: 0
        });

        // Path for temporary PDF file
        const pdfPath = path.join(__dirname, `Certificate_${Date.now()}.pdf`);
        const writeStream = fs.createWriteStream(pdfPath);
        doc.pipe(writeStream);

        // 1. Background Image
        const bgPath = path.join(__dirname, '../assets/certificate_bg.png');
        doc.image(bgPath, 0, 0, { width: pdfWidth, height: pdfHeight });

        // 2. Text Overlays
        // Text area: Right side to accommodate the ribbon/seal on the left.
        // 2. Text Overlays
        // Start text content below the logo.
        const fontPath = path.join(__dirname, '../assets/OLDENGL.TTF');
        doc.registerFont('OldEnglish', fontPath);

        // 2. Text Overlays
        // Start text content below the logo.
        const textBoxX = originalWidth * 0.38 * ratio;
        const textBoxY = originalHeight * 0.56 * ratio; // Moved down to 0.56 to clear logo
        const textBoxWidth = originalWidth * 0.56 * ratio;

        // NAME (Prominent, Dark Red)
        doc.font('Helvetica-Bold')
            .fontSize(16) // Reduced
            .fillColor('#8B0000')
            .text(name || 'Participant', textBoxX, textBoxY, { width: textBoxWidth, align: 'center' });

        doc.moveDown(0.4);

        // "is hereby recognized as a" (Italic Serif)
        doc.font('Times-Italic')
            .fontSize(10) // Reduced
            .fillColor('black')
            .text('is hereby recognized as a', { width: textBoxWidth, align: 'center' });

        doc.moveDown(0.2);

        // "ZED Facilitator" (Old English / Gothic Style)
        doc.font('OldEnglish')
            .fontSize(30) // Increased for Gothic impact
            .fillColor('#8B0000')
            .text('ZED Facilitator', { width: textBoxWidth, align: 'center' });

        doc.moveDown(0.2);

        // "(under MSME Sustainable (ZED) Certification Scheme)" (Smaller Sans-Serif)
        doc.font('Helvetica')
            .fontSize(8) // Reduced
            .fillColor('gray')
            .text('(under MSME Sustainable (ZED) Certification Scheme)', { width: textBoxWidth, align: 'center' });

        doc.moveDown(0.5);

        // Body Paragraph (Italic Serif)
        // Using explicit text(str, x, y) to prevent page break loops
        const bodyText = "attesting to successful completion of the training requirements, reflecting a commitment to maintaining the highest standards of competence as a ZED Facilitator.";
        const bodyY = doc.y; // Capture current Y

        doc.font('Times-Italic')
            .fontSize(11) // Reduced
            .fillColor('black')
            .text(bodyText, textBoxX, bodyY, { width: textBoxWidth, align: 'center', lineGap: 3 });

        // --- Bottom Left Details ---
        // Masking background
        // --- Bottom Left Details ---
        // Masking background
        const maskX = 30 * ratio; // x=30
        const maskY = originalHeight * 0.76 * ratio; // y=approx 395 (of 520)
        const maskW = 250 * ratio;
        const maskH = 85 * ratio; // SIGNIFICANTLY REDUCED to 85 to reveal bottom border

        doc.save();
        doc.rect(maskX, maskY, maskW, maskH).fill('white');

        // Use passed Certificate Number (or fallback if empty/undefined logic needed, but assumed guaranteed)
        const certNo = certificateNumber || `ZF-ERR-${Date.now()}`;

        // Positioning footer higher to ensure it's on the page
        const detailsX = 40 * ratio;
        const detailsY = originalHeight * 0.78 * ratio;
        const lineHeight = 12; // Fixed small line height for footer

        doc.fillColor('black')
            .font('Helvetica-Bold')
            .fontSize(9); // Reduced footer font

        // Manually placing lines to ensure compactness
        doc.text(`Certificate No. : ${certNo}`, detailsX, detailsY);
        doc.text(`Issued on : ${dateStr}`, detailsX, detailsY + lineHeight);

        // Split Validity line
        doc.text('Certificate Validity :', detailsX, detailsY + (lineHeight * 2));
        doc.fillColor('#8B0000').text('Valid for one year from the date of issue', detailsX, detailsY + (lineHeight * 3));

        doc.restore();

        doc.restore();

        doc.end();

        // Wait for PDF to finish
        writeStream.on('finish', async () => {
            try {
                const mailOptions = {
                    from: 'FME App <zedcertifications@navabharathtechnologies.com>',
                    to: email,
                    subject: 'Your Facilitator Mock Exam Certificate',
                    html: `
                        <h3>Congratulations ${name}!</h3>
                        <p>You have successfully completed the Facilitator Mock Exam.</p>
                        <p>Your score is <b>${finalMarks}/100</b>.</p>
                        <p>Please find your certificate attached to this email.</p>
                        <br/>
                        <p>Regards,<br/>FME Team</p>
                    `,
                    attachments: [
                        {
                            filename: 'Certificate.pdf',
                            path: pdfPath
                        }
                    ]
                };

                // NOTE: Without real credentials, this will fail or hang. 
                // We wrap in try/catch to ensure API response succeeds even if email fails (or we simulate).
                await transporter.sendMail(mailOptions);
                console.log(`Certificate email sent to ${email}`);

                // Cleanup
                fs.unlink(pdfPath, (err) => { if (err) console.error(err); });
            } catch (err) {
                console.error('Error sending mail:', err);
            }
        });

    } catch (emailErr) {
        console.error('Error generating/sending email:', emailErr);
    }
};

/**
 * Sends an OTP email to the user.
 * @param {string} email - Recipient's email address
 * @param {string} otp - The OTP code
 */
const sendOtpEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: 'FME App <zedcertifications@navabharathtechnologies.com>',
            to: email,
            subject: 'FME App Login Verification',
            text: `Your OTP for FME App login is: ${otp}\n\nPlease do not share this code with anyone.`
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${email}`);
    } catch (err) {
        console.error('Error sending OTP email:', err);
    }
};

module.exports = { sendCertificateEmail, sendOtpEmail, transporter };
