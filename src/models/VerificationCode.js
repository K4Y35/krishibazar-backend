import { VerificationCodes } from "../db/model.js";
import {
  runSelectSqlQuery,
  runInsertSqlQuery,
  runUpdateSqlQuery,
  runDeleteSqlQuery,
} from "../db/sqlfunction.js";

export const createVerificationCode = async (data) => {
  const sql = `
    INSERT INTO ${VerificationCodes} 
    (user_id, otp_code, verification_type, expires_at)
    VALUES (?, ?, ?, ?)
  `;

  return runInsertSqlQuery(sql, [
    data.user_id || null,
    data.code,
    data.type,
    data.expires_at,
  ]);
};


export const updateVerificationCode = async (id, data) => {
  const sql = `UPDATE ${VerificationCodes} SET otp_code = ?, expires_at = ? WHERE id = ?`;
  return runUpdateSqlQuery(sql, [data.code, data.expires_at, id]);
};

export const getVerificationCodeById = async (userId, type) => {
  const sql = `SELECT * FROM ${VerificationCodes} WHERE user_id = ? AND verification_type = ?`;
  return runSelectSqlQuery(sql, [userId, type]);
};

export const invalidateUserCodes = async (userId, type) => {
  const sql = `DELETE FROM ${VerificationCodes} WHERE user_id = ? AND verification_type = ?`;
  return runDeleteSqlQuery(sql, [userId, type]);
};