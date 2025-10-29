import * as UserDB from "../../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await UserDB.getAllUsers();
    return res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error getting all users:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting all users",
    });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }
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

export const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id,"id");
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }
    const user = await UserDB.getUserDetails(id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    await UserDB.approveUser(id);
    return res.json({
      success: true,
      message: "User approved successfully",
    });
  } catch (error) {
    console.error("Error approving user:", error);
    return res.status(500).json({
      success: false,
      message: "Error approving user",
    });
  }
};
