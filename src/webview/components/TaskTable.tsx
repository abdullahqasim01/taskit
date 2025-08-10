import React, { useState, memo } from "react";
import { TaskType } from "../types";
import { useTasks } from "../contexts/TasksContext";

const TaskTable: React.FC = memo(
  () => {
    const { tasks, deleteTask, editTask, addTask, changeStatus } = useTasks();
    const [editingTask, setEditingTask] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const [addText, setAddText] = useState("")

    const handleEditStart = (task: TaskType) => {
      setEditingTask(task.id);
      setEditText(task.text);
    };

    const handleEditSave = () => {
      if (editingTask) {
        editTask(editingTask, editText);
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
  addTask(addText);
      setAddText("")
    }

    const handleAddCancel = () => {
      setAddText("")
    }

    const handleInputBlur = () => {
      handleEditSave();
    };

    const getTaskStatus = (task: TaskType): "todo" | "doing" | "done" => {
      if (task.status) return task.status;
      return task.completed ? "done" : "todo";
    };

    const handleStatusChange = (
      taskId: string,
      newStatus: "todo" | "doing" | "done"
    ) => {
  changeStatus(taskId, newStatus);
    };

    return (
          <div className="w-full h-full overflow-y-auto">
            <table className="w-full">
              <thead className="leading-[50px] bg-[var(--vscode-input-background)] sticky top-0">
                <tr className="">
                  <th className="max-w-[50px] p-1"></th>
                  <th className="text-left">Task</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="leading-[50px]">
                  <td className="max-w-[50px] p-1 text-center">+</td>
                  <td className="leading-normal px-1">
                    <input
                      type="text"
                      value={addText}
                      onChange={(e) => setAddText(e.target.value)}
                      className="w-full border-[var(--vscode-editorIndentGuide-background)] border-b-1 border-dashed focus:border-[var(--vscode-statusBar-foreground)]"
                      placeholder="Add Task"
                      onBlur={handleInputBlur}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddtask();
                        if (e.key === "Escape") handleAddCancel();
                      }}
                    />
                  </td>
                </tr>
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <tr
                      key={task.id}
                      className="leading-[50px] border-y-1 border-[var(--vscode-editorIndentGuide-background)]"
                    >
                      <td className="max-w-[50px] p-1"></td>
                      <td className="leading-normal">
                        {editingTask === task.id ? (
                          <div className="">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full border-[var(--vscode-editorIndentGuide-background)] border-b-1 border-dashed focus:border-[var(--vscode-statusBar-foreground)]"
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
                            className=""
                            onClick={() => handleEditStart(task)}
                          >
                            {task.text}
                          </span>
                        )}
                      </td>{" "}
                      <td className="">
                        <div className="">
                          <select
                            value={getTaskStatus(task)}
                            onChange={(e) =>
                              handleStatusChange(
                                task.id,
                                e.target.value as "todo" | "doing" | "done"
                              )
                            }
                            className="border-[var(--vscode-editorIndentGuide-background)] border-1 p-1 rounded-lg focus:border-[var(--vscode-statusBar-foreground)]"
                          >
                            <option className="p-2 bg-[var(--vscode-input-background)]" value="todo">To Do</option>
                            <option className="p-2 bg-[var(--vscode-input-background)]" value="doing">Doing</option>
                            <option className="p-2 bg-[var(--vscode-input-background)]" value="done">Done</option>
                          </select>
                        </div>
                      </td>
                      <td className="">
                        <div className="">
                          <button
                            onClick={() => deleteTask(task.id)}
                            className=""
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
                    <td colSpan={3} className="">
                      No tasks found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
    );
  }
);

export default TaskTable;
