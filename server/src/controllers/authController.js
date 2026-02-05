import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [existing] = await db.query(
      "SELECT user_id FROM Users WHERE email = ?",
      [email]
    );
    if (existing.length) return res.status(409).json({ message: "Email exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO Users (email, password, role_id) VALUES (?, ?, ?)",
      [email, hashedPassword, 1]
    );

    res.status(201).json({ message: "User registered" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query(
      `SELECT u.user_id, u.password, r.role_type
       FROM Users u JOIN Roles r ON u.role_id = r.role_id
       WHERE email = ?`,
      [email]
    );

    if (!rows.length)
      return res.status(401).json({ message: "Invalid credentials" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role_type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
