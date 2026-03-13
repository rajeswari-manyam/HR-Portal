import { useState } from "react";
import type { Project } from "../types/Project.types";
import { PROGRESS_COLOR } from "../components/constants/Project.constants";
import { StatusBadge, PriorityBadge, Overlay } from "../components/ProjectUi";
import { IClose, ICalendar, IDollar, IActivity, IUsers, IPencil } from "../components/icons";

export const ViewModal = ({
  p, onClose, onEdit,
}: {
  p: Project;
  onClose: () => void;
  onEdit:  () => void;
}) => {
  const [tab, setTab] = useState<"overview" | "team" | "activity">("overview");
  const daysLeft = Math.max(
    0,
    Math.round((new Date(p.endDate).getTime() - Date.now()) / 86_400_000),
  );

  const stats = [
    { icon: <IUsers />,    val: String(p.team.length),            label: "TEAM SIZE", bg: "bg-blue-50"   },
    { icon: <ICalendar />, val: `${daysLeft}d`,                    label: "DAYS LEFT", bg: "bg-green-50"  },
    { icon: <IDollar />,   val: `$${Math.round(p.budget / 1000)}k`, label: "BUDGET",   bg: "bg-purple-50" },
    { icon: <IActivity />, val: `$${Math.round(p.spent  / 1000)}k`, label: "SPENT",    bg: "bg-yellow-50" },
  ];

  return (
    <Overlay onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl mx-auto overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{p.id}</span>
              <StatusBadge status={p.status} />
              <PriorityBadge priority={p.priority} />
            </div>
            <div className="flex items-center gap-1">
              <button onClick={onEdit} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                <IPencil /> Edit
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <IClose />
              </button>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{p.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">🏢 {p.client}</p>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex justify-between mb-1.5">
              <span className="text-sm text-gray-500 font-medium">Overall Progress</span>
              <span className="text-sm font-bold text-gray-800">{p.progress}%</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full ${PROGRESS_COLOR[p.status]}`} style={{ width: `${p.progress}%` }} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-gray-100">
          <div className="flex gap-6">
            {(["overview", "team", "activity"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[380px] overflow-y-auto">

          {tab === "overview" && (
            <div className="space-y-5">
              {/* Stat cards */}
              <div className="grid grid-cols-4 gap-3">
                {stats.map(({ icon, val, label, bg }) => (
                  <div key={label} className={`${bg} rounded-xl p-3`}>
                    <div className="text-gray-500 mb-1">{icon}</div>
                    <div className="text-xl font-bold text-gray-800">{val}</div>
                    <div className="text-[10px] text-gray-500 font-semibold tracking-wide mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              {p.description && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 tracking-widest uppercase mb-1.5">Description</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{p.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 tracking-widest uppercase mb-2">Project Manager</p>
                  <div className="flex items-center gap-2">
                    <span className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold ${p.managerColor}`}>{p.managerInitials}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{p.manager}</p>
                      <p className="text-xs text-gray-400">Manager</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 tracking-widest uppercase mb-2">Timeline</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Start</span><span className="font-medium text-gray-800">{p.startDate}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">End</span>  <span className="font-medium text-gray-800">{p.endDate}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "team" && (
            <div className="space-y-2">
              {p.team.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No team members assigned</p>}
              {p.team.map((m, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold ${m.color}`}>{m.initials}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{m.name}</p>
                      <p className="text-xs text-gray-400">Team Member</p>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                </div>
              ))}
            </div>
          )}

          {tab === "activity" && (
            <div className="space-y-4">
              {[
                { text: `Progress updated to ${p.progress}%`, time: "2 hours ago", dot: "bg-blue-500"   },
                { text: `Status changed to ${p.status}`,       time: "1 day ago",   dot: "bg-green-500"  },
                { text: "Project created",                     time: p.startDate,   dot: "bg-purple-500" },
              ].map((a, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.dot}`} />
                  <div>
                    <p className="text-sm text-gray-700">{a.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
};
