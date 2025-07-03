const db = require('../db');

const getPendingFarmers = async (req, res) => {
  try {
    const [farmers] = await db.query(
      `SELECT 
        id, 
        first_name, 
        last_name, 
        phone, 
        email, 
        created_at, 
        nid_front, 
        nid_back 
      FROM users 
      WHERE usertype = 1 
        AND is_approved = 0 
        AND deleted_at IS NULL
      ORDER BY created_at DESC`
    );
    res.json(farmers);
  } catch (error) {
    console.error('Error fetching pending farmers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getFarmerDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid farmer ID' });
    }

    const [farmer] = await db.query(
      `SELECT 
        id,
        first_name,
        last_name,
        phone,
        email,
        created_at,
        nid_front,
        nid_back,
        is_phone_verified,
        is_approved,
        approved_at
      FROM users 
      WHERE id = ? 
        AND usertype = 1 
        AND deleted_at IS NULL`,
      [id]
    );

    if (farmer.length === 0) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    res.json(farmer[0]);
  } catch (error) {
    console.error('Error fetching farmer details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const approveFarmer = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Approving farmer with ID:', id);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid farmer ID' });
    }

    // First check if farmer exists and is pending
    const [farmer] = await db.query(
      `SELECT id FROM users 
      WHERE id = ? 
        AND usertype = 1 
        AND is_approved = 0 
        AND deleted_at IS NULL`,
      [id]
    );

    if (farmer.length === 0) {
      return res.status(404).json({ error: 'Pending farmer not found' });
    }

    await db.query(
      `UPDATE users 
      SET is_approved = 1, 
          approved_at = NOW()
      WHERE id = ?`,
      [id]
    );

    res.json({ message: 'Farmer approved successfully' });
  } catch (error) {
    console.error('Error approving farmer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const rejectFarmer = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Rejecting farmer with ID:', id);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: 'Invalid farmer ID' });
    }

    // First check if farmer exists and is pending
    const [farmer] = await db.query(
      `SELECT id FROM users 
      WHERE id = ? 
        AND usertype = 1 
        AND is_approved = 0 
        AND deleted_at IS NULL`,
      [id]
    );

    if (farmer.length === 0) {
      return res.status(404).json({ error: 'Pending farmer not found' });
    }

    await db.query(
      `UPDATE users 
      SET is_approved = 2
      WHERE id = ?`,
      [id]
    );

    res.json({ message: 'Farmer rejected successfully' });
  } catch (error) {
    console.error('Error rejecting farmer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPendingInvestors = async (req, res) => {
  try {
    const [investors] = await db.query(
      `SELECT 
        id, 
        first_name, 
        last_name, 
        phone, 
        email, 
        created_at, 
        nid_front, 
        nid_back 
      FROM users 
      WHERE usertype = 2 
        AND is_approved = 0 
        AND deleted_at IS NULL
      ORDER BY created_at DESC`
    );
    res.json(investors);
  } catch (error) {
    console.error("Error fetching pending investors:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getInvestorDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Invalid investor ID" });
    }

    const [investor] = await db.query(
      `SELECT 
        id,
        first_name,
        last_name,
        phone,
        email,
        created_at,
        nid_front,
        nid_back,
        is_phone_verified,
        is_approved,
        approved_at
      FROM users 
      WHERE id = ? 
        AND usertype = 2 
        AND deleted_at IS NULL`,
      [id]
    );

    if (investor.length === 0) {
      return res.status(404).json({ error: "Investor not found" });
    }

    res.json(investor[0]);
  } catch (error) {
    console.error("Error fetching investor details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const approveInvestor = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Approving investor with ID:", id);

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Invalid investor ID" });
    }

    // First check if investor exists and is pending
    const [investor] = await db.query(
      `SELECT id FROM users 
      WHERE id = ? 
        AND usertype = 2 
        AND is_approved = 0 
        AND deleted_at IS NULL`,
      [id]
    );

    if (investor.length === 0) {
      return res.status(404).json({ error: "Pending investor not found" });
    }

    await db.query(
      `UPDATE users 
      SET is_approved = 1, 
          approved_at = NOW()
      WHERE id = ?`,
      [id]
    );

    res.json({ message: "Investor approved successfully" });
  } catch (error) {
    console.error("Error approving investor:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const rejectInvestor = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Rejecting investor with ID:", id);

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Invalid investor ID" });
    }

    // First check if investor exists and is pending
    const [investor] = await db.query(
      `SELECT id FROM users 
      WHERE id = ? 
        AND usertype = 2 
        AND is_approved = 0 
        AND deleted_at IS NULL`,
      [id]
    );

    if (investor.length === 0) {
      return res.status(404).json({ error: "Pending investor not found" });
    }

    await db.query(
      `UPDATE users 
      SET is_approved = 2
      WHERE id = ?`,
      [id]
    );

    res.json({ message: "Investor rejected successfully" });
  } catch (error) {
    console.error("Error rejecting investor:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getPendingFarmers,
  getFarmerDetails,
  approveFarmer,
  rejectFarmer,
  getPendingInvestors,
  getInvestorDetails,
  approveInvestor,
  rejectInvestor,
}; 