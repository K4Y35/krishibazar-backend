import { pool } from './index.js';

export const runSelectSqlQuery = async (sql, values = []) => {
  const [rows] = await pool.query(sql, values);
  return rows;
};

export const runInsertSqlQuery = async (sql, values = [], conn = null) => {
  const executor = conn || pool;
  const [result] = await executor.query(sql, values);
  return result;
};

export const runUpdateSqlQuery = async (sql, values = [], conn = null) => {
  const executor = conn || pool;
  const [result] = await executor.query(sql, values);
  return result;
};

export const runDeleteSqlQuery = async (sql, values = [], conn = null) => {
  const executor = conn || pool;
  const [result] = await executor.query(sql, values);
  return result;
};



