import TaskItem from './TaskItem'

function TaskList({ tasks, onTaskUpdated, onTaskDeleted }) {
  if (tasks.length === 0) {
    return null // Let App.jsx handle empty state
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        Your Tasks ({tasks.length})
      </h2>
      
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          onTaskUpdated={onTaskUpdated}
          onTaskDeleted={onTaskDeleted}
        />
      ))}
    </div>
  )
}

export default TaskList
