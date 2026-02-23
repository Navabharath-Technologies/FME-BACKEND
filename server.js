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

/* ===============================
   ✅ Azure Port (IMPORTANT)
================================ */
const port = process.env.PORT || 8080;

/* ===============================
   ✅ Middlewares
================================ */
app.use(cors());
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

/* ===============================
   ✅ Health Check (Azure)
================================ */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.status(200).send('Backend Running');
});

/* ===============================
   Logging
================================ */
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/* ===============================
   Static Files
================================ */
app.use('/public', express.static(path.join(__dirname, 'public')));

/* ===============================
   OTP Store
================================ */
const otpStore = {};

/* ===============================
   Database Connection
================================ */
sql.connect(dbConfig)
  .then(pool => {
    if (pool.connected) {
      console.log('Connected to SQL Server');
    }
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });

/* ===============================
   LOGIN / REGISTER
================================ */
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
        .input('email', sql.NVarChar, email)
        .input('phone', sql.NVarChar, phone)
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
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ===============================
   VERIFY OTP (FIXED VERSION)
================================ */
app.post('/api/verify-otp', (req, res) => {
  try {
    const { email, phone, otp } = req.body;

    console.log("Verify OTP Request:", req.body);

    if (!otp) {
      return res.status(400).json({ success: false, message: "OTP required" });
    }

    if (phone && otpStore[phone] && otpStore[phone] === otp) {
      delete otpStore[phone];
      return res.status(200).json({ success: true, message: "OTP Verified" });
    }

    if (email && otpStore[email] && otpStore[email] === otp) {
      delete otpStore[email];
      return res.status(200).json({ success: true, message: "OTP Verified" });
    }

    return res.status(400).json({ success: false, message: "Invalid OTP" });

  } catch (error) {
    console.error("OTP Verification Error:", error);
    return res.status(500).json({ success: false, message: "Server error during verification" });
  }
});

/* ===============================
   START SERVER
================================ */
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  checkMissedReport();
});
