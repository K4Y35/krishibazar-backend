import * as UserDB from "../../models/User.js";
import bcrypt from "bcryptjs";

export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserDB.getUserDetails(id);

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error getting user details:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting user details",
    });
  }
};


export const changePassword = async (req, res) => {
  try {
    const authUserId = req.user?.id;
    const { current_password, new_password } = req.body || {};

    if (!authUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: "Current and new password are required" });
    }

    if (typeof new_password !== "string" || new_password.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    const rows = await UserDB.getUserDetails(authUserId);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = rows[0];

    const isCurrentValid = await bcrypt.compare(current_password, user.password);
    if (!isCurrentValid) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(new_password, salt);
    await UserDB.updateUserPassword(authUserId, password_hash);

    return res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Change password error:", error);
    return res.status(500).json({ success: false, message: "Failed to change password" });
  }
};
