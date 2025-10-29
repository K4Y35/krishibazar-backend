import { runSelectSqlQuery, runInsertSqlQuery, runDeleteSqlQuery } from "../db/sqlfunction.js";
import { Admins, AdminRoles, AdminPermissions, Roles, Permissions, RolePermissions } from "../db/model.js";

export const getAllAdmins = async () => {
  return await runSelectSqlQuery(
    `SELECT id, username, email, name, created_at FROM ${Admins} ORDER BY username`
  );
};

export const getAdminWithRolesAndPermissions = async (adminId) => {
  const admin = await runSelectSqlQuery(
    `SELECT id, username, email, name FROM ${Admins} WHERE id = ?`,
    [adminId]
  );

  if (admin.length === 0) return null;

  // Get roles assigned to admin
  const roles = await runSelectSqlQuery(
    `SELECT r.* FROM ${Roles} r
     INNER JOIN ${AdminRoles} ar ON r.id = ar.role_id
     WHERE ar.admin_id = ?`,
    [adminId]
  );

  // Get direct permissions assigned to admin
  const directPermissions = await runSelectSqlQuery(
    `SELECT p.* FROM ${Permissions} p
     INNER JOIN ${AdminPermissions} ap ON p.id = ap.permission_id
     WHERE ap.admin_id = ?`,
    [adminId]
  );

  return {
    ...admin[0],
    roles,
    directPermissions
  };
};

export const getAdminEffectivePermissions = async (adminId) => {
  // Get permissions from roles
  const rolePermissions = await runSelectSqlQuery(
    `SELECT DISTINCT p.permission_key, p.label, p.id 
     FROM ${Permissions} p
     INNER JOIN ${RolePermissions} rp ON p.id = rp.permission_id
     INNER JOIN ${AdminRoles} ar ON rp.role_id = ar.role_id
     WHERE ar.admin_id = ?`,
    [adminId]
  );

  // Get direct permissions
  const directPermissions = await runSelectSqlQuery(
    `SELECT DISTINCT p.permission_key, p.label, p.id
     FROM ${Permissions} p
     INNER JOIN ${AdminPermissions} ap ON p.id = ap.permission_id
     WHERE ap.admin_id = ?`,
    [adminId]
  );

  // Merge and deduplicate
  const permissionMap = new Map();
  [...rolePermissions, ...directPermissions].forEach(perm => {
    permissionMap.set(perm.permission_key, perm);
  });

  return Array.from(permissionMap.values());
};

export const assignRoleToAdmin = async (adminId, roleId) => {
  return await runInsertSqlQuery(
    `INSERT IGNORE INTO ${AdminRoles} (admin_id, role_id) VALUES (?, ?)`,
    [adminId, roleId]
  );
};

export const removeRoleFromAdmin = async (adminId, roleId) => {
  return await runDeleteSqlQuery(
    `DELETE FROM ${AdminRoles} WHERE admin_id = ? AND role_id = ?`,
    [adminId, roleId]
  );
};

export const setAdminRoles = async (adminId, roleIds) => {
  // Remove all existing roles for this admin
  await runDeleteSqlQuery(
    `DELETE FROM ${AdminRoles} WHERE admin_id = ?`,
    [adminId]
  );

  // Add new roles
  if (roleIds && roleIds.length > 0) {
    const values = roleIds.map(roleId => [adminId, roleId]);
    const placeholders = values.map(() => '(?, ?)').join(', ');
    const flatValues = values.flat();
    
    await runInsertSqlQuery(
      `INSERT INTO ${AdminRoles} (admin_id, role_id) VALUES ${placeholders}`,
      flatValues
    );
  }
};

export const assignPermissionToAdmin = async (adminId, permissionId) => {
  return await runInsertSqlQuery(
    `INSERT IGNORE INTO ${AdminPermissions} (admin_id, permission_id) VALUES (?, ?)`,
    [adminId, permissionId]
  );
};

export const removePermissionFromAdmin = async (adminId, permissionId) => {
  return await runDeleteSqlQuery(
    `DELETE FROM ${AdminPermissions} WHERE admin_id = ? AND permission_id = ?`,
    [adminId, permissionId]
  );
};

export const setAdminPermissions = async (adminId, permissionIds) => {
  // Remove all existing permissions for this admin
  await runDeleteSqlQuery(
    `DELETE FROM ${AdminPermissions} WHERE admin_id = ?`,
    [adminId]
  );

  // Add new permissions
  if (permissionIds && permissionIds.length > 0) {
    const values = permissionIds.map(permId => [adminId, permId]);
    const placeholders = values.map(() => '(?, ?)').join(', ');
    const flatValues = values.flat();
    
    await runInsertSqlQuery(
      `INSERT INTO ${AdminPermissions} (admin_id, permission_id) VALUES ${placeholders}`,
      flatValues
    );
  }
};

export const checkAdminPermission = async (adminId, permissionKey) => {
  const result = await runSelectSqlQuery(
    `SELECT COUNT(*) as count FROM (
      SELECT p.id FROM ${Permissions} p
      INNER JOIN ${RolePermissions} rp ON p.id = rp.permission_id
      INNER JOIN ${AdminRoles} ar ON rp.role_id = ar.role_id
      WHERE ar.admin_id = ? AND p.permission_key = ?
      UNION
      SELECT p.id FROM ${Permissions} p
      INNER JOIN ${AdminPermissions} ap ON p.id = ap.permission_id
      WHERE ap.admin_id = ? AND p.permission_key = ?
    ) AS combined`,
    [adminId, permissionKey, adminId, permissionKey]
  );

  return result[0].count > 0;
};

