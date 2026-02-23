require('dotenv').config();
const express = require('express');
const sql = require('mssql');
const path = require('path');

const cors = require('cors');
const questionsData = require('./questions_data');
const dbConfig = require('./dbConfig');
const { sendCertificateEmail, sendOtpEmail } = require('./emailService');
const { sendPhoneEmailOtp } = require('./phoneEmailService');
const { job, generateAndSendReport, checkMissedReport } = require('./cronService');

const app = express();

/* ============================
   AZURE HEALTH CHECK
============================ */
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.get('/', (req, res) => {
    res.status(200).send('Backend Running');
});

/* ============================
   PORT
============================ */
const port = process.env.PORT || 8080;

/* ============================
   MIDDLEWARE
============================ */
app.use(cors());
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

// Request Logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Static Files
app.use('/public', express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.pdf')) {
            res.setHeader('Content-Disposition', 'inline');
            res.setHeader('Content-Type', 'application/pdf');
        }
    }
}));

/* ============================
   OTP STORE
============================ */
const otpStore = {};

/* ============================
   DATABASE INIT
============================ */
async function initializeDatabase() {
    try {
        const pool = await sql.connect(dbConfig);
        console.log("Database schema verified.");
    } catch (err) {
        console.error("Database initialization failed:", err);
    }
}

sql.connect(dbConfig).then(pool => {
    if (pool.connected) {
        console.log('Connected to SQL Server');
        initializeDatabase();
    }
}).catch(err => {
    console.error('Database connection failed:', err);
});

/* ============================
   UPLOAD PHOTO
============================ */
app.post('/api/upload-photo', async (req, res) => {
    try {
        const { email, photo } = req.body;

        if (!email || !photo) {
            return res.status(400).json({ message: 'Email and Photo are required' });
        }

        const pool = await sql.connect(dbConfig);

        await pool.request()
            .input('email', sql.NVarChar, email)
            .input('photo', sql.NVarChar(sql.MAX), photo)
            .query(`
                UPDATE FME_logins.users 
                SET photo = @photo 
                WHERE email = @email
            `);

        res.status(200).json({ message: 'Photo uploaded successfully', success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

/* ============================
   LOGIN
============================ */
app.post('/api/login', async (req, res) => {
    try {
        const { name, email, phone, otpChannel } = req.body;

        if (!email || !phone || !name) {
            return res.status(400).json({ message: 'Name, Email and Phone are required' });
        }

        const pool = await sql.connect(dbConfig);

        const checkUser = await pool.request()
            .input('email', sql.NVarChar, email)
            .input('phone', sql.NVarChar, phone)
            .query("SELECT TOP 1 * FROM FME_logins.users WHERE email=@email AND phone_number=@phone");

        if (checkUser.recordset.length > 0) {
            await pool.request()
                .input('name', sql.NVarChar, name)
                .query(`
                    UPDATE FME_logins.users 
                    SET name=@name, last_login=GETDATE()
                    WHERE email=@email AND phone_number=@phone
                `);
        } else {
            await pool.request()
                .input('name', sql.NVarChar, name)
                .input('email', sql.NVarChar, email)
                .input('phone', sql.NVarChar, phone)
                .query(`
                    INSERT INTO FME_logins.users (name,email,phone_number,created_at,last_login)
                    VALUES (@name,@email,@phone,GETDATE(),GETDATE())
                `);
        }

        if (otpChannel === 'firebase' || otpChannel === 'phone_email') {
            return res.status(200).json({ message: 'Verified', success: true });
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        if (otpChannel === 'sms') {
            otpStore[phone] = otp;
            await sendPhoneEmailOtp(phone, otp);
        } else {
            otpStore[email] = otp;
            await sendOtpEmail(email, otp);
        }

        res.status(200).json({ message: 'OTP Sent', success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

/* ============================
   VERIFY OTP (FIXED)
============================ */
app.post('/api/verify-otp', (req, res) => {
    try {
        const { email, phone, otp } = req.body;

        if (!otp) {
            return res.status(400).json({ success: false, message: "OTP is required" });
        }

        if (phone && otpStore[phone] === otp) {
            delete otpStore[phone];
            if (email) delete otpStore[email];
            return res.status(200).json({ success: true, message: "OTP Verified Successfully" });
        }

        if (email && otpStore[email] === otp) {
            delete otpStore[email];
            if (phone) delete otpStore[phone];
            return res.status(200).json({ success: true, message: "OTP Verified Successfully" });
        }

        return res.status(400).json({ success: false, message: "Invalid OTP" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error during verification" });
    }
});

/* ============================
   QUESTIONS
============================ */
app.get('/api/questions', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM ZED_MCQ_DB.questions ORDER BY NEWID()');
        res.status(200).json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* ============================
   SUBMIT RESULT
============================ */
app.post('/api/submit-result', async (req, res) => {
    try {
        const { email, score, name, questions, userAnswers } = req.body;

        const finalMarks = score * 2;
        let certNo = null;

        if (finalMarks >= 80) {
            certNo = `ZF${Date.now()}`;
        }

        const pool = await sql.connect(dbConfig);

        await pool.request()
            .input('email', sql.NVarChar, email)
            .input('score', sql.Int, finalMarks)
            .input('certNo', sql.NVarChar, certNo)
            .query(`
                UPDATE FME_logins.users 
                SET finalMarks=@score, certificate_number=@certNo
                WHERE email=@email
            `);

        await sendCertificateEmail(email, name, score, certNo, questions, userAnswers);

        res.status(200).json({ success: true });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

/* ============================
   START SERVER
============================ */
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    checkMissedReport();
});
