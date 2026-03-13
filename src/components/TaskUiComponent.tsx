import React, { useState } from "react";
import { TaskStatus, Priority } from "../types/task.types";
import { STATUS_CFG, STATUS_LIST, PRIORITY_CFG } from "../components/constants/Task.constants";

// ── Progress Bar ──────────────────────────────────────────────────────────────
interface ProgressBarProps {
  value: number;
  color: string;
}
export function ProgressBar({ value, color }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold text-gray-600 w-9 text-right tabular-nums">
        {value}%
      </span>
    </div>
  );
}

// ── Priority Pill ─────────────────────────────────────────────────────────────
interface PriorityPillProps {
  priority: Priority;
}
export function PriorityPill({ priority }: PriorityPillProps) {
  const pc = PRIORITY_CFG[priority];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${pc.bg} ${pc.text} ${pc.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
      {priority}
    </span>
  );
}

// ── Status Pill (with dropdown) ───────────────────────────────────────────────
interface StatusPillProps {
  status: TaskStatus;
  onChange: (s: TaskStatus) => void;
}
export function StatusPill({ status, onChange }: StatusPillProps) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CFG[status];
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer ${cfg.pillBg} ${cfg.pillText} ${cfg.pillBorder}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
        {status}
        <svg width={10} height={10} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] bg-white border border-gray-100 rounded-xl shadow-lg z-50 min-w-[150px] py-1">
          {STATUS_LIST.map((s) => {
            const sc = STATUS_CFG[s];
            return (
              <button
                key={s}
                onClick={() => { onChange(s); setOpen(false); }}
                className="flex items-center gap-2 w-full px-3.5 py-2 text-xs text-left hover:bg-gray-50 transition-colors"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dotColor}`} />
                <span className={`${sc.pillText} font-medium`}>{s}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Summary Card ──────────────────────────────────────────────────────────────
interface SummaryCardProps {
  status: TaskStatus;
  count: number;
}
export function SummaryCard({ status, count }: SummaryCardProps) {
  const cfg = STATUS_CFG[status];
  return (
    <div className={`flex-1 rounded-2xl border p-5 ${cfg.bgCard} ${cfg.borderCard}`}>
      <div className="flex items-start justify-between mb-3">
        {cfg.icon}
        <span className={`text-4xl font-black tracking-tight ${cfg.numColor}`}>{count}</span>
      </div>
      <p className={`text-sm font-bold ${cfg.labelColor}`}>{status}</p>
    </div>
  );
}

// ── Field Label ───────────────────────────────────────────────────────────────
interface FieldLabelProps {
  children: React.ReactNode;
}
export function FieldLabel({ children }: FieldLabelProps) {
  return (
    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}

// ── Modal Input ───────────────────────────────────────────────────────────────
interface ModalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}
export function ModalInput({ className = "", ...props }: ModalInputProps) {
  return (
    <input
      className={`w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all ${className}`}
      {...props}
    />
  );
}

// ── Modal Select ──────────────────────────────────────────────────────────────
interface ModalSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}
export function ModalSelect({ value, onChange, options }: ModalSelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 pr-8 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white outline-none appearance-none cursor-pointer focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <svg
        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
        width={14} height={14} fill="none" viewBox="0 0 24 24"
        stroke="currentColor" strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}