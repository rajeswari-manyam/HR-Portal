import React, { useState } from "react";
import { Task, TaskStatus, Priority } from "../types/task.types";
import { STATUS_CFG, PRIORITY_CFG, STATUS_LIST, PRIORITY_LIST, MEMBERS } from "../components/constants/Task.constants";
import { ProgressBar, FieldLabel, ModalInput, ModalSelect } from "../components/TaskUiComponent";

// ── View Drawer ───────────────────────────────────────────────────────────────
interface ViewDrawerProps {
  task: Task;
  onClose: () => void;
  onEdit: () => void;
}
export function ViewDrawer({ task, onClose, onEdit }: ViewDrawerProps) {
  const sc = STATUS_CFG[task.status];
  const pc = PRIORITY_CFG[task.priority];
  const doneSubs = task.subtasks.filter((s) => s.done).length;

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />

      {/* Panel */}
      <div
        className="w-[460px] bg-white h-full shadow-2xl flex flex-col overflow-y-auto"
        style={{ animation: "slideInRight .22s ease" }}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${sc.pillBg} ${sc.pillText} ${sc.pillBorder}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dotColor}`} />
                {task.status}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${pc.bg} ${pc.text} ${pc.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
                {task.priority}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="px-4 py-1.5 border border-indigo-200 rounded-lg text-indigo-600 text-xs font-semibold hover:bg-indigo-50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 text-lg leading-none"
              >
                ×
              </button>
            </div>
          </div>
          <h2 className="text-xl font-black text-gray-900 leading-snug">{task.title}</h2>
          {task.description && (
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">{task.description}</p>
          )}
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                {
                  label: "Assignee",
                  node: (
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-7 h-7 rounded-full ${task.assigneeColor} flex items-center justify-center text-white text-[11px] font-bold`}>
                        {task.assigneeInitials}
                      </span>
                      <span className="text-sm font-semibold text-gray-800">{task.assignee}</span>
                    </div>
                  ),
                },
                { label: "Due Date", node: <p className="text-sm font-semibold text-gray-800 mt-1">{task.due}</p> },
                { label: "Created",  node: <p className="text-sm text-gray-600 mt-1">{task.createdAt}</p> },
                { label: "ID",       node: <p className="text-sm font-mono text-gray-500 mt-1">{task.id}</p> },
              ] as { label: string; node: JSX.Element }[]
            ).map(({ label, node }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                {node}
              </div>
            ))}
          </div>

          {/* Progress */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Progress</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${task.progress}%`, backgroundColor: sc.barColor }} />
              </div>
              <span className="text-sm font-black text-gray-700 tabular-nums w-12 text-right">
                {task.progress}%
              </span>
            </div>
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((t) => (
                  <span key={t} className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-lg shadow-sm">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Subtasks */}
          {task.totalSubtasks > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Subtasks</p>
                <span className="text-xs font-bold text-indigo-500">{doneSubs}/{task.totalSubtasks}</span>
              </div>
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${task.totalSubtasks ? (doneSubs / task.totalSubtasks) * 100 : 0}%` }}
                />
              </div>
              <div className="flex flex-col gap-2">
                {task.subtasks.map((st) => (
                  <div key={st.id} className="flex items-center gap-2.5 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border-2 shrink-0 ${st.done ? "bg-indigo-500 border-indigo-500" : "bg-white border-gray-300"}`}>
                      {st.done && (
                        <svg width={10} height={10} viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${st.done ? "line-through text-gray-400" : "text-gray-700"}`}>
                      {st.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Edit Task Modal ───────────────────────────────────────────────────────────
interface EditTaskModalProps {
  task: Task;
  onClose: () => void;
  onSave: (t: Task) => void;
}
export function EditTaskModal({ task, onClose, onSave }: EditTaskModalProps) {
  const [form, setForm] = useState({
    title:       task.title,
    description: task.description,
    status:      task.status   as TaskStatus,
    priority:    task.priority as Priority,
    assignee:    task.assignee,
    due:         task.due,
    progress:    task.progress,
    tags:        task.tags.join(", "),
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    const member = MEMBERS.find((m) => m.name === form.assignee) ?? MEMBERS[0];
    onSave({
      ...task,
      ...form,
      assigneeInitials: member.initials,
      assigneeColor:    member.color,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
  };

  const sc = STATUS_CFG[form.status];
  const pc = PRIORITY_CFG[form.priority];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div
        className="bg-white w-full max-w-[580px] max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ animation: "zoomIn .2s ease" }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 shrink-0 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-black text-gray-900">Edit Task</h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{task.id}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 text-lg leading-none">×</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {/* Title */}
          <div>
            <FieldLabel>Title</FieldLabel>
            <ModalInput value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>

          {/* Description */}
          <div>
            <FieldLabel>Description</FieldLabel>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-y min-h-[90px]"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Status</FieldLabel>
              <ModalSelect value={form.status} onChange={(v) => set("status", v as TaskStatus)}
                options={STATUS_LIST.map((s) => ({ label: s, value: s }))} />
            </div>
            <div>
              <FieldLabel>Priority</FieldLabel>
              <ModalSelect value={form.priority} onChange={(v) => set("priority", v as Priority)}
                options={PRIORITY_LIST.map((p) => ({ label: p, value: p }))} />
            </div>
          </div>

          {/* Assignee + Due */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Assignee</FieldLabel>
              <ModalSelect value={form.assignee} onChange={(v) => set("assignee", v)}
                options={MEMBERS.map((m) => ({ label: m.name, value: m.name }))} />
            </div>
            <div>
              <FieldLabel>Due Date</FieldLabel>
              <input type="date" value={form.due} onChange={(e) => set("due", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
            </div>
          </div>

          {/* Progress */}
          <div>
            <FieldLabel>Progress: {form.progress}%</FieldLabel>
            <input type="range" min="0" max="100" value={form.progress}
              onChange={(e) => set("progress", Number(e.target.value))}
              className="w-full accent-indigo-500" />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>0%</span><span>50%</span><span>100%</span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <FieldLabel>Tags</FieldLabel>
            <ModalInput value={form.tags} onChange={(e) => set("tags", e.target.value)}
              placeholder="Frontend, Backend, API (comma separated)" />
            {form.tags && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
                  <span key={t} className="px-2.5 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 text-xs font-medium rounded-full">{t}</span>
                ))}
              </div>
            )}
          </div>

          {/* Live Preview */}
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-4 bg-gray-50">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Live Preview</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${sc.pillBg} ${sc.pillText} ${sc.pillBorder}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dotColor}`} />{form.status}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${pc.bg} ${pc.text} ${pc.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />{form.priority}
              </span>
              <div className="flex-1 min-w-[120px]">
                <ProgressBar value={form.progress} color={sc.barColor} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// ── Add Task Modal ────────────────────────────────────────────────────────────
let _nid = 10;

interface AddTaskModalProps {
  onClose: () => void;
  onSave: (t: Task) => void;
}
export function AddTaskModal({ onClose, onSave }: AddTaskModalProps) {
  const [form, setForm] = useState({
    title:        "",
    description:  "",
    status:       "To Do"        as TaskStatus,
    priority:     "Medium"       as Priority,
    assignee:     "Priya Sharma",
    due:          "",
    tags:         "",
    subtaskInput: "",
    subtasks:     [] as { id: string; title: string; done: boolean }[],
  });
  const [errors, setErrors] = useState<{ title?: string }>({});

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const addSubtask = () => {
    if (!form.subtaskInput.trim()) return;
    set("subtasks", [
      ...form.subtasks,
      { id: "ns" + Date.now(), title: form.subtaskInput.trim(), done: false },
    ]);
    set("subtaskInput", "");
  };

  const handleCreate = () => {
    if (!form.title.trim()) { setErrors({ title: "Task title is required" }); return; }
    const member = MEMBERS.find((m) => m.name === form.assignee) ?? MEMBERS[0];
    onSave({
      id:               `t${++_nid}`,
      title:            form.title.trim(),
      description:      form.description.trim(),
      status:           form.status,
      priority:         form.priority,
      assignee:         form.assignee,
      assigneeInitials: member.initials,
      assigneeColor:    member.color,
      due:              form.due || "—",
      progress:         0,
      subtasks:         form.subtasks,
      totalSubtasks:    form.subtasks.length,
      doneSubtasks:     0,
      tags:             form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      createdAt:        new Date().toISOString().split("T")[0],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div
        className="bg-white w-full max-w-[580px] max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ animation: "zoomIn .2s ease" }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 shrink-0 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-black text-gray-900">Add New Task</h2>
            <p className="text-xs text-gray-400 mt-0.5">Fill in the details below</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 text-lg leading-none">×</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {/* Title */}
          <div>
            <FieldLabel>Task Title *</FieldLabel>
            <ModalInput
              value={form.title}
              onChange={(e) => { set("title", e.target.value); setErrors({}); }}
              placeholder="e.g. Refactor card components"
              className={errors.title ? "border-red-400" : ""}
            />
            {errors.title && <p className="mt-1 text-xs text-red-500 font-medium">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <FieldLabel>Description</FieldLabel>
            <textarea rows={3} value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the task in detail..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-y min-h-[90px]" />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Status</FieldLabel>
              <ModalSelect value={form.status} onChange={(v) => set("status", v as TaskStatus)}
                options={STATUS_LIST.map((s) => ({ label: s, value: s }))} />
            </div>
            <div>
              <FieldLabel>Priority</FieldLabel>
              <ModalSelect value={form.priority} onChange={(v) => set("priority", v as Priority)}
                options={PRIORITY_LIST.map((p) => ({ label: p, value: p }))} />
            </div>
          </div>

          {/* Assignee + Due */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Assignee</FieldLabel>
              <ModalSelect value={form.assignee} onChange={(v) => set("assignee", v)}
                options={MEMBERS.map((m) => ({ label: m.name, value: m.name }))} />
            </div>
            <div>
              <FieldLabel>Due Date</FieldLabel>
              <input type="date" value={form.due} onChange={(e) => set("due", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
            </div>
          </div>

          {/* Tags */}
          <div>
            <FieldLabel>Tags</FieldLabel>
            <ModalInput value={form.tags} onChange={(e) => set("tags", e.target.value)}
              placeholder="Frontend, Backend, API (comma separated)" />
            {form.tags && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
                  <span key={t} className="px-2.5 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 text-xs font-medium rounded-full">{t}</span>
                ))}
              </div>
            )}
          </div>

          {/* Subtasks */}
          <div>
            <FieldLabel>Subtasks</FieldLabel>
            <div className="flex gap-2 mb-2">
              <ModalInput
                value={form.subtaskInput}
                onChange={(e) => set("subtaskInput", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                placeholder="Add a subtask..."
                className="flex-1"
              />
              <button onClick={addSubtask}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shrink-0">
                Add
              </button>
            </div>
            {form.subtasks.map((st) => (
              <div key={st.id} className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 rounded-lg mb-1.5 border border-gray-100">
                <div className="w-4 h-4 rounded border-2 border-gray-300 bg-white shrink-0" />
                <span className="flex-1 text-sm text-gray-600">{st.title}</span>
                <button onClick={() => set("subtasks", form.subtasks.filter((s) => s.id !== st.id))}
                  className="text-gray-400 hover:text-red-400 text-base leading-none">×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleCreate} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm">Create Task</button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm ────────────────────────────────────────────────────────────
interface DeleteConfirmProps {
  taskTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}
export function DeleteConfirm({ taskTitle, onConfirm, onCancel }: DeleteConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-[400px] rounded-2xl shadow-2xl p-6" style={{ animation: "zoomIn .2s ease" }}>
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-center font-black text-gray-900 text-lg mb-1">Delete Task?</h3>
        <p className="text-center text-sm text-gray-500 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-700">"{taskTitle}"</span>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}