const dbConfig = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASS || 'Sa#7744',
    server: process.env.DB_SERVER || 'localhost\\SQLEXPRESS01',
    database: process.env.DB_NAME || 'FME_Unified_DB',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

module.exports = dbConfig;
