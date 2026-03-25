const express = require('express');
const app = express();

require('dotenv').config();
const connectDB = require('./config/db');

const { deleteExpiredTasks } = require('./controllers/taskController');

setInterval(async () => {
    try {
        await deleteExpiredTasks();
    } catch (error) {
        console.error('Error deleting expired tasks:', error);
    }
}, 60000);

//middleware
app.use(express.json());

const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
    res.send("API is working");
});

//database connection
connectDB();



const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}`);
});
