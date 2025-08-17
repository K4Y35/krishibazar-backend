import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'krishibazar',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const promisePool = pool.promise();

const connectDB = async () => {
  try {
    const [rows] = await promisePool.query('SELECT 1 + 1 AS result');
    return rows;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('DB connection test failed:', err);
    throw err;
  }
};

export { promisePool as pool, connectDB };


