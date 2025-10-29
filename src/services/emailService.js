import nodemailer from 'nodemailer';


export const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};


export const sendOtpEmail = async (recipients, otpCode, userName, purpose = "registration") => {

  const transporter = createTransporter();
  const isPasswordReset = purpose === "password_reset";
  const subject = isPasswordReset
    ? "KrishiBazar - Password Reset Code"
    : "KrishiBazar - Email Verification OTP";

  const htmlBody = isPasswordReset
    ? `
      <div>
        <p>Hello ${userName},</p>
        <p>We received a request to reset your password for your KrishiBazar account.</p>
        <p>Please use the following code to reset your password:</p>
        <div style="font-size:22px;font-weight:bold;letter-spacing:4px;margin:12px 0;">${otpCode}</div>
        <p>This code will expire in 10 minutes. If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `
    : `
      <div>
        <p>Hello ${userName},</p>
        <p>Thank you for registering with KrishiBazar! To complete your registration and secure your account, 
          please verify your email address using the OTP code below:</p>
        <div style="font-size:22px;font-weight:bold;letter-spacing:4px;margin:12px 0;">${otpCode}</div>
        <p>This OTP will expire in 10 minutes for security reasons.</p>
      </div>
    `;

  const textBody = isPasswordReset
    ? `
      KrishiBazar - Password Reset Code
      Hello ${userName},
      We received a request to reset your password for your KrishiBazar account.
      Please use the following code to reset your password:
      ${otpCode}
      This code will expire in 10 minutes. If you did not request a password reset, you can safely ignore this email.
    `
    : `
      KrishiBazar - Email Verification OTP
      Hello ${userName},
      Thank you for registering with KrishiBazar! To complete your registration and secure your account, 
      please verify your email address using the OTP code below:
      ${otpCode}
      This OTP will expire in 10 minutes for security reasons.
    `;

  const mailOptions = {
    from: {
      name: process.env.EMAIL_FROM_NAME || 'KrishiBazar',
      address: process.env.EMAIL_USER,
    },
    to: recipients,
    subject,
    html: htmlBody,
    text: textBody
  };
  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent successfully:', info.messageId);
  return {
    success: true,
    messageId: info.messageId,
  };
};

// Send project update notification to investors
export const sendProjectUpdateNotification = async (recipients, updateData, projectName, investorName) => {
  try {
    const transporter = createTransporter();
    
    const subject = `Project Update: ${projectName}`;
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5016;">Project Update - ${projectName}</h2>
        <p>Hello ${investorName},</p>
        <p>We have an important update about the project you invested in:</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2d5016; margin-top: 0;">${updateData.title}</h3>
          <p><strong>Update Type:</strong> ${updateData.update_type}</p>
          ${updateData.description ? `<p>${updateData.description}</p>` : ''}
          ${updateData.milestone_status ? `<p><strong>Milestone Status:</strong> ${updateData.milestone_status}</p>` : ''}
          ${updateData.farmer_notes ? `<div style="background-color: #e8f5e9; padding: 10px; border-left: 4px solid #4caf50; margin-top: 15px;"><strong>Farmer Notes:</strong><br>${updateData.farmer_notes}</div>` : ''}
        </div>
        
        <div style="margin-top: 20px;">
          <p>Thank you for your investment and continued support!</p>
          <p style="color: #666;">Best regards,<br>The KrishiBazar Team</p>
        </div>
      </div>
    `;
    
    const textBody = `
      Project Update - ${projectName}
      Hello ${investorName},
      
      We have an important update about the project you invested in:
      
      ${updateData.title}
      Update Type: ${updateData.update_type}
      ${updateData.description ? '\n' + updateData.description : ''}
      ${updateData.milestone_status ? '\nMilestone Status: ' + updateData.milestone_status : ''}
      ${updateData.farmer_notes ? '\nFarmer Notes: ' + updateData.farmer_notes : ''}
      
      Thank you for your investment and continued support!
      
      Best regards,
      The KrishiBazar Team
    `;
    
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'KrishiBazar',
        address: process.env.EMAIL_USER,
      },
      to: recipients,
      subject,
      html: htmlBody,
      text: textBody
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Project update notification sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Error sending project update notification:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Send order status update notification to user
export const sendOrderStatusUpdateEmail = async (recipients, orderData, newStatus, paymentStatus) => {
  try {
    const transporter = createTransporter();
    
    const statusMessages = {
      pending: { color: '#ff9800', message: 'Your order is being reviewed' },
      confirmed: { color: '#2196f3', message: 'Your order has been confirmed!' },
      processing: { color: '#9c27b0', message: 'Your order is being processed' },
      shipped: { color: '#673ab7', message: 'Your order has been shipped!' },
      completed: { color: '#4caf50', message: 'Your order has been completed!' },
      cancelled: { color: '#f44336', message: 'Your order has been cancelled' }
    };

    const statusInfo = statusMessages[newStatus] || { color: '#666', message: `Your order status is now ${newStatus}` };
    const customerName = orderData.customer_name || 'Customer';
    const productName = orderData.product_name || 'Product';
    
    const subject = `Order #${orderData.id} - ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`;
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f5; padding: 20px;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #2d5016; margin-top: 0;">Order Status Update</h2>
          
          <p>Hello ${customerName},</p>
          <p>We have an update on your order:</p>
          
          <div style="background-color: ${statusInfo.color}15; padding: 20px; border-radius: 8px; border-left: 4px solid ${statusInfo.color}; margin: 20px 0;">
            <h3 style="color: ${statusInfo.color}; margin-top: 0;">
              ${statusInfo.message}
            </h3>
            <p style="margin-bottom: 0; font-size: 14px; color: #666;">
              Status: <strong style="color: ${statusInfo.color};">${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</strong>
            </p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #333;">Order Details</h4>
            <p style="margin: 8px 0;"><strong>Order ID:</strong> #${orderData.id}</p>
            <p style="margin: 8px 0;"><strong>Product:</strong> ${productName}</p>
            <p style="margin: 8px 0;"><strong>Quantity:</strong> ${orderData.order_quantity}</p>
            <p style="margin: 8px 0;"><strong>Total Amount:</strong> ৳${parseFloat(orderData.total_price).toLocaleString()}</p>
            <p style="margin: 8px 0;"><strong>Payment Status:</strong> ${paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}</p>
          </div>
          
          ${orderData.delivery_address ? `
          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #333;">Delivery Address</h4>
            <p style="margin: 0;">${orderData.delivery_address}</p>
          </div>
          ` : ''}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666;">Thank you for choosing KrishiBazar!</p>
            <p style="color: #999; font-size: 12px;">Best regards,<br>The KrishiBazar Team</p>
          </div>
        </div>
      </div>
    `;
    
    const textBody = `
      Order Status Update
      Hello ${customerName},
      
      We have an update on your order:
      
      ${statusInfo.message}
      
      Status: ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}
      
      Order Details:
      - Order ID: #${orderData.id}
      - Product: ${productName}
      - Quantity: ${orderData.order_quantity}
      - Total Amount: ৳${parseFloat(orderData.total_price).toLocaleString()}
      - Payment Status: ${paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
      
      ${orderData.delivery_address ? `Delivery Address: ${orderData.delivery_address}` : ''}
      
      Thank you for choosing KrishiBazar!
      
      Best regards,
      The KrishiBazar Team
    `;
    
    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'KrishiBazar',
        address: process.env.EMAIL_USER,
      },
      to: recipients,
      subject,
      html: htmlBody,
      text: textBody
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Order status email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Error sending order status email:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};