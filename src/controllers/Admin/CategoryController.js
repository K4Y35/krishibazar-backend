import * as CategoryModel from "../../models/Category.js";
import path from "path";
import fs from "fs";

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const { is_active } = req.query;
    
    const filters = {};
    if (is_active !== undefined) {
      filters.is_active = is_active === 'true';
    }

    const categories = await CategoryModel.getAllCategories(filters);
    const totalCount = await CategoryModel.getCategoriesCount(filters);

    res.json({
      success: true,
      data: categories,
      total: totalCount
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await CategoryModel.getCategoryById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
};

// Create new category
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const created_by = req.admin?.id || null;
    let icon = req.body.icon || 'crop';

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    // Handle file upload if icon file is provided
    if (req.file) {
      icon = req.file.filename;
    }

    const categoryId = await CategoryModel.createCategory({
      name,
      icon,
      description,
      created_by
    });

    const newCategory = await CategoryModel.getCategoryById(categoryId);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;
    let icon = req.body.icon;

    // Check if category exists
    const existingCategory = await CategoryModel.getCategoryById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Handle file upload if icon file is provided
    if (req.file) {
      // Delete old icon file if exists
      if (existingCategory.icon && !iconOptions.some(opt => opt.value === existingCategory.icon)) {
        const oldFilePath = path.join(process.cwd(), 'src', 'public', existingCategory.icon);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      icon = req.file.filename;
    }

    await CategoryModel.updateCategory(id, {
      name,
      icon,
      description,
      is_active
    });

    const updatedCategory = await CategoryModel.getCategoryById(id);

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const existingCategory = await CategoryModel.getCategoryById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await CategoryModel.deleteCategory(id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
};

