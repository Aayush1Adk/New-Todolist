import { useEffect, useState } from 'react'
import { updateTask, deleteTask } from '../services/api'

function TaskItem({ task, onTaskUpdated, onTaskDeleted }) {
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [duration, setDuration] = useState(task.duration)
  const [error, setError] = useState(null)
  const [, setNow] = useState(Date.now())

  useEffect(() => {
    setTitle(task.title)
    setDuration(task.duration)
  }, [task.title, task.duration])

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

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

  const getDeleteCountdown = () => {
    if (!task.expiresAt) return null

    const now = Date.now()
    const expiredAt = new Date(task.expiresAt).getTime()
    const secondsSinceExpired = Math.floor((now - expiredAt) / 1000)

    // Backend schedules deletion 50 seconds after expiration
    const secondsUntilDeletion = 50 - secondsSinceExpired
    if (secondsUntilDeletion <= 0) return 'Deleting now...'

    return `${secondsUntilDeletion}s left before deletion`
  }

  const isExpired = task.expiresAt ? new Date(task.expiresAt) < new Date() : false
  const secondsSinceExpired = task.expiresAt ? Math.floor((Date.now() - new Date(task.expiresAt).getTime()) / 1000) : null
  const secondsUntilDeletion = secondsSinceExpired !== null ? 50 - secondsSinceExpired : null
  const isScheduledForDeletion = isExpired && secondsUntilDeletion > 0 && !task.completed

  const handleComplete = async () => {
    try {
      setLoading(true)
      setError(null)
      const updatedTask = await updateTask(task._id, {
        completed: !task.completed,
      })
      onTaskUpdated(updatedTask)
    } catch (apiError) {
      console.error('Failed to update task:', apiError)
      setError(apiError.message || 'Failed to update task')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()

    if (!title.trim()) {
  setError('Please enter a task title')
  return
}

// Add this NEW validation for format
const titleRegex = /^[a-zA-Z0-9\s\-.,!?'"()&]+$/;
if (!titleRegex.test(title.trim())) {
  setError('Title can only contain letters, numbers, spaces, and basic punctuation')
  return
}

    const parsedDuration = Number(duration)
    if (!Number.isFinite(parsedDuration) || parsedDuration < 1 || parsedDuration > 1440) {
      setError('Duration must be a number between 1 and 1440 minutes')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const updatedTask = await updateTask(task._id, {
        title: title.trim(),
        duration: parsedDuration,
      })
      onTaskUpdated(updatedTask)
      setIsEditing(false)
    } catch (apiError) {
      console.error('Failed to save task:', apiError)
      setError(apiError.message || 'Failed to update task')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setTitle(task.title)
    setDuration(task.duration)
    setError(null)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        setLoading(true)
        setError(null)
        await deleteTask(task._id)
        onTaskDeleted(task._id)
      } catch (apiError) {
        console.error('Failed to delete task:', apiError)
        setError(apiError.message || 'Failed to delete task')
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
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label htmlFor={`title-${task._id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  id={`title-${task._id}`}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor={`duration-${task._id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  id={`duration-${task._id}`}
                  type="number"
                  min="1"
                  max="1440"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 font-medium">{error}</p>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-sm disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={loading}
                  className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <h3
                className={`text-lg font-semibold ${
                  task.completed
                    ? 'text-gray-400 line-through'
                    : isExpired
                    ? 'text-red-700'
                    : 'text-gray-900'
                }`}
              >
                {task.title}
              </h3>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
                <span className={isExpired ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                  Duration: {task.duration} mins
                </span>
                <span className={isExpired ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                  Timer: {getTimeRemaining()}
                </span>
                {task.completed && (
                  <span className="text-green-600 font-semibold">Completed</span>
                )}
              </div>

              {isExpired && !task.completed && (
  <div className="mt-2 space-y-1 p-3 bg-red-100 border border-red-300 rounded-lg">
    <p className="text-red-700 font-bold">⚠️ This task has expired</p>
    {isScheduledForDeletion ? (
      <>
        <p className="text-red-700 font-semibold">
          ⏰ Deletion in: {getDeleteCountdown()}
        </p>
        <p className="text-sm text-red-600">✅ Can edit title/duration</p>
        <p className="text-sm text-red-600">❌ Cannot mark done (locked)</p>
      </>
    ) : (
      <p className="text-amber-700">Waiting for deletion schedule...</p>
    )}
  </div>
)}

              {error && (
                <p className="text-sm text-red-600 font-medium mt-3">{error}</p>
              )}
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setError(null)
              setIsEditing((currentValue) => !currentValue)
            }}
            disabled={loading}
            className="px-3 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 font-semibold text-sm transition disabled:opacity-50"
            title="Edit task"
          >
            {isEditing ? 'Close' : 'Edit'}
          </button>

          <button
  onClick={handleComplete}
  disabled={loading || (isScheduledForDeletion && !task.completed)}
  className={`px-3 py-1 rounded-lg font-semibold text-sm transition ${
    task.completed
      ? 'bg-gray-300 text-gray-700 hover:bg-gray-400'
      : 'bg-green-500 text-white hover:bg-green-600'
  } disabled:opacity-50 disabled:cursor-not-allowed`}
  title={
    isScheduledForDeletion && !task.completed
      ? 'Cannot mark as done while countdown is active'
      : task.completed
      ? 'Mark as incomplete'
      : 'Mark as complete'
  }
>
  {task.completed ? 'Undo' : 'Done'}
</button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold text-sm transition disabled:opacity-50"
            title="Delete task"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskItem
