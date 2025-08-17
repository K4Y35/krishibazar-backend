import { runSelectSqlQuery, runUpdateSqlQuery } from '../../db/sqlfunction.js';
import { Users } from '../../db/model.js';

const getPendingByUserType = async (usertype) => {
  const sql = `SELECT id, first_name, last_name, phone, email, created_at, nid_front, nid_back
               FROM ${Users}
               WHERE usertype = ? AND is_approved = 0 AND deleted_at IS NULL
               ORDER BY created_at DESC`;
  return runSelectSqlQuery(sql, [usertype]);
};

const getDetailsByIdAndType = async (id, usertype) => {
  const sql = `SELECT id, first_name, last_name, phone, email, created_at, nid_front, nid_back,
                      is_verified, is_approved, approved_at
               FROM ${Users}
               WHERE id = ? AND usertype = ? AND deleted_at IS NULL`;
  return runSelectSqlQuery(sql, [id, usertype]);
};

const approveById = async (id) => {
  const sql = `UPDATE ${Users} SET is_approved = 1, approved_at = NOW() WHERE id = ?`;
  return runUpdateSqlQuery(sql, [id]);
};

const rejectById = async (id) => {
  const sql = `UPDATE ${Users} SET is_approved = 2 WHERE id = ?`;
  return runUpdateSqlQuery(sql, [id]);
};

const getPendingFarmers = async (req, res) => {
  try {
    const farmers = await getPendingByUserType(1);
    return res.json(farmers);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error fetching pending farmers:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getFarmerDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) return res.status(400).json({ error: 'Invalid farmer ID' });
    const farmer = await getDetailsByIdAndType(id, 1);
    if (farmer.length === 0) return res.status(404).json({ error: 'Farmer not found' });
    return res.json(farmer[0]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error fetching farmer details:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const approveFarmer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) return res.status(400).json({ error: 'Invalid farmer ID' });
    await approveById(id);
    return res.json({ message: 'Farmer approved successfully' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error approving farmer:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const rejectFarmer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) return res.status(400).json({ error: 'Invalid farmer ID' });
    await rejectById(id);
    return res.json({ message: 'Farmer rejected successfully' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error rejecting farmer:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getPendingInvestors = async (req, res) => {
  try {
    const investors = await getPendingByUserType(2);
    return res.json(investors);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error fetching pending investors:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getInvestorDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) return res.status(400).json({ error: 'Invalid investor ID' });
    const investor = await getDetailsByIdAndType(id, 2);
    if (investor.length === 0) return res.status(404).json({ error: 'Investor not found' });
    return res.json(investor[0]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error fetching investor details:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const approveInvestor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) return res.status(400).json({ error: 'Invalid investor ID' });
    await approveById(id);
    return res.json({ message: 'Investor approved successfully' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error approving investor:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const rejectInvestor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id)) return res.status(400).json({ error: 'Invalid investor ID' });
    await rejectById(id);
    return res.json({ message: 'Investor rejected successfully' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error rejecting investor:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export {
  getPendingFarmers,
  getFarmerDetails,
  approveFarmer,
  rejectFarmer,
  getPendingInvestors,
  getInvestorDetails,
  approveInvestor,
  rejectInvestor,
};


