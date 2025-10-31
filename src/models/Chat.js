import { runSelectSqlQuery, runInsertSqlQuery, runUpdateSqlQuery } from "../db/sqlfunction.js";

export const getAllMessages = async (filters = {}) => {
  let query = `
    SELECT cm.*,
           u.first_name as sender_name
    FROM chat_messages cm
    LEFT JOIN users u ON cm.sender_id = u.id
  `;
  const params = [];
  const conditions = [];

  if (filters.sender_id) {
    conditions.push("cm.sender_id = ?");
    params.push(filters.sender_id);
  }

  if (filters.receiver_id) {
    conditions.push("cm.receiver_id = ?");
    params.push(filters.receiver_id);
  }

  if (filters.sender_type) {
    conditions.push("cm.sender_type = ?");
    params.push(filters.sender_type);
  }

  if (filters.user_id && filters.admin_id) {
    conditions.push(
      "((cm.sender_id = ? AND cm.receiver_id = ?) OR (cm.sender_id = ? AND cm.receiver_id = ?))"
    );
    params.push(filters.user_id, filters.admin_id, filters.admin_id, filters.user_id);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY cm.created_at DESC";

  if (filters.limit) {
    query += ` LIMIT ${filters.limit}`;
  }

  return await runSelectSqlQuery(query, params);
};

export const createMessage = async (messageData) => {
  const { sender_id, sender_type, receiver_id, message } = messageData;

  return await runInsertSqlQuery(
    `INSERT INTO chat_messages (sender_id, sender_type, receiver_id, message) VALUES (?, ?, ?, ?)`,
    [sender_id, sender_type, receiver_id, message]
  );
};

export const markAsRead = async (messageId) => {
  return await runUpdateSqlQuery(
    `UPDATE chat_messages SET is_read = true WHERE id = ?`,
    [messageId]
  );
};

export const markAllAsRead = async (sender_id, receiver_id) => {
  return await runUpdateSqlQuery(
    `UPDATE chat_messages SET is_read = true WHERE sender_id = ? AND receiver_id = ?`,
    [sender_id, receiver_id]
  );
};

export const getUnreadCount = async (receiver_id) => {
  const result = await runSelectSqlQuery(
    `SELECT COUNT(*) as count FROM chat_messages WHERE receiver_id = ? AND is_read = false`,
    [receiver_id]
  );
  return result[0].count;
};

