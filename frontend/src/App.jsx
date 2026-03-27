import { useState, useEffect } from 'react'
import { getTasks, deleteAllTasks } from './services/api'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'

function App() {
  // State Variables
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Function to fetch all tasks from API
  const fetchTasks = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTasks()
      setTasks(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch tasks when component mounts (first load)
  useEffect(() => {
    fetchTasks()
  }, [])

  // Refresh only when the next task reaches an important timer point
  useEffect(() => {
    if (tasks.length === 0) {
      return undefined
    }

    const now = Date.now()
    let nextRefreshAt = null

    tasks.forEach((task) => {
      if (task.completed) {
        return
      }

      // Check deletion scheduled time
      if (task.deleteScheduledAt) {
        const deleteTime = new Date(task.deleteScheduledAt).getTime() + 50000 + 1000
        if (deleteTime > now && (!nextRefreshAt || deleteTime < nextRefreshAt)) {
          nextRefreshAt = deleteTime
        }
        return
      }

      // Check expiration time
      if (task.expiresAt) {
        const expireTime = new Date(task.expiresAt).getTime() + 1500
        if (expireTime > now && (!nextRefreshAt || expireTime < nextRefreshAt)) {
          nextRefreshAt = expireTime
        }

        // Also check if already expired - schedule refresh 50s after expiration
        const expiredAt = new Date(task.expiresAt).getTime()
        if (expiredAt < now) {
          const deleteTime = expiredAt + 50000 + 1000
          if (deleteTime > now && (!nextRefreshAt || deleteTime < nextRefreshAt)) {
            nextRefreshAt = deleteTime
          }
        }
      }
    })

    if (!nextRefreshAt) {
      return undefined
    }

    const timeout = setTimeout(() => {
      console.log('Smart refresh triggered')
      fetchTasks()
    }, Math.max(nextRefreshAt - now, 0))

    return () => clearTimeout(timeout)
  }, [tasks])

  // Handle adding new task (called from TaskForm)
  const handleTaskAdded = (newTask) => {
    // Add the new task to the list instantly
    setTasks((currentTasks) => [newTask, ...currentTasks])
  }

  // Handle task updates (called from TaskItem)
  const handleTaskUpdated = (updatedTask) => {
    setTasks((currentTasks) => currentTasks.map(task => 
      task._id === updatedTask._id ? updatedTask : task
    ))
  }

  // Handle task deletion (called from TaskItem)
  const handleTaskDeleted = (taskId) => {
    setTasks((currentTasks) => currentTasks.filter(task => task._id !== taskId))
  }

  // Handle delete all tasks
  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete ALL tasks?')) {
      try {
        setLoading(true)
        await deleteAllTasks()
        setTasks([])
        setError(null)
      } catch (err) {
        setError(err.message || 'Failed to delete all tasks')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📋 Todo App</h1>
          <p className="text-gray-600">Stay organized and productive</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-semibold">⚠️ Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Task Form */}
        <TaskForm onTaskAdded={handleTaskAdded} />

        {/* Loading State */}
        {loading && (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-700">Loading tasks...</span>
            </div>
        )}

        {/* Task List */}
        {!loading && (
            <>
                <TaskList 
                tasks={tasks} 
                onTaskUpdated={handleTaskUpdated}
                onTaskDeleted={handleTaskDeleted}
            />

            {/* Delete All Button */}
            {tasks.length > 0 && (
                <button
                    onClick={handleDeleteAll}
                    className="w-full mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                >
                🗑️ Delete All Tasks
              </button>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && tasks.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No tasks yet. Create one to get started! ✨</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
