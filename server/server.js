import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (req,res) => {
  res.send("hello world");
})

async function testConnection() {
  try {
    const { db } = await import("./src/config/db.js");
    const connection = await db.getConnection();
    connection.release();
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

app.listen(PORT, async () => {
  await testConnection();
  const authRoutes = await import("./src/routes/authRoutes.js");
  const taskRoutes = await import("./src/routes/taskRoutes.js");
  const { errorHandler } = await import("./src/middleware/errorHandler.js");
  app.use("/auth", authRoutes.default);
  app.use("/tasks", taskRoutes.default);
  app.use(errorHandler);
  console.log("server running on:", PORT);
});
