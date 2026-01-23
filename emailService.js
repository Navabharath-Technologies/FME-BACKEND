const { Resend } = require('resend');
const path = require('path');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const os = require('os');

require('dotenv').config();

// Initialize Resend
let resend;
if (process.env.RESEND_API_KEY) {
    console.log('[EmailService] Initializing Resend with Key:', process.env.RESEND_API_KEY ? 'Present' : 'Missing');
    resend = new Resend(process.env.RESEND_API_KEY);
} else {
    console.warn("WARNING: RESEND_API_KEY is missing. Email service will not work.");
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'zedcertifications@navabharathtechnologies.com'; // Fallback

/**
 * @param {string} email - Recipient's email address
 * @param {string} name - User's name
 * @param {number} score - User's score
 * @param {string} certificateNumber - Pre-generated Certificate Number
 * @param {Array} questions - List of questions
 * @param {Object} userAnswers - Map of user answers
 */
const sendCertificateEmail = async (email, name, score, certificateNumber, questions, userAnswers) => {
    if (!resend) { console.error("Resend not initialized, cannot send email."); return; }

    return new Promise(async (resolve, reject) => { // Wrap in Promise
        try {
            // Format name: Capitalize first letter of each word; specific rule for initials (<= 2 chars) -> ALL CAPS
            if (name) {
                name = name.split(' ').map(word => {
                    if (word.length === 2) {
                        return word.split('').join(' ').toUpperCase();
                    }
                    if (word.length === 1) {
                        return word.toUpperCase();
                    }
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                }).join(' ');
            }

            console.log(`[EmailService] Starting certificate generation for: ${email} (Score: ${score})`);

            const finalMarks = score * 2;

            // CHECK IF FAILED
            if (finalMarks < 80) {
                // Generate Review PDF
                const doc = new PDFDocument({ margin: 30, size: 'A4' });
                const reviewPdfPath = path.join(os.tmpdir(), `ExamReview_${Date.now()}.pdf`); // Use tmpdir
                const writeStream = fs.createWriteStream(reviewPdfPath);
                doc.pipe(writeStream);

                // Title
                doc.fontSize(18).text('Exam Review Report', { align: 'center' });
                doc.moveDown();
                doc.fontSize(12).text(`Name: ${name}`);
                doc.text(`Score: ${finalMarks}/100`);
                doc.text(`Date: ${new Date().toLocaleDateString()}`);
                doc.moveDown();

                // Table Header
                const tableTop = doc.y;
                const col1X = 30; // Question
                const col2X = 350; // Your Answer
                const col3X = 450; // Status

                doc.font('Helvetica-Bold');
                doc.text('Question', col1X, tableTop);
                doc.text('Your Answer', col2X, tableTop);
                doc.text('Status', col3X, tableTop);
                doc.moveDown();
                doc.font('Helvetica');

                let y = doc.y;

                // Iterate Questions
                if (questions && userAnswers) {
                    questions.forEach((q, i) => {
                        const userSelectedKey = userAnswers[q.id];
                        const correctAnswerKey = q.correct_answer;

                        // Helper to get option text
                        const getOptionText = (key) => key ? q[`option_${key.toLowerCase()}`] : 'Not Answered';

                        const userText = getOptionText(userSelectedKey);
                        const isCorrect = userSelectedKey === correctAnswerKey;
                        const status = isCorrect ? 'Correct' : 'Wrong';

                        // Check page break
                        if (y > 700) {
                            doc.addPage();
                            y = 30;
                        }

                        doc.fontSize(10);
                        // Print Question (Wrap text)
                        doc.text(`${i + 1}. ${q.question_text || q.question}`, col1X, y, { width: 300 });

                        // Print Answer
                        doc.text(userText, col2X, y, { width: 90 });

                        // Print Status (Icon + Text)
                        doc.save();
                        if (isCorrect) {
                            // Draw Green Tick
                            doc.strokeColor('green').lineWidth(1.5);
                            doc.moveTo(col3X, y + 6).lineTo(col3X + 4, y + 10).lineTo(col3X + 10, y + 1).stroke();
                            doc.fillColor('green').text('Correct', col3X + 15, y);
                        } else {
                            // Draw Red X
                            doc.strokeColor('red').lineWidth(1.5);
                            doc.moveTo(col3X, y + 2).lineTo(col3X + 8, y + 10).stroke();
                            doc.moveTo(col3X + 8, y + 2).lineTo(col3X, y + 10).stroke();
                            doc.fillColor('red').text('Wrong', col3X + 15, y);
                        }
                        doc.restore();
                        doc.fillColor('black');

                        // Advance Y (Calculate max height to prevent overlap)
                        const questionHeight = doc.heightOfString(`${i + 1}. ${q.question_text || q.question}`, { width: 300 });
                        const answerHeight = doc.heightOfString(userText, { width: 90 });
                        const rowHeight = Math.max(questionHeight, answerHeight);

                        y += rowHeight + 15; // increased padding for safety
                    });
                }

                doc.end();

                writeStream.on('finish', async () => {
                    try {
                        const pdfBuffer = fs.readFileSync(reviewPdfPath);
                        await resend.emails.send({
                            from: FROM_EMAIL,
                            to: email,
                            subject: 'RESULT: ZED Training Certification Scheme',
                            html: `
                                <p>Dear Sir/Madam,</p>
                                <p>We regret to inform you that you did not qualify for the ZED Training Program.</p>
                                <p>Your Score: <b>${finalMarks}/100</b></p>
                                <p>Please find attached the review of your exam attempts.</p>
                                <p>However, you can participate again in the next training programs and examination by registering at the following link:</p>
                                <p><a href="https://zed.msme.gov.in/">Please click here to Register for Training Programs</a></p>
                                <p>In case of any queries, please feel free to contact us at: <a href="mailto:zedcertifications@navabharathtechnologies.com">zedcertifications@navabharathtechnologies.com</a>.</p>
                                <p>For your future reference, please refer this <a href="https://fme-gqgdddhnb7auc6b6.eastus2-01.azurewebsites.net/public/Study_Material.pdf">Study Material PDF</a>.</p>
                                <p>Regards,<br/>FME Team</p>
                            `,
                            attachments: [
                                {
                                    filename: 'ExamReview.pdf',
                                    content: pdfBuffer
                                }
                            ]
                        });
                        console.log(`Failure email with review sent to ${email}`);
                        fs.unlink(reviewPdfPath, (err) => { if (err) console.error(err); });
                        resolve(); // Resolve Promise
                    } catch (err) {
                        console.error('Error sending failure email:', err);
                        reject(err); // Reject Promise
                    }
                });

                writeStream.on('error', (err) => {
                    console.error('Error writing review PDF:', err);
                    reject(err);
                });

                return;
            }

            const today = new Date();
            const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

            // --- Generate PDF Certificate ---
            const pdfWidth = 595.28;
            const originalWidth = 800;
            const originalHeight = 520;
            const ratio = pdfWidth / originalWidth;
            const pdfHeight = originalHeight * ratio;

            const doc = new PDFDocument({
                size: [pdfWidth, pdfHeight],
                margin: 0
            });

            // Path for temporary PDF file
            const pdfPath = path.join(os.tmpdir(), `Certificate_${Date.now()}.pdf`); // Use tmpdir
            const writeStream = fs.createWriteStream(pdfPath);
            doc.pipe(writeStream);

            // 1. Background Image
            const bgPath = path.join(__dirname, 'assets/certificate_bg.png');
            if (fs.existsSync(bgPath)) {
                console.log(`[EmailService] Background image found at ${bgPath}`);
                doc.image(bgPath, 0, 0, { width: pdfWidth, height: pdfHeight });
            } else {
                console.error(`[EmailService] CRISIS: Background image NOT found at ${bgPath}. Generating without background.`);
            }

            // 2. Text Overlays
            const fontPath = path.join(__dirname, 'assets/OLDENGL.TTF');
            let fontToUse = 'Helvetica'; // Default fallback

            if (fs.existsSync(fontPath)) {
                console.log(`[EmailService] Font found at ${fontPath}`);
                doc.registerFont('OldEnglish', fontPath);
                fontToUse = 'OldEnglish';
            } else {
                console.error(`[EmailService] CRISIS: Font NOT found at ${fontPath}. Using standard font.`);
            }

            const textBoxX = originalWidth * 0.38 * ratio;
            const textBoxY = originalHeight * 0.56 * ratio;
            const textBoxWidth = originalWidth * 0.56 * ratio;

            // NAME
            doc.font('Helvetica-Bold')
                .fontSize(16)
                .fillColor('#8B0000')
                .text(name || 'Participant', textBoxX, textBoxY, { width: textBoxWidth, align: 'center' });

            doc.moveDown(0.4);

            doc.font('Times-Italic')
                .fontSize(10)
                .fillColor('black')
                .text('is hereby recognized as a', { width: textBoxWidth, align: 'center' });

            doc.moveDown(0.2);

            doc.font(fontToUse === 'OldEnglish' ? 'OldEnglish' : 'Helvetica-Bold')
                .fontSize(30)
                .fillColor('#8B0000')
                .text('ZED Facilitator', { width: textBoxWidth, align: 'center' });

            doc.moveDown(0.2);

            doc.font('Helvetica')
                .fontSize(8)
                .fillColor('gray')
                .text('(under MSME Sustainable (ZED) Certification Scheme)', { width: textBoxWidth, align: 'center' });

            doc.moveDown(0.5);

            const bodyText = "attesting to successful completion of the training requirements, reflecting a commitment to maintaining the highest standards of competence as a ZED Facilitator.";
            const bodyY = doc.y;

            doc.font('Times-Italic')
                .fontSize(11)
                .fillColor('black')
                .text(bodyText, textBoxX, bodyY, { width: textBoxWidth, align: 'center', lineGap: 3 });

            // Masking background
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

            doc.fillColor('black')
                .font('Helvetica-Bold')
                .fontSize(9);

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
                    // Read the file buffer for Resend
                    const pdfBuffer = fs.readFileSync(pdfPath);

                    await resend.emails.send({
                        from: FROM_EMAIL,
                        to: email,
                        subject: 'Your Facilitator Mock Exam Certificate',
                        html: `
                            <h3>Congratulations ${name}!</h3>
                            <p>You have successfully completed the Facilitator Mock Exam.</p>
                            <p>Your score is <b>${finalMarks}/100</b>.</p>
                            <p>Please find your certificate attached to this email.</p>
                            <p>For your future reference, please refer this <a href="https://fme-gqgdddhnb7auc6b6.eastus2-01.azurewebsites.net/public/Study_Material.pdf">Study Material PDF</a>.</p>
                            <br/>
                            <p>Regards,<br/>FME Team</p>
                        `,
                        attachments: [
                            {
                                filename: 'Certificate.pdf',
                                content: pdfBuffer
                            }
                        ]
                    });
                    console.log(`[EmailService] Certificate email sent to ${email} via Resend successfully.`);

                    // Cleanup
                    fs.unlink(pdfPath, (err) => { if (err) console.error(err); });
                    resolve(); // Resolve
                } catch (err) {
                    console.error('[EmailService] Resend Error:', JSON.stringify(err, null, 2));
                    reject(err);
                }
            });

            writeStream.on('error', (err) => {
                console.error('[EmailService] Error writing Certificate PDF:', err);
                reject(err);
            });

        } catch (emailErr) {
            console.error('Error generating/sending email:', emailErr);
            reject(emailErr);
        }
    }); // End Promise
};

/**
 * Sends an OTP email to the user.
 * @param {string} email - Recipient's email address
 * @param {string} otp - The OTP code
 */
const sendOtpEmail = async (email, otp) => {
    if (!resend) { console.error("Resend not initialized, cannot send OTP."); return; }
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: 'FME App Login Verification',
            text: `Your OTP for FME App login is: ${otp}\n\nPlease do not share this code with anyone.`
        });

        if (error) {
            console.error('Resend Error:', error);
            return;
        }

        console.log(`OTP email sent to ${email} via Resend. ID: ${data.id}`);
    } catch (err) {
        console.error('Error sending OTP email via Resend:', err);
    }
};

module.exports = { sendCertificateEmail, sendOtpEmail };
