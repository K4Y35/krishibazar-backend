import { runSelectSqlQuery, runInsertSqlQuery, runUpdateSqlQuery, runDeleteSqlQuery } from "../db/sqlfunction.js";
import { Projects } from "../db/model.js";

export const getAllProjects = async (filters = {}) => {
  let query = `SELECT * FROM ${Projects}`;
  const params = [];
  const conditions = [];

  if (filters.status) {
    conditions.push("status = ?");
    params.push(filters.status);
  }

  if (filters.statuses && Array.isArray(filters.statuses)) {
    const placeholders = filters.statuses.map(() => '?').join(',');
    conditions.push(`status IN (${placeholders})`);
    params.push(...filters.statuses);
  }

  if (filters.category_id) {
    conditions.push("category_id = ?");
    params.push(filters.category_id);
  }

  if (filters.search) {
    conditions.push("(project_name LIKE ? OR farmer_name LIKE ? OR farmer_phone LIKE ?)");
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

export const getProjectById = async (id) => {
  const rows = await runSelectSqlQuery(
    `SELECT * FROM ${Projects} WHERE id = ?`,
    [id]
  );
  return rows[0];
};

export const createProject = async (projectData) => {
  const {
    farmer_name,
    farmer_phone,
    farmer_address,
    nid_card_front,
    nid_card_back,
    project_name,
    project_images,
    per_unit_price,
    total_returnable_per_unit,
    project_duration,
    total_units,
    why_fund_with_krishibazar,
    earning_percentage,
    category_id,
    created_by
  } = projectData;

  return await runInsertSqlQuery(
    `INSERT INTO ${Projects} (farmer_name, farmer_phone, farmer_address, nid_card_front, nid_card_back, project_name, project_images, per_unit_price, total_returnable_per_unit, project_duration, total_units, why_fund_with_krishibazar, earning_percentage, category_id, created_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      farmer_name,
      farmer_phone,
      farmer_address,
      nid_card_front,
      nid_card_back,
      project_name,
      project_images,
      per_unit_price,
      total_returnable_per_unit,
      project_duration,
      total_units,
      why_fund_with_krishibazar,
      earning_percentage,
      category_id,
      created_by
    ]
  );
};

export const updateProject = async (id, projectData) => {
  const updateFields = [];
  const params = [];

  Object.keys(projectData).forEach(key => {
    if (projectData[key] !== undefined && projectData[key] !== null) {
      updateFields.push(`${key} = ?`);
      params.push(projectData[key]);
    }
  });

  if (updateFields.length === 0) {
    throw new Error("No fields to update");
  }

  params.push(id);

  return await runUpdateSqlQuery(
    `UPDATE ${Projects} SET ${updateFields.join(", ")} WHERE id = ?`,
    params
  );
};

export const deleteProject = async (id) => {
  return await runDeleteSqlQuery(
    `DELETE FROM ${Projects} WHERE id = ?`,
    [id]
  );
};

export const approveProject = async (id, approved_by) => {
  return await runUpdateSqlQuery(
    `UPDATE ${Projects} SET status = 'approved', approved_by = ?, approved_at = NOW() WHERE id = ?`,
    [approved_by, id]
  );
};

export const rejectProject = async (id, approved_by, rejection_reason) => {
  return await runUpdateSqlQuery(
    `UPDATE ${Projects} SET status = 'rejected', approved_by = ?, approved_at = NOW(), rejection_reason = ? WHERE id = ?`,
    [approved_by, rejection_reason, id]
  );
};

export const startProject = async (id, started_by) => {
  return await runUpdateSqlQuery(
    `UPDATE ${Projects} SET status = 'running', started_at = NOW() WHERE id = ?`,
    [id]
  );
};

export const completeProject = async (id, completed_by) => {
  return await runUpdateSqlQuery(
    `UPDATE ${Projects} SET status = 'completed', completed_at = NOW() WHERE id = ?`,
    [id]
  );
};

export const getProjectsCount = async (filters = {}) => {
  let query = `SELECT COUNT(*) as count FROM ${Projects}`;
  const params = [];
  const conditions = [];

  if (filters.status) {
    conditions.push("status = ?");
    params.push(filters.status);
  }

  if (filters.statuses && Array.isArray(filters.statuses)) {
    const placeholders = filters.statuses.map(() => '?').join(',');
    conditions.push(`status IN (${placeholders})`);
    params.push(...filters.statuses);
  }

  if (filters.category_id) {
    conditions.push("category_id = ?");
    params.push(filters.category_id);
  }

  if (filters.search) {
    conditions.push("(project_name LIKE ? OR farmer_name LIKE ? OR farmer_phone LIKE ?)");
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  const result = await runSelectSqlQuery(query, params);
  return result[0].count;
};