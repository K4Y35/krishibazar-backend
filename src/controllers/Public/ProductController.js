import * as ProductModel from "../../models/Product.js";

export const getAllProducts = async (req, res) => {
  try {
    const { category, type, search, page = 1, limit = 20 } = req.query;
    
    const filters = {
      category,
      type,
      in_stock: true,
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

    if (!product.in_stock) {
      return res.status(404).json({
        success: false,
        message: 'Product not available'
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


