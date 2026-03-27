const Task = require("../models/Task");

//create task
const validateMongoID = (id) => {
  // MongoDB IDs are 24 character hex strings
    return /^[0-9a-fA-F]{24}$/.test(id);
};

const createTask = async (req, res) => {
    try {
    const { title, duration } = req.body;
    if (!title || typeof title !== "string" || title.trim() === "") {
        return res
        .status(400)
        .json({ error: "Title is required and must be a non-empty string" });
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

    if (
        updates.title === undefined && typeof updates.duration !== "string" && updates.title.trim() === '') 
        {
        return res.status(400).json({ error: "Title need to be non empty and string only" });
    }

    if (
        updates.duration === undefined && typeof updates.duration !== "number") 
        {
        return res.status(400).json({ error: "duration need to be non empty number only" });
    }

    if (
        updates.completed === undefined && typeof updates.completed !== "boolean") 
        {
        return res.status(400).json({ error: "Completed must be true or false" });
    }

    const updateTask = await Task.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
    });

    if (!updateTask) {
        return res.status(404).json({ error: "Task not Found" });
    }

    res.json(updateTask);
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
      //shows which task are expired.

        expiredTasks.forEach((task) => {
        console.log(` - ${task.title} is expired at ${task.expiresAt} and will be deleted after 50 second`);
        });

      // if you want to delete expired tasks then
        await new Promise((resolve) => {
        setTimeout(async () => {
            try {
                await Task.deleteMany({
                    completed: false,
                    expiresAt: { $lt: now },
            });
            console.log(`Deleted ${expiredTasks.length} expired Tasks`);
            resolve();
            } catch (error) {
                console.error("Error deleting tasks:", error);
                resolve();
            }
        }, 50000);
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
