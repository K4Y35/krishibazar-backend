import * as PermissionModel from "../../models/Permission.js";
import * as RoleModel from "../../models/Role.js";
import * as AdminRBACModel from "../../models/AdminRBAC.js";
import { runInsertSqlQuery, runSelectSqlQuery } from "../../db/sqlfunction.js";
import { Admins } from "../../db/model.js";
import bcrypt from "bcryptjs";

// ============ PERMISSIONS ============

export const getAllPermissions = async (req, res) => {
  try {
    const permissions = await PermissionModel.getAllPermissions();
    return res.json({
      success: true,
      data: permissions
    });
  } catch (error) {
    console.error("Get all permissions error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch permissions"
    });
  }
};

export const createPermission = async (req, res) => {
  try {
    const { permission_key, label } = req.body;

    if (!permission_key || !label) {
      return res.status(400).json({
        success: false,
        message: "Permission key and label are required"
      });
    }

    // Check if permission already exists
    const existing = await PermissionModel.getPermissionByKey(permission_key);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Permission with this key already exists"
      });
    }

    const result = await PermissionModel.createPermission(permission_key, label);

    return res.json({
      success: true,
      message: "Permission created successfully",
      data: {
        id: result.insertId,
        permission_key,
        label
      }
    });
  } catch (error) {
    console.error("Create permission error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create permission"
    });
  }
};

export const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { permission_key, label } = req.body;

    if (!permission_key || !label) {
      return res.status(400).json({
        success: false,
        message: "Permission key and label are required"
      });
    }

    await PermissionModel.updatePermission(id, permission_key, label);

    return res.json({
      success: true,
      message: "Permission updated successfully"
    });
  } catch (error) {
    console.error("Update permission error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update permission"
    });
  }
};

export const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;

    await PermissionModel.deletePermission(id);

    return res.json({
      success: true,
      message: "Permission deleted successfully"
    });
  } catch (error) {
    console.error("Delete permission error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete permission"
    });
  }
};

// ============ ROLES ============

export const getAllRoles = async (req, res) => {
  try {
    const roles = await RoleModel.getAllRolesWithPermissions();
    return res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error("Get all roles error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch roles"
    });
  }
};

export const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await RoleModel.getRoleWithPermissions(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }

    return res.json({
      success: true,
      data: role
    });
  } catch (error) {
    console.error("Get role error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch role"
    });
  }
};

export const createRole = async (req, res) => {
  try {
    const { name, permission_ids } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Role name is required"
      });
    }

    const result = await RoleModel.createRole(name);
    const roleId = result.insertId;

    // Assign permissions if provided
    if (permission_ids && permission_ids.length > 0) {
      await RoleModel.setRolePermissions(roleId, permission_ids);
    }

    const role = await RoleModel.getRoleWithPermissions(roleId);

    return res.json({
      success: true,
      message: "Role created successfully",
      data: role
    });
  } catch (error) {
    console.error("Create role error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create role"
    });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, permission_ids } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Role name is required"
      });
    }

    await RoleModel.updateRole(id, name);

    // Update permissions if provided
    if (permission_ids !== undefined) {
      await RoleModel.setRolePermissions(id, permission_ids);
    }

    const role = await RoleModel.getRoleWithPermissions(id);

    return res.json({
      success: true,
      message: "Role updated successfully",
      data: role
    });
  } catch (error) {
    console.error("Update role error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update role"
    });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    await RoleModel.deleteRole(id);

    return res.json({
      success: true,
      message: "Role deleted successfully"
    });
  } catch (error) {
    console.error("Delete role error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete role"
    });
  }
};

// ============ ADMINS ============

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await AdminRBACModel.getAllAdmins();

    // Get roles and permissions for each admin
    const adminsWithRBAC = await Promise.all(
      admins.map(async (admin) => {
        const adminData = await AdminRBACModel.getAdminWithRolesAndPermissions(admin.id);
        const effectivePermissions = await AdminRBACModel.getAdminEffectivePermissions(admin.id);
        
        return {
          ...adminData,
          effectivePermissions
        };
      })
    );

    return res.json({
      success: true,
      data: adminsWithRBAC
    });
  } catch (error) {
    console.error("Get all admins error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admins"
    });
  }
};

export const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await AdminRBACModel.getAdminWithRolesAndPermissions(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    const effectivePermissions = await AdminRBACModel.getAdminEffectivePermissions(id);

    return res.json({
      success: true,
      data: {
        ...admin,
        effectivePermissions
      }
    });
  } catch (error) {
    console.error("Get admin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin"
    });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, username, email, password, role_ids, permission_ids } = req.body;

    // Validate required fields
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, username, email, and password are required"
      });
    }

    // Check if username already exists
    const existingUsername = await runSelectSqlQuery(
      `SELECT id FROM ${Admins} WHERE username = ?`,
      [username]
    );

    if (existingUsername.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Username already exists"
      });
    }

    // Check if email already exists
    const existingEmail = await runSelectSqlQuery(
      `SELECT id FROM ${Admins} WHERE email = ?`,
      [email]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const result = await runInsertSqlQuery(
      `INSERT INTO ${Admins} (name, username, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [name, username, email, hashedPassword]
    );

    const adminId = result.insertId;

    // Assign roles if provided
    if (role_ids && Array.isArray(role_ids) && role_ids.length > 0) {
      await AdminRBACModel.setAdminRoles(adminId, role_ids);
    }

    // Assign direct permissions if provided
    if (permission_ids && Array.isArray(permission_ids) && permission_ids.length > 0) {
      await AdminRBACModel.setAdminPermissions(adminId, permission_ids);
    }

    // Fetch the created admin with roles and permissions
    const admin = await AdminRBACModel.getAdminWithRolesAndPermissions(adminId);
    const effectivePermissions = await AdminRBACModel.getAdminEffectivePermissions(adminId);

    return res.json({
      success: true,
      message: "Admin created successfully",
      data: {
        ...admin,
        effectivePermissions
      }
    });
  } catch (error) {
    console.error("Create admin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create admin"
    });
  }
};

export const updateAdminRoles = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_ids } = req.body;

    if (!Array.isArray(role_ids)) {
      return res.status(400).json({
        success: false,
        message: "role_ids must be an array"
      });
    }

    await AdminRBACModel.setAdminRoles(id, role_ids);

    const admin = await AdminRBACModel.getAdminWithRolesAndPermissions(id);
    const effectivePermissions = await AdminRBACModel.getAdminEffectivePermissions(id);

    return res.json({
      success: true,
      message: "Admin roles updated successfully",
      data: {
        ...admin,
        effectivePermissions
      }
    });
  } catch (error) {
    console.error("Update admin roles error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update admin roles"
    });
  }
};

export const updateAdminPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permission_ids } = req.body;

    if (!Array.isArray(permission_ids)) {
      return res.status(400).json({
        success: false,
        message: "permission_ids must be an array"
      });
    }

    await AdminRBACModel.setAdminPermissions(id, permission_ids);

    const admin = await AdminRBACModel.getAdminWithRolesAndPermissions(id);
    const effectivePermissions = await AdminRBACModel.getAdminEffectivePermissions(id);

    return res.json({
      success: true,
      message: "Admin permissions updated successfully",
      data: {
        ...admin,
        effectivePermissions
      }
    });
  } catch (error) {
    console.error("Update admin permissions error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update admin permissions"
    });
  }
};

export const getMyPermissions = async (req, res) => {
  try {
    const admin = req.user;

    // Superadmin has all permissions
    if (admin.username === "superadmin") {
      const allPermissions = await PermissionModel.getAllPermissions();
      return res.json({
        success: true,
        data: allPermissions
      });
    }

    const permissions = await AdminRBACModel.getAdminEffectivePermissions(admin.id);

    return res.json({
      success: true,
      data: permissions
    });
  } catch (error) {
    console.error("Get my permissions error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch permissions"
    });
  }
};

