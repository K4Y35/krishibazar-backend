import { runSelectSqlQuery, runInsertSqlQuery, runUpdateSqlQuery, runDeleteSqlQuery } from "../db/sqlfunction.js";
import { Products } from "../db/model.js";

export const getAllProducts = async (filters = {}) => {
  let query = `SELECT * FROM ${Products}`;
  const params = [];
  const conditions = [];

  if (filters.category) {
    conditions.push("category = ?");
    params.push(filters.category);
  }

  if (filters.type) {
    conditions.push("type = ?");
    params.push(filters.type);
  }

  if (filters.in_stock !== undefined) {
    conditions.push("in_stock = ?");
    params.push(filters.in_stock);
  }

  if (filters.search) {
    conditions.push("(name LIKE ? OR description LIKE ? OR farmer LIKE ?)");
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  if (filters.page && filters.limit) {
    const offset = (filters.page - 1) * filters.limit;
    query += ` ORDER BY created_at DESC LIMIT ${filters.limit} OFFSET ${offset}`;
  } else {
    query += " ORDER BY created_at DESC";
  }

  return await runSelectSqlQuery(query, params);
};

export const getProductById = async (id) => {
  const rows = await runSelectSqlQuery(
    `SELECT * FROM ${Products} WHERE id = ?`,
    [id]
  );
  return rows[0];
};

export const createProduct = async (productData) => {
  const {
    name,
    type,
    category,
    price,
    quantity,
    unit,
    min_order,
    max_order,
    product_images,
    in_stock,
    description,
    nutritional_info,
    harvest_date,
    shelf_life,
    farmer,
    certifications,
    rating,
    reviews,
    created_by
  } = productData;

  return await runInsertSqlQuery(
    `INSERT INTO ${Products} (name, type, category, price, quantity, unit, min_order, max_order, product_images, in_stock, description, nutritional_info, harvest_date, shelf_life, farmer, certifications, rating, reviews, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      type || 'product',
      category,
      price,
      quantity || 0,
      unit || 'unit',
      min_order,
      max_order,
      product_images,
      in_stock,
      description,
      nutritional_info,
      harvest_date,
      shelf_life,
      farmer,
      certifications,
      rating,
      reviews,
      created_by
    ]
  );
};

export const updateProduct = async (id, productData) => {
  const updateFields = [];
  const params = [];

  Object.keys(productData).forEach(key => {
    if (productData[key] !== undefined && productData[key] !== null) {
      updateFields.push(`${key} = ?`);
      params.push(productData[key]);
    }
  });

  if (updateFields.length === 0) {
    throw new Error("No fields to update");
  }

  params.push(id);

  return await runUpdateSqlQuery(
    `UPDATE ${Products} SET ${updateFields.join(", ")} WHERE id = ?`,
    params
  );
};

export const deleteProduct = async (id) => {
  return await runDeleteSqlQuery(
    `DELETE FROM ${Products} WHERE id = ?`,
    [id]
  );
};

export const getProductsCount = async (filters = {}) => {
  let query = `SELECT COUNT(*) as count FROM ${Products}`;
  const params = [];
  const conditions = [];

  if (filters.category) {
    conditions.push("category = ?");
    params.push(filters.category);
  }

  if (filters.type) {
    conditions.push("type = ?");
    params.push(filters.type);
  }

  if (filters.in_stock !== undefined) {
    conditions.push("in_stock = ?");
    params.push(filters.in_stock);
  }

  if (filters.search) {
    conditions.push("(name LIKE ? OR description LIKE ? OR farmer LIKE ?)");
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  const result = await runSelectSqlQuery(query, params);
  return result[0].count;
};


