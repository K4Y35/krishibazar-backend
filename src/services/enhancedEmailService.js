/**
 * Email Service for KrishiBazar
 * Template system with comprehensive OTP functionality
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { 
  runSelectSqlQuery, 
  runInsertSqlQuery, 
  runUpdateSqlQuery 
} from '../db/sqlfunction.js';

dotenv.config();

/**
 * Get email configuration from database or environment
 * @param {string} environment - 'development' or 'production'
 * @returns {Object} Email configuration
 */
export const getEmailConfig = async (environment = 'development') => {
  try {
    const sql = `SELECT * FROM email_config WHERE environment = ? AND is_active = TRUE LIMIT 1`;
    const [config] = await runSelectSqlQuery(sql, [environment]);
    
    if (config) {
      return {
        host: config.smtp_host,
        port: config.smtp_port,
        secure: config.smtp_secure,
        auth: {
          user: config.smtp_user || process.env.EMAIL_USER,
          pass: config.smtp_password || process.env.EMAIL_PASS,
        },
        from: {
          email: config.from_email,
          name: config.from_name
        }
      };
    }
  } catch (error) {
    console.log('Database email config not found, using environment variables');
  }
  
  // Fallback to environment variables
  return {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    from: {
      email: process.env.EMAIL_USER,
      name: process.env.EMAIL_FROM_NAME || 'KrishiBazar'
    }
  };
};

/**
 * Create email transporter
 * @param {string} environment - Environment type
 * @returns {Object} Nodemailer transporter
 */
export const getEmailTransporter = async (environment = 'development') => {
  const config = await getEmailConfig(environment);
  
  const transporterConfig = {
    ...config,
    // Remove the 'from' property from transporter config
    from: undefined
  };
  
  return nodemailer.createTransporter(transporterConfig);
};

/**
 * Get email template from database
 * @param {string} templateName - Template name
 * @returns {Object} Email template
 */
export const getEmailTemplate = async (templateName) => {
  try {
    const sql = `SELECT * FROM email_templates WHERE template_name = ? AND is_active = TRUE LIMIT 1`;
    const [template] = await runSelectSqlQuery(sql, [templateName]);
    
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }
    
    return {
      subject: template.subject,
      body: template.body,
      placeholders: JSON.parse(template.placeholders || '[]')
    };
  } catch (error) {
    console.error('Error fetching email template:', error);
    throw error;
  }
};

/**
 * Replace placeholders in email template
 * @param {string} template - Email template string
 * @param {Object} params - Parameters to replace
 * @returns {string} Processed template
 */
export const replacePlaceholders = (template, params) => {
  let processedTemplate = template;
  
  for (const [key, value] of Object.entries(params)) {
    const regex = new RegExp(`%${key}%`, 'g');
    processedTemplate = processedTemplate.replace(regex, value || '');
  }
  
  return processedTemplate;
};

/**
 * Log email sending attempt
 * @param {Object} emailData - Email data for logging
 * @returns {number} Log ID
 */
export const logEmail = async (emailData) => {
  try {
    const sql = `
      INSERT INTO email_logs (recipient_email, template_name, subject, status, verification_code_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await runInsertSqlQuery(sql, [
      emailData.recipient,
      emailData.templateName,
      emailData.subject,
      'pending',
      emailData.verificationCodeId || null
    ]);
    
    return result.insertId;
  } catch (error) {
    console.error('Error logging email:', error);
    return null;
  }
};

/**
 * Update email log status
 * @param {number} logId - Email log ID
 * @param {string} status - Email status
 * @param {string} errorMessage - Error message if failed
 */
export const updateEmailLog = async (logId, status, errorMessage = null) => {
  if (!logId) return;
  
  try {
    const sql = `
      UPDATE email_logs 
      SET status = ?, error_message = ?, sent_at = ?
      WHERE id = ?
    `;
    await runUpdateSqlQuery(sql, [
      status,
      errorMessage,
      status === 'sent' ? new Date() : null,
      logId
    ]);
  } catch (error) {
    console.error('Error updating email log:', error);
  }
};

/**
 * Send email with template
 * @param {string|Array} recipients - Email recipient(s)
 * @param {string} templateName - Template name
 * @param {Object} params - Template parameters
 * @param {Object} options - Additional options
 * @returns {Object} Send result
 */
export const sendEmail = async (recipients, templateName, params = {}, options = {}) => {
  let logId = null;
  
  try {
    // Ensure recipients is an array
    const recipientList = Array.isArray(recipients) ? recipients : [recipients];
    const primaryRecipient = recipientList[0];
    
    // Get email template
    const template = await getEmailTemplate(templateName);
    
    // Process template with parameters
    const processedSubject = replacePlaceholders(template.subject, params);
    const processedBody = replacePlaceholders(template.body, params);
    
    // Log email attempt
    logId = await logEmail({
      recipient: primaryRecipient,
      templateName,
      subject: processedSubject,
      verificationCodeId: options.verificationCodeId
    });
    
    // Get email configuration and transporter
    const emailConfig = await getEmailConfig(options.environment);
    const transporter = await getEmailTransporter(options.environment);
    
    // Prepare email options
    const mailOptions = {
      from: {
        name: emailConfig.from.name,
        address: emailConfig.from.email,
      },
      to: recipientList.join(', '),
      subject: processedSubject,
      html: processedBody,
      // Generate text version from HTML (basic conversion)
      text: processedBody.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    };
    
    // Add attachments if provided
    if (options.attachments) {
      mailOptions.attachments = options.attachments;
    }
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    // Update log as sent
    await updateEmailLog(logId, 'sent');
    
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      recipients: recipientList,
      template: templateName
    });
    
    return {
      success: true,
      messageId: info.messageId,
      recipients: recipientList,
      logId
    };
    
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Update log as failed
    await updateEmailLog(logId, 'failed', error.message);
    
    return {
      success: false,
      error: error.message,
      logId
    };
  }
};

/**
 * Send OTP email specifically
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {string} templateName - Template to use
 * @param {Object} userData - User data for template
 * @param {Object} options - Additional options
 * @returns {Object} Send result
 */
export const sendOtpEmail = async (email, otp, templateName = 'registration', userData = {}, options = {}) => {
  const params = {
    otp,
    firstName: userData.firstName || userData.first_name || '',
    lastName: userData.lastName || userData.last_name || '',
    email: email,
    ...userData
  };
  
  return await sendEmail(email, templateName, params, options);
};

/**
 * Test email connection
 * @param {string} environment - Environment to test
 * @returns {boolean} Connection status
 */
export const testEmailConnection = async (environment = 'development') => {
  try {
    const transporter = await getEmailTransporter(environment);
    await transporter.verify();
    console.log('Email service is ready for environment:', environment);
    return true;
  } catch (error) {
    console.error('Email service configuration error:', error);
    return false;
  }
};

/**
 * Send bulk emails
 * @param {Array} emailList - List of email data objects
 * @param {Object} options - Bulk send options
 * @returns {Object} Bulk send results
 */
export const sendBulkEmails = async (emailList, options = {}) => {
  const results = {
    successful: [],
    failed: [],
    total: emailList.length
  };
  
  const batchSize = options.batchSize || 10;
  const delay = options.delay || 1000; // 1 second delay between batches
  
  for (let i = 0; i < emailList.length; i += batchSize) {
    const batch = emailList.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (emailData) => {
      try {
        const result = await sendEmail(
          emailData.recipients,
          emailData.templateName,
          emailData.params,
          emailData.options
        );
        
        if (result.success) {
          results.successful.push({
            recipients: result.recipients,
            messageId: result.messageId
          });
        } else {
          results.failed.push({
            recipients: emailData.recipients,
            error: result.error
          });
        }
      } catch (error) {
        results.failed.push({
          recipients: emailData.recipients,
          error: error.message
        });
      }
    });
    
    await Promise.all(batchPromises);
    
    // Add delay between batches to avoid rate limiting
    if (i + batchSize < emailList.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.log('Bulk email results:', {
    successful: results.successful.length,
    failed: results.failed.length,
    total: results.total
  });
  
  return results;
};

/**
 * Get email delivery statistics
 * @param {Date} startDate - Start date for statistics
 * @param {Date} endDate - End date for statistics
 * @returns {Object} Email statistics
 */
export const getEmailStats = async (startDate, endDate) => {
  try {
    const sql = `
      SELECT 
        status,
        template_name,
        COUNT(*) as count,
        DATE(created_at) as date
      FROM email_logs 
      WHERE created_at BETWEEN ? AND ?
      GROUP BY status, template_name, DATE(created_at)
      ORDER BY date DESC
    `;
    
    const stats = await runSelectSqlQuery(sql, [startDate, endDate]);
    
    return {
      success: true,
      data: stats,
      summary: {
        total: stats.reduce((sum, stat) => sum + stat.count, 0),
        sent: stats.filter(s => s.status === 'sent').reduce((sum, stat) => sum + stat.count, 0),
        failed: stats.filter(s => s.status === 'failed').reduce((sum, stat) => sum + stat.count, 0),
        pending: stats.filter(s => s.status === 'pending').reduce((sum, stat) => sum + stat.count, 0)
      }
    };
  } catch (error) {
    console.error('Error getting email stats:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Export legacy function for compatibility
export { sendOtpEmail as sendOTPEmail };
