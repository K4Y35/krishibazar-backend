import * as ProjectUpdateModel from "../../models/ProjectUpdate.js";
import * as InvestmentReportModel from "../../models/InvestmentReport.js";
import * as InvestmentModel from "../../models/Investment.js";
import * as ProjectModel from "../../models/Project.js";

export const getInvestmentUpdates = async (req, res) => {
  try {
    const userId = req.user.id;
    const { investment_id } = req.params;

    const investment = await InvestmentModel.getInvestmentById(investment_id);
    
    if (!investment || investment.user_id !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    const updates = await ProjectUpdateModel.getProjectUpdates(investment.project_id);

    res.json({
      success: true,
      data: updates,
      investment: {
        id: investment.id,
        project_name: investment.project_name,
        farmer_name: investment.farmer_name
      }
    });
  } catch (error) {
    console.error('Error fetching investment updates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch updates',
      error: error.message
    });
  }
};

export const getInvestmentReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const { investment_id } = req.params;

    const investment = await InvestmentModel.getInvestmentById(investment_id);
    
    if (!investment || investment.user_id !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    const reports = await InvestmentReportModel.getProjectReports(investment.project_id);

    res.json({
      success: true,
      data: reports,
      investment: {
        id: investment.id,
        project_name: investment.project_name,
        farmer_name: investment.farmer_name
      }
    });
  } catch (error) {
    console.error('Error fetching investment reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message
    });
  }
};

export const getProjectWithDetails = async (req, res) => {
  try {
    const { project_id } = req.params;

    const project = await ProjectModel.getProjectById(project_id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const updates = await ProjectUpdateModel.getProjectUpdates(project_id);

    const reports = await InvestmentReportModel.getProjectReports(project_id);

    res.json({
      success: true,
      data: {
        project,
        updates,
        reports
      }
    });
  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project details',
      error: error.message
    });
  }
};

