import { runSelectSqlQuery, runInsertSqlQuery, runUpdateSqlQuery, runDeleteSqlQuery } from "../db/sqlfunction.js";
import { Permissions } from "../db/model.js";

export const getAllPermissions = async () => {
  return await runSelectSqlQuery(`SELECT * FROM ${Permissions} ORDER BY label`);
};

export const getPermissionById = async (id) => {
  const rows = await runSelectSqlQuery(
    `SELECT * FROM ${Permissions} WHERE id = ?`,
    [id]
  );
  return rows[0];
};

export const getPermissionByKey = async (key) => {
  const rows = await runSelectSqlQuery(
    `SELECT * FROM ${Permissions} WHERE permission_key = ?`,
    [key]
  );
  return rows[0];
};

export const createPermission = async (permissionKey, label) => {
  return await runInsertSqlQuery(
    `INSERT INTO ${Permissions} (permission_key, label) VALUES (?, ?)`,
    [permissionKey, label]
  );
};

export const updatePermission = async (id, permissionKey, label) => {
  return await runUpdateSqlQuery(
    `UPDATE ${Permissions} SET permission_key = ?, label = ? WHERE id = ?`,
    [permissionKey, label, id]
  );
};

export const deletePermission = async (id) => {
  return await runDeleteSqlQuery(
    `DELETE FROM ${Permissions} WHERE id = ?`,
    [id]
  );
};

