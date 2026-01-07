const { Resend } = require('resend');
const path = require('path');
const PDFDocument = require('pdfkit');
const fs = require('fs');

// Initialize Resend
const resend = new Resend('re_32sgasPc_77YYy46KFRB3Wek8T2T6NJrS');
// NOTE: On Free Tier without domain verification, you can only send FROM 'onboarding@resend.dev'
// AND you can only send TO the email address you signed up with.
const FROM_EMAIL = 'onboarding@resend.dev';

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
            try {
                await resend.emails.send({
                    from: FROM_EMAIL,
                    to: email, // Free Tier Limitation: Might only work if 'email' is your own.
                    subject: 'RESULT: ZED Training Certification Scheme',
                    html: `
                        <p>Dear Sir/Madam,</p>
                        <p>We regret to inform you that you did not qualify for the ZED Training Program.</p>
                        <p>However, you can participate again in the next training programs and examination by registering at the following link:</p>
                        <p><a href="https://zed.msme.gov.in/">Please click here to Register for Training Programs</a></p>
                        <p>In case of any queries, please feel free to contact us at: <a href="mailto:zedcertifications@navabharathtechnologies.com">zedcertifications@navabharathtechnologies.com</a>.</p>
                        <p>Regards,<br/>FME Team</p>
                    `
                });
                console.log(`Failure email sent to ${email} (Score: ${finalMarks})`);
            } catch (err) {
                console.error('Error sending failure email (Resend):', err);
            }
            return;
        }

        const today = new Date();
        const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

        // --- Generate PDF Certificate (Same Logic) ---
        const pdfWidth = 595.28;
        const originalWidth = 800;
        const originalHeight = 520;
        const ratio = pdfWidth / originalWidth;
        const pdfHeight = originalHeight * ratio;

        const doc = new PDFDocument({
            size: [pdfWidth, pdfHeight],
            margin: 0
        });

        const pdfPath = path.join(__dirname, `Certificate_${Date.now()}.pdf`);
        const writeStream = fs.createWriteStream(pdfPath);
        doc.pipe(writeStream);

        // 1. Background Image
        const bgPath = path.join(__dirname, '../assets/certificate_bg.png');
        doc.image(bgPath, 0, 0, { width: pdfWidth, height: pdfHeight });

        // 2. Text Overlays
        const fontPath = path.join(__dirname, '../assets/OLDENGL.TTF');
        doc.registerFont('OldEnglish', fontPath);

        const textBoxX = originalWidth * 0.38 * ratio;
        const textBoxY = originalHeight * 0.56 * ratio;
        const textBoxWidth = originalWidth * 0.56 * ratio;

        doc.font('Helvetica-Bold').fontSize(16).fillColor('#8B0000')
            .text(name || 'Participant', textBoxX, textBoxY, { width: textBoxWidth, align: 'center' });

        doc.moveDown(0.4);
        doc.font('Times-Italic').fontSize(10).fillColor('black')
            .text('is hereby recognized as a', { width: textBoxWidth, align: 'center' });

        doc.moveDown(0.2);
        doc.font('OldEnglish').fontSize(30).fillColor('#8B0000')
            .text('ZED Facilitator', { width: textBoxWidth, align: 'center' });

        doc.moveDown(0.2);
        doc.font('Helvetica').fontSize(8).fillColor('gray')
            .text('(under MSME Sustainable (ZED) Certification Scheme)', { width: textBoxWidth, align: 'center' });

        doc.moveDown(0.5);
        const bodyText = "attesting to successful completion of the training requirements, reflecting a commitment to maintaining the highest standards of competence as a ZED Facilitator.";
        const bodyY = doc.y;

        doc.font('Times-Italic').fontSize(11).fillColor('black')
            .text(bodyText, textBoxX, bodyY, { width: textBoxWidth, align: 'center', lineGap: 3 });

        const maskX = 30 * ratio;
        const maskY = originalHeight * 0.76 * ratio;
        const maskW = 250 * ratio;
        const maskH = 85 * ratio;

        doc.save();
        doc.rect(maskX, maskY, maskW, maskH).fill('white');

        const certNo = certificateNumber || `ZF-ERR-${Date.now()}`;
        const detailsX = 40 * ratio;
        const detailsY = originalHeight * 0.78 * ratio;
        const lineHeight = 12;

        doc.fillColor('black').font('Helvetica-Bold').fontSize(9);
        doc.text(`Certificate No. : ${certNo}`, detailsX, detailsY);
        doc.text(`Issued on : ${dateStr}`, detailsX, detailsY + lineHeight);
        doc.text('Certificate Validity :', detailsX, detailsY + (lineHeight * 2));
        doc.fillColor('#8B0000').text('Valid for one year from the date of issue', detailsX, detailsY + (lineHeight * 3));
        doc.restore();
        doc.restore();
        doc.end();

        // Wait for PDF to finish
        writeStream.on('finish', async () => {
            try {
                // Read the file buffer for attachment
                const fileBuffer = fs.readFileSync(pdfPath);

                await resend.emails.send({
                    from: FROM_EMAIL,
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
                            content: fileBuffer
                        }
                    ]
                });
                console.log(`Certificate email sent to ${email} (Resend)`);

                // Cleanup
                fs.unlink(pdfPath, (err) => { if (err) console.error(err); });
            } catch (err) {
                console.error('Error sending certificate email (Resend):', err);
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
        const data = await resend.emails.send({
            from: FROM_EMAIL,
            to: email, // Free Tier Limitation: Might only work if 'email' is your own registered email.
            subject: 'FME App Login Verification',
            text: `Your OTP for FME App login is: ${otp}\n\nPlease do not share this code with anyone.`
        });
        console.log(`OTP email sent to ${email} (Resend ID: ${data.id})`);
    } catch (err) {
        console.error('Error sending OTP email (Resend):', err);
    }
};

module.exports = { sendCertificateEmail, sendOtpEmail };
