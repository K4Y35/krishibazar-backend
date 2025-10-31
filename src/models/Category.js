import { runSelectSqlQuery, runInsertSqlQuery, runUpdateSqlQuery, runDeleteSqlQuery } from "../db/sqlfunction.js";
import { Categories } from "../db/model.js";

export const getAllCategories = async (filters = {}) => {
  let query = `SELECT * FROM ${Categories}`;
  const params = [];
  const conditions = [];

  if (filters.is_active !== undefined) {
    conditions.push("is_active = ?");
    params.push(filters.is_active);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY name ASC";

  return await runSelectSqlQuery(query, params);
};

export const getCategoryById = async (id) => {
  const rows = await runSelectSqlQuery(
    `SELECT * FROM ${Categories} WHERE id = ?`,
    [id]
  );
  return rows[0];
};

export const createCategory = async (categoryData) => {
  const { name, icon, description, created_by } = categoryData;
  
  const result = await runInsertSqlQuery(
    `INSERT INTO ${Categories} (name, icon, description, created_by) VALUES (?, ?, ?, ?)`,
    [name, icon, description, created_by]
  );
  
  return result.insertId;
};

export const updateCategory = async (id, categoryData) => {
  const { name, icon, description, is_active } = categoryData;
  
  await runUpdateSqlQuery(
    `UPDATE ${Categories} SET name = ?, icon = ?, description = ?, is_active = ? WHERE id = ?`,
    [name, icon, description, is_active, id]
  );
  
  return true;
};

export const deleteCategory = async (id) => {
  await runDeleteSqlQuery(
    `DELETE FROM ${Categories} WHERE id = ?`,
    [id]
  );
  
  return true;
};

export const getCategoriesCount = async (filters = {}) => {
  let query = `SELECT COUNT(*) as count FROM ${Categories}`;
  const params = [];
  const conditions = [];

  if (filters.is_active !== undefined) {
    conditions.push("is_active = ?");
    params.push(filters.is_active);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  const result = await runSelectSqlQuery(query, params);
  return result[0].count;
};

