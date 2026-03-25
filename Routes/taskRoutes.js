    const express = require('express');

const router = express.Router();

const { createTask, updateTask, getTasks, getTask, deleteTask, deleteTasks, checkExpiredTask } = require('../controllers/taskController');

router.post('/', createTask);
router.get('/', getTasks);
router.get('/:id', getTask);
router.patch('/:id', updateTask);
router.delete('/expires', checkExpiredTask);
router.delete('/', deleteTasks);
router.delete('/:id', deleteTask);

module.exports = router;