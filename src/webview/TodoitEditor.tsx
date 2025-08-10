import React, { useState } from "react";
import TaskTable from "./components/TaskTable";
import "./TodoitEditor.css";
import Header from "./components/Header";
import TaskText from "./components/TaskText";
import TaskCombined from "./components/TaskCombined";
import { TasksProvider } from "./contexts/TasksContext";
import { TextProvider, useText } from "./contexts/TextContext";

declare global {
  interface Window {
    initialData?: { text: string };
  }
}

const TodoitEditorInner: React.FC = () => {
  const [view, setView] = useState<"combined" | "table" | "text">("table");

  return (
    <div className="w-full h-screen p-2">
      <div className="flex flex-col gap-4 h-full">
  <TasksProvider>
          <Header view={view} setView={setView} />

          <div className="w-full flex-1 border-[var(--vscode-editorIndentGuide-background)] border-1 rounded-lg overflow-hidden">
            {view === "combined" && (
              <TaskCombined />
            )}

            {view === "table" && <TaskTable />}

            {view === "text" && (
              <TaskText />
            )}
          </div>
        </TasksProvider>
      </div>
    </div>
  );
};

const TodoitEditor: React.FC = () => (
  <TextProvider>
    <TodoitEditorInner />
  </TextProvider>
);

export default TodoitEditor;
