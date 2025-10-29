import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as UserDB from "../../models/User.js";
import * as VerificationCodeDB from "../../models/VerificationCode.js";
import { sendOtpEmail } from "../../services/emailService.js";
import constants from "../../constants/index.js";
import { generateOtp } from "../../helpers/otpHelper.js";

export const register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      phone,
      email,
      password,
      nid_front,
      nid_back,
    } = req.body;

    // Validation
    if (!nid_front || !nid_back) {
      return res.status(400).json({
        success: false,
        message: "Both NID front and back images are required",
      });
    }

    if (!first_name || !last_name || !phone || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user already exists
    const [existingByPhone] = await UserDB.getUserByPhone(phone);
    const [existingByEmail] = await UserDB.getUserByEmail(email);

    if (existingByPhone?.id || existingByEmail?.id) {
      return res.status(400).json({
        success: false,
        message: "User with this phone or email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const userResult = await UserDB.createUser({
      first_name,
      last_name,
      phone,
      email,
      nid_front,
      nid_back,
      password_hash,
    });

    const userId = userResult.insertId;

    const otpCode = await generateOtp();

    //insert verification code
    const verificationResult = await VerificationCodeDB.createVerificationCode({
      user_id: userId,
      code: otpCode,
      expires_at: new Date(Date.now() + 10 * 60 * 1000),
      type: constants.OTP_TYPES.REGISTRATION,
    });

    const fullName = `${first_name} ${last_name}`;

    const emailResult = await sendOtpEmail(email, otpCode, fullName, "password_reset");

    console.log("emailResult", emailResult);

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email for the OTP to verify your account.",
      data: {
        user_id: userId,
        phone,
        email,
        verification_id: verificationResult.insertId,
        expires_in_minutes: 10,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

/**
 * OTP verification with multiple scenarios
 */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp_code, verification_type } = req.body;
    

    if (!otp_code) {
      return res.status(400).json({
        success: false,
        message: "OTP code is required",
      });
    }

    //check user exists
    const [user] = await UserDB.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    // Determine verification type (default: registration)
    const type = verification_type || constants.OTP_TYPES.REGISTRATION;

    // Get verification code
    const verificationCode = await VerificationCodeDB.getVerificationCodeById(
      user.id,
      type
    );

    if (!verificationCode) {
      return res.status(404).json({
        success: false,
        message: "No verification code found. Please request a new one.",
      });
    }

    if (verificationCode[0].otp_code !== otp_code) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code",
      });
    }

    // If this is for password reset, return a reset token
    if (type === constants.OTP_TYPES.PASSWORD_RESET) {
      const resetToken = jwt.sign(
        { userId: user.id, type: "password_reset" },
        process.env.JWT_SECRET || "jwtKrishibazaar2025",
        { expiresIn: "15m" }
      );
      return res.json({
        success: true,
        message: "OTP verified successfully",
        data: { resetToken },
      });
    }

    // Otherwise mark user verified (registration flow)
    await UserDB.updateUser(user.id, { is_verified: true });

    return res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (err) {
    console.error("OTP verification error:", err);
    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

/**
 * Resend OTP with rate limiting
 */
export const resendOTP = async (req, res) => {
  try {
    const {
      email,
      phone,
      identifier,
      verification_type = constants.OTP_TYPES.REGISTRATION,
    } = req.body;

    const lookupIdentifier = identifier || email || phone;
    if (!lookupIdentifier) {
      return res.status(400).json({
        success: false,
        message: "Please provide email, phone, or identifier",
      });
    }

    // Optionally add rate limiting

    // Invalidate existing codes
    // Optionally invalidate previous codes

    // Get user data for email template
    let userData = {};
    let userId = null;

    const [userByEmail] = await UserDB.getUserByEmail(lookupIdentifier);
    const [userByPhone] = await UserDB.getUserByPhone(lookupIdentifier);
    const user = userByEmail || userByPhone;

    if (user) {
      userId = user.id;
      userData = {
        firstName: user.first_name,
        lastName: user.last_name,
      };
    }

    // Generate new verification code
    const otpCode = await generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save verification code
    const verificationResult = await VerificationCodeDB.createVerificationCode({
      user_id: userId,
      code: otpCode,
      type: verification_type,
      expires_at: expiresAt,
    });

    // Determine template name
    const fullName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim();

    // Send OTP email
    const emailResult = await sendOtpEmail(
      lookupIdentifier,
      otpCode,
      fullName || "KrishiBazar User",
      verification_type === constants.OTP_TYPES.PASSWORD_RESET ? "password_reset" : "registration"
    );

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification code",
      });
    }

    return res.json({
      success: true,
      message: "Verification code resent successfully",
      data: {
        verification_id: verificationResult.insertId,
        expires_in_minutes: 10,
      },
    });
  } catch (err) {
    console.error("Resend OTP error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to resend verification code",
    });
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if user exists
    const [user] = await UserDB.getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists for security
      return res.json({
        success: true,
        message:
          "If an account with this email exists, you will receive password reset instructions.",
      });
    }

    // Optionally: implement rate limiting in DB module; for now, skip

    // Invalidate existing password reset codes
    // Optionally: invalidate previous codes (not implemented in current model)

    // Generate OTP (reuse registration approach)
    const otpCode = await generateOtp();

    // Save verification code
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    //check if that user has already a password reset code and if so replace that code
    const existingPasswordResetCode = await VerificationCodeDB.getVerificationCodeById(
      user.id,
      constants.OTP_TYPES.PASSWORD_RESET
    );
    let verificationId;
    if (existingPasswordResetCode && existingPasswordResetCode.length > 0) {
      const existing = existingPasswordResetCode[0];
      await VerificationCodeDB.updateVerificationCode(existing.id, {
        code: otpCode,
        expires_at: expiresAt,
      });
      verificationId = existing.id;
    } else {
      const insertResult = await VerificationCodeDB.createVerificationCode({
        user_id: user.id,
        code: otpCode,
        expires_at: expiresAt,
        type: constants.OTP_TYPES.PASSWORD_RESET,
      });
      verificationId = insertResult.insertId;
    }

    // Send password reset email (uses name as third param in current service)
    const fullName = `${user.first_name} ${user.last_name}`;
    await sendOtpEmail(email, otpCode, fullName);

    return res.json({
      success: true,
      message: "Password reset code sent to your email",
      data: {
        verification_id: verificationId,
        expires_in_minutes: 10,
      },
    });
  } catch (err) {
    console.error("Password reset request error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to process password reset request",
    });
  }
};

/**
 * Reset password with verified OTP
 */
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required",
      });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(
        resetToken,
        process.env.JWT_SECRET || "jwtKrishibazaar2025"
      );
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    if (decoded.type !== "password_reset") {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // Update user password
    await UserDB.updateUserPassword(decoded.userId, password_hash);

    // Invalidate all verification codes for this user
    try {
      await VerificationCodeDB.invalidateUserCodes(
        decoded.userId,
        constants.OTP_TYPES.PASSWORD_RESET
      );
    } catch {}

    return res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    console.error("Password reset error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const rows = await UserDB.getUserByEmail(email);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = rows[0];

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is verified
    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email address first",
        requiresVerification: true,
        email: user.email,
      });
    }

    if (!user.is_approved) {
      return res.status(200).json({
        success: true,
        message: "Your account is not approved. Please wait for approval",
        userStatus: "pending",
        id: user.id,
      });
    }

    // Generate login token
    const token = jwt.sign(
      {
        id: user.id,
        phone: user.phone,
        email: user.email,
      },
      process.env.JWT_SECRET || "jwtKrishibazaar2025",
      { expiresIn: "24h" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          email: user.email,
          is_approved: user.is_approved,
        },
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

export { verifyOTP as verifyOtp };

