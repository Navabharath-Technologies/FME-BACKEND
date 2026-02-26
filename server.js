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

// Request Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Serve Static Files (e.g., PDFs) using absolute path
app.use('/public', express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.pdf')) {
            res.setHeader('Content-Disposition', 'inline');
            res.setHeader('Content-Type', 'application/pdf');
        }
    }
}));

/* ============================
   OTP STORE (MIGRATED TO DB)
============================ */
// const otpStore = {}; // DEPRECATED: Caused issues with Azure App Service multi-instance load balancing.

/* ============================
   DATABASE INIT
============================ */
async function initializeDatabase() {
    try {
        const pool = await sql.connect(dbConfig);

        // Create Users table if not exists
        const tableCheck = await pool.query(`SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'FME_logins' AND TABLE_NAME = 'users'`);
        if (tableCheck.recordset.length === 0) {
            await pool.query(`
                CREATE TABLE FME_logins.users (
                    id INT PRIMARY KEY IDENTITY(1,1),
                    email NVARCHAR(255) NOT NULL,
                    name NVARCHAR(100),
                    phone_number NVARCHAR(50),
                    photo NVARCHAR(MAX),
                    latitude NVARCHAR(50),
                    longitude NVARCHAR(50),
                    location_link NVARCHAR(MAX),
                    created_at DATETIME DEFAULT GETDATE(),
                    last_login DATETIME
                )
            `);
            console.log('Users table created.');
        } else {
            // Check Name Column
            const nameCheck = await pool.query(`SELECT * FROM sys.columns WHERE Name = N'name' AND Object_ID = Object_ID(N'[FME_logins].[users]')`);
            if (nameCheck.recordset.length === 0) {
                await pool.query(`ALTER TABLE FME_logins.users ADD name NVARCHAR(100)`);
                console.log('Name column added.');
            }

            // Check Photo
            const photoCheck = await pool.query(`SELECT * FROM sys.columns WHERE Name = N'photo' AND Object_ID = Object_ID(N'[FME_logins].[users]')`);
            if (photoCheck.recordset.length === 0) {
                await pool.query(`ALTER TABLE FME_logins.users ADD photo NVARCHAR(MAX)`);
                console.log('Photo column added.');
            } else {
                await pool.query(`ALTER TABLE FME_logins.users ALTER COLUMN photo NVARCHAR(MAX)`);
            }

            // Location Columns
            const locCheck = await pool.query(`SELECT * FROM sys.columns WHERE Name = N'latitude' AND Object_ID = Object_ID(N'[FME_logins].[users]')`);
            if (locCheck.recordset.length === 0) {
                await pool.query(`ALTER TABLE FME_logins.users ADD latitude NVARCHAR(50), longitude NVARCHAR(50), location_link NVARCHAR(MAX)`);
                console.log('Location columns added.');
            } else {
                const linkCheck = await pool.query(`SELECT * FROM sys.columns WHERE Name = N'location_link' AND Object_ID = Object_ID(N'[FME_logins].[users]')`);
                if (linkCheck.recordset.length === 0) {
                    await pool.query(`ALTER TABLE FME_logins.users ADD location_link NVARCHAR(MAX)`);
                    console.log('Location link column added.');
                }
            }

            // Check Final Marks
            const fmCheck = await pool.query(`SELECT * FROM sys.columns WHERE Name = N'finalMarks' AND Object_ID = Object_ID(N'[FME_logins].[users]')`);
            const esCheck = await pool.query(`SELECT * FROM sys.columns WHERE Name = N'exam_score' AND Object_ID = Object_ID(N'[FME_logins].[users]')`);

            if (esCheck.recordset.length > 0) {
                if (fmCheck.recordset.length > 0) {
                    await pool.query(`ALTER TABLE FME_logins.users DROP COLUMN finalMarks`);
                    console.log('Dropped extra finalMarks column.');
                }
                await pool.query(`EXEC sp_rename 'FME_logins.users.exam_score', 'finalMarks', 'COLUMN'`);
                console.log('Renamed exam_score to finalMarks.');
            } else if (fmCheck.recordset.length === 0) {
                await pool.query(`ALTER TABLE FME_logins.users ADD finalMarks INT`);
                console.log('FinalMarks column added.');
            }

            // Check Last Login
            const loginCheck = await pool.query(`SELECT * FROM sys.columns WHERE Name = N'last_login' AND Object_ID = Object_ID(N'[FME_logins].[users]')`);
            if (loginCheck.recordset.length === 0) {
                await pool.query(`ALTER TABLE FME_logins.users ADD last_login DATETIME`);
                console.log('Last login column added.');
            }

            // Check is_reported
            const reportedCheck = await pool.query(`SELECT * FROM sys.columns WHERE Name = N'is_reported' AND Object_ID = Object_ID(N'[FME_logins].[users]')`);
            if (reportedCheck.recordset.length === 0) {
                await pool.query(`ALTER TABLE FME_logins.users ADD is_reported BIT DEFAULT 0`);
                console.log('is_reported column added.');
            }

            // Check OTP
            const otpCheck = await pool.query(`SELECT * FROM sys.columns WHERE Name = N'otp' AND Object_ID = Object_ID(N'[FME_logins].[users]')`);
            if (otpCheck.recordset.length === 0) {
                await pool.query(`ALTER TABLE FME_logins.users ADD otp NVARCHAR(10)`);
                console.log('OTP column added for persistent cloud storage.');
            }
        }

        // Create Questions table if not exists
        const questionsTableCheck = await pool.query(`SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'ZED_MCQ_DB' AND TABLE_NAME = 'questions'`);
        if (questionsTableCheck.recordset.length === 0) {
            await pool.query(`
                CREATE TABLE ZED_MCQ_DB.questions (
                    id INT PRIMARY KEY IDENTITY(1,1),
                    question_text NVARCHAR(MAX),
                    option_a NVARCHAR(255),
                    option_b NVARCHAR(255),
                    option_c NVARCHAR(255),
                    option_d NVARCHAR(255),
                    option_e NVARCHAR(255),
                    correct_answer NVARCHAR(50)
                )
            `);
            console.log('Questions table created.');

            for (const q of questionsData) {
                await pool.request()
                    .input('question', sql.NVarChar(sql.MAX), q.question)
                    .input('option_a', sql.NVarChar, q.options.A)
                    .input('option_b', sql.NVarChar, q.options.B)
                    .input('option_c', sql.NVarChar, q.options.C || null)
                    .input('option_d', sql.NVarChar, q.options.D || null)
                    .input('option_e', sql.NVarChar, q.options.E || null)
                    .input('answer', sql.NVarChar, q.answer)
                    .query(`
                        INSERT INTO ZED_MCQ_DB.questions (question_text, option_a, option_b, option_c, option_d, option_e, correct_answer)
                        VALUES (@question, @option_a, @option_b, @option_c, @option_d, @option_e, @answer)
                    `);
            }
            console.log('Questions populated.');
        }

        console.log("Database schema verified.");

    } catch (err) {
        console.error("Database initialization failed:", err);
    }
}

// Connect to Database and Initialize
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

        res.status(200).send({ message: 'Photo uploaded successfully', success: true });

    } catch (err) {
        console.error('Error uploading photo:', err);
        res.status(500).send({ message: 'Server error', error: err.message });
    }
});

/* ============================
   LOGIN
============================ */
app.post('/api/login', async (req, res) => {
    try {
        console.log('Received Login Body:', req.body);
        const { name, email, phone, otpChannel } = req.body;

        if (!email || !phone || !name) {
            console.log('Missing fields:', req.body);
            return res.status(400).json({ message: 'Name, Email and Phone are required' });
        }

        // Validate Name (Only Alphabets and Spaces)
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!nameRegex.test(name)) {
            return res.status(400).json({ message: 'Name should not contain special characters' });
        }

        // Validate Phone (Only Digits)
        const phoneRegex = /^\d+$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ message: 'Phone number should not contain special characters' });
        }

        const pool = await sql.connect(dbConfig);

        const checkUser = await pool.request()
            .input('email', sql.NVarChar, email)
            .input('phone', sql.NVarChar, phone)
            .query("SELECT TOP 1 * FROM FME_logins.users WHERE email = @email AND phone_number = @phone");

        if (checkUser.recordset.length > 0) {
            await pool.request()
                .input('name', sql.NVarChar, name)
                .input('email', sql.NVarChar, email)
                .input('phone', sql.NVarChar, phone)
                .query(`
                    UPDATE FME_logins.users 
                    SET name = @name, last_login = GETDATE()
                    WHERE email = @email AND phone_number = @phone
                `);
            console.log(`User updated: ${email}`);
        } else {
            await pool.request()
                .input('name', sql.NVarChar, name)
                .input('email', sql.NVarChar, email)
                .input('phone', sql.NVarChar, phone)
                .query(`
                    INSERT INTO FME_logins.users (name, email, phone_number, created_at, last_login)
                    VALUES (@name, @email, @phone, GETDATE(), GETDATE())
                `);
            console.log(`New user registered: ${email}`);
        }

        if (otpChannel === 'firebase' || otpChannel === 'phone_email') {
            return res.status(200).json({ message: 'User data stored/synced successfully', result: 'Verified' });
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        // 1) SAVE THE GENERATED OTP TO THE DATABASE INSTEAD OF LOCAL MEMORY
        await pool.request()
            .input('otp', sql.NVarChar, otp)
            .input('email', sql.NVarChar, email)
            .input('phone', sql.NVarChar, phone)
            .query(`
                UPDATE FME_logins.users 
                SET otp = @otp 
                WHERE email = @email AND phone_number = @phone
            `);

        if (otpChannel === 'sms') {
            console.log(`\n================================`);
            console.log(`[OTP Generated in DB] For ${phone}: ${otp}`);
            console.log(`================================\n`);

            const sent = await sendPhoneEmailOtp(phone, otp);
            if (sent) {
                return res.status(200).json({ message: 'OTP sent via Phone.Email', success: true });
            } else {
                return res.status(200).json({ message: 'OTP Generated (Check Console). SMS failed (Config missing?)', success: true });
            }
        } else {
            console.log(`\n================================`);
            console.log(`[OTP Generated in DB] For ${email}: ${otp}`);
            console.log(`================================\n`);

            await sendOtpEmail(email, otp);
            res.status(200).json({ message: 'User data stored successfully', result: 'OTP Sent via Email', success: true });
        }

    } catch (err) {
        console.error('Error storing data:', err);
        res.status(500).send({ message: 'Server error', error: err.message });
    }
});

/* ============================
   AUTH - SEND OTP (Phone.Email)
============================ */
app.post('/auth/send-otp', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ message: 'Phone number required' });

        if (!/^\d+$/.test(phone)) {
            return res.status(400).json({ message: 'Phone number should not contain special characters' });
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('otp', sql.NVarChar, otp)
            .input('phone', sql.NVarChar, phone)
            .query(`
                UPDATE FME_logins.users 
                SET otp = @otp 
                WHERE phone_number = @phone
            `);

        console.log(`[Auth] OTP stored in DB for ${phone}: ${otp}`);

        const sent = await sendPhoneEmailOtp(phone, otp);
        if (sent) {
            res.status(200).json({ status: 200, message: 'OTP sent successfully', success: true });
        } else {
            res.status(500).json({ status: 500, message: 'Failed to send OTP via Phone.Email', success: false });
        }
    } catch (err) {
        console.error('Error in /auth/send-otp:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/* ============================
   AUTH - VERIFY OTP (Phone.Email)
============================ */
app.post('/auth/verify-otp', async (req, res) => {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP required' });

        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('phone', sql.NVarChar, phone)
            .input('otp', sql.NVarChar, otp)
            .query(`SELECT * FROM FME_logins.users WHERE phone_number = @phone AND otp = @otp`);

        if (result.recordset.length > 0) {
            // Clear the OTP to prevent reuse
            await pool.request()
                .input('phone', sql.NVarChar, phone)
                .query(`UPDATE FME_logins.users SET otp = NULL WHERE phone_number = @phone`);

            res.status(200).json({
                status: 200,
                message: 'OTP Verified',
                token: 'mock-jwt-token-from-backend',
                success: true
            });
        } else {
            res.status(400).json({ status: 400, message: 'Invalid OTP', success: false });
        }
    } catch (err) {
        console.error('Error in /auth/verify-otp:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

/* ============================
   UPDATE LOCATION
============================ */
app.post('/api/update-location', async (req, res) => {
    try {
        const { email, latitude, longitude } = req.body;

        if (!email || !latitude || !longitude) {
            return res.status(400).json({ message: 'Email and Location data are required' });
        }

        const locationLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

        const pool = await sql.connect(dbConfig);

        await pool.request()
            .input('email', sql.NVarChar, email)
            .input('latitude', sql.NVarChar, latitude.toString())
            .input('longitude', sql.NVarChar, longitude.toString())
            .input('location_link', sql.NVarChar, locationLink)
            .query(`
                UPDATE FME_logins.users 
                SET latitude = @latitude, longitude = @longitude, location_link = @location_link
                WHERE email = @email
            `);

        console.log(`Location updated for ${email}: ${locationLink}`);
        res.status(200).json({ message: 'Location updated successfully', success: true, link: locationLink });

    } catch (err) {
        console.error('Error updating location:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

/* ============================
   VERIFY OTP MAIN
============================ */
app.post('/api/verify-otp', async (req, res) => {
    try {
        const { email, phone, otp } = req.body;

        if (!otp) {
            return res.status(400).send({ message: 'OTP is required' });
        }

        const pool = await sql.connect(dbConfig);
        let queryCondition = '';
        if (email && phone) {
            queryCondition = `(email = @email OR phone_number = @phone)`;
        } else if (email) {
            queryCondition = `email = @email`;
        } else if (phone) {
            queryCondition = `phone_number = @phone`;
        }

        const result = await pool.request()
            .input('email', sql.NVarChar, email || '')
            .input('phone', sql.NVarChar, phone || '')
            .input('otp', sql.NVarChar, otp)
            .query(`SELECT * FROM FME_logins.users WHERE ${queryCondition} AND otp = @otp`);

        if (result.recordset.length > 0) {
            // Nullify the OTP so it can't be reused over and over
            await pool.request()
                .input('email', sql.NVarChar, email || '')
                .input('phone', sql.NVarChar, phone || '')
                .query(`UPDATE FME_logins.users SET otp = NULL WHERE ${queryCondition}`);

            return res.status(200).json({ message: 'OTP Verified Successfully (DB)', success: true });
        }

        return res.status(400).json({ message: 'Invalid OTP', success: false });

    } catch (err) {
        console.error('Error in /api/verify-otp:', err);
        res.status(500).json({ message: 'Server error' });
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
        console.error('Error fetching questions:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

/* ============================
   SUBMIT RESULT
============================ */
app.post('/api/submit-result', async (req, res) => {
    try {
        const { email, score, name, questions, userAnswers } = req.body;

        if (!email || score === undefined) {
            return res.status(400).json({ message: 'Email and Score are required' });
        }

        let certNo = null;
        const finalMarks = score * 2;

        if (finalMarks >= 80) {
            const today = new Date();
            const randomNum = Math.floor(1000000000 + Math.random() * 9000000000);
            certNo = `ZF${today.getFullYear()}${randomNum}`;
        }

        const pool = await sql.connect(dbConfig);

        await pool.request()
            .input('email', sql.NVarChar, email)
            .input('score', sql.Int, finalMarks)
            .input('certNo', sql.NVarChar, certNo)
            .query(`
                UPDATE FME_logins.users 
                SET finalMarks = @score, certificate_number = @certNo
                WHERE email = @email
            `);

        console.log(`Score updated for ${email}: ${score}. Cert: ${certNo}`);

        await sendCertificateEmail(email, name, score, certNo, questions, userAnswers);

        if (certNo) {
            res.status(200).json({ message: 'Score updated and certificate generated', success: true });
        } else {
            res.status(200).json({ message: 'Score updated. User did not qualify.', success: true });
        }

    } catch (err) {
        console.error('Error updating score:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

/* ============================
   TEST CRON (Manual Trigger)
============================ */
app.get('/api/test-cron', async (req, res) => {
    try {
        console.log('[API] Manual cron trigger initiated');
        await generateAndSendReport();
        res.status(200).json({ message: 'Report generation triggered successfully. Check logs/email.' });
    } catch (err) {
        console.error('[API] Manual cron trigger failed:', err);
        res.status(500).json({ message: 'Failed to trigger report', error: err.message });
    }
});

/* ============================
   START SERVER
============================ */
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    checkMissedReport();
});
