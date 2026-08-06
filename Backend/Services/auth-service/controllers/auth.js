import bcrypt from "bcrypt";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { pool } from "../config/db.js";
import { generateOtp } from "../utils/generateOtp.js";
import {storeOTP} from "../services/otp.service.js";
import {getOTP} from "../services/otp.service.js";
import {deleteOTP} from "../services/otp.service.js";
import sendEmail from "../services/sendEmail.js";
import { setAuthCookies, clearAuthCookies } from "../utils/cookie.js";
import { createAccessToken, createRefreshToken, verifyAccessToken, verifyRefreshToken } from "../utils/jwt.js";
import { publishEvent, TOPICS } from "@localmart/shared";



export const signup = async (req, res) => {
  const connection = await pool.getConnection();
  console.log("Signup api hit");

  try {
    const { full_name, email, password, role = "CUSTOMER" } = req.body;

    // Validation
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required.",
      });
    }

    if (!["CUSTOMER", "SELLER", "DELIVERY"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified.",
      });
    }

    await connection.beginTransaction();

    // Check if user already exists
    const [existingUser] = await connection.execute(
      "SELECT id, password_hash, is_email_verified FROM users WHERE email = ?",
      [email]
    );

    let userId;
    let isExisting = false;
    let isEmailVerified = false;

    // Get Role id
    const [rolesList] = await connection.execute(
      "SELECT id FROM roles WHERE name = ?",
      [role]
    );

    if (rolesList.length === 0) {
      await connection.rollback();
      return res.status(500).json({
        success: false,
        message: `${role} role not found in database.`,
      });
    }

    const assignedRoleId = rolesList[0].id;

    if (existingUser.length > 0) {
      userId = existingUser[0].id;
      isEmailVerified = existingUser[0].is_email_verified;
      isExisting = true;

      // Verify Password since they are modifying an existing account
      const isPasswordValid = await bcrypt.compare(password, existingUser[0].password_hash);
      if (!isPasswordValid) {
        await connection.rollback();
        return res.status(401).json({
          success: false,
          message: "User exists but password is incorrect.",
        });
      }

      // Check if user already has this role
      const [existingRoles] = await connection.execute(
        "SELECT role_id FROM user_roles WHERE user_id = ? AND role_id = ?",
        [userId, assignedRoleId]
      );

      if (existingRoles.length === 0) {
        // Assign Role
        await connection.execute(
          `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`,
          [userId, assignedRoleId]
        );
      }
    } else {
      // Create new user
      userId = uuidv4();
      const passwordHash = await bcrypt.hash(password, 10);

      await connection.execute(
        `INSERT INTO users (id, full_name, email, password_hash) VALUES (?, ?, ?, ?)`,
        [userId, full_name, email, passwordHash]
      );

      await connection.execute(
        `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`,
        [userId, assignedRoleId]
      );
    }

    await connection.commit();

    console.log("User registered/updated successfully:", { id: userId, full_name, email });

    // Fetch all roles for the JWT payload
    const [allUserRoles] = await connection.execute(
      `SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?`,
      [userId]
    );
    const assignedRolesArray = allUserRoles.map(r => r.name);

    if (!isExisting || !isEmailVerified) {
      const otp = generateOtp();
      console.log(`Generated OTP for user ${userId}:`, otp);
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
  
      console.log(`OTP for user ${email} stored in Redis:`, otp);
    }

    const payload = {
      userId: userId,
      email: email,
      roles: assignedRolesArray,
      fullName: full_name,
    };

    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken({ userId });

    // Store hashed Refresh Token in Database
    const tokenId = uuidv4();
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await pool.query(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)`,
      [tokenId, userId, tokenHash, expiresAt]
    );

    await setAuthCookies(res, accessToken, refreshToken);

    // Publish USER_CREATED Kafka Event immediately upon registration
    try {
      await publishEvent(TOPICS.USER_EVENTS, {
        eventType: "USER_CREATED",
        userId: userId,
        email: email,
        fullName: full_name,
      });
      console.log(`📡 Kafka USER_CREATED event published for ${email} on signup`);
    } catch (kafkaErr) {
      console.error("❌ Kafka publishing error on signup:", kafkaErr);
    }

    return res.status(201).json({
      success: true,
      message: isExisting ? "Role added successfully." : "User registered successfully.",
      user: {
        id: userId,
        full_name,
        email,
        roles: assignedRolesArray,
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
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Fetch user details with roles
    const [rows] = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.password_hash, u.is_email_verified, 
              COALESCE(JSON_ARRAYAGG(r.name), JSON_ARRAY('CUSTOMER')) AS roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.email = ?
       GROUP BY u.id`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = rows[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Parse roles if JSON string
    if (typeof user.roles === "string") {
      try {
        user.roles = JSON.parse(user.roles);
      } catch (e) {
        user.roles = ["CUSTOMER"];
      }
    }

    // Remove password_hash from response user object
    delete user.password_hash;

    // Generate JWT Tokens
    const payload = {
      userId: user.id,
      email: user.email,
      roles: user.roles,
      fullName: user.full_name,
    };

    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken({ userId: user.id });

    // Store hashed Refresh Token in DB
    const tokenId = uuidv4();
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await pool.query(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)`,
      [tokenId, user.id, tokenHash, expiresAt]
    );

    // Set Cookies
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "No refresh token provided.",
      });
    }

    // Verify Refresh Token JWT signature & expiration
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token.",
      });
    }

    // Check DB for refresh token record (must exist and revoked_at IS NULL)
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const [tokenRows] = await pool.query(
      `SELECT id, revoked_at, expires_at FROM refresh_tokens WHERE token_hash = ? AND user_id = ?`,
      [tokenHash, decoded.userId]
    );

    if (tokenRows.length === 0 || tokenRows[0].revoked_at !== null || new Date(tokenRows[0].expires_at) < new Date()) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Refresh token has been revoked or is invalid.",
      });
    }

    // Fetch user details from DB
    const [rows] = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.is_email_verified, 
              COALESCE(JSON_ARRAYAGG(r.name), JSON_ARRAY('CUSTOMER')) AS roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = ?
       GROUP BY u.id`,
      [decoded.userId]
    );

    if (rows.length === 0) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = rows[0];
    if (typeof user.roles === "string") {
      try {
        user.roles = JSON.parse(user.roles);
      } catch (e) {
        user.roles = ["CUSTOMER"];
      }
    }

    // Revoke old refresh token (Token rotation)
    await pool.query(
      `UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [tokenRows[0].id]
    );

     // Create new Tokens
    const payload = {
      userId: user.id,
      email: user.email,
      roles: user.roles,
      fullName: user.full_name,
    };

    const newAccessToken = createAccessToken(payload);
    const newRefreshToken = createRefreshToken({ userId: user.id });

    // Store new refresh token in DB
    const newTokenId = uuidv4();
    const newTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)`,
      [newTokenId, user.id, newTokenHash, newExpiresAt]
    );

    // Set new cookies
    setAuthCookies(res, newAccessToken, newRefreshToken);

    return res.status(200).json({
      success: true,
      message: "Tokens refreshed successfully.",
      user,
    });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
      // Mark refresh token as revoked in database
      await pool.query(
        `UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = ? AND revoked_at IS NULL`,
        [tokenHash]
      );
    }

    clearAuthCookies(res);
    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    clearAuthCookies(res);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
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
      
      // 3. Generate Auth Tokens & Set Cookies
      const payload = {
        userId: userData.id,
        email: userData.email,
        roles: userData.roles || ["CUSTOMER"],
        fullName: userData.full_name,
      };

      const accessToken = createAccessToken(payload);
      const refreshToken = createRefreshToken({ userId: userData.id });

      setAuthCookies(res, accessToken, refreshToken);

      // 4. Clear the OTP from Redis so it cannot be reused
      await deleteOTP(email);

      // 5. Publish USER_CREATED Kafka Event for User Service
      try {
        await publishEvent(TOPICS.USER_EVENTS, {
          eventType: "USER_CREATED",
          userId: userData.id,
          email: userData.email,
          fullName: userData.full_name,
        });
        console.log(`📡 Kafka USER_CREATED event published for ${email}`);
      } catch (kafkaErr) {
        console.error("❌ Kafka publishing error:", kafkaErr);
      }
      
      return res.status(200).json({
        success: true,
        message: "Email verified successfully.",
        user: userData,
      });
    }

};

export const me = async (req, res) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. No access token provided.",
      });
    }

    const decoded = verifyAccessToken(token);

    const [rows] = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.is_email_verified, 
              COALESCE(JSON_ARRAYAGG(r.name), JSON_ARRAY('CUSTOMER')) AS roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = ?
       GROUP BY u.id`,
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = rows[0];
    if (typeof user.roles === "string") {
      try {
        user.roles = JSON.parse(user.roles);
      } catch (e) {
        user.roles = ["CUSTOMER"];
      }
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token.",
    });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    // Verify user exists in database
    const [rows] = await pool.query("SELECT id, full_name, is_email_verified FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User with this email does not exist.",
      });
    }

    if (rows[0].is_email_verified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified.",
      });
    }

    // Generate new OTP & store in Redis
    const newOtp = generateOtp();
    await storeOTP(email, newOtp);

    // Send Email via Brevo
    await sendEmail({
      to: email,
      subject: "Your New Verification OTP - LocalMart",
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
          <p style="margin:0 0 8px 0; color:#111827; font-size:20px; font-weight:600;">Resent OTP Verification</p>
          <p style="margin:0 0 28px 0; color:#6b7280; font-size:15px; line-height:1.6;">Use the code below to complete your email verification. This code will expire in 10 minutes.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="background-color:#f0fdf4; border:1px dashed #16a34a; border-radius:12px; padding:22px 20px;">
              <span style="font-size:34px; font-weight:700; letter-spacing:10px; color:#15803d; font-family:'Courier New', monospace;">${newOtp}</span>
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

    console.log(`Resent new OTP for ${email}:`, newOtp);

    return res.status(200).json({
      success: true,
      message: "A new 6-digit OTP code has been sent to your email.",
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while resending OTP.",
    });
  }
};

export const sellerSignup = async (req, res) => {
  const connection = await pool.getConnection();
  console.log("Seller Signup api hit");

  try {
    const { full_name, email, password, role = "SELLER" } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ success: false, message: "Full name, email and password are required." });
    }

    await connection.beginTransaction();

    const [existingUser] = await connection.execute("SELECT id, password_hash, is_email_verified FROM users WHERE email = ?", [email]);
    let userId;
    let isExisting = false;
    let isEmailVerified = false;

    const [rolesList] = await connection.execute("SELECT id FROM roles WHERE name = ?", [role]);
    if (rolesList.length === 0) {
      await connection.rollback();
      return res.status(500).json({ success: false, message: `${role} role not found.` });
    }
    const assignedRoleId = rolesList[0].id;

    if (existingUser.length > 0) {
      userId = existingUser[0].id;
      isEmailVerified = existingUser[0].is_email_verified;
      isExisting = true;
      const isPasswordValid = await bcrypt.compare(password, existingUser[0].password_hash);
      if (!isPasswordValid) {
        await connection.rollback();
        return res.status(401).json({ success: false, message: "User exists but password is incorrect." });
      }
      const [existingRoles] = await connection.execute("SELECT role_id FROM user_roles WHERE user_id = ? AND role_id = ?", [userId, assignedRoleId]);
      if (existingRoles.length === 0) {
        await connection.execute(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`, [userId, assignedRoleId]);
      }
    } else {
      userId = uuidv4();
      const passwordHash = await bcrypt.hash(password, 10);
      await connection.execute(`INSERT INTO users (id, full_name, email, password_hash) VALUES (?, ?, ?, ?)`, [userId, full_name, email, passwordHash]);
      await connection.execute(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`, [userId, assignedRoleId]);
    }

    await connection.commit();

    const [allUserRoles] = await connection.execute(`SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?`, [userId]);
    const assignedRolesArray = allUserRoles.map(r => r.name);

    if (!isExisting || !isEmailVerified) {
      const otp = generateOtp();
      await storeOTP(email, otp);
      await sendEmail({
        to: email,
        subject: "Email Verification OTP",
        html: `<p>Your OTP is ${otp}</p>`
      });
    }

    const payload = { userId, email, roles: assignedRolesArray };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken({ userId });

    const tokenId = uuidv4();
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.query(`INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)`, [tokenId, userId, tokenHash, expiresAt]);

    // Publish SELLER_CREATED Kafka Event for User Service
    try {
      console.log("Publishing SELLER_CREATED event to Kafka...");
      await publishEvent(TOPICS.USER_EVENTS, {
        eventType: "SELLER_CREATED",
        userId: userId,
        email: email,
        fullName: full_name,
        businessName: req.body.businessName,
        ownerName: req.body.ownerName,
        phone: req.body.phone,
        businessType: req.body.businessType,
        gstNumber: req.body.gstNumber,
        panNumber: req.body.panNumber,
      });
      console.log(`📡 Kafka SELLER_CREATED event published successfully for ${email}`);
    } catch (kafkaErr) {
      console.error("❌ Kafka publishing error:", kafkaErr);
    }

    await setAuthCookies(res, accessToken, refreshToken);
    return res.status(201).json({
      success: true,
      message: isExisting ? "Seller role added successfully." : "Seller registered successfully.",
      user: { id: userId, full_name, email, roles: assignedRolesArray },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Seller Signup Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  } finally {
    connection.release();
  }
};

