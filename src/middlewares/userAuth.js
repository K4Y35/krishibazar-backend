import jwt from 'jsonwebtoken';
import { runSelectSqlQuery } from '../db/sqlfunction.js';

const userAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'No authentication token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwtKrishibazaar2025');

    const rows = await runSelectSqlQuery(
      'SELECT id, first_name, last_name, phone, email, usertype, is_approved FROM users WHERE id = ? ',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('User authentication error:', error);
    return res.status(401).json({ success: false, message: 'Please authenticate' });
  }
};

export default userAuth;


