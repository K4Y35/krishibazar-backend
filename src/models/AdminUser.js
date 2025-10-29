import { Admins } from "../db/model.js";
import { runSelectSqlQuery } from "../db/sqlfunction.js";





export const getAdminUserByUsername = async (username) => {
  const sql = `SELECT * FROM ${Admins} WHERE lower(username) = ? `;
  return runSelectSqlQuery(sql, [username.toLowerCase()]);
};