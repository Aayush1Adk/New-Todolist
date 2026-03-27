import { useState } from 'react'
import { createTask } from '../services/api'

function TaskForm({ onTaskAdded }) {
  // Form state
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState(60) // Default 60 minutes
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault() // Prevent page reload
    
    // Validation
    if (!title.trim()) {
      setError('Please enter a task title')
      return
    }

    if (duration < 1 || duration > 1440) {
      setError('Duration must be between 1 and 1440 minutes')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Call API to create task
      const newTask = await createTask(title, parseInt(duration))

      // Pass new task back to parent (App.jsx)
      onTaskAdded(newTask)

      // Clear form
      setTitle('')
      setDuration(60)
    } catch (err) {
      setError(err.message || 'Failed to create task')
      console.error('Create task error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Task</h2>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Task Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your task (e.g., Write report)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        {/* Duration Input */}
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
            Duration (in minutes)
          </label>
          <div className="flex items-center space-x-2">
            <input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
              max="1440"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={loading}
            />
            <span className="text-gray-500">
              {duration <= 60 ? `${duration} min` : `${(duration / 60).toFixed(1)} hours`}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Min: 1 min | Max: 1440 min (24 hours)</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition font-semibold"
        >
          {loading ? 'Creating...' : '➕ Add Task'}
        </button>
      </div>
    </form>
  )
}

export default TaskForm
