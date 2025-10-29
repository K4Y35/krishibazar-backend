import * as ProductModel from "../../models/Product.js";

// Get all products with filters
export const getAllProducts = async (req, res) => {
  try {
    const { category, type, in_stock, search, page = 1, limit = 20 } = req.query;
    
    const filters = {
      category,
      type,
      in_stock: in_stock === 'true' ? true : in_stock === 'false' ? false : undefined,
      search,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const products = await ProductModel.getAllProducts(filters);
    const totalCount = await ProductModel.getProductsCount(filters);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: {
        products,
        totalPages,
        currentPage: parseInt(page),
        totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// Create new product
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      type,
      category,
      price,
      quantity,
      unit,
      min_order,
      max_order,
      in_stock,
      description,
      nutritional_info,
      harvest_date,
      shelf_life,
      farmer,
      certifications,
      rating,
      reviews
    } = req.body;

    // Validate required fields
    if (!name || !category || !price || !min_order) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, price, and min_order are required'
      });
    }

    // Handle file uploads
    let product_images = null;
    
    if (req.files && req.files['product_image']) {
      // Join multiple image filenames with comma
      product_images = req.files['product_image'].map(file => file.filename).join(',');
    }

    const productData = {
      name,
      type: type || 'product',
      category,
      price: parseFloat(price),
      quantity: quantity ? parseInt(quantity) : 0,
      unit: unit || 'unit',
      min_order: parseFloat(min_order),
      max_order: max_order ? parseFloat(max_order) : null,
      product_images,
      in_stock: in_stock === 'true' || in_stock === true,
      description: description || null,
      nutritional_info: nutritional_info || null,
      harvest_date: harvest_date || null,
      shelf_life: shelf_life || null,
      farmer: farmer || null,
      certifications: certifications || null,
      rating: rating ? parseFloat(rating) : 0,
      reviews: reviews ? parseInt(reviews) : 0,
      created_by: req.user.id
    };

    const result = await ProductModel.createProduct(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { id: result.insertId, ...productData }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const existingProduct = await ProductModel.getProductById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Build update data
    const updateData = {};
    const {
      name,
      type,
      category,
      price,
      quantity,
      unit,
      min_order,
      max_order,
      in_stock,
      description,
      nutritional_info,
      harvest_date,
      shelf_life,
      farmer,
      certifications,
      rating,
      reviews
    } = req.body;

    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (category) updateData.category = category;
    if (price) updateData.price = parseFloat(price);
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (unit) updateData.unit = unit;
    if (min_order) updateData.min_order = parseFloat(min_order);
    if (max_order !== undefined) updateData.max_order = max_order ? parseFloat(max_order) : null;
    if (in_stock !== undefined) updateData.in_stock = in_stock === 'true' || in_stock === true;
    if (description !== undefined) updateData.description = description;
    if (nutritional_info !== undefined) updateData.nutritional_info = nutritional_info;
    if (harvest_date !== undefined) updateData.harvest_date = harvest_date;
    if (shelf_life !== undefined) updateData.shelf_life = shelf_life;
    if (farmer !== undefined) updateData.farmer = farmer;
    if (certifications !== undefined) updateData.certifications = certifications;
    if (rating !== undefined) updateData.rating = parseFloat(rating);
    if (reviews !== undefined) updateData.reviews = parseInt(reviews);

    // Handle file uploads
    if (req.files && req.files['product_image']) {
      const product_images = req.files['product_image'].map(file => file.filename).join(',');
      updateData.product_images = product_images;
    }

    await ProductModel.updateProduct(id, updateData);

    res.json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const existingProduct = await ProductModel.getProductById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await ProductModel.deleteProduct(id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};


