import * as InvestmentModel from "../../models/Investment.js";

// Get all investments with filters (admin)
export const getAllInvestments = async (req, res) => {
  try {
    const { status, payment_status, user_id, project_id, page = 1, limit = 20 } = req.query;
    
    const filters = {
      status,
      payment_status,
      user_id,
      project_id,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const investments = await InvestmentModel.getAllInvestments(filters);
    const totalCount = await InvestmentModel.getInvestmentsCount(filters);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: {
        investments,
        totalPages,
        currentPage: parseInt(page),
        totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch investments',
      error: error.message
    });
  }
};

// Get investment by ID (admin)
export const getInvestmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const investment = await InvestmentModel.getInvestmentById(id);

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    res.json({
      success: true,
      data: investment
    });
  } catch (error) {
    console.error('Error fetching investment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch investment',
      error: error.message
    });
  }
};

// Confirm investment payment (admin)
export const confirmInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_reference, payment_method } = req.body;

    const investment = await InvestmentModel.getInvestmentById(id);

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    if (investment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending investments can be confirmed'
      });
    }

    await InvestmentModel.confirmInvestment(id, { payment_reference, payment_method });
    const updatedInvestment = await InvestmentModel.getInvestmentById(id);

    res.json({
      success: true,
      message: 'Investment confirmed successfully',
      data: updatedInvestment
    });
  } catch (error) {
    console.error('Error confirming investment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm investment',
      error: error.message
    });
  }
};

// Cancel investment (admin)
export const cancelInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const investment = await InvestmentModel.getInvestmentById(id);

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    if (investment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed investments cannot be cancelled'
      });
    }

    await InvestmentModel.cancelInvestment(id, reason);
    const updatedInvestment = await InvestmentModel.getInvestmentById(id);

    res.json({
      success: true,
      message: 'Investment cancelled successfully',
      data: updatedInvestment
    });
  } catch (error) {
    console.error('Error cancelling investment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel investment',
      error: error.message
    });
  }
};

// Complete investment (admin)
export const completeInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const { return_amount } = req.body;

    const investment = await InvestmentModel.getInvestmentById(id);

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    if (investment.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed investments can be completed'
      });
    }

    await InvestmentModel.completeInvestment(id, return_amount);
    const updatedInvestment = await InvestmentModel.getInvestmentById(id);

    res.json({
      success: true,
      message: 'Investment completed successfully',
      data: updatedInvestment
    });
  } catch (error) {
    console.error('Error completing investment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete investment',
      error: error.message
    });
  }
};

// Get investment statistics
export const getInvestmentStats = async (req, res) => {
  try {
    const { project_id } = req.query;
    
    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

    const stats = await InvestmentModel.getProjectInvestmentStats(project_id);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching investment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch investment statistics',
      error: error.message
    });
  }
};
