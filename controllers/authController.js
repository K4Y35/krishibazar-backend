const bcrypt = require('bcryptjs');
const db = require('../db');
const jwt = require('jsonwebtoken');

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register new user
const register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      phone,
      email,
      password,
      usertype
    } = req.body;
    

    // Check if files were uploaded
    if (!req.files || !req.files.nid_front || !req.files.nid_back) {
      return res.status(400).json({
        success: false,
        message: 'Both NID front and back images are required'
      });
    }

    // Get file paths
    const nid_front = req.files.nid_front[0].filename;
    const nid_back = req.files.nid_back[0].filename;

    // Check if user already exists
    const [existingUser] = await db.query(
      'SELECT id FROM users WHERE phone = ? OR email = ?',
      [phone, email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this phone or email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp_code = generateOTP();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Create user
    const [result] = await db.query(
      `INSERT INTO users (
        first_name, last_name, phone, email, usertype,
        nid_front, nid_back, password_hash, otp_code, otp_expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name, last_name, phone, email, usertype,
        nid_front, nid_back, password_hash, otp_code, otp_expires_at
      ]
    );

    // TODO: Send OTP via SMS service

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your phone number.',
      data: {
        user_id: result.insertId,
        phone
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  const { phone, otp_code } = req.body;

  try {
    const [user] = await db.query(
      'SELECT id, otp_code, otp_expires_at FROM users WHERE phone = ?',
      [phone]
    );

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user[0].otp_code !== otp_code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    if (new Date(user[0].otp_expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Mark phone as verified
    await db.query(
      'UPDATE users SET is_phone_verified = TRUE, otp_code = NULL WHERE id = ?',
      [user[0].id]
    );

    res.json({
      success: true,
      message: 'Phone number verified successfully'
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed'
    });
  }
};

// Login user
const login = async (req, res) => {
  const { username, password } = req.body; // username can be phone or email

  try {
    // Find user by phone or email
    const [users] = await db.query(
      'SELECT id, first_name, last_name, phone, email, usertype, password_hash, is_phone_verified, is_approved FROM users WHERE phone = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if phone is verified (skip for approved users)
    if (!user.is_phone_verified && !user.is_approved) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your phone number first'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        user_id: user.id,
        phone: user.phone,
        email: user.email,
        usertype: user.usertype
      },
      process.env.JWT_SECRET || 'your_super_secure_jwt_secret_key_for_krishibazaar_2024',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          email: user.email,
          usertype: user.usertype,
          is_approved: user.is_approved
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

module.exports = {
  register,
  verifyOTP,
  login
}; 