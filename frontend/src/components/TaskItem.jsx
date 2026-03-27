import { useState } from 'react'
import { updateTask, deleteTask } from '../services/api'

function TaskItem({ task, onTaskCompleted, onTaskDeleted }) {
  const [loading, setLoading] = useState(false)

  // Calculate time remaining
  const getTimeRemaining = () => {
    const now = new Date()
    const expiresAt = new Date(task.expiresAt)
    const diff = expiresAt - now

    if (diff <= 0) {
      return 'Expired'
    }

    const minutes = Math.floor(diff / 1000 / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d left`
    if (hours > 0) return `${hours}h left`
    return `${minutes}m left`
  }

  // Check if task is expired
  const isExpired = new Date(task.expiresAt) < new Date()

  // Handle mark complete
  const handleComplete = async () => {
    try {
      setLoading(true)
      const updatedTask = await updateTask(task._id, { 
        completed: !task.completed 
      })
      onTaskCompleted(updatedTask)
    } catch (error) {
      console.error('Failed to update task:', error)
      alert('Failed to update task')
    } finally {
      setLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        setLoading(true)
        await deleteTask(task._id)
        onTaskDeleted(task._id)
      } catch (error) {
        console.error('Failed to delete task:', error)
        alert('Failed to delete task')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-4 border-l-4 transition ${
        task.completed
          ? 'border-l-green-500 bg-green-50'
          : isExpired
          ? 'border-l-red-500 bg-red-50'
          : 'border-l-indigo-500'
      }`}
    >
      <div className="flex items-start justify-between">
        {/* Task Info */}
        <div className="flex-1">
          <h3
            className={`text-lg font-semibold ${
              task.completed
                ? 'text-gray-400 line-through'
                : isExpired
                ? 'text-red-700'
                : 'text-gray-900'
            }`}
          >
            {task.completed && '✅'} {task.title}
          </h3>

          <div className="flex items-center space-x-4 mt-2 text-sm">
            <span className={`flex items-center ${
              isExpired ? 'text-red-600 font-semibold' : 'text-gray-600'
            }`}>
              ⏱️ {task.duration} mins
            </span>

            <span className={`flex items-center ${
              isExpired ? 'text-red-600 font-semibold' : 'text-gray-600'
            }`}>
              ⏳ {getTimeRemaining()}
            </span>

            {task.completed && (
              <span className="text-green-600 font-semibold">✓ Completed</span>
            )}
          </div>

          {isExpired && !task.completed && (
            <p className="text-red-600 font-semibold mt-2">⚠️ This task has expired</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 ml-4">
          {/* Complete Button */}
          <button
            onClick={handleComplete}
            disabled={loading}
            className={`px-3 py-1 rounded-lg font-semibold text-sm transition ${
              task.completed
                ? 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                : 'bg-green-500 text-white hover:bg-green-600'
            } disabled:opacity-50`}
            title={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {task.completed ? '↩️' : '✓'}
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold text-sm transition disabled:opacity-50"
            title="Delete task"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskItem
