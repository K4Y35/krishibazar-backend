const jwt = require('jsonwebtoken');

const adminAuth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token found' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const [users] = await req.db.query(
      'SELECT id, usertype FROM users WHERE id = ? AND deleted_at IS NULL',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = users[0];

    // Check if user is admin (usertype = 0)
    if (user.usertype !== 0) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    // Add user info to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(401).json({ error: 'Please authenticate as admin' });
  }
};

module.exports = adminAuth; 