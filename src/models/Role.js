import { runSelectSqlQuery, runInsertSqlQuery, runUpdateSqlQuery, runDeleteSqlQuery } from "../db/sqlfunction.js";
import { Roles, RolePermissions, Permissions } from "../db/model.js";

export const getAllRoles = async () => {
  return await runSelectSqlQuery(`SELECT * FROM ${Roles} ORDER BY name`);
};

export const getRoleById = async (id) => {
  const rows = await runSelectSqlQuery(
    `SELECT * FROM ${Roles} WHERE id = ?`,
    [id]
  );
  return rows[0];
};

export const getRoleWithPermissions = async (roleId) => {
  const role = await getRoleById(roleId);
  if (!role) return null;

  const permissions = await runSelectSqlQuery(
    `SELECT p.* FROM ${Permissions} p
     INNER JOIN ${RolePermissions} rp ON p.id = rp.permission_id
     WHERE rp.role_id = ?`,
    [roleId]
  );

  return {
    ...role,
    permissions
  };
};

export const getAllRolesWithPermissions = async () => {
  const roles = await getAllRoles();
  
  const rolesWithPermissions = await Promise.all(
    roles.map(async (role) => {
      const permissions = await runSelectSqlQuery(
        `SELECT p.* FROM ${Permissions} p
         INNER JOIN ${RolePermissions} rp ON p.id = rp.permission_id
         WHERE rp.role_id = ?`,
        [role.id]
      );
      return {
        ...role,
        permissions
      };
    })
  );

  return rolesWithPermissions;
};

export const createRole = async (name) => {
  return await runInsertSqlQuery(
    `INSERT INTO ${Roles} (name) VALUES (?)`,
    [name]
  );
};

export const updateRole = async (id, name) => {
  return await runUpdateSqlQuery(
    `UPDATE ${Roles} SET name = ? WHERE id = ?`,
    [name, id]
  );
};

export const deleteRole = async (id) => {
  return await runDeleteSqlQuery(
    `DELETE FROM ${Roles} WHERE id = ?`,
    [id]
  );
};

export const assignPermissionToRole = async (roleId, permissionId) => {
  return await runInsertSqlQuery(
    `INSERT IGNORE INTO ${RolePermissions} (role_id, permission_id) VALUES (?, ?)`,
    [roleId, permissionId]
  );
};

export const removePermissionFromRole = async (roleId, permissionId) => {
  return await runDeleteSqlQuery(
    `DELETE FROM ${RolePermissions} WHERE role_id = ? AND permission_id = ?`,
    [roleId, permissionId]
  );
};

export const setRolePermissions = async (roleId, permissionIds) => {
  // Remove all existing permissions for this role
  await runDeleteSqlQuery(
    `DELETE FROM ${RolePermissions} WHERE role_id = ?`,
    [roleId]
  );

  // Add new permissions
  if (permissionIds && permissionIds.length > 0) {
    const values = permissionIds.map(permId => [roleId, permId]);
    const placeholders = values.map(() => '(?, ?)').join(', ');
    const flatValues = values.flat();
    
    await runInsertSqlQuery(
      `INSERT INTO ${RolePermissions} (role_id, permission_id) VALUES ${placeholders}`,
      flatValues
    );
  }
};

