export const validateCreateTask = (req, res, next) => {
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
}