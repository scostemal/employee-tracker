const mysql = require('mysql2');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '3ndur3@ND$urviv3!',
    database: process.env.DB_NAME || 'company_db'
};

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
    if(err) {
        console.error('Error connecting to database:', err.stack);
        return;
    }
    console.log('Connected to database as ID', connection.threadId);
});

module.exports = connection;

