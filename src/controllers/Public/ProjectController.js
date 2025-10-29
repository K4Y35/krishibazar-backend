import * as ProjectModel from "../../models/Project.js";
import * as InvestmentModel from "../../models/Investment.js";

// Get approved projects for public display
export const getApprovedProjects = async (req, res) => {
  try {
    const { search, category_id, page = 1, limit = 20 } = req.query;
    
    const filters = {
      statuses: ['approved', 'running'], // Show both approved and running projects
      search,
      category_id: category_id ? parseInt(category_id) : undefined,
      page: parseInt(page),
      limit: parseInt(limit)
    };

  const projects = await ProjectModel.getAllProjects(filters);
  const totalCount = await ProjectModel.getProjectsCount(filters);
  const totalPages = Math.ceil(totalCount / limit);

    // Get investment stats for all projects
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        try {
          const stats = await InvestmentModel.getProjectInvestmentStats(project.id);
          const availableUnits = project.total_units - (stats.total_booked_units || 0);
          return {
            ...project,
            available_units: Math.max(0, availableUnits),
            total_booked_units: stats.total_booked_units || 0,
            confirmed_units: stats.confirmed_units || 0
          };
        } catch (error) {
          return {
            ...project,
            available_units: project.total_units,
            total_booked_units: 0,
            confirmed_units: 0
          };
        }
      })
    );

    // Transform the data to match the frontend expectations
    const transformedProjects = projectsWithStats.map(project => ({
      id: project.id,
      title: project.project_name,
      project_name: project.project_name,
      farmer_name: project.farmer_name,
      farmer_location: project.farmer_address,
      project_type: 'crop', // Default type
      category_id: project.category_id,
      description: project.why_fund_with_krishibazar,
      why_fund_with_krishibazar: project.why_fund_with_krishibazar,
      total_fund_needed: project.per_unit_price,
      current_funded: 0, // This would come from investments table later
      duration_months: project.project_duration,
      expected_return_percent: project.earning_percentage,
      risk_level: 'medium', // Default risk level
      status: 'approved',
      per_unit_price: project.per_unit_price,
      total_returnable_per_unit: project.total_returnable_per_unit,
      total_units: project.total_units,
      available_units: project.available_units,
      created_at: project.created_at,
      approved_at: project.approved_at,
      project_images: project.project_images
    }));

    res.json({
      success: true,
      data: transformedProjects,
      pagination: {
        totalPages,
        currentPage: parseInt(page),
        totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching approved projects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message
    });
  }
};

// Get single project by ID for public display
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

    // Check if project is approved (not running or completed)
    if (project.status !== 'approved') {
      return res.status(404).json({
        success: false,
        message: 'Project not available for investment'
      });
    }

    // Get investment stats for this project
    const stats = await InvestmentModel.getProjectInvestmentStats(id);
    const availableUnits = project.total_units - (stats.total_booked_units || 0);

    // Transform the data to match the frontend expectations
    const transformedProject = {
      id: project.id,
      project_name: project.project_name,
      farmer_name: project.farmer_name,
      farmer_address: project.farmer_address,
      farmer_phone: project.farmer_phone,
      project_type: 'crop', // Default type, can be enhanced later
      description: project.why_fund_with_krishibazar,
      total_fund_needed: project.per_unit_price,
      current_funded: 0, // This would come from investments table later
      duration_months: project.project_duration,
      expected_return_percent: project.earning_percentage,
      risk_level: 'medium', // Default risk level
      status: project.status,
      per_unit_price: project.per_unit_price,
      total_returnable_per_unit: project.total_returnable_per_unit,
      earning_percentage: project.earning_percentage,
      project_duration: project.project_duration,
      total_units: project.total_units,
      available_units: Math.max(0, availableUnits),
      total_booked_units: stats.total_booked_units || 0,
      confirmed_units: stats.confirmed_units || 0,
      created_at: project.created_at,
      approved_at: project.approved_at,
      project_images: project.project_images
    };

    res.json({
      success: true,
      data: transformedProject
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
