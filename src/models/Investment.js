import { runSelectSqlQuery, runInsertSqlQuery, runUpdateSqlQuery, runDeleteSqlQuery } from "../db/sqlfunction.js";
import { Investments, Projects, Users } from "../db/model.js";

export const getAllInvestments = async (filters = {}) => {
  let query = `
    SELECT i.*, p.project_name, p.farmer_name, u.first_name, u.last_name, u.email
    FROM ${Investments} i
    LEFT JOIN ${Projects} p ON i.project_id = p.id
    LEFT JOIN ${Users} u ON i.user_id = u.id
  `;
  const params = [];
  const conditions = [];

  // Add filters
  if (filters.status) {
    conditions.push("i.status = ?");
    params.push(filters.status);
  }

  if (filters.payment_status) {
    conditions.push("i.payment_status = ?");
    params.push(filters.payment_status);
  }

  if (filters.user_id) {
    conditions.push("i.user_id = ?");
    params.push(filters.user_id);
  }

  if (filters.project_id) {
    conditions.push("i.project_id = ?");
    params.push(filters.project_id);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  // Add pagination
  if (filters.page && filters.limit) {
    const offset = (filters.page - 1) * filters.limit;
    query += ` ORDER BY i.created_at DESC LIMIT ${filters.limit} OFFSET ${offset}`;
  } else {
    query += " ORDER BY i.created_at DESC";
  }

  return await runSelectSqlQuery(query, params);
};

export const getInvestmentById = async (id) => {
  const query = `
    SELECT i.*, p.project_name, p.farmer_name, u.first_name, u.last_name, u.email
    FROM ${Investments} i
    LEFT JOIN ${Projects} p ON i.project_id = p.id
    LEFT JOIN ${Users} u ON i.user_id = u.id
    WHERE i.id = ?
  `;
  const rows = await runSelectSqlQuery(query, [id]);
  return rows[0];
};

export const getUserInvestments = async (userId, filters = {}) => {
  let query = `
    SELECT i.*, p.project_name, p.farmer_name, p.project_duration, p.status as project_status, p.started_at as project_started_at, p.completed_at as project_completed_at
    FROM ${Investments} i
    LEFT JOIN ${Projects} p ON i.project_id = p.id
    WHERE i.user_id = ?
  `;
  const params = [userId];
  const conditions = [];

  if (filters.status) {
    conditions.push("i.status = ?");
    params.push(filters.status);
  }

  if (conditions.length > 0) {
    query += " AND " + conditions.join(" AND ");
  }

  query += " ORDER BY i.created_at DESC";

  return await runSelectSqlQuery(query, params);
};

export const createInvestment = async (investmentData) => {
  const {
    user_id,
    project_id,
    units_invested,
    amount_per_unit,
    total_amount,
    expected_return_amount,
    payment_method,
    payment_reference,
    notes
  } = investmentData;

  return await runInsertSqlQuery(
    `INSERT INTO ${Investments} (user_id, project_id, units_invested, amount_per_unit, total_amount, expected_return_amount, payment_method, payment_reference, notes, status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')`,
    [
      user_id,
      project_id,
      units_invested,
      amount_per_unit,
      total_amount,
      expected_return_amount,
      payment_method,
      payment_reference,
      notes
    ]
  );
};

export const updateInvestment = async (id, investmentData) => {
  const updateFields = [];
  const params = [];

  // Build dynamic update query
  Object.keys(investmentData).forEach(key => {
    if (investmentData[key] !== undefined && investmentData[key] !== null) {
      updateFields.push(`${key} = ?`);
      params.push(investmentData[key]);
    }
  });

  if (updateFields.length === 0) {
    throw new Error("No fields to update");
  }

  params.push(id);

  return await runUpdateSqlQuery(
    `UPDATE ${Investments} SET ${updateFields.join(", ")} WHERE id = ?`,
    params
  );
};

export const confirmInvestment = async (id, paymentData) => {
  const { payment_reference, payment_method } = paymentData;
  
  return await runUpdateSqlQuery(
    `UPDATE ${Investments} SET status = 'confirmed', payment_status = 'paid', payment_reference = ?, payment_method = ?, payment_date = NOW() WHERE id = ?`,
    [payment_reference, payment_method, id]
  );
};

export const cancelInvestment = async (id, reason) => {
  return await runUpdateSqlQuery(
    `UPDATE ${Investments} SET status = 'cancelled', notes = CONCAT(IFNULL(notes, ''), ' Cancellation reason: ', ?) WHERE id = ?`,
    [reason, id]
  );
};

export const completeInvestment = async (id, returnAmount) => {
  return await runUpdateSqlQuery(
    `UPDATE ${Investments} SET status = 'completed', return_received = ?, return_date = NOW() WHERE id = ?`,
    [returnAmount, id]
  );
};

export const getInvestmentsCount = async (filters = {}) => {
  let query = `SELECT COUNT(*) as count FROM ${Investments} i`;
  const params = [];
  const conditions = [];

  if (filters.status) {
    conditions.push("i.status = ?");
    params.push(filters.status);
  }

  if (filters.payment_status) {
    conditions.push("i.payment_status = ?");
    params.push(filters.payment_status);
  }

  if (filters.user_id) {
    conditions.push("i.user_id = ?");
    params.push(filters.user_id);
  }

  if (filters.project_id) {
    conditions.push("i.project_id = ?");
    params.push(filters.project_id);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  const result = await runSelectSqlQuery(query, params);
  return result[0].count;
};

export const getProjectInvestmentStats = async (projectId) => {
  const query = `
    SELECT 
      COUNT(*) as total_investments,
      SUM(units_invested) as total_units_invested,
      SUM(total_amount) as total_amount_invested,
      SUM(CASE WHEN status = 'confirmed' THEN units_invested ELSE 0 END) as confirmed_units,
      SUM(CASE WHEN status = 'confirmed' THEN total_amount ELSE 0 END) as confirmed_amount,
      SUM(CASE WHEN status IN ('pending', 'confirmed', 'completed') THEN units_invested ELSE 0 END) as total_booked_units
    FROM ${Investments}
    WHERE project_id = ? AND status IN ('pending', 'confirmed', 'completed')
  `;
  
  const result = await runSelectSqlQuery(query, [projectId]);
  return result[0];
};

// Get all investors for a specific project with their contact information
export const getProjectInvestors = async (projectId) => {
  const query = `
    SELECT DISTINCT
      i.user_id,
      u.first_name,
      u.last_name,
      u.email,
      SUM(i.units_invested) as total_units,
      SUM(i.total_amount) as total_invested
    FROM ${Investments} i
    INNER JOIN ${Users} u ON i.user_id = u.id
    WHERE i.project_id = ? AND i.status IN ('confirmed', 'completed')
    GROUP BY i.user_id, u.first_name, u.last_name, u.email
  `;
  
  return await runSelectSqlQuery(query, [projectId]);
};
