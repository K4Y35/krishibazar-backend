import * as OrderModel from "../../models/Order.js";
import { getProductById } from "../../models/Product.js";
import { updateProduct } from "../../models/Product.js";

export const createOrder = async (req, res) => {
  try {
    const {
      product_id,
      order_quantity,
      unit_price,
      total_price,
      customer_name,
      customer_phone,
      customer_email,
      delivery_address,
      notes,
      payment_method
    } = req.body;

    const user_id = req.user.id;

    if (!product_id || !order_quantity || !customer_name || !customer_phone || !delivery_address) {
      return res.status(400).json({
        success: false,
        message: 'Product, quantity, customer name, phone, and delivery address are required'
      });
    }

    const product = await getProductById(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.in_stock) {
      return res.status(400).json({
        success: false,
        message: 'Product is currently out of stock'
      });
    }

    if (product.quantity < parseInt(order_quantity)) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.quantity} units available`
      });
    }

    const orderData = {
      user_id,
      product_id,
      order_quantity: parseInt(order_quantity),
      unit_price: parseFloat(unit_price),
      total_price: parseFloat(total_price),
      customer_name,
      customer_phone,
      customer_email: customer_email || null,
      delivery_address,
      notes: notes || null,
      payment_method: payment_method || 'cash_on_delivery'
    };

    const result = await OrderModel.createOrder(orderData);

    const newQuantity = product.quantity - order_quantity;
    const updatedStock = {
      quantity: newQuantity,
      in_stock: newQuantity > 0
    };
    await updateProduct(product_id, updatedStock);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { id: result.insertId, ...orderData }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const user_id = req.user.id;

    const filters = {
      user_id
    };

    if (req.query.order_status && req.query.order_status !== 'all') {
      filters.order_status = req.query.order_status;
    }

    const orders = await OrderModel.getAllOrders(filters);

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await OrderModel.getOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

