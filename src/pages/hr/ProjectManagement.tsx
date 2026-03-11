import { useState, useMemo, useEffect } from "react";
import { useAuth } from '../../context/AuthContext';
import { Pencil } from 'lucide-react';
import Button from '../../components/shared/Button';
import {
  Priority,
  ProjectStatus,
  Project,
  Task,
  SubTask,
  Comment,
  Person
} from '../../types';
import { PERSONS, INITIAL_PROJECTS } from '../../data/mockProjects';

// alias for backwards compatibility with the older local status type
type Status = ProjectStatus;


// data live in src/data/mockProjects.ts

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  critical: { label: "Critical", color: "#ef4444", bg: "#fef2f2" },
  high:     { label: "High",     color: "#f59e0b", bg: "#fffbeb" },
  medium:   { label: "Medium",   color: "#6366f1", bg: "#eef2ff" },
  low:      { label: "Low",      color: "#10b981", bg: "#f0fdf4" },
};

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; dot: string }> = {
  not_started: { label: "Not Started", color: "#64748b", bg: "#f1f5f9", dot: "#94a3b8" },
  in_progress: { label: "In Progress", color: "#6366f1", bg: "#eef2ff", dot: "#6366f1" },
  on_hold:     { label: "On Hold",     color: "#f59e0b", bg: "#fffbeb", dot: "#f59e0b" },
  completed:   { label: "Completed",   color: "#10b981", bg: "#f0fdf4", dot: "#10b981" },
  overdue:     { label: "Overdue",     color: "#ef4444", bg: "#fef2f2", dot: "#ef4444" },
};

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function formatDateTime(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function isOverdue(endDate: string, status: Status) {
  if (status === "completed") return false;
  return new Date(endDate) < new Date();
}
function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function getPerson(id: string | null) {
  return PERSONS.find((p) => p.id === id) ?? null;
}
function progressOf(tasks: Task[]) {
  if (!tasks.length) return 0;
  return Math.round((tasks.filter((t) => t.status === "completed").length / tasks.length) * 100);
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ person, size = 32 }: { person: Person | null; size?: number }) {
  if (!person) return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, color: "#94a3b8", fontWeight: 700, flexShrink: 0 }}>?</div>
  );
  return (
    <div title={person.name} style={{ width: size, height: size, borderRadius: "50%", background: person.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, color: "#fff", fontWeight: 700, flexShrink: 0, letterSpacing: "-0.5px" }}>
      {person.avatar}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = PRIORITY_CONFIG[priority];
  return <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg, padding: "2px 8px", borderRadius: 20, letterSpacing: "0.5px", textTransform: "uppercase" }}>{cfg.label}</span>;
}
function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: cfg.color, background: cfg.bg, padding: "2px 10px", borderRadius: 20 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
      {cfg.label}
    </span>
  );
}

// ─── PersonSelector ───────────────────────────────────────────────────────────

function PersonSelector({ value, onChange }: { value: string | null; onChange: (id: string | null) => void }) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || "")}
      style={{ fontSize: 13, color: "#1e293b", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "5px 10px", background: "#fff", cursor: "pointer", outline: "none" }}
    >
      <option value="">Unassigned</option>
      {PERSONS.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.role}</option>)}
    </select>
  );
}

// ─── IncompleteReasonModal ────────────────────────────────────────────────────

function IncompleteReasonModal({ onSubmit, onClose }: { onSubmit: (reason: string) => void; onClose: () => void }) {
  const [reason, setReason] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 480, boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <span style={{ fontSize: 24 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#0f172a" }}>Task Not Completed</div>
            <div style={{ fontSize: 13, color: "#64748b" }}>Please provide a reason for not completing this task on time.</div>
          </div>
        </div>
        <textarea
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain what blocked this task or why it wasn't completed..."
          rows={4}
          style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, color: "#1e293b", resize: "none", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
        />
        <div className="flex gap-2 mt-4 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            variant="danger"
            disabled={!reason.trim()}
            onClick={() => reason.trim() && onSubmit(reason.trim())}
          >
            Send Reason
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── CommentSection ───────────────────────────────────────────────────────────

function CommentSection({ comments, onAdd, incompleteReason }: { comments: Comment[]; onAdd: (text: string) => void; incompleteReason?: string }) {
  const [text, setText] = useState("");
  return (
    <div style={{ marginTop: 16 }}>
      {incompleteReason && (
        <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 10, padding: "10px 14px", marginBottom: 12, display: "flex", gap: 8 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>🚫</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", marginBottom: 3 }}>Incomplete Reason</div>
            <div style={{ fontSize: 13, color: "#7f1d1d" }}>{incompleteReason}</div>
          </div>
        </div>
      )}
      {comments.filter(c => !c.isIncompleteReason).map((c) => {
        const author = getPerson(c.authorId);
        return (
          <div key={c.id} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <Avatar person={author} size={28} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{author?.name ?? "Unknown"}</span>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>{formatDateTime(c.createdAt)}</span>
              </div>
              <div style={{ fontSize: 13, color: "#475569", background: "#f8fafc", padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0" }}>{c.text}</div>
            </div>
          </div>
        );
      })}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <Avatar person={PERSONS[0]} size={28} />
        <div style={{ flex: 1, display: "flex", gap: 8 }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && text.trim()) { onAdd(text.trim()); setText(""); } }}
            placeholder="Add a comment... (Enter to send)"
            style={{ flex: 1, padding: "7px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#1e293b", outline: "none", fontFamily: "inherit" }}
          />
          <button
            onClick={() => { if (text.trim()) { onAdd(text.trim()); setText(""); } }}
            style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >Send</button>
        </div>
      </div>
    </div>
  );
}

// ─── SubTask Row ──────────────────────────────────────────────────────────────

function SubTaskRow({ subtask, onUpdate }: { subtask: SubTask; onUpdate: (s: SubTask) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [showReason, setShowReason] = useState(false);
  const assignee = getPerson(subtask.assigneeId);
  const overdue = isOverdue(subtask.dueDate, subtask.status);
  const effectiveStatus: Status = overdue && subtask.status !== "completed" ? "overdue" : subtask.status;

  function toggleComplete() {
    if (subtask.status === "completed") {
      onUpdate({ ...subtask, status: "in_progress", completedAt: undefined });
    } else {
      const now = new Date().toISOString();
      const pastDue = new Date(subtask.dueDate) < new Date();
      if (pastDue) {
        setShowReason(true);
      } else {
        onUpdate({ ...subtask, status: "completed", completedAt: now });
      }
    }
  }

  return (
    <>
      {showReason && (
        <IncompleteReasonModal
          onClose={() => setShowReason(false)}
          onSubmit={(reason) => {
            const now = new Date().toISOString();
            const newComment: Comment = { id: uid(), authorId: "p1", text: reason, createdAt: now, isIncompleteReason: true };
            onUpdate({
              ...subtask,
              status: "completed",
              completedAt: now,
              incompleteReason: reason,
              comments: [...subtask.comments, newComment],
            });
            setShowReason(false);
          }}
        />
      )}
      <div style={{ marginLeft: 24, borderLeft: "2px solid #f1f5f9", paddingLeft: 16 }}>
        <div
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, cursor: "pointer", background: expanded ? "#f8fafc" : "transparent", transition: "background 0.15s" }}
          onClick={() => setExpanded(!expanded)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); toggleComplete(); }}
            style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${subtask.status === "completed" ? "#10b981" : "#cbd5e1"}`, background: subtask.status === "completed" ? "#10b981" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}
          >
            {subtask.status === "completed" && <span style={{ color: "#fff", fontSize: 11, fontWeight: 900 }}>✓</span>}
          </button>
          <span style={{ flex: 1, fontSize: 13, color: subtask.status === "completed" ? "#94a3b8" : "#1e293b", textDecoration: subtask.status === "completed" ? "line-through" : "none", fontWeight: 500 }}>{subtask.title}</span>
          <Avatar person={assignee} size={22} />
          <span style={{ fontSize: 11, color: overdue && subtask.status !== "completed" ? "#ef4444" : "#94a3b8" }}>{formatDate(subtask.dueDate)}</span>
          <StatusBadge status={effectiveStatus} />
          {subtask.completedAt && <span style={{ fontSize: 11, color: "#10b981" }}>✓ {formatDateTime(subtask.completedAt)}</span>}
          <span style={{ fontSize: 12, color: "#94a3b8" }}>{expanded ? "▲" : "▼"}</span>
        </div>
        {expanded && (
          <div style={{ padding: "0 10px 12px 28px" }}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
              Assigned to: <b>{assignee?.name ?? "Unassigned"}</b> &nbsp;|&nbsp; Due: <b style={{ color: overdue ? "#ef4444" : "#1e293b" }}>{formatDate(subtask.dueDate)}</b>
              {subtask.completedAt && <> &nbsp;|&nbsp; Completed: <b style={{ color: "#10b981" }}>{formatDateTime(subtask.completedAt)}</b></>}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>Assignee:</span>
              <PersonSelector value={subtask.assigneeId} onChange={(id) => onUpdate({ ...subtask, assigneeId: id || "" })} />
            </div>
            <CommentSection
              comments={subtask.comments}
              incompleteReason={subtask.incompleteReason}
              onAdd={(text) => {
                const c: Comment = { id: uid(), authorId: "p1", text, createdAt: new Date().toISOString() };
                onUpdate({ ...subtask, comments: [...subtask.comments, c] });
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({ task, onUpdate }: { task: Task; onUpdate: (t: Task) => void }) {
  const { user } = useAuth();
  const isHr = user?.role === 'hr';
  const [expanded, setExpanded] = useState(false);
  const [showReason, setShowReason] = useState(false);
  const assignee = getPerson(task.assigneeId);
  const overdue = isOverdue(task.dueDate, task.status);
  const effectiveStatus: Status = overdue && task.status !== "completed" ? "overdue" : task.status;
  const doneCount = task.subtasks.filter((s) => s.status === "completed").length;

  function toggleComplete() {
    if (task.status === "completed") {
      onUpdate({ ...task, status: "in_progress", completedAt: undefined });
    } else {
      const pastDue = new Date(task.dueDate) < new Date();
      const now = new Date().toISOString();
      if (pastDue) {
        setShowReason(true);
      } else {
        onUpdate({ ...task, status: "completed", completedAt: now });
      }
    }
  }

  return (
    <>
      {showReason && (
        <IncompleteReasonModal
          onClose={() => setShowReason(false)}
          onSubmit={(reason) => {
            const now = new Date().toISOString();
            const newComment: Comment = { id: uid(), authorId: "p1", text: reason, createdAt: now, isIncompleteReason: true };
            onUpdate({ ...task, status: "completed", completedAt: now, incompleteReason: reason, comments: [...task.comments, newComment] });
            setShowReason(false);
          }}
        />
      )}
      <div style={{ border: `1.5px solid ${expanded ? "#6366f1" : "#e2e8f0"}`, borderRadius: 12, marginBottom: 10, overflow: "hidden", transition: "border-color 0.2s", background: "#fff" }}>
        {/* Task Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
          <button
            onClick={(e) => { e.stopPropagation(); toggleComplete(); }}
            style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${task.status === "completed" ? "#10b981" : "#cbd5e1"}`, background: task.status === "completed" ? "#10b981" : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}
          >
            {task.status === "completed" && <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</span>}
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: task.status === "completed" ? "#94a3b8" : "#0f172a", textDecoration: task.status === "completed" ? "line-through" : "none", marginBottom: 4 }}>{task.title}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={effectiveStatus} />
              <span style={{ fontSize: 11, color: overdue && task.status !== "completed" ? "#ef4444" : "#94a3b8" }}>Due: {formatDate(task.dueDate)}</span>
              {task.completedAt && <span style={{ fontSize: 11, color: "#10b981" }}>✓ {formatDateTime(task.completedAt)}</span>}
              {task.subtasks.length > 0 && <span style={{ fontSize: 11, color: "#6366f1", fontWeight: 600 }}>{doneCount}/{task.subtasks.length} subtasks</span>}
              {task.comments.filter(c => !c.isIncompleteReason).length > 0 && <span style={{ fontSize: 11, color: "#94a3b8" }}>💬 {task.comments.filter(c => !c.isIncompleteReason).length}</span>}
            </div>
          </div>
          <Avatar person={assignee} size={30} />
          <span style={{ fontSize: 14, color: "#94a3b8" }}>{expanded ? "▲" : "▼"}</span>
        </div>

        {/* Expanded */}
        {expanded && (
          <div style={{ borderTop: "1.5px solid #f1f5f9", padding: "16px 16px 16px 16px" }}>
            <p style={{ fontSize: 13, color: "#475569", marginBottom: 16 }}>{task.description}</p>

            {/* Assign + Status row */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Assignee:</span>
                <PersonSelector value={task.assigneeId} onChange={(id) => onUpdate({ ...task, assigneeId: id })} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Status:</span>
                <select
                  value={task.status}
                  onChange={(e) => onUpdate({ ...task, status: e.target.value as Status })}
                  style={{ fontSize: 13, color: "#1e293b", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "5px 10px", background: "#fff", cursor: "pointer", outline: "none" }}
                >
                  {(Object.keys(STATUS_CONFIG) as Status[]).map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Priority:</span>
                <select
                  value={task.priority}
                  onChange={(e) => onUpdate({ ...task, priority: e.target.value as Priority })}
                  style={{ fontSize: 13, color: "#1e293b", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "5px 10px", background: "#fff", cursor: "pointer", outline: "none" }}
                >
                  {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>)}
                </select>
              </div>
            </div>

            {/* Subtasks */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
                Subtasks {task.subtasks.length > 0 && `(${doneCount}/${task.subtasks.length})`}
              </div>
              {task.subtasks.map((st) => (
                <SubTaskRow
                  key={st.id}
                  subtask={st}
                  onUpdate={(updated) => onUpdate({ ...task, subtasks: task.subtasks.map((s) => s.id === updated.id ? updated : s) })}
                />
              ))}
              {isHr && (
                <button
                  onClick={() => {
                    const st: SubTask = { id: uid(), title: "New Subtask", assigneeId: "", status: "not_started", dueDate: task.dueDate, comments: [] };
                    onUpdate({ ...task, subtasks: [...task.subtasks, st] });
                  }}
                  style={{ marginLeft: 24, marginTop: 8, fontSize: 12, color: "#6366f1", background: "none", border: "1.5px dashed #c7d2fe", borderRadius: 8, padding: "5px 14px", cursor: "pointer", fontWeight: 600 }}
                >+ Add Subtask</button>
              )}
            </div>

            {/* Comments */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Comments</div>
              <CommentSection
                comments={task.comments}
                incompleteReason={task.incompleteReason}
                onAdd={(text) => {
                  const c: Comment = { id: uid(), authorId: "p1", text, createdAt: new Date().toISOString() };
                  onUpdate({ ...task, comments: [...task.comments, c] });
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ project, onClick, onEdit }: { project: Project; onClick: () => void; onEdit?: () => void }) {
  const manager = getPerson(project.managerId);
  const progress = progressOf(project.tasks);
  const overdue = isOverdue(project.endDate, project.status);
  const effectiveStatus: Status = overdue && project.status !== "completed" ? "overdue" : project.status;

  return (
    <div
      className="group relative"
      onClick={onClick}
      style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "20px", cursor: "pointer", transition: "box-shadow 0.18s, transform 0.18s", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", position: "relative", overflow: "hidden" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(0,0,0,0.10)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
    >
      {onEdit && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title="Edit project"
          >
            <Pencil size={14} />
          </button>
        </div>
      )}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: project.color, borderRadius: "14px 14px 0 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", flex: 1 }}>{project.name}</div>
        <PriorityBadge priority={project.priority} />
      </div>
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 14, lineHeight: 1.5 }}>{project.description}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <StatusBadge status={effectiveStatus} />
        <span style={{ fontSize: 11, color: overdue && project.status !== "completed" ? "#ef4444" : "#94a3b8" }}>End: {formatDate(project.endDate)}</span>
      </div>
      {/* Progress */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Progress</span>
          <span style={{ fontSize: 11, color: "#6366f1", fontWeight: 700 }}>{progress}%</span>
        </div>
        <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99 }}>
          <div style={{ height: 6, borderRadius: 99, background: progress === 100 ? "#10b981" : "#6366f1", width: `${progress}%`, transition: "width 0.4s" }} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar person={manager} size={26} />
          <span style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>{manager?.name ?? "Unassigned"}</span>
        </div>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>{project.tasks.length} task{project.tasks.length !== 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}

// ─── Project Detail ───────────────────────────────────────────────────────────

function ProjectDetail({ project, onUpdate, onBack, onEdit }: { project: Project; onUpdate: (p: Project) => void; onBack: () => void; onEdit?: () => void }) {
  const { user } = useAuth();
  const isHr = user?.role === 'hr';
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const manager = getPerson(project.managerId);
  const progress = progressOf(project.tasks);
  const overdue = isOverdue(project.endDate, project.status);
  const effectiveStatus: Status = overdue && project.status !== "completed" ? "overdue" : project.status;

  function addTask() {
    if (!newTaskTitle.trim()) return;
    const t: Task = {
      id: uid(), title: newTaskTitle.trim(), description: "", assigneeId: null, priority: "medium",
      status: "not_started", dueDate: project.endDate, comments: [], subtasks: [],
    };
    onUpdate({ ...project, tasks: [...project.tasks, t] });
    setNewTaskTitle("");
    setShowAddTask(false);
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Back + optional edit */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <button onClick={onBack} style={{ fontSize: 13, color: "#6366f1", background: "none", border: "none", cursor: "pointer", fontWeight: 700, padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
          ← Back to Projects
        </button>
        {isHr && onEdit && (
          <button
            onClick={onEdit}
            className="btn-secondary"
            style={{ fontSize: 13 }}
          >Edit Project</button>
        )}
      </div>

      {/* Header */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, marginBottom: 20, border: "1.5px solid #e2e8f0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: project.color }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#64748b", marginBottom: 2 }}>{project.code}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>{project.name}</div>
            {project.client && <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>Client: {project.client}</div>}
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, marginBottom: 16 }}>{project.description}</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <PriorityBadge priority={project.priority} />
              <StatusBadge status={effectiveStatus} />
              <span style={{ fontSize: 12, color: overdue && project.status !== "completed" ? "#ef4444" : "#94a3b8" }}>
                {project.startDate && <>Start: {formatDate(project.startDate)} &nbsp;|&nbsp;</>}
                End: {formatDate(project.endDate)}
              </span>
              {project.completedAt && <span style={{ fontSize: 12, color: "#10b981" }}>✓ Completed: {formatDateTime(project.completedAt)}</span>}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, color: "#64748b" }}>Project Manager:</span>
              <PersonSelector value={project.managerId} onChange={(id) => onUpdate({ ...project, managerId: id })} />
            </div>
            {manager && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar person={manager} size={36} /><div><div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{manager.name}</div><div style={{ fontSize: 11, color: "#94a3b8" }}>{manager.role}</div></div></div>}
            {/* team avatars */}
            {project.team && project.team.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
                {project.team.map((pid) => {
                  const person = getPerson(pid);
                  return person ? <Avatar key={pid} person={person} size={26} /> : null;
                })}
              </div>
            )}
          </div>
        </div>
        {/* Progress */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Overall Progress</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: progress === 100 ? "#10b981" : "#6366f1" }}>{progress}%</span>
          </div>
          <div style={{ height: 10, background: "#f1f5f9", borderRadius: 99 }}>
            <div style={{ height: 10, borderRadius: 99, background: progress === 100 ? "#10b981" : `linear-gradient(90deg, #6366f1, #8b5cf6)`, width: `${progress}%`, transition: "width 0.4s" }} />
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
            {(["not_started","in_progress", "completed", "on_hold", "overdue"] as Status[]).map((s) => {
              const count = project.tasks.filter((t) => (isOverdue(t.dueDate, t.status) ? "overdue" : t.status) === s).length;
              if (!count) return null;
              return <div key={s} style={{ fontSize: 11, color: STATUS_CONFIG[s].color, fontWeight: 600 }}>{STATUS_CONFIG[s].label}: {count}</div>;
            })}
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1.5px solid #e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>Tasks</div>
          {isHr && (
            <Button variant="primary" onClick={() => setShowAddTask(true)}>
              + Add Task
            </Button>
          )}
        </div>

        {showAddTask && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input
              autoFocus
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addTask(); if (e.key === "Escape") setShowAddTask(false); }}
              placeholder="Task title..."
              style={{ flex: 1, padding: "9px 14px", border: "1.5px solid #6366f1", borderRadius: 9, fontSize: 14, color: "#1e293b", outline: "none", fontFamily: "inherit" }}
            />
            <Button variant="primary" onClick={addTask}>Add</Button>
            <Button variant="secondary" onClick={() => setShowAddTask(false)}>Cancel</Button>
          </div>
        )}

        {project.tasks.length === 0 && !showAddTask && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 14 }}>No tasks yet. Add your first task!</div>
          </div>
        )}

        {project.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdate={(updated) => onUpdate({ ...project, tasks: project.tasks.map((t) => t.id === updated.id ? updated : t) })}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const isHr = user?.role === 'hr';
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [showNewProject, setShowNewProject] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editProj, setEditProj] = useState<Project | null>(null);
  const [newProj, setNewProj] = useState({
    code: "",
    name: "",
    client: "",
    description: "",
    startDate: "",
    endDate: "",
    managerId: null as string | null,
    team: [] as string[],
  });

  const visibleProjects = useMemo(() => {
    if (isHr) return projects;
    const eid = user?.employeeId || "";
    const me = PERSONS.find((p) => p.employeeId === eid);
    const pid = me?.id || "";
    return projects.filter(p =>
      p.managerId === pid || p.team.includes(pid) || p.tasks.some(t => t.assigneeId === pid)
    );
  }, [projects, isHr, user?.employeeId]);

  const selectedProject = useMemo(() => visibleProjects.find((p) => p.id === selectedId) ?? null, [visibleProjects, selectedId]);

  // whenever the editingProject reference changes, copy its data to the edit form state
  useEffect(() => {
    if (editingProject) setEditProj(editingProject);
  }, [editingProject]);

  function updateProject(updated: Project) {
    setProjects((prev) => prev.map((p) => p.id === updated.id ? updated : p));
  }

  function createProject() {
    // basic validation; extend as needed
    if (!newProj.name.trim() || !newProj.code.trim() || !newProj.startDate || !newProj.endDate) return;
    const colors = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"];
    const p: Project = {
      id: uid(),
      code: newProj.code.trim(),
      name: newProj.name.trim(),
      client: newProj.client.trim(),
      description: newProj.description,
      managerId: newProj.managerId,
      team: [...newProj.team],
      priority: "medium",
      status: "not_started",
      startDate: newProj.startDate,
      endDate: newProj.endDate,
      tasks: [],
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    setProjects((prev) => [...prev, p]);
    setNewProj({
      code: "",
      name: "",
      client: "",
      description: "",
      startDate: "",
      endDate: "",
      managerId: null,
      team: [],
    });
    setShowNewProject(false);
    setSelectedId(p.id);
  }

  const filteredProjects = useMemo(() =>
    filterStatus === "all"
      ? visibleProjects
      : visibleProjects.filter((p) => {
          const eff = isOverdue(p.endDate, p.status) ? "overdue" : p.status;
          return eff === filterStatus;
        }),
    [visibleProjects, filterStatus]
  );

  const stats = useMemo(() => ({
    total: visibleProjects.length,
    notStarted: visibleProjects.filter((p) => p.status === "not_started").length,
    inProgress: visibleProjects.filter((p) => p.status === "in_progress").length,
    onHold: visibleProjects.filter((p) => p.status === "on_hold").length,
    completed: visibleProjects.filter((p) => p.status === "completed").length,
    overdue: visibleProjects.filter((p) => isOverdue(p.endDate, p.status)).length,
  }), [visibleProjects]);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Outfit', 'Segoe UI', sans-serif" }}>
      {/* Top Nav */}
      <div style={{ background: "#fff", borderBottom: "1.5px solid #e2e8f0", padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 16 }}>⚡</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>FlowDesk</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Team avatars */}
          <div style={{ display: "flex" }}>
            {PERSONS.slice(0, 4).map((p, i) => (
              <div key={p.id} style={{ marginLeft: i > 0 ? -8 : 0, zIndex: 4 - i }}>
                <Avatar person={p} size={28} />
              </div>
            ))}
          </div>
          {!selectedId && isHr && (
            <button
              onClick={() => setShowNewProject(true)}
              style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: "#6366f1", border: "none", borderRadius: 9, padding: "8px 18px", cursor: "pointer" }}
            >+ New Project</button>
          )}
        </div>
      </div>

      <div style={{ padding: "32px" }}>
        {selectedProject ? (
          <ProjectDetail
            project={selectedProject}
            onUpdate={updateProject}
            onBack={() => setSelectedId(null)}
            onEdit={() => {
              setEditingProject(selectedProject);
              setEditProj(selectedProject);
              setShowEditProject(true);
            }}
          />
        ) : (
          <>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
              {[
                { label: "Total Projects", value: stats.total, color: "#6366f1", bg: "#eef2ff", icon: "📁" },
                { label: "Not Started", value: stats.notStarted, color: "#64748b", bg: "#f1f5f9", icon: "⏳" },
                { label: "In Progress", value: stats.inProgress, color: "#f59e0b", bg: "#fffbeb", icon: "🔄" },
                { label: "On Hold", value: stats.onHold, color: "#fbbf24", bg: "#fffbeb", icon: "⛔" },
                { label: "Completed", value: stats.completed, color: "#10b981", bg: "#f0fdf4", icon: "✅" },
                { label: "Overdue", value: stats.overdue, color: "#ef4444", bg: "#fef2f2", icon: "⚠️" },
              ].map((s) => (
                <div key={s.label} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, background: s.bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filter */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
              {([["all", "All"], ["not_started", "Not Started"], ["in_progress", "In Progress"], ["on_hold", "On Hold"], ["completed", "Completed"], ["overdue", "Overdue"]] as [string, string][]).map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setFilterStatus(v as any)}
                  style={{ fontSize: 13, fontWeight: 600, padding: "7px 16px", borderRadius: 20, border: "1.5px solid", borderColor: filterStatus === v ? "#6366f1" : "#e2e8f0", background: filterStatus === v ? "#eef2ff" : "#fff", color: filterStatus === v ? "#6366f1" : "#64748b", cursor: "pointer", transition: "all 0.15s" }}
                >{l}</button>
              ))}
            </div>

            {/* New Project Modal */}
            {showNewProject && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 24 }}>Create New Project</div>
                  {/* project code */}
                  <div style={{ marginBottom: 12 }}>
                    <label className="label">Project Code *</label>
                    <input
                      value={newProj.code}
                      onChange={(e) => setNewProj({ ...newProj, code: e.target.value })}
                      placeholder="e.g. PRJ-001"
                      className="input"
                    />
                  </div>
                  {/* project name and client side by side */}
                  <div style={{ marginBottom: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <label className="label">Project Name *</label>
                      <input
                        value={newProj.name}
                        onChange={(e) => setNewProj({ ...newProj, name: e.target.value })}
                        placeholder="Customer Portal v2"
                        className="input"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="label">Client Name</label>
                      <input
                        value={newProj.client}
                        onChange={(e) => setNewProj({ ...newProj, client: e.target.value })}
                        placeholder="Acme Corp"
                        className="input"
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label className="label">Description</label>
                    <textarea
                      value={newProj.description}
                      onChange={(e) => setNewProj({ ...newProj, description: e.target.value })}
                      placeholder="Brief project description..."
                      rows={3}
                      className="input resize-none"
                    />
                  </div>
                  {/* dates row */}
                  <div style={{ marginBottom: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <div>
                      <label className="label">Start Date *</label>
                      <input
                        type="date"
                        value={newProj.startDate}
                        onChange={(e) => setNewProj({ ...newProj, startDate: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">End Date *</label>
                      <input
                        type="date"
                        value={newProj.endDate}
                        onChange={(e) => setNewProj({ ...newProj, endDate: e.target.value })}
                        className="input"
                      />
                    </div>
                  </div>
                  {/* manager and team selectors */}
                  <div style={{ marginBottom: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <label className="label">Project Manager</label>
                      <PersonSelector
                        value={newProj.managerId}
                        onChange={(id) => setNewProj({ ...newProj, managerId: id })}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="label">Team Members</label>
                      <select
                        multiple
                        value={newProj.team}
                        onChange={(e) => {
                          const opts = Array.from(e.target.options);
                          const vals = opts.filter(o => o.selected).map(o => o.value);
                          setNewProj({ ...newProj, team: vals });
                        }}
                        className="input h-32"
                      >
                        {PERSONS.map(p => <option key={p.id} value={p.id}>{p.name} — {p.role}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={() => setShowNewProject(false)} className="btn-secondary">Cancel</button>
                    <button
                      onClick={createProject}
                      disabled={!newProj.name.trim() || !newProj.code.trim() || !newProj.startDate || !newProj.endDate}
                      className="btn-primary"
                    >Create Project</button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Project Modal (reuse same form structure) */}
            {showEditProject && editProj && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 24 }}>Edit Project</div>
                  {/* similar fields as create */}
                  <div style={{ marginBottom: 12 }}>
                    <label className="label">Project Code *</label>
                    <input
                      value={editProj.code}
                      onChange={(e) => setEditProj({ ...editProj, code: e.target.value })}
                      placeholder="e.g. PRJ-001"
                      className="input"
                    />
                  </div>
                  <div style={{ marginBottom: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <label className="label">Project Name *</label>
                      <input
                        value={editProj.name}
                        onChange={(e) => setEditProj({ ...editProj, name: e.target.value })}
                        placeholder="Customer Portal v2"
                        className="input"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="label">Client Name</label>
                      <input
                        value={editProj.client}
                        onChange={(e) => setEditProj({ ...editProj, client: e.target.value })}
                        placeholder="Acme Corp"
                        className="input"
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label className="label">Description</label>
                    <textarea
                      value={editProj.description}
                      onChange={(e) => setEditProj({ ...editProj, description: e.target.value })}
                      placeholder="Brief project description..."
                      rows={3}
                      className="input resize-none"
                    />
                  </div>
                  <div style={{ marginBottom: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <div>
                      <label className="label">Start Date *</label>
                      <input
                        type="date"
                        value={editProj.startDate}
                        onChange={(e) => setEditProj({ ...editProj, startDate: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">End Date *</label>
                      <input
                        type="date"
                        value={editProj.endDate}
                        onChange={(e) => setEditProj({ ...editProj, endDate: e.target.value })}
                        className="input"
                      />
                    </div>
                  </div>
                  <div style={{ marginBottom: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <label className="label">Project Manager</label>
                      <PersonSelector
                        value={editProj.managerId}
                        onChange={(id) => setEditProj({ ...editProj, managerId: id })}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="label">Team Members</label>
                      <select
                        multiple
                        value={editProj.team}
                        onChange={(e) => {
                          const opts = Array.from(e.target.options);
                          const vals = opts.filter(o => o.selected).map(o => o.value);
                          setEditProj({ ...editProj, team: vals });
                        }}
                        className="input h-32"
                      >
                        {PERSONS.map(p => <option key={p.id} value={p.id}>{p.name} — {p.role}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={() => { setShowEditProject(false); setEditingProject(null); }} className="btn-secondary">Cancel</button>
                    <button
                      onClick={() => {
                        if (editProj) {
                          updateProject(editProj);
                          setShowEditProject(false);
                          setEditingProject(null);
                        }
                      }}
                      disabled={!editProj?.name.trim() || !editProj?.code.trim() || !editProj?.startDate || !editProj?.endDate}
                      className="btn-primary"
                    >Save Changes</button>
                  </div>
                </div>
              </div>
            )}

            {/* Project Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
              {filteredProjects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onClick={() => setSelectedId(p.id)}
                  onEdit={isHr ? () => {
                    setEditingProject(p);
                    setEditProj(p);
                    setShowEditProject(true);
                  } : undefined}
                />
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div style={{ textAlign: "center", padding: "80px 0", color: "#94a3b8" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🗂️</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#64748b" }}>No projects found</div>
                <div style={{ fontSize: 14 }}>Try a different filter or create a new project.</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


