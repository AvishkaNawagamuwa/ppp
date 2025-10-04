const mysql = require('mysql2');
require('dotenv').config();

// LSA Spa Management System Database Connection
// MySQL Connection Pool for better performance and scalability
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '12345678',  // Your MySQL password
  database: 'lsa_spa_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Promise wrapper for async/await support
const promisePool = pool.promise();

// Test connection
promisePool.getConnection()
  .then(connection => {
    console.log('✅ MySQL Connected to LSA Spa Management Database');
    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL Connection Error:', err.message);
  });

module.exports = promisePool;