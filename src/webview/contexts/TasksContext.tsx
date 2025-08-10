import React, { createContext, useCallback, useContext, useMemo } from "react";
import { TaskType } from "../types";
import { useText } from "./TextContext";

type TaskStatus = "todo" | "doing" | "done";

interface TasksContextValue {
	tasks: TaskType[];
	addTask: (text: string) => void;
	editTask: (id: string, newText: string) => void;
	deleteTask: (id: string) => void;
	changeStatus: (id: string, status: TaskStatus) => void;
	getDone: () => number;
}

interface TasksProviderProps { children: React.ReactNode }

const TasksContext = createContext<TasksContextValue | undefined>(undefined);

export const TasksProvider: React.FC<TasksProviderProps> = ({ children }) => {
	const { text, setTextImmediate: onTextUpdate } = useText();
	const normalizeText = useCallback((value: string) => {
		return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
	}, []);

	const tasks = useMemo(() => {
		const normalizedText = normalizeText(text);
		const lines = normalizedText.split("\n");
		const parsedTasks: TaskType[] = [];

		lines.forEach((line, index) => {
			const taskMatch = line.match(/^(\s*)(- )?\[([ *xX])\]\s*(.+)$/);
			if (taskMatch) {
				const [, , , checkbox, taskText] = taskMatch;
				const checkboxLower = checkbox.toLowerCase();

				let status: TaskStatus;
				let completed: boolean;

				if (checkboxLower === "x") {
					status = "done";
					completed = true;
				} else if (checkboxLower === "*") {
					status = "doing";
					completed = false;
				} else {
					status = "todo";
					completed = false;
				}

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

	const addTask = useCallback(
		(taskText: string) => {
			const normalized = normalizeText(text);
			const lines = normalized.split("\n");
			const newTaskLine = `[ ] ${taskText}`;

			let insertIndex = lines.length;
			for (let i = lines.length - 1; i >= 0; i--) {
				if (lines[i].match(/^\s*(- )?\[([ xX])\]/)) {
					insertIndex = i + 1;
					break;
				}
			}

			lines.splice(insertIndex, 0, newTaskLine);
			const newText = lines.join("\n");
			onTextUpdate(newText);
		},
		[text, normalizeText, onTextUpdate]
	);

	const editTask = useCallback(
		(taskId: string, newTaskText: string) => {
			const task = tasks.find((t) => t.id === taskId);
			if (!task) return;

			const normalized = normalizeText(text);
			const lines = normalized.split("\n");
			const line = lines[task.line];
			const checkboxMatch = line.match(/^(\s*)(- )?\[([ xX])\]\s*/);

			if (checkboxMatch) {
				const [, indent, dash, checkbox] = checkboxMatch;
				const newLine = `${indent}${dash || ""}[${checkbox}] ${newTaskText}`;
				lines[task.line] = newLine;
				const newText = lines.join("\n");
				onTextUpdate(newText);
			}
		},
		[tasks, text, normalizeText, onTextUpdate]
	);

	const deleteTask = useCallback(
		(taskId: string) => {
			const task = tasks.find((t) => t.id === taskId);
			if (!task) return;

			const normalized = normalizeText(text);
			const lines = normalized.split("\n");
			lines.splice(task.line, 1);
			const newText = lines.join("\n");
			onTextUpdate(newText);
		},
		[tasks, text, normalizeText, onTextUpdate]
	);

	const changeStatus = useCallback(
		(taskId: string, newStatus: TaskStatus) => {
			const task = tasks.find((t) => t.id === taskId);
			if (!task) return;

			const normalized = normalizeText(text);
			const lines = normalized.split("\n");
			const line = lines[task.line];

			let newCheckbox: string;
			switch (newStatus) {
				case "todo":
					newCheckbox = "[ ]";
					break;
				case "doing":
					newCheckbox = "[*]";
					break;
				case "done":
					newCheckbox = "[x]";
					break;
			}

			const newLine = line.replace(/\[([ *xX])\]/, newCheckbox);
			lines[task.line] = newLine;
			const newText = lines.join("\n");
			onTextUpdate(newText);
		},
		[tasks, text, normalizeText, onTextUpdate]
	);

	const getDone = useCallback(() => {
		let count = 0;
		tasks.forEach((t) => {
			if (t.status === "done") count += 1;
		});
		return count;
	}, [tasks]);

	const value: TasksContextValue = useMemo(
		() => ({ tasks, addTask, editTask, deleteTask, changeStatus, getDone }),
		[tasks, addTask, editTask, deleteTask, changeStatus, getDone]
	);

	return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};

export const useTasks = (): TasksContextValue => {
	const ctx = useContext(TasksContext);
	if (!ctx) {
		throw new Error("useTasks must be used within a TasksProvider");
	}
	return ctx;
};

