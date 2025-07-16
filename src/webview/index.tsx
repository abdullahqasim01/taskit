import React from 'react';
import { createRoot } from 'react-dom/client';
import TaskitEditor from './TaskitEditor';

// VS Code API
declare const acquireVsCodeApi: () => any;

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(<TaskitEditor />);
