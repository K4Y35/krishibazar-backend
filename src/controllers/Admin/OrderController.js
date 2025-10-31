import * as OrderModel from "../../models/Order.js";
import { sendOrderStatusUpdateEmail } from "../../services/emailService.js";
import { getProductById, updateProduct } from "../../models/Product.js";

export const getAllOrders = async (req, res) => {
  try {
    const { order_status, payment_status, page = 1, limit = 20 } = req.query;
    
    const filters = {
      order_status,
      payment_status,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const orders = await OrderModel.getAllOrders(filters);
    const totalCount = await OrderModel.getOrdersCount(filters);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: {
        orders,
        totalPages,
        currentPage: parseInt(page),
        totalCount
      }
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

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status, payment_status, notes } = req.body;
    
    const existingOrder = await OrderModel.getOrderById(id);
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const updateData = {};
    if (order_status) updateData.order_status = order_status;
    if (payment_status) updateData.payment_status = payment_status;
    if (notes !== undefined) updateData.notes = notes;

    if (order_status === 'confirmed') {
      updateData.confirmed_by = req.user.id;
      updateData.confirmed_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    await OrderModel.updateOrder(id, updateData);

    if (order_status && order_status !== existingOrder.order_status) {
      try {
        const product = await getProductById(existingOrder.product_id);
        
        if (product) {
          if (order_status === 'cancelled' && existingOrder.order_status !== 'cancelled') {
            const newQuantity = product.quantity + existingOrder.order_quantity;
            await updateProduct(existingOrder.product_id, {
              quantity: newQuantity,
              in_stock: true
            });
            console.log(`Order #${id} cancelled. Returned ${existingOrder.order_quantity} units to stock. New quantity: ${newQuantity}`);
          }
        }
      } catch (stockError) {
        console.error('Error adjusting stock:', stockError);
      }

      try {
        await sendOrderStatusUpdateEmail(
          existingOrder.user_email,
          existingOrder,
          order_status,
          payment_status || existingOrder.payment_status
        );
      } catch (emailError) {
        console.error('Error sending order status email:', emailError);
      }
    }

    res.json({
      success: true,
      message: 'Order updated successfully'
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: error.message
    });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingOrder = await OrderModel.getOrderById(id);
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await OrderModel.deleteOrder(id);

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      error: error.message
    });
  }
};

