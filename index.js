import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import db from "./db.js";
import adminRoutes from "./src/routes/admin/index.js";
import userRoutes from "./src/routes/users/index.js";
import sharedRoutes from "./src/routes/Shared/index.js";
import publicProjectRoutes from "./src/routes/public/projects.js";
import publicProductRoutes from "./src/routes/public/products.js";
import publicCategoryRoutes from "./src/routes/public/categories.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use("/public", express.static(path.join(__dirname, "src/public")));

app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use("/shared", sharedRoutes);
app.use("/api/projects", publicProjectRoutes);
app.use("/api/products", publicProductRoutes);
app.use("/api/categories", publicCategoryRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to KrishiBazar API" });
});

// Socket.io Connection Handling
const connectedUsers = new Map();
const connectedAdmins = new Map();

io.on("connection", (socket) => {
  // console.log("============ NEW SOCKET CONNECTION ============");
  // console.log("Socket ID:", socket.id);

  socket.on("auth", async (authData) => {
    const { userId, userType, name } = authData;
    // console.log("Auth received:", { userId, userType, name });

    if (userType === "admin") {
      connectedAdmins.set(userId, { socket, name, userId });
      io.emit("admin-online", connectedAdmins.size);
      // console.log("Admin connected. Total admins:", connectedAdmins.size);
    } else if (userType === "user") {
      connectedUsers.set(userId, { socket, name, userId });
      io.emit("user-online", connectedUsers.size);
      // console.log("User connected. Total users:", connectedUsers.size);
      // Notify all admins
      connectedAdmins.forEach((admin) => {
        admin.socket.emit("user-connected", userId);
      });
    }
  });

  // Handle sending messages
  socket.on("send-message", async (data) => {
    try {
      // console.log("\n============ NEW MESSAGE RECEIVED ============");
      // console.log("Full message data:", JSON.stringify(data, null, 2));

      const { senderId, senderType, message, receiverId } = data;

      // Validate data
      if (!senderId || !senderType || !message) {
        console.error("Invalid message data:", data);
        socket.emit("error", { message: "Invalid message data" });
        return;
      }

      // Save to database
      const query = `INSERT INTO chat_messages (sender_id, sender_type, receiver_id, message) VALUES (?, ?, ?, ?)`;

      // console.log("About to insert into database...");

      db.query(query, [senderId, senderType, receiverId || null, message])
        .then(([result]) => {

          const messageData = {
            id: result.insertId,
            message,
            senderType,
            senderName:
              data.senderName || (senderType === "user" ? "User" : "Admin"),
            senderId,
            createdAt: data.createdAt || new Date().toISOString(),
            isRead: false,
          };


          // Broadcast to all admins if user sent
          if (senderType === "user") {
            if (connectedAdmins.size > 0) {
              connectedAdmins.forEach((admin) => {
                admin.socket.emit("message", messageData);
              });
            } 
          } else {
            // Admin sending to specific user
            if (receiverId && connectedUsers.has(receiverId)) {
              const targetUser = connectedUsers.get(receiverId);
              targetUser.socket.emit("message", messageData);
            }
          }

          // Also send back to sender to confirm
          socket.emit("message-sent", messageData);
        })
        .catch((err) => {
          console.error("Error saving message to database:", err);
          console.error("SQL Error details:", err.message);
          console.error("Query:", query);
          console.error("Params:", [
            senderId,
            senderType,
            receiverId || null,
            message,
          ]);
          socket.emit("error", {
            message: "Failed to save message",
            error: err.message,
          });
        });
    } catch (error) {
      console.error("Error handling message:", error);
      socket.emit("error", {
        message: "Failed to process message",
        error: error.message,
      });
    }
  });

  socket.on("disconnect", () => {
    connectedAdmins.forEach((admin, adminId) => {
      if (admin.socket.id === socket.id) {
        connectedAdmins.delete(adminId);
        io.emit("admin-online", connectedAdmins.size);
      }
    });

    connectedUsers.forEach((user, userId) => {
      if (user.socket.id === socket.id) {
        connectedUsers.delete(userId);
        io.emit("user-online", connectedUsers.size);
      }
    });
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Something went wrong!",
  });
});

httpServer.listen(PORT, () => {
  console.log(`KrishiBazar API running on http://localhost:${PORT}`);
  console.log(`Socket.io server ready`);
});
