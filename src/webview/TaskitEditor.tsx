import React, { useState, useEffect, useMemo } from 'react';
import TaskList from './TaskList';
import './TaskitEditor.css';

interface VSCodeApi {
  postMessage(message: any): void;
  getState(): any;
  setState(state: any): void;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
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
  const [text, setText] = useState(window.initialData?.text || '');
  const [isEditing, setIsEditing] = useState(false);
  const [originalText, setOriginalText] = useState(window.initialData?.text || '');
  const [view, setView] = useState<'formatted' | 'raw'>('formatted');
  const [vscodeApi] = useState(() => acquireVsCodeApi());

  // Parse tasks from text
  const tasks = useMemo(() => {
    const lines = text.split('\r\n');
    const parsedTasks: Task[] = [];
    
    lines.forEach((line, index) => {
      // Match patterns like [ ], [x], [X] for tasks
      const taskMatch = line.match(/^(\s*)(- )?\[([ xX])\]\s*(.+)$/);
      if (taskMatch) {
        const [, , , checkbox, taskText] = taskMatch;
        parsedTasks.push({
          id: `task-${index}`,
          text: taskText.trim(),
          completed: checkbox.toLowerCase() === 'x',
          line: index
        });
      }
    });
    
    return parsedTasks;
  }, [text]);

  useEffect(() => {
    // Listen for messages from the extension
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      console.log('Received message from webview:', message);
      switch (message.type) {
        case 'update':
          if (!isEditing) {
            setText(message.text);
            setOriginalText(message.text);
          }
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    vscodeApi.postMessage({
      type: 'update',
      text: text
    });
    setOriginalText(text);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setText(originalText);
    setIsEditing(false);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleTaskToggle = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const lines = text.split('\n');
    const line = lines[task.line];
    
    // Toggle the checkbox
    const newLine = task.completed 
      ? line.replace(/\[x\]/i, '[ ]')
      : line.replace(/\[ \]/, '[x]');
    
    lines[task.line] = newLine;
    const newText = lines.join('\n');
    
    setText(newText);
    vscodeApi.postMessage({
      type: 'update',
      text: newText
    });
  };

  const handleTaskDelete = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const lines = text.split('\n');
    lines.splice(task.line, 1);
    const newText = lines.join('\n');
    
    setText(newText);
    vscodeApi.postMessage({
      type: 'update',
      text: newText
    });
  };

  return (
    <div className="taskit-container">
      <div className="task-container">
        <div className="header">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${view === 'formatted' ? 'active' : ''}`}
              onClick={() => setView('formatted')}
            >
              Tasks View
            </button>
            <button 
              className={`toggle-btn ${view === 'raw' ? 'active' : ''}`}
              onClick={() => setView('raw')}
            >
              Raw Text
            </button>
          </div>
          {view === 'raw' && (
            <button className="edit-button" onClick={handleEdit}>
              Edit
            </button>
          )}
        </div>

        {view === 'formatted' ? (
          <div className="formatted-view">
            <h3>Tasks ({tasks.length})</h3>
            <TaskList 
              tasks={tasks}
              onTaskToggle={handleTaskToggle}
              onTaskDelete={handleTaskDelete}
            />
            {tasks.length === 0 && (
              <div className="help-text">
                <p>Switch to Raw Text view to add tasks using this format:</p>
                <pre>
                  [ ] Incomplete task{'\n'}
                  [x] Completed task
                </pre>
              </div>
            )}
          </div>
        ) : (
          <>
            {!isEditing ? (
              <div className="task-content">
                {text}
              </div>
            ) : (
              <div className="edit-mode">
                <textarea
                  className="edit-area"
                  value={text}
                  onChange={handleTextChange}
                  autoFocus
                />
                <div className="button-group">
                  <button className="save-button" onClick={handleSave}>
                    Save
                  </button>
                  <button className="cancel-button" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TaskitEditor;
