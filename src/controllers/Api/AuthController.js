import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as UserDB from '../../models/User.js';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const register = async (req, res) => {
  console.log(req.body);
  try {
    const { first_name, last_name, phone, email, password, usertype,nid_front,nid_back } = req.body;

    if (!nid_front || !nid_back) {
      return res.status(400).json({ success: false, message: 'Both NID front and back images are required' });
    }

    if (first_name === '' || last_name === '' || phone === '' || email === '' || password === '' || usertype === '') {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const [byPhone] = await UserDB.getUserByPhone(phone);
    const [byEmail] = await UserDB.getUserByEmail(email);

    
    if ((byPhone && byPhone.id) || (byEmail && byEmail.id)) {
      return res.status(400).json({ success: false, message: 'User with this phone or email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const otp_code = generateOTP();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);

    const result = await UserDB.createUser({
      first_name,
      last_name,
      phone,
      email,
      usertype,
      nid_front,
      nid_back,
      password_hash,
      otp_code,
      otp_expires_at,
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your phone number.',
      data: { user_id: result.insertId, phone },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

const verifyOTP = async (req, res) => {
  const { phone, otp_code } = req.body;
  try {
    const rows = await UserDB.getUserForOtp(phone);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = rows[0];
    if (user.otp_code !== otp_code) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    if (new Date(user.otp_expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    await UserDB.updateUserPhoneVerified(user.id);
    return res.json({ success: true, message: 'Phone number verified successfully' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('OTP verification error:', err);
    return res.status(500).json({ success: false, message: 'OTP verification failed' });
  }
};

const login = async (req, res) => {
  const { phone, password } = req.body;
  try {
    const rows = await UserDB.getUserByPhoneOrEmail(phone);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.is_verified && !user.is_approved) {
      return res.status(403).json({ success: false, message: 'Please verify your phone number first' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        phone: user.phone,
        email: user.email,
        usertype: user.usertype,
      },
      process.env.JWT_SECRET || 'jwtKrishibazaar2025',
      { expiresIn: '24h' },
    );

    return res.json({
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
          is_approved: user.is_approved,
        },
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
};

export { register, verifyOTP, login };


