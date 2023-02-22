// Import the dependencies of MySQL2/promise library to handle the MySQL database connection using promises

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load the dotenv library to read the environment variables from the .env file

dotenv.config();

// Create a new MYSQL database connection using the environment variables from the .env file

const connection = mysql.createConnection ({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Export the connection object so that it can be used by other modules

module.exports = connection;