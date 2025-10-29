import * as ProjectUpdateModel from "../../models/ProjectUpdate.js";
import * as ProjectModel from "../../models/Project.js";
import * as InvestmentModel from "../../models/Investment.js";
import { sendProjectUpdateNotification } from "../../services/emailService.js";

// Get all project updates
export const getAllUpdates = async (req, res) => {
  try {
    const { project_id, update_type, page, limit } = req.query;
    const filters = { project_id, update_type, page: parseInt(page), limit: parseInt(limit) };
    
    const updates = await ProjectUpdateModel.getAllUpdates(filters);
    
    res.json({
      success: true,
      data: updates
    });
  } catch (error) {
    console.error('Error fetching updates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project updates',
      error: error.message
    });
  }
};

// Get single update
export const getUpdateById = async (req, res) => {
  try {
    const { id } = req.params;
    const update = await ProjectUpdateModel.getUpdateById(id);
    
    if (!update) {
      return res.status(404).json({
        success: false,
        message: 'Update not found'
      });
    }
    
    res.json({
      success: true,
      data: update
    });
  } catch (error) {
    console.error('Error fetching update:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch update',
      error: error.message
    });
  }
};

// Create project update
export const createUpdate = async (req, res) => {
  try {
    const {
      project_id,
      title,
      description,
      update_type,
      media_files,
      milestone_status,
      financial_data,
      farmer_notes,
      impact_metrics
    } = req.body;

    // Validate required fields
    if (!project_id || !title || !update_type) {
      return res.status(400).json({
        success: false,
        message: 'Project ID, title, and update type are required'
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

    // Handle uploaded files
    let uploadedFiles = null;
    if (req.files && req.files['media_files']) {
      const files = Array.isArray(req.files['media_files']) 
        ? req.files['media_files'] 
        : [req.files['media_files']];
      
      // Process file uploads (convert to JSON array of filenames)
      uploadedFiles = files.map(file => file.filename);
    }

    const updateData = {
      project_id,
      title,
      description,
      update_type,
      media_files: uploadedFiles || (media_files ? JSON.parse(media_files) : null),
      milestone_status,
      financial_data: financial_data ? JSON.parse(financial_data) : null,
      farmer_notes,
      impact_metrics: impact_metrics ? JSON.parse(impact_metrics) : null,
      created_by: req.user.id
    };

    const result = await ProjectUpdateModel.createUpdate(updateData);
    const newUpdate = await ProjectUpdateModel.getUpdateById(result.insertId);

    // Get all investors for this project and send notifications
    try {
      const investors = await InvestmentModel.getProjectInvestors(project_id);
      
      if (investors && investors.length > 0) {
        // Send email notification to each investor
        const emailPromises = investors.map(async (investor) => {
          try {
            const investorName = `${investor.first_name} ${investor.last_name}`;
            await sendProjectUpdateNotification(
              investor.email,
              newUpdate,
              project.project_name,
              investorName
            );
            console.log(`Email sent to investor: ${investor.email}`);
          } catch (emailError) {
            console.error(`Failed to send email to ${investor.email}:`, emailError);
          }
        });
        
        // Send emails in parallel (don't wait for all to complete)
        Promise.all(emailPromises).then(() => {
          console.log(`Sent update notifications to ${investors.length} investors for project ${project_id}`);
        });
      } else {
        console.log(`No confirmed investors found for project ${project_id}`);
      }
    } catch (notificationError) {
      // Log error but don't fail the request
      console.error('Error sending investor notifications:', notificationError);
    }

    res.status(201).json({
      success: true,
      message: 'Project update created successfully',
      data: newUpdate
    });
  } catch (error) {
    console.error('Error creating update:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create update',
      error: error.message
    });
  }
};

// Update project update
export const updateUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const update = await ProjectUpdateModel.getUpdateById(id);
    if (!update) {
      return res.status(404).json({
        success: false,
        message: 'Update not found'
      });
    }

    // Parse JSON fields if they exist
    if (updateData.media_files && typeof updateData.media_files === 'string') {
      updateData.media_files = JSON.parse(updateData.media_files);
    }
    if (updateData.financial_data && typeof updateData.financial_data === 'string') {
      updateData.financial_data = JSON.parse(updateData.financial_data);
    }
    if (updateData.impact_metrics && typeof updateData.impact_metrics === 'string') {
      updateData.impact_metrics = JSON.parse(updateData.impact_metrics);
    }

    await ProjectUpdateModel.updateUpdate(id, updateData);
    const updated = await ProjectUpdateModel.getUpdateById(id);

    res.json({
      success: true,
      message: 'Update modified successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating update:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project update',
      error: error.message
    });
  }
};

// Delete project update
export const deleteUpdate = async (req, res) => {
  try {
    const { id } = req.params;

    const update = await ProjectUpdateModel.getUpdateById(id);
    if (!update) {
      return res.status(404).json({
        success: false,
        message: 'Update not found'
      });
    }

    await ProjectUpdateModel.deleteUpdate(id);

    res.json({
      success: true,
      message: 'Update deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting update:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete update',
      error: error.message
    });
  }
};

