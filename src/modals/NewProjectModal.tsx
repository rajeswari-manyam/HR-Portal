import { useState } from "react";
import type { Project, Status, Priority } from "../types/Project.types";
import { ALL_STATUSES, ALL_PRIORITIES, inputCls } from "../components/constants/Project.constants";
import { Overlay } from "../components/ProjectUi";
import { IClose, IPlus } from "../components/icons";

export const NewProjectModal = ({
  onClose, onCreate,
}: {
  onClose:  () => void;
  onCreate: (p: Project) => void;
}) => {
  const [form, setForm] = useState({
    name: "", client: "", description: "",
    status:   "Planning" as Status,
    priority: "Medium"  as Priority,
    startDate: "", endDate: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setF = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleCreate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())   e.name      = "Required";
    if (!form.client.trim()) e.client    = "Required";
    if (!form.startDate)     e.startDate = "Required";
    if (!form.endDate)       e.endDate   = "Required";
    if (Object.keys(e).length) { setErrors(e); return; }
    onCreate({
      ...form,
      id:               `PROJ-${String(Date.now()).slice(-4)}`,
      manager:          "Unassigned",
      managerInitials:  "--",
      managerColor:     "bg-gray-400",
      budget:           0,
      spent:            0,
      progress:         0,
      team:             [],
    });
  };

  return (
    <Overlay onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg mx-auto overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><IPlus /></div>
          <h2 className="text-base font-semibold text-gray-900">New Project</h2>
          <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <IClose />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Project Name <span className="text-red-500">*</span></label>
              <input value={form.name} onChange={e => setF("name", e.target.value)} className={inputCls(errors.name)} placeholder="e.g. Dashboard Redesign" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Client <span className="text-red-500">*</span></label>
              <input value={form.client} onChange={e => setF("client", e.target.value)} className={inputCls(errors.client)} placeholder="e.g. Acme Corp" />
              {errors.client && <p className="text-xs text-red-500 mt-1">{errors.client}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Description</label>
            <textarea value={form.description} onChange={e => setF("description", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none resize-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
              rows={2} placeholder="Brief project overview..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Start Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.startDate} onChange={e => setF("startDate", e.target.value)} className={inputCls(errors.startDate)} />
              {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">End Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.endDate} onChange={e => setF("endDate", e.target.value)} className={inputCls(errors.endDate)} />
              {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Status</label>
              <select value={form.status} onChange={e => setF("status", e.target.value as Status)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors">
                {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Priority</label>
              <select value={form.priority} onChange={e => setF("priority", e.target.value as Priority)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors">
                {ALL_PRIORITIES.map(pr => <option key={pr} value={pr}>{pr}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose}      className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleCreate} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">Create Project</button>
        </div>
      </div>
    </Overlay>
  );
};
