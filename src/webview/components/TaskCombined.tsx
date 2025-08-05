import { TaskType } from "../types";
import TaskText from "./TaskText";
import TaskTable from "./TaskTable";

interface TaskCombinedProps {
  tasks: TaskType[];
  onTaskDelete: (id: string) => void;
  onTaskEdit: (id: string, newText: string) => void;
  onTaskAdd: (text: string) => void;
  onStatusChange: (id: string, status: "todo" | "doing" | "done") => void;
  text: string;
  onChange: any;
  ref: any;
}

const TaskCombined = ({
  tasks,
  onTaskDelete,
  onTaskEdit,
  onTaskAdd,
  onStatusChange,
  text,
  onChange,
  ref,
}: TaskCombinedProps) => {
  return (
    <div className="w-full h-full flex flex-row">
      <div className="w-1/2 h-full border-[var(--vscode-editorIndentGuide-background)] border-r-1">
        <TaskTable
          tasks={tasks}
          onTaskDelete={onTaskDelete}
          onTaskEdit={onTaskEdit}
          onTaskAdd={onTaskAdd}
          onStatusChange={onStatusChange}
        />
      </div>

      <div className="w-1/2 h-full">
        <TaskText ref={ref} text={text} onChange={onChange} />
      </div>
    </div>
  );
};

export default TaskCombined;
