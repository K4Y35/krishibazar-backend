import * as InvestmentReportModel from "../../models/InvestmentReport.js";
import * as ProjectModel from "../../models/Project.js";

// Get all investment reports
export const getAllReports = async (req, res) => {
  try {
    const { project_id, report_period, page, limit } = req.query;
    const filters = { project_id, report_period, page: parseInt(page), limit: parseInt(limit) };
    
    const reports = await InvestmentReportModel.getAllReports(filters);
    
    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch investment reports',
      error: error.message
    });
  }
};

// Get single report
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await InvestmentReportModel.getReportById(id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
      error: error.message
    });
  }
};

// Create investment report
export const createReport = async (req, res) => {
  try {
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
      videos
    } = req.body;

    // Validate required fields
    if (!project_id || !report_period || !report_date) {
      return res.status(400).json({
        success: false,
        message: 'Project ID, report period, and report date are required'
      });
    }

    // Verify project exists
    const project = await ProjectModel.getProjectById(project_id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const reportData = {
      project_id,
      report_period,
      report_date,
      financial_summary: financial_summary ? JSON.parse(financial_summary) : null,
      project_metrics: project_metrics ? JSON.parse(project_metrics) : null,
      farmer_feedback,
      issues_challenges,
      next_steps,
      photos: photos ? JSON.parse(photos) : null,
      videos: videos ? JSON.parse(videos) : null,
      created_by: req.user.id
    };

    const result = await InvestmentReportModel.createReport(reportData);
    const newReport = await InvestmentReportModel.getReportById(result.insertId);

    res.status(201).json({
      success: true,
      message: 'Investment report created successfully',
      data: newReport
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create investment report',
      error: error.message
    });
  }
};

// Update investment report
export const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const reportData = req.body;

    const report = await InvestmentReportModel.getReportById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Parse JSON fields if they exist
    if (reportData.financial_summary && typeof reportData.financial_summary === 'string') {
      reportData.financial_summary = JSON.parse(reportData.financial_summary);
    }
    if (reportData.project_metrics && typeof reportData.project_metrics === 'string') {
      reportData.project_metrics = JSON.parse(reportData.project_metrics);
    }
    if (reportData.photos && typeof reportData.photos === 'string') {
      reportData.photos = JSON.parse(reportData.photos);
    }
    if (reportData.videos && typeof reportData.videos === 'string') {
      reportData.videos = JSON.parse(reportData.videos);
    }

    await InvestmentReportModel.updateReport(id, reportData);
    const updated = await InvestmentReportModel.getReportById(id);

    res.json({
      success: true,
      message: 'Report updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report',
      error: error.message
    });
  }
};

// Delete investment report
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await InvestmentReportModel.getReportById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await InvestmentReportModel.deleteReport(id);

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report',
      error: error.message
    });
  }
};

