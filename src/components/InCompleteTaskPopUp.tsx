import { useState, useEffect } from 'react';
import { AlertTriangle, X, Send } from 'lucide-react';
import { Task } from '../context/TaskContext';

interface Props {
  tasks: Task[];
  onSubmit: (id: string, reason: string) => void;
}

export function IncompleteTaskPopup({ tasks, onSubmit }: Props) {
  const today = new Date().toISOString().slice(0, 10);

  // Only overdue tasks that haven't been completed and don't have a reason yet
  const overdue = tasks.filter(t =>
    t.due &&
    t.due < today &&
    t.status !== 'Completed' &&
    !t.incompleteReason
  );

  const [current, setCurrent] = useState(0);
  const [reason, setReason] = useState('');
  const [visible, setVisible] = useState(true);
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());

  useEffect(() => {
    setVisible(overdue.length > 0);
    setCurrent(0);
  }, [overdue.length]);

  if (!visible || overdue.length === 0) return null;

  const task = overdue[current];
  if (!task) return null;

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onSubmit(task.id, reason);
    setSubmitted(prev => new Set([...prev, task.id]));
    setReason('');
    if (current < overdue.length - 1) {
      setCurrent(c => c + 1);
    } else {
      setVisible(false);
    }
  };

  const handleSkip = () => {
    if (current < overdue.length - 1) {
      setCurrent(c => c + 1);
    } else {
      setVisible(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-[zoomIn_.2s_ease]">
        {/* Header */}
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle size={18} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-amber-900 text-sm">Incomplete Task Report</p>
            <p className="text-xs text-amber-600 mt-0.5">
              {overdue.length} overdue task{overdue.length !== 1 ? 's' : ''} need your attention
            </p>
          </div>
          {overdue.length > 1 && (
            <span className="text-xs font-bold text-amber-500 bg-amber-100 px-2 py-1 rounded-full">
              {current + 1} / {overdue.length}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Task info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="font-semibold text-gray-800 text-sm">{task.title}</p>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
            <div className="flex items-center gap-3 mt-2.5">
              <span className="text-xs text-red-500 font-semibold">Due: {task.due}</span>
              <span className="text-xs text-gray-400">·</span>
              <span className={`w-5 h-5 rounded-full ${task.assigneeColor} text-white text-[9px] font-bold flex items-center justify-center`}>
                {task.assigneeInitials}
              </span>
              <span className="text-xs text-gray-500">{task.assignee}</span>
            </div>
          </div>

          {/* Reason input */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Why wasn't this completed? *
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Blocked by dependencies, waiting for review, scope changed..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all placeholder-gray-300"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleSkip}
            className="px-3 py-2 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason.trim()}
            className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 disabled:opacity-40 transition-colors"
          >
            <Send size={13} />
            Submit Reason
          </button>
        </div>
      </div>
    </div>
  );
}