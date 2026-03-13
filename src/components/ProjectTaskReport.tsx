import { useState } from 'react';
import { X, CheckCircle, Clock, AlertCircle, BarChart2, Calendar, MessageSquare } from 'lucide-react';
import { Task } from '../context/TaskContext';

interface Props {
  projectId: string;
  projectName: string;
  tasks: Task[];
  onClose: () => void;
}

type DateFilter = 'all' | 'today' | 'week' | 'month';

function toYMD(d: Date) { return d.toISOString().slice(0, 10); }

function getDateRange(filter: DateFilter): { from: string; to: string } | null {
  const today = new Date();
  if (filter === 'today') return { from: toYMD(today), to: toYMD(today) };
  if (filter === 'week') {
    const from = new Date(today); from.setDate(today.getDate() - 6);
    return { from: toYMD(from), to: toYMD(today) };
  }
  if (filter === 'month') {
    const from = new Date(today); from.setDate(today.getDate() - 29);
    return { from: toYMD(from), to: toYMD(today) };
  }
  return null;
}

const STATUS_CFG: Record<Task['status'], { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
  'Completed':   { label: 'Completed',   bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: <CheckCircle size={14} className="text-emerald-500" /> },
  'In Progress': { label: 'In Progress', bg: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-200',     icon: <Clock size={14} className="text-sky-500" /> },
  'Review':      { label: 'Review',      bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200',  icon: <BarChart2 size={14} className="text-violet-500" /> },
  'To Do':       { label: 'To Do',       bg: 'bg-gray-50',    text: 'text-gray-600',    border: 'border-gray-200',    icon: <AlertCircle size={14} className="text-gray-400" /> },
};

export function ProjectTaskReport({ projectId, projectName, tasks, onClose }: Props) {
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [statusFilter, setStatusFilter] = useState<Task['status'] | 'All'>('All');

  const projectTasks = tasks.filter(t => t.projectId === projectId);

  // Apply date filter based on createdAt
  const range = getDateRange(dateFilter);
  const filtered = projectTasks.filter(t => {
    const matchDate = !range || (t.createdAt >= range.from && t.createdAt <= range.to);
    const matchStatus = statusFilter === 'All' || t.status === statusFilter;
    return matchDate && matchStatus;
  });

  // Stats
  const stats = {
    total:      projectTasks.length,
    completed:  projectTasks.filter(t => t.status === 'Completed').length,
    inProgress: projectTasks.filter(t => t.status === 'In Progress').length,
    review:     projectTasks.filter(t => t.status === 'Review').length,
    toDo:       projectTasks.filter(t => t.status === 'To Do').length,
    withReason: projectTasks.filter(t => t.incompleteReason).length,
  };

  const completionPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col overflow-hidden animate-[zoomIn_.2s_ease]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-black text-gray-900 text-base">{projectName}</h2>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <BarChart2 size={11} /> Task Report · {projectTasks.length} total tasks
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50">
            <X size={14} />
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-5 gap-3 px-6 py-4 bg-gray-50 border-b border-gray-100">
          {[
            { label: 'Total',       value: stats.total,      color: 'text-gray-800'    },
            { label: 'Completed',   value: stats.completed,  color: 'text-emerald-600' },
            { label: 'In Progress', value: stats.inProgress, color: 'text-sky-600'     },
            { label: 'Review',      value: stats.review,     color: 'text-violet-600'  },
            { label: 'To Do',       value: stats.toDo,       color: 'text-gray-500'    },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-gray-500">Overall Completion</span>
            <span className="text-xs font-black text-emerald-600">{completionPct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${completionPct}%` }} />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 flex-wrap">
          {/* Date filter */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {(['all', 'today', 'week', 'month'] as DateFilter[]).map(f => (
              <button key={f} onClick={() => setDateFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${dateFilter === f ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
                {f === 'all' ? 'All Time' : f === 'week' ? 'Last 7d' : f === 'month' ? 'Last 30d' : 'Today'}
              </button>
            ))}
          </div>
          {/* Status filter */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {(['All', 'Completed', 'In Progress', 'Review', 'To Do'] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${statusFilter === s ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
                {s}
              </button>
            ))}
          </div>
          <span className="ml-auto text-xs font-semibold text-gray-400">{filtered.length} tasks</span>
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-300">
              <BarChart2 size={32} className="mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-400">No tasks for this filter</p>
            </div>
          ) : (
            filtered.map(task => {
              const scfg = STATUS_CFG[task.status];
              return (
                <div key={task.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{scfg.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-gray-800 text-sm">{task.title}</p>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border ${scfg.bg} ${scfg.text} ${scfg.border}`}>
                          {scfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>

                      {/* Meta row */}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <span className={`w-5 h-5 rounded-full ${task.assigneeColor} text-white text-[9px] font-bold flex items-center justify-center`}>
                            {task.assigneeInitials}
                          </span>
                          <span className="text-xs text-gray-500">{task.assignee}</span>
                        </div>
                        {task.due && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar size={10} />
                            <span>Due: {task.due}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${task.progress}%` }} />
                          </div>
                          <span className="text-[10px] text-gray-400">{task.progress}%</span>
                        </div>
                        {task.createdAt && (
                          <span className="text-[10px] text-gray-300">Created: {task.createdAt}</span>
                        )}
                      </div>

                      {/* Incomplete reason */}
                      {task.incompleteReason && (
                        <div className="mt-2.5 flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg">
                          <MessageSquare size={12} className="text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-0.5">
                              Incomplete Reason {task.reasonDate && `· ${task.reasonDate}`}
                            </p>
                            <p className="text-xs text-amber-800">{task.incompleteReason}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}