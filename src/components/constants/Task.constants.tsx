import { Task, TaskStatus, Priority } from "../../types/task.types";

// ── Lists ─────────────────────────────────────────────────────────────────────
export const STATUS_LIST: TaskStatus[] = ["To Do", "In Progress", "Review", "Completed"];
export const PRIORITY_LIST: Priority[] = ["Critical", "High", "Medium", "Low"];

// ── Status Config ─────────────────────────────────────────────────────────────
export const STATUS_CFG: Record<
  TaskStatus,
  {
    bgCard: string;
    borderCard: string;
    numColor: string;
    labelColor: string;
    icon: JSX.Element;
    dotColor: string;
    pillBg: string;
    pillText: string;
    pillBorder: string;
    barColor: string;
  }
> = {
  "To Do": {
    bgCard: "bg-indigo-50",
    borderCard: "border-indigo-100",
    numColor: "text-indigo-600",
    labelColor: "text-indigo-500",
    icon: (
      <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="#818cf8" strokeWidth={1.8}>
        <circle cx={12} cy={12} r={9} />
      </svg>
    ),
    dotColor: "bg-indigo-400",
    pillBg: "bg-indigo-50",
    pillText: "text-indigo-600",
    pillBorder: "border-indigo-200",
    barColor: "#818cf8",
  },
  "In Progress": {
    bgCard: "bg-sky-50",
    borderCard: "border-sky-100",
    numColor: "text-sky-500",
    labelColor: "text-sky-500",
    icon: (
      <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="#38bdf8" strokeWidth={1.8}>
        <circle cx={12} cy={12} r={9} />
        <path strokeLinecap="round" d="M12 7v5l3 3" />
      </svg>
    ),
    dotColor: "bg-sky-400",
    pillBg: "bg-sky-50",
    pillText: "text-sky-600",
    pillBorder: "border-sky-200",
    barColor: "#38bdf8",
  },
  Review: {
    bgCard: "bg-violet-50",
    borderCard: "border-violet-100",
    numColor: "text-violet-500",
    labelColor: "text-violet-500",
    icon: (
      <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="#a78bfa" strokeWidth={1.8}>
        <path strokeLinecap="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    dotColor: "bg-violet-400",
    pillBg: "bg-violet-50",
    pillText: "text-violet-600",
    pillBorder: "border-violet-200",
    barColor: "#a78bfa",
  },
  Completed: {
    bgCard: "bg-emerald-50",
    borderCard: "border-emerald-100",
    numColor: "text-emerald-500",
    labelColor: "text-emerald-500",
    icon: (
      <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="#34d399" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    dotColor: "bg-emerald-400",
    pillBg: "bg-emerald-50",
    pillText: "text-emerald-600",
    pillBorder: "border-emerald-200",
    barColor: "#34d399",
  },
};

// ── Priority Config ───────────────────────────────────────────────────────────
export const PRIORITY_CFG: Record<
  Priority,
  { bg: string; text: string; border: string; dot: string }
> = {
  Critical: { bg: "bg-red-50",    text: "text-red-600",    border: "border-red-200",    dot: "bg-red-500"    },
  High:     { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200", dot: "bg-orange-500" },
  Medium:   { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", dot: "bg-yellow-500" },
  Low:      { bg: "bg-green-50",  text: "text-green-600",  border: "border-green-200",  dot: "bg-green-500"  },
};

// ── Members ───────────────────────────────────────────────────────────────────
export const MEMBERS = [
  { name: "Priya Sharma",  initials: "PS", color: "bg-purple-500" },
  { name: "Marcus Chen",   initials: "MC", color: "bg-green-500"  },
  { name: "Jordan Lee",    initials: "JL", color: "bg-blue-500"   },
  { name: "Sara Kim",      initials: "SR", color: "bg-pink-500"   },
  { name: "Arjun Sharma",  initials: "AS", color: "bg-orange-500" },
];

// ── Seed Data ─────────────────────────────────────────────────────────────────
export const INITIAL_TASKS: Task[] = [
  {
    id: "t1",
    title: "Refactor card components",
    description:
      "Rebuild all card components using the new design token system. Ensure consistent spacing, typography, and colour usage across the entire component library.",
    subtasks: [
      { id: "s1", title: "Audit existing card variants", done: true },
      { id: "s2", title: "Migrate to design tokens",     done: true },
    ],
    totalSubtasks: 2, doneSubtasks: 2,
    assignee: "Priya Sharma", assigneeInitials: "PS", assigneeColor: "bg-purple-500",
    priority: "High", due: "2026-02-10", progress: 100, status: "Completed",
    tags: ["Frontend", "Design System"], createdAt: "2026-01-20",
  },
  {
    id: "t2",
    title: "Implement filter panel",
    description:
      "Build the advanced filter panel for the data table. Includes multi-select dropdowns, date range pickers, and saved filter presets.",
    subtasks: [
      { id: "s3", title: "UI skeleton",      done: false },
      { id: "s4", title: "Wire up filters",  done: false },
    ],
    totalSubtasks: 2, doneSubtasks: 0,
    assignee: "Marcus Chen", assigneeInitials: "MC", assigneeColor: "bg-green-500",
    priority: "High", due: "2026-03-01", progress: 55, status: "In Progress",
    tags: ["Frontend", "UX"], createdAt: "2026-02-01",
  },
  {
    id: "t3",
    title: "API integration — dashboard metrics",
    description:
      "Connect all dashboard widgets to the live metrics API. Handle loading states, error boundaries, and polling intervals.",
    subtasks: [
      { id: "s5", title: "Connect endpoints", done: true  },
      { id: "s6", title: "Error handling",    done: false },
    ],
    totalSubtasks: 2, doneSubtasks: 1,
    assignee: "Jordan Lee", assigneeInitials: "JL", assigneeColor: "bg-blue-500",
    priority: "Critical", due: "2026-03-05", progress: 40, status: "In Progress",
    tags: ["Backend", "API"], createdAt: "2026-02-20",
  },
  {
    id: "t4",
    title: "Accessibility audit",
    description:
      "Full WCAG 2.1 AA audit of the dashboard. Document all issues and provide remediation recommendations.",
    subtasks: [],
    totalSubtasks: 3, doneSubtasks: 1,
    assignee: "Sara Kim", assigneeInitials: "SR", assigneeColor: "bg-pink-500",
    priority: "Medium", due: "2026-03-12", progress: 30, status: "Review",
    tags: ["QA", "A11y"], createdAt: "2026-02-10",
  },
  {
    id: "t5",
    title: "Write onboarding docs",
    description:
      "Create comprehensive onboarding documentation for new team members joining the project.",
    subtasks: [],
    totalSubtasks: 0, doneSubtasks: 0,
    assignee: "Arjun Sharma", assigneeInitials: "AS", assigneeColor: "bg-orange-500",
    priority: "Low", due: "2026-03-20", progress: 0, status: "To Do",
    tags: ["Docs"], createdAt: "2026-02-15",
  },
];