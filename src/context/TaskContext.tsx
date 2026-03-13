import { createContext, useContext, useState, ReactNode } from 'react';

export type TaskStatus = 'To Do' | 'In Progress' | 'Review' | 'Completed';
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Subtask { id: string; title: string; done: boolean; }

export interface Task {
  id: string;
  title: string;
  description: string;
  subtasks: Subtask[];
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
  projectId?: string;       // links task to a project
  incompleteReason?: string; // reason if not completed by due date
  reasonDate?: string;       // date reason was submitted
}

interface TaskContextType {
  tasks: Task[];
  addTask: (t: Task) => void;
  updateTask: (t: Task) => void;
  deleteTask: (id: string) => void;
  setIncompleteReason: (id: string, reason: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const INITIAL_TASKS: Task[] = [
  {
    id: 't1', title: 'Refactor card components',
    description: 'Rebuild all card components using the new design token system.',
    subtasks: [{ id: 's1', title: 'Audit existing card variants', done: true }, { id: 's2', title: 'Migrate to design tokens', done: true }],
    totalSubtasks: 2, doneSubtasks: 2, assignee: 'Priya Sharma', assigneeInitials: 'PS', assigneeColor: 'bg-purple-500',
    priority: 'High', due: '2026-02-10', progress: 100, status: 'Completed',
    tags: ['Frontend', 'Design System'], createdAt: '2026-01-20', projectId: 'PRJ-001',
  },
  {
    id: 't2', title: 'Implement filter panel',
    description: 'Build the advanced filter panel for the data table.',
    subtasks: [{ id: 's3', title: 'UI skeleton', done: false }, { id: 's4', title: 'Wire up filters', done: false }],
    totalSubtasks: 2, doneSubtasks: 0, assignee: 'Marcus Chen', assigneeInitials: 'MC', assigneeColor: 'bg-green-500',
    priority: 'High', due: '2026-03-01', progress: 55, status: 'In Progress',
    tags: ['Frontend', 'UX'], createdAt: '2026-02-01', projectId: 'PRJ-001',
  },
  {
    id: 't3', title: 'API integration — dashboard metrics',
    description: 'Connect all dashboard widgets to the live metrics API.',
    subtasks: [{ id: 's5', title: 'Connect endpoints', done: true }, { id: 's6', title: 'Error handling', done: false }],
    totalSubtasks: 2, doneSubtasks: 1, assignee: 'Jordan Lee', assigneeInitials: 'JL', assigneeColor: 'bg-blue-500',
    priority: 'Critical', due: '2026-03-05', progress: 40, status: 'In Progress',
    tags: ['Backend', 'API'], createdAt: '2026-02-20', projectId: 'PRJ-002',
  },
  {
    id: 't4', title: 'Accessibility audit',
    description: 'Full WCAG 2.1 AA audit of the dashboard.',
    subtasks: [], totalSubtasks: 3, doneSubtasks: 1, assignee: 'Sara Kim', assigneeInitials: 'SR', assigneeColor: 'bg-pink-500',
    priority: 'Medium', due: '2026-03-12', progress: 30, status: 'Review',
    tags: ['QA', 'A11y'], createdAt: '2026-02-10', projectId: 'PRJ-002',
  },
  {
    id: 't5', title: 'Write onboarding docs',
    description: 'Create comprehensive onboarding documentation.',
    subtasks: [], totalSubtasks: 0, doneSubtasks: 0, assignee: 'Arjun Sharma', assigneeInitials: 'AS', assigneeColor: 'bg-orange-500',
    priority: 'Low', due: '2026-03-20', progress: 0, status: 'To Do',
    tags: ['Docs'], createdAt: '2026-02-15', projectId: 'PRJ-001',
  },
];

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  const addTask = (t: Task) => setTasks(prev => [t, ...prev]);
  const updateTask = (t: Task) => setTasks(prev => prev.map(x => x.id === t.id ? t : x));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(x => x.id !== id));
  const setIncompleteReason = (id: string, reason: string) =>
    setTasks(prev => prev.map(x => x.id === id
      ? { ...x, incompleteReason: reason, reasonDate: new Date().toISOString().slice(0, 10) }
      : x
    ));

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, setIncompleteReason }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext must be used within TaskProvider');
  return ctx;
}