// ── Types ─────────────────────────────────────────────────────────────────────
export type TaskStatus = "To Do" | "In Progress" | "Review" | "Completed";
export type Priority = "High" | "Critical" | "Medium" | "Low";

export interface SubTask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  subtasks: SubTask[];
  totalSubtasks: number;
  doneSubtasks: number;
  assignee: string;
  assigneeInitials: string;
  assigneeColor: string;
  priority: Priority;
  due: string;
  progress: number;
  status: TaskStatus;
  tags: string[];
  createdAt: string;
}

export type ModalState =
  | { type: "add" }
  | { type: "edit"; task: Task }
  | { type: "view"; task: Task }
  | { type: "delete"; task: Task }
  | null;