import * as ProjectModel from "../../models/Project.js";
import * as InvestmentModel from "../../models/Investment.js";
import path from "path";
import fs from "fs";

export const getAllProjects = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    const filters = {
      status,
      search,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const projects = await ProjectModel.getAllProjects(filters);
    const totalCount = await ProjectModel.getProjectsCount(filters);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: {
        projects,
        totalPages,
        currentPage: parseInt(page),
        totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message
    });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await ProjectModel.getProjectById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    let stats = null;
    try {
      stats = await InvestmentModel.getProjectInvestmentStats(id);
    } catch (error) {
      console.error('Error fetching investment stats:', error);
    }

    res.json({
      success: true,
      data: {
        ...project,
        investment_stats: stats
      }
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: error.message
    });
  }
};

export const createProject = async (req, res) => {
  try {
    const {
      farmer_name,
      farmer_phone,
      farmer_address,
      project_name,
      per_unit_price,
      total_returnable_per_unit,
      project_duration,
      total_units,
      why_fund_with_krishibazar,
      earning_percentage,
      category_id
    } = req.body;

    if (!farmer_name || !farmer_phone || !farmer_address || !project_name || 
        !per_unit_price || !total_returnable_per_unit || !project_duration || 
        !total_units || !why_fund_with_krishibazar || !earning_percentage) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Handle file uploads
    let nid_card_front = null;
    let nid_card_back = null;
    let project_images = null;
    
    if (req.files) {
      if (req.files['nid_card_front']) {
        nid_card_front = req.files['nid_card_front'][0].filename;
      }
      if (req.files['nid_card_back']) {
        nid_card_back = req.files['nid_card_back'][0].filename;
      }
      if (req.files['project_images']) {
        // Join multiple image filenames with comma
        project_images = req.files['project_images'].map(file => file.filename).join(',');
      }
    }

    const projectData = {
      farmer_name,
      farmer_phone,
      farmer_address,
      nid_card_front,
      nid_card_back,
      project_name,
      project_images,
      per_unit_price: parseFloat(per_unit_price),
      total_returnable_per_unit: parseFloat(total_returnable_per_unit),
      project_duration: parseInt(project_duration),
      total_units: parseInt(total_units),
      why_fund_with_krishibazar,
      earning_percentage: parseFloat(earning_percentage),
      category_id: category_id ? parseInt(category_id) : null,
      created_by: req.user.id
    };

    const result = await ProjectModel.createProject(projectData);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { id: result.insertId, ...projectData }
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await ProjectModel.getProjectById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.created_by !== req.user.id && req.user.username !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'You can only update projects you created'
      });
    }

    const updateData = { ...req.body };
    
    if (req.file) {
      if (project.nid_card_photo) {
        const oldFilePath = path.join('src/public', project.nid_card_photo);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      updateData.nid_card_photo = req.file.filename;
    }

    if (updateData.per_unit_price) {
      updateData.per_unit_price = parseFloat(updateData.per_unit_price);
    }
    if (updateData.total_returnable_per_unit) {
      updateData.total_returnable_per_unit = parseFloat(updateData.total_returnable_per_unit);
    }
    if (updateData.project_duration) {
      updateData.project_duration = parseInt(updateData.project_duration);
    }
    if (updateData.earning_percentage) {
      updateData.earning_percentage = parseFloat(updateData.earning_percentage);
    }
    if (updateData.category_id !== undefined) {
      updateData.category_id = updateData.category_id ? parseInt(updateData.category_id) : null;
    }

    await ProjectModel.updateProject(id, updateData);
    const updatedProject = await ProjectModel.getProjectById(id);

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await ProjectModel.getProjectById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.created_by !== req.user.id && req.user.username !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete projects you created'
      });
    }

    if (project.nid_card_photo) {
      const filePath = path.join('src/public', project.nid_card_photo);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await ProjectModel.deleteProject(id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message
    });
  }
};

export const approveProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await ProjectModel.getProjectById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Project is not in pending status'
      });
    }

    await ProjectModel.approveProject(id, req.user.id);
    const updatedProject = await ProjectModel.getProjectById(id);

    res.json({
      success: true,
      message: 'Project approved successfully',
      data: updatedProject
    });
  } catch (error) {
    console.error('Error approving project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve project',
      error: error.message
    });
  }
};

export const rejectProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    const project = await ProjectModel.getProjectById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Project is not in pending status'
      });
    }

    if (!rejection_reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    await ProjectModel.rejectProject(id, req.user.id, rejection_reason);
    const updatedProject = await ProjectModel.getProjectById(id);

    res.json({
      success: true,
      message: 'Project rejected successfully',
      data: updatedProject
    });
  } catch (error) {
    console.error('Error rejecting project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject project',
      error: error.message
    });
  }
};

export const startProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await ProjectModel.getProjectById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Only approved projects can be started'
      });
    }

    await ProjectModel.startProject(id, req.user.id);
    const updatedProject = await ProjectModel.getProjectById(id);

    res.json({
      success: true,
      message: 'Project started successfully',
      data: updatedProject
    });
  } catch (error) {
    console.error('Error starting project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start project',
      error: error.message
    });
  }
};

export const completeProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await ProjectModel.getProjectById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.status !== 'running') {
      return res.status(400).json({
        success: false,
        message: 'Only running projects can be completed'
      });
    }

    await ProjectModel.completeProject(id, req.user.id);
    const updatedProject = await ProjectModel.getProjectById(id);

    res.json({
      success: true,
      message: 'Project completed successfully',
      data: updatedProject
    });
  } catch (error) {
    console.error('Error completing project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete project',
      error: error.message
    });
  }
};