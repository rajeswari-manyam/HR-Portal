import type { Status, Priority } from "../../types/Project.types";

export const STATUS_CFG: Record<Status, { dot: string; text: string; bg: string; border: string }> = {
  Active:    { dot: "bg-green-500",  text: "text-green-700",  bg: "bg-green-50",  border: "border-green-200"  },
  Overdue:   { dot: "bg-red-500",    text: "text-red-700",    bg: "bg-red-50",    border: "border-red-200"    },
  Completed: { dot: "bg-blue-500",   text: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200"   },
  "On Hold": { dot: "bg-yellow-500", text: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200" },
  Planning:  { dot: "bg-gray-400",   text: "text-gray-600",   bg: "bg-gray-100",  border: "border-gray-200"   },
};

export const PRIORITY_CFG: Record<Priority, { text: string; bg: string }> = {
  Critical: { text: "text-red-700",    bg: "bg-red-50 border border-red-200"       },
  High:     { text: "text-orange-700", bg: "bg-orange-50 border border-orange-200" },
  Medium:   { text: "text-blue-700",   bg: "bg-blue-50 border border-blue-200"     },
  Low:      { text: "text-gray-600",   bg: "bg-gray-100 border border-gray-200"    },
};

export const PROGRESS_COLOR: Record<Status, string> = {
  Active:    "bg-green-500",
  Overdue:   "bg-red-500",
  Completed: "bg-blue-500",
  "On Hold": "bg-yellow-400",
  Planning:  "bg-orange-400",
};

export const ALL_STATUSES:   Status[]   = ["Active", "Overdue", "Completed", "On Hold", "Planning"];
export const ALL_PRIORITIES: Priority[] = ["Critical", "High", "Medium", "Low"];

export const ROLE_COLOR_MAP: Record<string, string> = {
  "Lead Developer":   "bg-indigo-500",
  "Designer":         "bg-pink-500",
  "Backend Engineer": "bg-amber-500",
  "QA Engineer":      "bg-emerald-500",
  "Product Manager":  "bg-violet-500",
};

export const inputCls = (err?: string) =>
  `w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-blue-100 ${
    err ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-400 bg-white"
  }`;
