import TaskText from "./TaskText";
import TaskTable from "./TaskTable";
import { useTasks } from "../contexts/TasksContext";

const TaskCombined = () => {
  // Access context to ensure provider is present (even if not used directly here)
  useTasks();
  return (
    <div className="w-full h-full flex flex-row">
      <div className="w-1/2 h-full border-[var(--vscode-editorIndentGuide-background)] border-r-1">
        <TaskTable />
      </div>

      <div className="w-1/2 h-full">
        <TaskText />
      </div>
    </div>
  );
};

export default TaskCombined;
