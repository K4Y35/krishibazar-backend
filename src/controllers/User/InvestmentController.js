import * as InvestmentModel from "../../models/Investment.js";
import * as ProjectModel from "../../models/Project.js";

// Get user's investments
export const getUserInvestments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;
    
    const filters = { status };
    const investments = await InvestmentModel.getUserInvestments(userId, filters);

    res.json({
      success: true,
      data: investments
    });
  } catch (error) {
    console.error('Error fetching user investments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch investments',
      error: error.message
    });
  }
};

// Create new investment
export const createInvestment = async (req, res) => {
  try {
    const {
      project_id,
      units_invested,
      payment_method,
      payment_reference,
      notes
    } = req.body;

    const userId = req.user.id;

    // Validate required fields
    if (!project_id || !units_invested || !payment_method) {
      return res.status(400).json({
        success: false,
        message: 'Project ID, units invested, and payment method are required'
      });
    }

    // Get project details
    const project = await ProjectModel.getProjectById(project_id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Project is not available for investment'
      });
    }

    // Check if enough units are available
    const stats = await InvestmentModel.getProjectInvestmentStats(project_id);
    const availableUnits = project.total_units - (stats.confirmed_units || 0);
    
    if (units_invested > availableUnits) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableUnits} units available for investment`
      });
    }

    // Calculate amounts
    const amount_per_unit = project.per_unit_price;
    const total_amount = amount_per_unit * units_invested;
    const expected_return_amount = project.total_returnable_per_unit * units_invested;

    const investmentData = {
      user_id: userId,
      project_id,
      units_invested: parseInt(units_invested),
      amount_per_unit,
      total_amount,
      expected_return_amount,
      payment_method,
      payment_reference,
      notes
    };

    const result = await InvestmentModel.createInvestment(investmentData);

    res.status(201).json({
      success: true,
      message: 'Investment created successfully',
      data: { 
        id: result.insertId, 
        ...investmentData,
        project_name: project.project_name,
        farmer_name: project.farmer_name
      }
    });
  } catch (error) {
    console.error('Error creating investment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create investment',
      error: error.message
    });
  }
};

// Get investment details
export const getInvestmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const investment = await InvestmentModel.getInvestmentById(id);

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    // Check if user owns this investment
    if (investment.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own investments'
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

// Cancel investment
export const cancelInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const investment = await InvestmentModel.getInvestmentById(id);

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    // Check if user owns this investment
    if (investment.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own investments'
      });
    }

    // Check if investment can be cancelled
    if (investment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending investments can be cancelled'
      });
    }

    await InvestmentModel.cancelInvestment(id, reason);

    res.json({
      success: true,
      message: 'Investment cancelled successfully'
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
