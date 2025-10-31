import { runSelectSqlQuery, runInsertSqlQuery, runUpdateSqlQuery, runDeleteSqlQuery } from "../db/sqlfunction.js";
import { Projects } from "../db/model.js";

export const getAllUpdates = async (filters = {}) => {
  let query = `
    SELECT pu.*, p.project_name, p.farmer_name
    FROM project_updates pu
    LEFT JOIN ${Projects} p ON pu.project_id = p.id
  `;
  const params = [];
  const conditions = [];

  if (filters.project_id) {
    conditions.push("pu.project_id = ?");
    params.push(filters.project_id);
  }

  if (filters.update_type) {
    conditions.push("pu.update_type = ?");
    params.push(filters.update_type);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY pu.created_at DESC";

  if (filters.page && filters.limit) {
    const offset = (filters.page - 1) * filters.limit;
    query += ` LIMIT ${filters.limit} OFFSET ${offset}`;
  }

  return await runSelectSqlQuery(query, params);
};

export const getUpdateById = async (id) => {
  const query = `
    SELECT pu.*, p.project_name, p.farmer_name
    FROM project_updates pu
    LEFT JOIN ${Projects} p ON pu.project_id = p.id
    WHERE pu.id = ?
  `;
  const rows = await runSelectSqlQuery(query, [id]);
  return rows[0];
};

export const createUpdate = async (updateData) => {
  const {
    project_id,
    title,
    description,
    update_type,
    media_files,
    milestone_status,
    financial_data,
    farmer_notes,
    impact_metrics,
    created_by
  } = updateData;

  return await runInsertSqlQuery(
    `INSERT INTO project_updates (project_id, title, description, update_type, media_files, milestone_status, financial_data, farmer_notes, impact_metrics, created_by) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      project_id,
      title,
      description,
      update_type,
      media_files ? JSON.stringify(media_files) : null,
      milestone_status,
      financial_data ? JSON.stringify(financial_data) : null,
      farmer_notes,
      impact_metrics ? JSON.stringify(impact_metrics) : null,
      created_by
    ]
  );
};

export const updateUpdate = async (id, updateData) => {
  const updateFields = [];
  const params = [];

  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined && updateData[key] !== null) {
      updateFields.push(`${key} = ?`);
      const value = typeof updateData[key] === 'object' && updateData[key] !== null 
        ? JSON.stringify(updateData[key]) 
        : updateData[key];
      params.push(value);
    }
  });

  if (updateFields.length === 0) {
    throw new Error("No fields to update");
  }

  params.push(id);

  return await runUpdateSqlQuery(
    `UPDATE project_updates SET ${updateFields.join(", ")} WHERE id = ?`,
    params
  );
};

export const deleteUpdate = async (id) => {
  return await runDeleteSqlQuery(
    `DELETE FROM project_updates WHERE id = ?`,
    [id]
  );
};

export const getProjectUpdates = async (projectId) => {
  const query = `
    SELECT * FROM project_updates
    WHERE project_id = ?
    ORDER BY created_at DESC
  `;
  return await runSelectSqlQuery(query, [projectId]);
};

