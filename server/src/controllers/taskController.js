import { db } from "../config/db.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createTask = asyncHandler(async(req, res) => {
    const { title, description, priority, due_date } = req.body;
    const userId = req.user.user_id;

    // if (!title) {
    //     return res.status(400).json({ message: "title is required "});
    // }

    await db.query(
        `insert into Tasks (user_id, title, description, priority, due_date)
        values (?,?,?,?,?)`,
        [userId, title, description, priority, due_date]
    );

    res.status(201).json({ message: "task created" });
});

export const getTasks = async(req, res) => {
    const userId = req.user.user_id;

    const{
        status, priority, sortBy="created_at",order="desc",page=1,limit=10
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
};

export const updateTask = async (req, res) => {
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
};

export const deleteTask = async(req, res) => {
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
};