const Task = require("../models/Task");

//create task
const validateMongoID = (id) => {
  // MongoDB IDs are 24 character hex strings
    return /^[0-9a-fA-F]{24}$/.test(id);
};

const createTask = async (req, res) => {
    try {
    const { title, duration } = req.body;
    
    // Validate title exists
    if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: "Title is required and must be a string" });
    }
    
    // Validate title format - only letters, numbers, spaces, basic punctuation
const titleRegex = /^[a-zA-Z0-9\s\-.,!?'"()&]+$/;
if (!titleRegex.test(title.trim())) {
    return res.status(400).json({ 
        error: "Title can only contain letters, numbers, spaces, and basic punctuation" 
    });
}
    if (
        duration < 0 || duration > 1440 || duration === null || typeof duration !== "number" || duration === undefined
    ) {
        return res.status(400).json({
        error: "Duration must be a number between 1 and 1440 minutes",
        });
    }
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);
    console.log(req.body);
    const task = await Task.create({
        title,
        duration,
        expiresAt,
    });

    res.status(201).json(task);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
};

const updateTask = async (req, res) => {
    try {
    const id = req.params.id;

    if (!validateMongoID(id)) {
        return res.status(400).json({
        error: "Invalid task ID format",
        });
    }

    const allowedUpdate = ["completed", "duration", "title"];

    const updates = {};
    for (let field of allowedUpdate) {
        if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
        }
    }

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({
        error: `only these fields can be updated ${allowedUpdate.join(", ")}`,
        });
    }

    // Validate title format - only letters, numbers, spaces, basic punctuation
const titleRegex = /^[a-zA-Z0-9\s\-.,!?'"()&]+$/;
if (updates.title !== undefined && !titleRegex.test(updates.title.trim())) {
    return res.status(400).json({ 
        error: "Title can only contain letters, numbers, spaces, and basic punctuation" 
    });
}

    if (updates.duration !== undefined) {
        if (typeof updates.duration !== 'number' || updates.duration < 1 || updates.duration > 1440) {
            return res.status(400).json({ error: 'Duration must be a number between 1 and 1440 minutes' });
        }
        // Recompute expiresAt when duration is updated
        updates.expiresAt = new Date(Date.now() + updates.duration * 60 * 1000);
    }

    if (updates.completed !== undefined) {
        if (typeof updates.completed !== 'boolean') {
            return res.status(400).json({ error: 'Completed must be true or false' });
        }
    }

    const taskResult = await Task.findByIdAndUpdate(id, updates, {
        returnDocument: 'after',
        runValidators: true,
    });

    if (!taskResult) {
        return res.status(404).json({ error: "Task not Found" });
    }

    res.json(taskResult);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
};

const getTasks = async (req, res) => {
    try {
    const tasks = await Task.find();
    res.json(tasks);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
};

const getTask = async (req, res) => {
    try {
    const id = req.params.id;
    const task = await Task.findById(id);

    if (!task) {
        return res.status(404).json({ error: "Task not Found" });
    }

    res.json(task);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
};

const deleteTasks = async (req, res) => {
    try {
    const deleteAll = await Task.deleteMany();
    res.json(deleteAll);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
    const id = req.params.id;

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
        return res.status(404).json({ error: "Task not Found" });
    }

    res.json({ message: "Task deleted successfully", deletedTask });
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
};

const deleteExpiredTasks = async () => {
    try {
    const now = new Date();

    const expiredTasks = await Task.find({
        completed: false,
        expiresAt: { $lt: now },
    });
if (expiredTasks.length > 0) {
    console.log(`${expiredTasks.length} expired tasks found and scheduled for deletion`);
    
    // Delete EACH task with its OWN 50-second timer
    expiredTasks.forEach(async (task) => {
    try {
        // Mark when deletion is scheduled (so frontend knows)
        const now = new Date();
        await Task.findByIdAndUpdate(task._id, {
            deleteScheduledAt: now,
        });
        console.log(`Scheduled deletion for ${task.title} at ${now}`);

        // Now wait 50 seconds and delete
        setTimeout(async () => {
            try {
                const deleted = await Task.findByIdAndDelete(task._id);
                if (deleted) {
                    console.log(`✓ Deleted: ${task.title}`);
                }
            } catch (error) {
                console.error(`Error deleting ${task._id}:`, error);
            }
        }, 50000);
    } catch (error) {
        console.error(`Error scheduling deletion for ${task._id}:`, error);
    }
});
}
    /*
        for (let task of expiredTasks) {
            console.log(`Task failed: ${task.title}`);
            await Task.findByIdAndDelete(task._id); 
        }*/

    return expiredTasks;
    } catch (error) {
    console.error("Error in deleteExpiredTasks:", error);
    return [];
    }
};

const checkExpiredTask = async (req, res) => {
    try {
    const expiredTasks = await deleteExpiredTasks();

    res.json({
        message: `${expiredTasks.length} expired tasks deleted`,
        deletedTasks: expiredTasks,
    });
    } catch (error) {
    res.status(400).json({ error: error.message });
    }
};

module.exports = {
  createTask,
  updateTask,
  getTasks,
  getTask,
  deleteTask,
  deleteTasks,
  checkExpiredTask,
  deleteExpiredTasks,
};
