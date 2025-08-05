export interface TaskType {
  id: string;
  text: string;
  completed: boolean;
  status?: "todo" | "doing" | "done";
  line: number;
}

export interface VSCodeApiType {
  postMessage(message: any): void;
  getState(): any;
  setState(state: any): void;
}