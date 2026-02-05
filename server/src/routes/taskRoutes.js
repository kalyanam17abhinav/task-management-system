import { validateCreateTask } from "../middleware/validateTask.js";
import express from "express";
import {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
} from "../controllers/taskController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.post("/", validateCreateTask, createTask);
router.get("/", getTasks);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;