import * as AdminUserDB from "../../models/AdminUser.js";
import * as AdminRBACModel from "../../models/AdminRBAC.js";
import * as PermissionModel from "../../models/Permission.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const adminLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  const admin = await AdminUserDB.getAdminUserByUsername(username);

  if (admin.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Admin not found",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, admin[0].password);

  if (!isPasswordValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid password",
    });
  }

  const user = {
    id: admin[0].id,
    username: admin[0].username,
    email: admin[0].email,
    name: admin[0].name,
  };

  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "24h" });

  // Get permissions
  let permissions = [];
  if (user.username === "superadmin") {
    // Superadmin has all permissions
    permissions = await PermissionModel.getAllPermissions();
  } else {
    // Get effective permissions from roles and direct assignments
    permissions = await AdminRBACModel.getAdminEffectivePermissions(user.id);
  }

  return res.json({
    success: true,
    message: "Login successful",
    token,
    user,
    permissions,
  });
};
