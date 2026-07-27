import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { pool } from "../config/db.js";


export const signup = async (req, res) => {
  const connection = await pool.getConnection();

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