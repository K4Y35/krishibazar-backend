import { pool } from './index.js';

const runSelectSqlQuery = async (sql, values = []) => {
  const [rows] = await pool.query(sql, values);
  return rows;
};

const runInsertSqlQuery = async (sql, values = [], conn = null) => {
  const executor = conn || pool;
  const [result] = await executor.query(sql, values);
  return result;
};

const runUpdateSqlQuery = async (sql, values = [], conn = null) => {
  const executor = conn || pool;
  const [result] = await executor.query(sql, values);
  return result;
};

const runDeleteSqlQuery = async (sql, values = [], conn = null) => {
  const executor = conn || pool;
  const [result] = await executor.query(sql, values);
  return result;
};

export {
  runSelectSqlQuery,
  runInsertSqlQuery,
  runUpdateSqlQuery,
  runDeleteSqlQuery,
};


