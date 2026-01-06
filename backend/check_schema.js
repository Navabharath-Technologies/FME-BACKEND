const sql = require('mssql');
const dbConfig = require('./dbConfig');

async function checkColumn() {
    try {
        const pool = await sql.connect(dbConfig);
        console.log('Connected to Database.');

        const result = await pool.request().query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'certificate_number'
        `);

        if (result.recordset.length > 0) {
            console.log('VERIFIED: Column "certificate_number" EXISTS.');
        } else {
            console.log('FAILED: Column "certificate_number" DOES NOT EXIST.');
        }

        sql.close();
    } catch (err) {
        console.error('Check Error:', err);
    }
}

checkColumn();
