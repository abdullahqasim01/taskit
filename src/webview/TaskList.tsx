import React from 'react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface TaskListProps {
  tasks: Task[];
  onTaskToggle: (id: string) => void;
  onTaskDelete: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskToggle, onTaskDelete }) => {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks found. Add some tasks to get started!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
          <div className="task-content">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onTaskToggle(task.id)}
              className="task-checkbox"
            />
            <span className="task-text">{task.text}</span>
          </div>
          <button
            onClick={() => onTaskDelete(task.id)}
            className="delete-button"
            title="Delete task"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
