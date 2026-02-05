// ===== TASK MANAGEMENT SYSTEM BACKEND - COMPLETE FLOW =====
// This file shows the complete backend architecture and flow

import dotenv from "dotenv";
import express from "express";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ===== 1. ENVIRONMENT SETUP =====
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// ===== 2. DATABASE CONNECTION =====
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// ===== 3. EXPRESS APP SETUP =====
const app = express();
app.use(express.json());

// CORS middleware for frontend communication
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

const PORT = process.env.PORT || 5000;

// ===== 4. UTILITY FUNCTIONS =====
// Async handler wrapper for error handling
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// ===== 5. AUTHENTICATION MIDDLEWARE =====
const authenticate = (req, res, next) => {
    const header = req.headers.authorization;
    if(!header || !header.startsWith("Bearer "))
        return res.status(401).json({message: "No token"});

    const token = header.split(" ")[1];
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ message: "invalid or expired token "});
    }
};

// ===== 6. VALIDATION MIDDLEWARE =====
const validateCreateTask = (req, res, next) => {
    const { title, priority, status } = req.body;

    if(!title || title.trim() === ""){
        return res.status(400).json({ message: "title is required "});
    }

    if(priority && !["low", "medium", "high"].includes(priority)){
        return res.status(400).json({ message: "invalid priority "});
    }

    if(status && !["pending", "in_progress", "completed"].includes(status)){
        return res.status(400).json({ message: "invalid status "});
    }

    next();
};

// ===== 7. AUTH CONTROLLERS =====
const register = asyncHandler(async (req, res) => {
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
});

const login = asyncHandler(async (req, res) => {
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
});

// ===== 8. TASK CONTROLLERS =====
const createTask = asyncHandler(async(req, res) => {
    const { title, description, priority, due_date } = req.body;
    const userId = req.user.user_id;

    await db.query(
        `insert into Tasks (user_id, title, description, priority, due_date)
        values (?,?,?,?,?)`,
        [userId, title, description, priority, due_date]
    );

    res.status(201).json({ message: "task created" });
});

const getTasks = asyncHandler(async(req, res) => {
    const userId = req.user.user_id;

    const{
        status, priority, search, sortBy="created_at",order="desc",page=1,limit=10
    } = req.query;

    const conditions = []
    const values = [];
    
    conditions.push("user_id = ?");
    values.push(userId);
    
    if(status){
        conditions.push("status = ?");
        values.push(status);
    }

    if(priority){
        conditions.push("priority = ?");
        values.push(priority);
    }

    if(search){
        conditions.push("lower(title) like lower(?)");
        values.push(`%${search}%`);
    }

    const allowedSort = ["created_at", "due_date"];
    const allowedOrder = ["asc", "desc"];
    
    const sortColumn = allowedSort.includes(sortBy) ? sortBy : "created_at";
    const sortOrder = allowedOrder.includes(order.toLowerCase())
    ? order.toUpperCase() : "DESC";

    const offset = (page - 1) * limit;
    const query = `select * from Tasks where ${conditions.join(" and ")} order by ${sortColumn} ${sortOrder} limit ? offset ?`;

    values.push(Number(limit), Number(offset));

    const [tasks] = await db.query(query, values);
    res.json({
        page: Number(page),
        limit: Number(limit),
        count: tasks.length,
        tasks
    });
});

const updateTask = asyncHandler(async (req, res) => {
    const {id} = req.params;
    const {title, description, status, priority, due_date} = req.body;
    const userId = req.user.user_id;

    const [result] = await db.query(
        'update Tasks set title = ?, description = ?, status = ?, priority = ?, due_date = ? where task_id = ? and user_id = ?',
        [title, description, status, priority, due_date, id, userId]
    );

    if(result.affectedRows === 0){
        return res.status(404).json({ message: "task not found or unauthorized "});
    }
    res.json({message: "task updated"});
});

const deleteTask = asyncHandler(async(req, res) => {
    const { id } = req.params;
    const userId = req.user.user_id;

    const [result] = await db.query(
        `delete from Tasks where task_id = ? and user_id = ?`,
        [id, userId]
    );

    if(result.affectedRows === 0){
        return res.status(404).json({ message: "task not found or unauthorized" });
    }
    res.json({ message: "task deleted" });
});

const getTaskStats = asyncHandler(async (req, res) => {
    const userId = req.user.user_id;
    const [rows] = await db.query(
        `select count(*) as total, sum(status='pending') as pending, sum(status='in_progress') as in_progress, sum(status='completed') as completed, sum(priority='high') as high_priority
        from Tasks where user_id = ?`,
        [userId]
    );
    res.json(rows[0]);
});

// ===== 9. ERROR HANDLER MIDDLEWARE =====
const errorHandler = (err, req, res, next) => {
    console.error(err);
    const statusCode = err.statusCode || 500;
    const message = err.message || "internal server error";

    res.status(statusCode).json({
        success: false,
        message
    });
};

// ===== 10. ROUTES SETUP =====
// Basic route
app.get("/", (req,res) => {
  res.send("Task Management System API");
});

// Auth routes
app.post("/auth/register", register);
app.post("/auth/login", login);
app.get("/auth/me", authenticate, (req, res) => {
    res.json({ user: req.user });
});

// Task routes (all require authentication)
app.get("/tasks/stats", authenticate, getTaskStats);
app.post("/tasks", authenticate, validateCreateTask, createTask);
app.get("/tasks", authenticate, getTasks);
app.put("/tasks/:id", authenticate, updateTask);
app.delete("/tasks/:id", authenticate, deleteTask);

// Error handler (must be last)
app.use(errorHandler);

// ===== 11. DATABASE CONNECTION TEST =====
async function testConnection() {
  try {
    const connection = await db.getConnection();
    console.log("✅ Database connected successfully");
    connection.release();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
}

// ===== 12. SERVER STARTUP =====
app.listen(PORT, async () => {
  console.log("Server running on:", PORT);
  await testConnection();
  console.log("🚀 Task Management System Backend Ready!");
});

// ===== BACKEND FLOW EXPLANATION =====
/*
1. ENVIRONMENT SETUP: Load and validate environment variables
2. DATABASE CONNECTION: Create MySQL connection pool
3. EXPRESS SETUP: Initialize Express app with middleware
4. UTILITY FUNCTIONS: Helper functions for error handling
5. AUTHENTICATION MIDDLEWARE: JWT token verification
6. VALIDATION MIDDLEWARE: Input validation for requests
7. AUTH CONTROLLERS: User registration and login logic
8. TASK CONTROLLERS: CRUD operations for tasks
9. ERROR HANDLER: Global error handling middleware
10. ROUTES SETUP: Define API endpoints
11. DATABASE TEST: Verify database connectivity
12. SERVER STARTUP: Start the server and confirm readiness

REQUEST FLOW:
Frontend → CORS → Route → Authentication → Validation → Controller → Database → Response

AUTHENTICATION FLOW:
1. User registers/logs in
2. Server validates credentials
3. JWT token generated and sent to client
4. Client stores token and sends with each request
5. Server verifies token on protected routes

TASK OPERATIONS FLOW:
1. Client sends authenticated request
2. Server verifies JWT token
3. Validates request data
4. Performs database operation
5. Returns response to client
*/