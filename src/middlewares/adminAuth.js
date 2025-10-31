import jwt from 'jsonwebtoken';
import { runSelectSqlQuery } from '../db/sqlfunction.js';
import { Admins } from "../db/model.js";

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token)
      return res.status(401).json({ error: "No authentication token found" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const rows = await runSelectSqlQuery(
      `SELECT id, username, email, name FROM ${Admins} WHERE id = ?`,
      [decoded.id]
    );

    if (rows.length === 0)
      return res.status(401).json({ error: "Admin not found" });

    const admin = rows[0];

    req.admin = admin;
    req.user = admin;
    next();
  } catch (error) {
    console.error("Admin authentication error:", error);
    res.status(401).json({ error: "Please authenticate as admin" });
  }
};

export default adminAuth;


