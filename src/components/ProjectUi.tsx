import type { Status, Priority, Project, TeamMember } from "../types/Project.types";
import { STATUS_CFG, PRIORITY_CFG, PROGRESS_COLOR } from "../components/constants/Project.constants";
import { IEye, IEdit, ITrash } from "./icons";

// ── Badges ────────────────────────────────────────────────────────────────────
export const StatusBadge = ({ status }: { status: Status }) => {
  const c = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} /> {status}
    </span>
  );
};

export const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const c = PRIORITY_CFG[priority];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>
      {priority}
    </span>
  );
};

// ── Action button ─────────────────────────────────────────────────────────────
export const ActionBtn = ({
  onClick, title, className = "", children,
}: {
  onClick: () => void;
  title: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded transition-colors text-gray-400 hover:bg-gray-100 hover:text-gray-600 ${className}`}
  >
    {children}
  </button>
);

// ── Overlay backdrop ──────────────────────────────────────────────────────────
export const Overlay = ({
  children, onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
    <div className="relative z-10 w-full" onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

// ── Project Grid Card ─────────────────────────────────────────────────────────
export const ProjectCard = ({
  p, onEdit, onDelete, onView, onAssign,
}: {
  p: Project;
  onEdit:   (p: Project) => void;
  onDelete: (p: Project) => void;
  onView:   (p: Project) => void;
  onAssign: (p: Project) => void;
}) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex flex-col gap-3">
    <div className="flex items-start justify-between">
      <div>
        <div className="font-semibold text-gray-800 text-sm">{p.name}</div>
        <div className="text-xs text-gray-400 mt-0.5">{p.id}</div>
      </div>
      <PriorityBadge priority={p.priority} />
    </div>

    <div className="text-xs text-gray-500">
      Client: <span className="text-gray-700 font-medium">{p.client}</span>
    </div>

    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] ${p.managerColor}`}>
        {p.managerInitials}
      </span>
      {p.manager}
    </div>

    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${PROGRESS_COLOR[p.status]}`} style={{ width: `${p.progress}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-500 w-8 text-right">{p.progress}%</span>
    </div>

    <div className="flex items-center justify-between">
      <StatusBadge status={p.status} />
      <div className="flex items-center -space-x-1.5">
        {p.team.slice(0, 3).map((m, i) => (
          <span key={i} className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] ${m.color}`}>
            {m.initials}
          </span>
        ))}
        {p.extraTeam && (
          <span className="w-6 h-6 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-white text-[10px]">
            +{p.extraTeam}
          </span>
        )}
      </div>
    </div>

    <div className="flex items-center gap-1 pt-1 border-t border-gray-100">
      <button onClick={() => onView(p)}   className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"><IEye /> View</button>
      <button onClick={() => onEdit(p)}   className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"><IEdit /> Edit</button>
      <button onClick={() => onDelete(p)} className="flex items-center gap-1 px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded transition-colors"><ITrash /> Delete</button>
    </div>
  </div>
);
