import { useState } from "react";
import type { Project, Status, Priority } from "../types/Project.types";
import { ALL_STATUSES, ALL_PRIORITIES, inputCls } from "../components/constants/Project.constants";
import { Overlay } from "../components/ProjectUi";
import { IClose, IPencil } from "../components/icons";

type EditForm = {
  name: string; client: string; description: string;
  status: Status; priority: Priority; progress: number;
  startDate: string; endDate: string; budget: number;
};

export const EditModal = ({
  p, onClose, onSave,
}: {
  p: Project;
  onClose: () => void;
  onSave:  (d: Partial<Project>) => void;
}) => {
  const [tab, setTab] = useState<"details" | "timeline" | "team">("details");
  const [form, setForm] = useState<EditForm>({
    name: p.name, client: p.client, description: p.description,
    status: p.status, priority: p.priority, progress: p.progress,
    startDate: p.startDate, endDate: p.endDate, budget: p.budget,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EditForm, string>>>({});
  const [saved,  setSaved]  = useState(false);

  const setF = <K extends keyof EditForm>(k: K, v: EditForm[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    const e: typeof errors = {};
    if (!form.name.trim())   e.name   = "Required";
    if (!form.client.trim()) e.client = "Required";
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Overlay onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl mx-auto overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><IPencil /></div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Edit Project</h2>
            <p className="text-xs text-gray-400">{p.name} · <span className="font-mono">{p.id}</span></p>
          </div>
          <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <IClose />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-gray-100">
          <div className="flex gap-5">
            {(["details", "timeline", "team"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                {t === "timeline" ? "Timeline & Budget" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[380px] overflow-y-auto">

          {tab === "details" && (
            <>
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
                  rows={3} placeholder="Project description..." />
              </div>

              <div className="grid grid-cols-3 gap-4">
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
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Progress %</label>
                  <input type="number" min={0} max={100} value={form.progress}
                    onChange={e => setF("progress", Math.min(100, Math.max(0, Number(e.target.value))))}
                    className={inputCls()} />
                  <input type="range" min={0} max={100} value={form.progress}
                    onChange={e => setF("progress", Number(e.target.value))}
                    className="w-full mt-1.5 accent-blue-600" />
                </div>
              </div>
            </>
          )}

          {tab === "timeline" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setF("startDate", e.target.value)} className={inputCls()} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">End Date</label>
                  <input type="date" value={form.endDate} onChange={e => setF("endDate", e.target.value)} className={inputCls()} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Budget ($)</label>
                <input type="number" value={form.budget} onChange={e => setF("budget", Number(e.target.value))} className={inputCls()} placeholder="120000" />
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">Timeline Preview</p>
                <div className="bg-gray-200 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: `${form.progress}%` }} />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>{form.startDate || "—"}</span>
                  <span>{form.endDate   || "—"}</span>
                </div>
              </div>
            </div>
          )}

          {tab === "team" && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 mb-3">Current team members. Use "Assign" from the table to manage team.</p>
              {p.team.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No team members assigned yet</p>}
              {p.team.map((m, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-lg">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${m.color}`}>{m.initials}</span>
                  <span className="text-sm font-medium text-gray-700">{m.name}</span>
                  <span className="ml-auto text-xs text-gray-400">Team Member</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{p.id}</span>
            {saved && <span className="text-green-500 font-medium">Last saved: just now</span>}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose}    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">Save Changes</button>
          </div>
        </div>
      </div>
    </Overlay>
  );
};
