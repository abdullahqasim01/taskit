import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import TaskList from "./TaskList";
import "./TaskitEditor.css";

interface VSCodeApi {
  postMessage(message: any): void;
  getState(): any;
  setState(state: any): void;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
  status?: 'todo' | 'doing' | 'done';
  line: number;
}

declare const acquireVsCodeApi: () => VSCodeApi;
declare global {
  interface Window {
    initialData?: {
      text: string;
    };
  }
}

const TaskitEditor: React.FC = () => {
  const [text, setText] = useState(window.initialData?.text || "");
  const [view, setView] = useState<"combined" | "table" | "text">("combined");
  const [vscodeApi] = useState(() => acquireVsCodeApi());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSentTextRef = useRef(window.initialData?.text || "");
  const isUserTypingRef = useRef(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Helper function to normalize line endings
  const normalizeText = useCallback((text: string) => {
    return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }, []);

  // Parse tasks from text
  const tasks = useMemo(() => {
    // Normalize line endings and split
    const normalizedText = normalizeText(text);
    const lines = normalizedText.split("\n");
    const parsedTasks: Task[] = [];

    lines.forEach((line, index) => {
      // Match patterns like [ ], [*], [x], [X] for tasks
      const taskMatch = line.match(/^(\s*)(- )?\[([ *xX])\]\s*(.+)$/);
      if (taskMatch) {
        const [, , , checkbox, taskText] = taskMatch;
        const checkboxLower = checkbox.toLowerCase();
        
        let status: 'todo' | 'doing' | 'done';
        let completed: boolean;
        
        if (checkboxLower === 'x') {
          status = 'done';
          completed = true;
        } else if (checkboxLower === '*') {
          status = 'doing';
          completed = false;
        } else {
          status = 'todo';
          completed = false;
        }
        
        // Create a more stable ID based on content hash and position
        const contentHash = taskText.trim().replace(/\s+/g, "-").toLowerCase();
        parsedTasks.push({
          id: `task-${index}-${contentHash.substring(0, 10)}`,
          text: taskText.trim(),
          completed,
          status,
          line: index,
        });
      }
    });

    return parsedTasks;
  }, [text, normalizeText]);

  useEffect(() => {
    // Listen for messages from the extension
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      switch (message.type) {
        case "update":
          // Only update if the text is different from what we last sent AND user is not actively typing
          if (
            message.text !== lastSentTextRef.current &&
            !isUserTypingRef.current
          ) {
            setText(message.text);
            lastSentTextRef.current = message.text;
          }
          break;
      }
    };

    window.addEventListener("message", handleMessage);

    // Cleanup function
    return () => {
      window.removeEventListener("message", handleMessage);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;

      // Mark that user is actively typing
      isUserTypingRef.current = true;

      // Store cursor position before updating text
      const cursorPosition = e.target.selectionStart;

      setText(newText);

      // Restore cursor position after state update
      requestAnimationFrame(() => {
        if (textAreaRef.current) {
          textAreaRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
      });

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Debounce the API call
      timeoutRef.current = setTimeout(() => {
        if (newText !== lastSentTextRef.current) {
          vscodeApi.postMessage({
            type: "update",
            text: newText,
          });
          lastSentTextRef.current = newText;
        }
        // Mark that user is no longer actively typing
        isUserTypingRef.current = false;
      }, 200); // Slightly longer timeout for better stability
    },
    [vscodeApi]
  );

  const handleTaskAdd = (taskText: string) => {
    // Temporarily disable typing detection during programmatic changes
    isUserTypingRef.current = false;

    const normalizedText = normalizeText(text);
    const lines = normalizedText.split("\n");
    const newTaskLine = `[ ] ${taskText}`;

    // Find the best place to insert the task (after existing tasks or at the end)
    let insertIndex = lines.length;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].match(/^\s*(- )?\[([ xX])\]/)) {
        insertIndex = i + 1;
        break;
      }
    }

    lines.splice(insertIndex, 0, newTaskLine);
    const newText = lines.join("\n");

    setText(newText);
    lastSentTextRef.current = newText;
    vscodeApi.postMessage({
      type: "update",
      text: newText,
    });
  };

  const handleTaskEdit = (taskId: string, newText: string) => {
    // Temporarily disable typing detection during programmatic changes
    isUserTypingRef.current = false;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const normalizedText = normalizeText(text);
    const lines = normalizedText.split("\n");
    const line = lines[task.line];
    const checkboxMatch = line.match(/^(\s*)(- )?\[([ xX])\]\s*/);

    if (checkboxMatch) {
      const [, indent, dash, checkbox] = checkboxMatch;
      const newLine = `${indent}${dash || ""}[${checkbox}] ${newText}`;
      lines[task.line] = newLine;
      const newTextContent = lines.join("\n");

      setText(newTextContent);
      lastSentTextRef.current = newTextContent;
      vscodeApi.postMessage({
        type: "update",
        text: newTextContent,
      });
    }
  };

  const handleTaskToggle = (taskId: string) => {
    // Temporarily disable typing detection during programmatic changes
    isUserTypingRef.current = false;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const normalizedText = normalizeText(text);
    const lines = normalizedText.split("\n");
    const line = lines[task.line];

    // Cycle through the states: todo -> doing -> done -> todo
    let newCheckbox: string;
    const currentStatus = task.status || (task.completed ? 'done' : 'todo');
    
    switch (currentStatus) {
      case 'todo':
        newCheckbox = '[*]';
        break;
      case 'doing':
        newCheckbox = '[x]';
        break;
      case 'done':
        newCheckbox = '[ ]';
        break;
      default:
        newCheckbox = '[*]';
    }

    // Replace the checkbox in the line
    const newLine = line.replace(/\[([ *xX])\]/, newCheckbox);

    lines[task.line] = newLine;
    const newText = lines.join("\n");

    setText(newText);
    lastSentTextRef.current = newText;
    vscodeApi.postMessage({
      type: "update",
      text: newText,
    });
  };

  const handleTaskDelete = (taskId: string) => {
    // Temporarily disable typing detection during programmatic changes
    isUserTypingRef.current = false;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const normalizedText = normalizeText(text);
    const lines = normalizedText.split("\n");
    lines.splice(task.line, 1);
    const newText = lines.join("\n");

    setText(newText);
    lastSentTextRef.current = newText;
    vscodeApi.postMessage({
      type: "update",
      text: newText,
    });
  };

  const handleStatusChange = (taskId: string, newStatus: 'todo' | 'doing' | 'done') => {
    // Temporarily disable typing detection during programmatic changes
    isUserTypingRef.current = false;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const normalizedText = normalizeText(text);
    const lines = normalizedText.split("\n");
    const line = lines[task.line];

    // Set the specific status
    let newCheckbox: string;
    switch (newStatus) {
      case 'todo':
        newCheckbox = '[ ]';
        break;
      case 'doing':
        newCheckbox = '[*]';
        break;
      case 'done':
        newCheckbox = '[x]';
        break;
    }

    // Replace the checkbox in the line
    const newLine = line.replace(/\[([ *xX])\]/, newCheckbox);

    lines[task.line] = newLine;
    const newText = lines.join("\n");

    setText(newText);
    lastSentTextRef.current = newText;
    vscodeApi.postMessage({
      type: "update",
      text: newText,
    });
  };

  return (
    <div className="taskit-container">
      <div className="task-container">
        <div className="header">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${view === "combined" ? "active" : ""}`}
              onClick={() => setView("combined")}
            >
              Combined
            </button>
            <button
              className={`toggle-btn ${view === "table" ? "active" : ""}`}
              onClick={() => setView("table")}
            >
              Table
            </button>
            <button
              className={`toggle-btn ${view === "text" ? "active" : ""}`}
              onClick={() => setView("text")}
            >
              Text
            </button>
          </div>
        </div>

        {view === "combined" ? (
          <div className="combined-view">
            <div className="tasks-panel">
              <TaskList
                tasks={tasks}
                onTaskToggle={handleTaskToggle}
                onTaskDelete={handleTaskDelete}
                onTaskEdit={handleTaskEdit}
                onTaskAdd={handleTaskAdd}
                onStatusChange={handleStatusChange}
              />
            </div>
            <div className="text-panel">
              <div className="edit-mode">
                <textarea
                  ref={textAreaRef}
                  className="edit-area"
                  value={text}
                  onChange={handleTextChange}
                  placeholder="Enter your tasks here using format: [ ] Task name or [x] Completed task"
                />
              </div>
            </div>
          </div>
        ) : view === "table" ? (
          <TaskList
            tasks={tasks}
            onTaskToggle={handleTaskToggle}
            onTaskDelete={handleTaskDelete}
            onTaskEdit={handleTaskEdit}
            onTaskAdd={handleTaskAdd}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <div className="text-view">
            <div className="edit-mode">
              <textarea
                ref={textAreaRef}
                className="edit-area"
                value={text}
                onChange={handleTextChange}
                placeholder="Enter your tasks here using format: [ ] Task name or [x] Completed task"
              />
            </div>
            {tasks.length === 0 && (
              <div className="help-text">
                <p>Add tasks using this format:</p>
                <pre>
                  [ ] Incomplete task{"\n"}
                  [*] Pendig task{"\n"}
                  [x] Completed task
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskitEditor;
