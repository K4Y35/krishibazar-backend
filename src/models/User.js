import { Users } from '../db/model.js';
import {
  runSelectSqlQuery,
  runInsertSqlQuery,
  runUpdateSqlQuery,
  runDeleteSqlQuery,
} from '../db/sqlfunction.js';

const getUserByPhoneOrEmail = async (username) => {
  const sql = `SELECT id, first_name, last_name, phone, email, usertype, password_hash, is_verified, is_approved
               FROM ${Users} WHERE phone = ? OR email = ?`;
  return runSelectSqlQuery(sql, [username, username]);
};

const getUserByPhone = async (phone) => {
  const sql = `SELECT * FROM ${Users} WHERE phone = ?`;
  return runSelectSqlQuery(sql, [phone]);
};

const getUserByEmail = async (email) => {
  const sql = `SELECT * FROM ${Users} WHERE email = ?`;
  return runSelectSqlQuery(sql, [email]);
};

const createUser = async (data) => {
  const sql = `INSERT INTO ${Users} (first_name, last_name, phone, email, usertype, nid_front, nid_back, password_hash, otp_code, otp_expires_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  return runInsertSqlQuery(sql, [
    data.first_name,
    data.last_name,
    data.phone,
    data.email,
    data.usertype,
    data.nid_front,
    data.nid_back,
    data.password_hash,
    data.otp_code,
    data.otp_expires_at,
  ]);
};

const updateUserPhoneVerified = async (id) => {
  const sql = `UPDATE ${Users} SET is_verified = TRUE, otp_code = NULL WHERE id = ?`;
  return runUpdateSqlQuery(sql, [id]);
};

const getUserForOtp = async (phone) => {
  const sql = `SELECT id, otp_code, otp_expires_at FROM ${Users} WHERE phone = ?`;
  return runSelectSqlQuery(sql, [phone]);
};

export {
  getUserByPhoneOrEmail,
  getUserByPhone,
  getUserByEmail,
  createUser,
  updateUserPhoneVerified,
  getUserForOtp,
};


