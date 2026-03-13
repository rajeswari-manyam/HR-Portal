import React from "react";
import { Task, TaskStatus, ModalState } from "../types/task.types";
import { STATUS_CFG, STATUS_LIST } from "../components/constants/Task.constants";
import { ProgressBar, PriorityPill, StatusPill } from "../components/TaskUiComponent";

// ── Task Table (List View) ────────────────────────────────────────────────────
interface TaskTableProps {
  tasks: Task[];
  expanded: Set<string>;
  onToggleExpand: (id: string) => void;
  onStatusChange: (id: string, s: TaskStatus) => void;
  onSetModal: (m: ModalState) => void;
}
export function TaskTable({
  tasks,
  expanded,
  onToggleExpand,
  onStatusChange,
  onSetModal,
}: TaskTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {(
                [
                  ["Task",     true ],
                  ["Assignee", false],
                  ["Priority", false],
                  ["Due",      true ],
                  ["Progress", false],
                ] as [string, boolean][]
              ).map(([label, active]) => (
                <th key={label} className="px-4 py-3 text-left">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer select-none">
                    {label}
                    <svg
                      width={12} height={12} fill="none" viewBox="0 0 24 24"
                      stroke={active ? "#6366f1" : "#d1d5db"} strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 w-28" />
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {tasks.length === 0 && (
              <tr>
                <td colSpan={7} className="py-14 text-center text-gray-400">
                  <svg width={36} height={36} fill="none" viewBox="0 0 24 24" stroke="#e5e7eb" strokeWidth={1.5} className="mx-auto mb-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="font-semibold text-sm">No tasks match your filters</p>
                </td>
              </tr>
            )}

            {tasks.map((task) => {
              const sc = STATUS_CFG[task.status];
              const isExp = expanded.has(task.id);

              return (
                <React.Fragment key={task.id}>
                  <tr className="row-hover hover:bg-blue-50/20 transition-colors">
                    {/* Task cell */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => task.subtasks.length > 0 && onToggleExpand(task.id)}
                          className={`mt-0.5 w-4 h-4 flex items-center justify-center text-gray-300 shrink-0 transition-transform
                            ${isExp ? "rotate-90" : ""}
                            ${task.subtasks.length === 0 ? "opacity-0 pointer-events-none" : "hover:text-gray-500 cursor-pointer"}`}
                        >
                          <svg width={11} height={11} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <div className="cursor-pointer" onClick={() => onSetModal({ type: "view", task })}>
                          <p className="font-semibold text-gray-800 text-sm leading-snug">{task.title}</p>
                          {task.totalSubtasks > 0 && (
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {task.doneSubtasks}/{task.totalSubtasks} subtasks
                            </p>
                          )}
                          {task.tags.length > 0 && (
                            <div className="flex gap-1.5 flex-wrap mt-1.5">
                              {task.tags.map((tag) => (
                                <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[11px] font-medium rounded-full">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Assignee */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-8 h-8 rounded-full ${task.assigneeColor} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}>
                          {task.assigneeInitials}
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {task.assignee.split(" ")[0]}
                        </span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3.5">
                      <PriorityPill priority={task.priority} />
                    </td>

                    {/* Due */}
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-gray-500 tabular-nums">{task.due}</span>
                    </td>

                    {/* Progress */}
                    <td className="px-4 py-3.5 min-w-[160px]">
                      <ProgressBar value={task.progress} color={sc.barColor} />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <StatusPill
                        status={task.status}
                        onChange={(s) => onStatusChange(task.id, s)}
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="row-actions flex items-center gap-0.5 justify-end">
                        <button
                          onClick={() => onSetModal({ type: "view", task })}
                          title="View"
                          className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 transition-colors"
                        >
                          <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onSetModal({ type: "edit", task })}
                          title="Edit"
                          className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 transition-colors"
                        >
                          <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onSetModal({ type: "delete", task })}
                          title="Delete"
                          className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded subtask rows */}
                  {isExp &&
                    task.subtasks.map((st) => (
                      <tr key={st.id} className="bg-gray-50/60 border-b border-gray-50">
                        <td colSpan={7} className="px-4 py-2 pl-14">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${st.done ? "bg-indigo-500 border-indigo-500" : "bg-white border-gray-300"}`}>
                              {st.done && (
                                <svg width={9} height={9} viewBox="0 0 12 12" fill="none">
                                  <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                            <span className={`text-[13px] ${st.done ? "line-through text-gray-400" : "text-gray-600"}`}>
                              {st.title}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Task Kanban (Board View) ──────────────────────────────────────────────────
interface TaskKanbanProps {
  tasks: Task[];
  onSetModal: (m: ModalState) => void;
}
export function TaskKanban({ tasks, onSetModal }: TaskKanbanProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {STATUS_LIST.map((col) => {
        const cfg = STATUS_CFG[col];
        const colTasks = tasks.filter((t) => t.status === col);

        return (
          <div key={col} className={`rounded-2xl border p-3 ${cfg.bgCard} ${cfg.borderCard}`}>
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                {cfg.icon}
                <h3 className={`text-sm font-bold ${cfg.labelColor}`}>{col}</h3>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white border ${cfg.borderCard} ${cfg.numColor}`}>
                {colTasks.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {colTasks.length === 0 && (
                <div className="py-6 text-center text-xs text-gray-300">No tasks</div>
              )}
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onSetModal({ type: "view", task })}
                  className="bg-white rounded-xl border border-gray-100 p-3.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <PriorityPill priority={task.priority} />
                    <span className={`w-7 h-7 rounded-full ${task.assigneeColor} flex items-center justify-center text-white text-[10px] font-bold`}>
                      {task.assigneeInitials}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 mb-2 leading-snug">{task.title}</p>
                  <div className="flex flex-wrap gap-1 mb-2.5">
                    {task.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-medium rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <ProgressBar value={task.progress} color={cfg.barColor} />
                  {task.totalSubtasks > 0 && (
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      {task.doneSubtasks}/{task.totalSubtasks} subtasks
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}