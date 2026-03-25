const Task = require("../models/Task");

//create task

const createTask = async(req, res) => {
    try{
        const{title, duration} = req.body;

        const expiresAt =new Date(Date.now() + duration * 60 * 1000);
        console.log(req.body);
        const task = await Task.create({
            title, 
            expiresAt
        });

        res.status(201).json(task);
    }
    catch(error){
        res.status(400).json({error: error.message});
        }
    };

const updateTask = async(req, res) => {
    try{

        const id = req.params.id;

        const updateTask = await Task.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        if(!updateTask){
            return res.status(404).json({error:"Task not Found"});
        }

        res.json(updateTask);
    }

    catch (error){
        res.status(400).json({error:error.message});
    }

};

const getTasks = async(req, res) => {
    try{
        const tasks = await Task.find();
        res.json(tasks);
    }
    catch(error){
        res.status(400).json({error: error.message});
    }
};

const getTask = async(req, res) => {
    try{
        const id = req.params.id;
        const task = await Task.findById(id);
        
        if(!task){
            return res.status(404).json({error: "Task not Found"});
        }
        
        res.json(task);
    }
    catch(error){
        res.status(400).json({error: error.message});
    }
};

const deleteTasks = async(req, res) => {
    try{
        const deleteAll = await Task.deleteMany();
        res.json(deleteAll); 
    }
    catch(error){
        res.status(400).json({error:error.message});
    }
};

const deleteTask = async(req, res) => {
    try{
        const id = req.params.id;
        
        const deletedTask = await Task.findByIdAndDelete(id);
        
        if(!deletedTask){
            return res.status(404).json({error: "Task not Found"});
        }
        
        res.json({message: "Task deleted successfully", deletedTask});
    }
    catch(error){
        res.status(400).json({error: error.message});
    }
};

const deleteExpiredTasks = async () => {
    try {
        const now = new Date();

        const expiredTasks = await Task.find({
            completed: false,
            expiresAt: { $lt: now }
        });

        for (let task of expiredTasks) {
            console.log(`Task failed: ${task.title}`);
            await Task.findByIdAndDelete(task._id);
        }

        return expiredTasks;
    } catch (error) {
        console.error('Error in deleteExpiredTasks:', error);
        return [];
    }
};

const checkExpiredTask = async (req, res) => {
    try {
        const expiredTasks = await deleteExpiredTasks();

        res.json({
            message: `${expiredTasks.length} expired tasks deleted`,
            deletedTasks: expiredTasks
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
    deleteExpiredTasks
};