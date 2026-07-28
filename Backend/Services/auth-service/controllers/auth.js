import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { pool } from "../config/db.js";
import { generateOtp } from "../utils/generateOtp.js";
import {storeOTP} from "../services/otp.service.js";
import {getOTP} from "../services/otp.service.js";
import {deleteOTP} from "../services/otp.service.js";
import sendEmail from "../services/sendEmail.js";


export const signup = async (req, res) => {
  const connection = await pool.getConnection();
//   console.log("Signup Request Body:", req.body);
console.log("Signup api hit");

  try {
    const { full_name, email, password } = req.body;

    // Validation
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required.",
      });
    }

    await connection.beginTransaction();

    // Check if user already exists
    const [existingUser] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message: "User already exists.",
      });
    }

    // Get CUSTOMER role id
    const [roles] = await connection.execute(
      "SELECT id FROM roles WHERE name = ?",
      ["CUSTOMER"]
    );

    if (roles.length === 0) {
      await connection.rollback();

      return res.status(500).json({
        success: false,
        message: "Customer role not found.",
      });
    }

    const customerRoleId = roles[0].id;

    // Hash Password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate UUID
    const userId = uuidv4();

    // Insert User
    await connection.execute(
      `INSERT INTO users
      (id, full_name, email, password_hash)
      VALUES (?, ?, ?, ?)`,
      [userId, full_name, email, passwordHash]
    );

    // Assign CUSTOMER Role
    await connection.execute(
      `INSERT INTO user_roles
      (user_id, role_id)
      VALUES (?, ?)`,
      [userId, customerRoleId]
    );

    await connection.commit();

    console.log("User registered successfully:", { id: userId, full_name, email });

    const otp = generateOtp();
    await storeOTP(email, otp);
     
    await sendEmail({
      to: email,
      subject: "Email Verification OTP",
      html: `
         <!DOCTYPE html>
         <html lang="en">
         <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
         <body style="margin:0; padding:0; background-color:#f4f5f7; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7; padding:32px 16px;">
        <tr><td align="center">
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.06);">
         <tr><td style="background-color:#16a34a; padding:28px 32px; text-align:center;">
          <span style="color:#ffffff; font-size:22px; font-weight:700;">🛒 LocalMart</span>
        </td></tr>
        <tr><td style="padding:40px 32px 24px 32px;">
          <p style="margin:0 0 8px 0; color:#111827; font-size:20px; font-weight:600;">Verify your email</p>
          <p style="margin:0 0 28px 0; color:#6b7280; font-size:15px; line-height:1.6;">Use the code below to complete your email verification. This code will expire in 10 minutes.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="background-color:#f0fdf4; border:1px dashed #16a34a; border-radius:12px; padding:22px 20px;">
              <span style="font-size:34px; font-weight:700; letter-spacing:10px; color:#15803d; font-family:'Courier New', monospace;">${otp}</span>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:24px 32px 32px 32px; text-align:center; border-top:1px solid #e5e7eb;">
          <p style="margin:0; color:#9ca3af; font-size:12px;">&copy; ${new Date().getFullYear()} LocalMart. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
    </table>
  </body>
  </html>`,
    });

    console.log(`OTP for user ${userId} stored in Redis:`, otp);

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: {
        id: userId,
        full_name,
        email,
        roles: ["CUSTOMER"],
      },
    });

  } catch (error) {
    await connection.rollback();

    console.error("Signup Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

  } finally {
    connection.release();
  }
};


export const login = async (req, res) => {
    // Implementation for login
};

export const refresh = async (req, res) => {
    // Implementation for refresh
};

export const logout = async (req, res) => {
    // Implementation for logout
};

export const verifyEmail = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({
            success: false,
            message: "Email and OTP are required.",
        });
    }

    

    const otpFromredis = await getOTP(email);

    if (!otpFromredis) {
        return res.status(400).json({
            success: false,
            message: "OTP has expired or is invalid.",
        });
    }

    if (otpFromredis !== otp) {
        return res.status(400).json({
            success: false,
            message: "Invalid OTP.",
        });
    }

    if (otpFromredis === otp) {
      // 1. Update the user's status in the database
      await pool.query(
        "UPDATE users SET is_email_verified = true WHERE email = ?", 
        [email]
      );

      // 2. Fetch user details with roles directly from users table
      const [rows] = await pool.query(
        `SELECT u.id, u.full_name, u.email, u.is_email_verified, 
                COALESCE(JSON_ARRAYAGG(r.name), JSON_ARRAY('CUSTOMER')) AS roles
         FROM users u
         LEFT JOIN user_roles ur ON u.id = ur.user_id
         LEFT JOIN roles r ON ur.role_id = r.id
         WHERE u.email = ?
         GROUP BY u.id`, 
        [email]
      );

      if (rows.length === 0) {
        return res.status(440).json({
          success: false,
          message: "User record not found.",
        });
      }

      const userData = rows[0];

      console.log("User data after email verification:", userData);

      // Parse JSON string array if needed
      if (typeof userData.roles === "string") {
        try {
          userData.roles = JSON.parse(userData.roles);
        } catch (e) {
          userData.roles = ["CUSTOMER"];
        }
      }
      
      // 3. Clear the OTP from Redis so it cannot be reused
      await deleteOTP(email);
      
      return res.status(200).json({
        success: true,
        message: "Email verified successfully.",
        user: userData,
      });
    }

}
