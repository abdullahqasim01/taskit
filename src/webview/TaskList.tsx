import React, { useState, memo } from "react";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  status?: "todo" | "doing" | "done";
}

interface TaskListProps {
  tasks: Task[];
  onTaskToggle: (id: string) => void;
  onTaskDelete: (id: string) => void;
  onTaskEdit: (id: string, newText: string) => void;
  onTaskAdd: (text: string) => void;
  onStatusChange?: (id: string, status: "todo" | "doing" | "done") => void;
}

const TaskList: React.FC<TaskListProps> = memo(
  ({
    tasks,
    onTaskToggle,
    onTaskDelete,
    onTaskEdit,
    onTaskAdd,
    onStatusChange,
  }) => {
    const [editingTask, setEditingTask] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const [addText, setAddText] = useState("")

    const handleEditStart = (task: Task) => {
      if (!onTaskEdit) return;
      setEditingTask(task.id);
      setEditText(task.text);
    };

    const handleEditSave = () => {
      if (editingTask && onTaskEdit) {
        onTaskEdit(editingTask, editText);
        setEditingTask(null);
        setEditText("");
      }
    };

    const handleEditCancel = () => {
      setEditingTask(null);
      setEditText("");
    };

    const handleAddtask = () => {
      if (editText === undefined) return;
      onTaskAdd(addText);
      setAddText("")
    }

    const handleAddCancel = () => {
      setAddText("")
    }

    const handleInputBlur = () => {
      // Auto-save when input loses focus
      handleEditSave();
    };

    const getTaskStatus = (task: Task): "todo" | "doing" | "done" => {
      if (task.status) return task.status;
      return task.completed ? "done" : "todo";
    };

    const getStatusDisplay = (status: "todo" | "doing" | "done") => {
      switch (status) {
        case "todo":
          return { symbol: "[ ]", text: "To Do" };
        case "doing":
          return { symbol: "[*]", text: "Doing" };
        case "done":
          return { symbol: "[x]", text: "Done" };
      }
    };

    const handleStatusChange = (
      taskId: string,
      newStatus: "todo" | "doing" | "done"
    ) => {
      if (onStatusChange) {
        onStatusChange(taskId, newStatus);
      } else {
        // Fallback to toggle if no specific status change handler
        onTaskToggle(taskId);
      }
    };

    return (
      <div className={`task-list-container `}>
        <div className="table-container">
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <input
                  type="text"
                  value={addText}
                  onChange={(e) => setAddText(e.target.value)}
                  className="edit-task-input-inline"
                  autoFocus
                  onBlur={handleInputBlur}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddtask();
                    if (e.key === "Escape") handleAddCancel();
                  }}
                />
              </tr>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr
                    key={task.id}
                    className={task.completed ? "completed" : ""}
                  >
                    <td className="task-cell">
                      {editingTask === task.id ? (
                        <div className="edit-task-form-inline">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="edit-task-input-inline"
                            autoFocus
                            onBlur={handleInputBlur}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleEditSave();
                              if (e.key === "Escape") handleEditCancel();
                            }}
                          />
                        </div>
                      ) : (
                        <span
                          className={`task-text ${
                            task.completed ? "completed" : ""
                          }`}
                          onClick={() => handleEditStart(task)}
                          title={"Click to edit"}
                        >
                          {task.text}
                        </span>
                      )}
                    </td>{" "}
                    <td className="status-cell">
                      <div className="status-dropdown">
                        <select
                          value={getTaskStatus(task)}
                          onChange={(e) =>
                            handleStatusChange(
                              task.id,
                              e.target.value as "todo" | "doing" | "done"
                            )
                          }
                          className="status-select"
                        >
                          <option value="todo">To Do</option>
                          <option value="doing">Doing</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          onClick={() => onTaskDelete(task.id)}
                          className="delete-btn"
                          title="Delete task"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="empty-row">
                    No tasks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

export default TaskList;
