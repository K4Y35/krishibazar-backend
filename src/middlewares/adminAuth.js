import jwt from 'jsonwebtoken';
import { runSelectSqlQuery } from '../db/sqlfunction.js';

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No authentication token found' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const rows = await runSelectSqlQuery(
      'SELECT id, usertype FROM users WHERE id = ? AND deleted_at IS NULL',
      [decoded.id]
    );

    if (rows.length === 0) return res.status(401).json({ error: 'User not found' });

    const user = rows[0];
    if (user.usertype !== 0) return res.status(403).json({ error: 'Access denied. Admin privileges required.' });

    req.user = user;
    next();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Admin authentication error:', error);
    res.status(401).json({ error: 'Please authenticate as admin' });
  }
};

export default adminAuth;


