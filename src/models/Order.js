import { runSelectSqlQuery, runInsertSqlQuery, runUpdateSqlQuery } from "../db/sqlfunction.js";

export const getAllOrders = async (filters = {}) => {
  let query = `
    SELECT o.*,
           u.first_name, u.last_name, u.email as user_email, u.phone as user_phone,
           p.name as product_name, p.category, p.product_images, p.type as product_type
    FROM product_orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN products p ON o.product_id = p.id
  `;
  const params = [];
  const conditions = [];

  if (filters.user_id) {
    conditions.push("o.user_id = ?");
    params.push(filters.user_id);
  }

  if (filters.product_id) {
    conditions.push("o.product_id = ?");
    params.push(filters.product_id);
  }

  if (filters.order_status) {
    conditions.push("o.order_status = ?");
    params.push(filters.order_status);
  }

  if (filters.payment_status) {
    conditions.push("o.payment_status = ?");
    params.push(filters.payment_status);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY o.created_at DESC";

  if (filters.page && filters.limit) {
    const offset = (filters.page - 1) * filters.limit;
    query += ` LIMIT ${filters.limit} OFFSET ${offset}`;
  }

  return await runSelectSqlQuery(query, params);
};

export const getOrderById = async (id) => {
  const rows = await runSelectSqlQuery(
    `SELECT o.*,
            u.first_name, u.last_name, u.email as user_email, u.phone as user_phone,
            p.name as product_name, p.category, p.product_images, p.type as product_type
     FROM product_orders o
     LEFT JOIN users u ON o.user_id = u.id
     LEFT JOIN products p ON o.product_id = p.id
     WHERE o.id = ?`,
    [id]
  );
  return rows[0];
};

export const createOrder = async (orderData) => {
  const {
    user_id,
    product_id,
    order_quantity,
    unit_price,
    total_price,
    customer_name,
    customer_phone,
    customer_email,
    delivery_address,
    notes,
    payment_method
  } = orderData;

  return await runInsertSqlQuery(
    `INSERT INTO product_orders 
     (user_id, product_id, order_quantity, unit_price, total_price, customer_name, customer_phone, customer_email, delivery_address, notes, payment_method) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [user_id, product_id, order_quantity, unit_price, total_price, customer_name, customer_phone, customer_email, delivery_address, notes, payment_method]
  );
};

export const updateOrder = async (id, orderData) => {
  const updateFields = [];
  const params = [];

  Object.keys(orderData).forEach(key => {
    if (orderData[key] !== undefined && orderData[key] !== null) {
      updateFields.push(`${key} = ?`);
      params.push(orderData[key]);
    }
  });

  if (updateFields.length === 0) {
    throw new Error("No fields to update");
  }

  params.push(id);

  return await runUpdateSqlQuery(
    `UPDATE product_orders SET ${updateFields.join(", ")} WHERE id = ?`,
    params
  );
};

export const deleteOrder = async (id) => {
  return await runUpdateSqlQuery(
    `DELETE FROM product_orders WHERE id = ?`,
    [id]
  );
};

export const getOrdersCount = async (filters = {}) => {
  let query = `SELECT COUNT(*) as count FROM product_orders`;
  const params = [];
  const conditions = [];

  if (filters.user_id) {
    conditions.push("user_id = ?");
    params.push(filters.user_id);
  }

  if (filters.order_status) {
    conditions.push("order_status = ?");
    params.push(filters.order_status);
  }

  if (filters.payment_status) {
    conditions.push("payment_status = ?");
    params.push(filters.payment_status);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  const result = await runSelectSqlQuery(query, params);
  return result[0].count;
};

