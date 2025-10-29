import { runSelectSqlQuery, runInsertSqlQuery, runUpdateSqlQuery, runDeleteSqlQuery } from "../db/sqlfunction.js";
import { Projects } from "../db/model.js";

export const getAllReports = async (filters = {}) => {
  let query = `
    SELECT ir.*, p.project_name, p.farmer_name
    FROM investment_reports ir
    LEFT JOIN ${Projects} p ON ir.project_id = p.id
  `;
  const params = [];
  const conditions = [];

  if (filters.project_id) {
    conditions.push("ir.project_id = ?");
    params.push(filters.project_id);
  }

  if (filters.report_period) {
    conditions.push("ir.report_period = ?");
    params.push(filters.report_period);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY ir.report_date DESC";

  if (filters.page && filters.limit) {
    const offset = (filters.page - 1) * filters.limit;
    query += ` LIMIT ${filters.limit} OFFSET ${offset}`;
  }

  return await runSelectSqlQuery(query, params);
};

export const getReportById = async (id) => {
  const query = `
    SELECT ir.*, p.project_name, p.farmer_name
    FROM investment_reports ir
    LEFT JOIN ${Projects} p ON ir.project_id = p.id
    WHERE ir.id = ?
  `;
  const rows = await runSelectSqlQuery(query, [id]);
  return rows[0];
};

export const createReport = async (reportData) => {
  const {
    project_id,
    report_period,
    report_date,
    financial_summary,
    project_metrics,
    farmer_feedback,
    issues_challenges,
    next_steps,
    photos,
    videos,
    created_by
  } = reportData;

  return await runInsertSqlQuery(
    `INSERT INTO investment_reports (project_id, report_period, report_date, financial_summary, project_metrics, farmer_feedback, issues_challenges, next_steps, photos, videos, created_by) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      project_id,
      report_period,
      report_date,
      financial_summary ? JSON.stringify(financial_summary) : null,
      project_metrics ? JSON.stringify(project_metrics) : null,
      farmer_feedback,
      issues_challenges,
      next_steps,
      photos ? JSON.stringify(photos) : null,
      videos ? JSON.stringify(videos) : null,
      created_by
    ]
  );
};

export const updateReport = async (id, reportData) => {
  const updateFields = [];
  const params = [];

  Object.keys(reportData).forEach(key => {
    if (reportData[key] !== undefined && reportData[key] !== null) {
      updateFields.push(`${key} = ?`);
      const value = typeof reportData[key] === 'object' && reportData[key] !== null 
        ? JSON.stringify(reportData[key]) 
        : reportData[key];
      params.push(value);
    }
  });

  if (updateFields.length === 0) {
    throw new Error("No fields to update");
  }

  params.push(id);

  return await runUpdateSqlQuery(
    `UPDATE investment_reports SET ${updateFields.join(", ")} WHERE id = ?`,
    params
  );
};

export const deleteReport = async (id) => {
  return await runDeleteSqlQuery(
    `DELETE FROM investment_reports WHERE id = ?`,
    [id]
  );
};

export const getProjectReports = async (projectId) => {
  const query = `
    SELECT * FROM investment_reports
    WHERE project_id = ?
    ORDER BY report_date DESC
  `;
  return await runSelectSqlQuery(query, [projectId]);
};

