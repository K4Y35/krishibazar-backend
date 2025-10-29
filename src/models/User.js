import { Users } from '../db/model.js';
import {
  runSelectSqlQuery,
  runInsertSqlQuery,
  runUpdateSqlQuery,
  runDeleteSqlQuery,
} from '../db/sqlfunction.js';


export const getUserByPhone = async (phone) => {
  const sql = `SELECT * FROM ${Users} WHERE phone = ?`;
  return runSelectSqlQuery(sql, [phone]);
};

export const getUserByEmail = async (email) => {
  const sql = `SELECT * FROM ${Users} WHERE email = ?`;
  return runSelectSqlQuery(sql, [email]);
};

export const createUser = async (data) => {
  const sql = `INSERT INTO ${Users} (first_name, last_name, phone, email, nid_front, nid_back, password)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
  return runInsertSqlQuery(sql, [
    data.first_name,
    data.last_name,
    data.phone,
    data.email,
    data.nid_front,
    data.nid_back,
    data.password_hash,
  ]);
};

export const updateUser = async (id) => {
  const sql = `UPDATE ${Users} SET is_verified = 1 WHERE id = ?`;
  return runUpdateSqlQuery(sql, [id]);
};

export const updateUserPhoneVerified = async (id) => {
  const sql = `UPDATE ${Users} SET is_verified = TRUE, email_verified_at = NOW() WHERE id = ?`;
  return runUpdateSqlQuery(sql, [id]);
};

export const getAllUsers = async () => {
  const sql = `SELECT * FROM ${Users}`;
  return runSelectSqlQuery(sql);
};

export const getUserDetails = async (id) => {
  const sql = `SELECT * FROM ${Users} WHERE id = ?`;
  return runSelectSqlQuery(sql, [id]);
};

export const approveUser = async (id) => {
  const sql = `UPDATE ${Users} SET is_approved = 1 WHERE id = ?`;
  return runUpdateSqlQuery(sql, [id]);
};

export const updateUserPassword = async (id, password_hash) => {
  const sql = `UPDATE ${Users} SET password = ? WHERE id = ?`;
  return runUpdateSqlQuery(sql, [password_hash, id]);
};