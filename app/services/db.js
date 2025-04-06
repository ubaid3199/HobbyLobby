require("dotenv").config();
const mysql = require('mysql2/promise');

// Validate required environment variables
const requiredEnvVars = ['DB_CONTAINER', 'DB_PORT', 'MYSQL_ROOT_USER', 'MYSQL_ROOT_PASSWORD', 'MYSQL_DATABASE'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const config = {
  host: process.env.DB_CONTAINER,
  port: process.env.DB_PORT,
  user: process.env.MYSQL_ROOT_USER,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10, // Increased from 2 for better performance
  queueLimit: 0,
  namedPlaceholders: true, // Enable named parameters
  decimalNumbers: true, // Return decimals as numbers instead of strings
  timezone: '+00:00', // UTC timezone
  connectTimeout: 10000, // 10 seconds connection timeout
  multipleStatements: false // For security
};

const pool = mysql.createPool(config);

// Utility function to query the database with better error handling
async function query(sql, params = []) {
  // Convert undefined parameters to null
  const safeParams = Array.isArray(params) 
    ? params.map(p => (p === undefined ? null : p))
    : params;

  try {
    console.log('Executing query:', sql, 'with params:', safeParams);
    const [rows] = await pool.execute(sql, safeParams);
    return rows;
  } catch (error) {
    console.error('Database query error:', {
      sql: sql,
      params: safeParams,
      error: error.message
    });
    throw new Error('Database operation failed');
  }
}

// Add health check function
async function checkConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

module.exports = {
  query,
  pool, // Export pool for transactions if needed
  checkConnection
};