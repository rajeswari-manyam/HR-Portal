import { useState } from "react";
import SearchInput from "../../components/shared/SearchInput";
import Table from "../../components/shared/Table";

import type { Project, TeamMember, Status } from "../../types/Project.types";
import { STATUS_CFG, ALL_STATUSES, PROGRESS_COLOR } from "../../components/constants/Project.constants";
import { useProjects } from "../../components/hooks/UseProject";
import { useTaskContext } from "../../context/TaskContext";

import { StatusBadge, PriorityBadge, ActionBtn, ProjectCard } from "../../components/ProjectUi";
import { IUserPlus, IEye, IEdit, ITrash, IDownload, IPlus, IList, IGrid } from "../../components/icons";

import { ViewModal } from "../../modals/ViewModal";
import { EditModal } from "../../modals/EditModal";
import { DeleteModal } from "../../modals/DeleteModal";
import { AssignModal } from "../../modals/AssignModal";
import { NewProjectModal } from "../../modals/NewProjectModal";
import { ProjectTaskReport } from "../../components/ProjectTaskReport";

type ModalType = "none" | "new" | "view" | "edit" | "delete" | "assign" | "taskReport";

export default function ProjectManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(1);

  const [activeModal, setActiveModal] = useState<ModalType>("none");
  const [selected, setSelected] = useState<Project | null>(null);

  const { projects, filtered, activeCount, statusCounts, create, update, remove, assign } =
    useProjects(search, statusFilter);

  const { tasks } = useTaskContext();

  const open = (modal: ModalType, p?: Project) => { if (p) setSelected(p); setActiveModal(modal); };
  const close = () => setActiveModal("none");

  const handleCreate = (p: Project) => { create(p); close(); };
  const handleEdit = (data: Partial<Project>) => { if (selected) update(selected.id, data); close(); };
  const handleDelete = () => { if (selected) remove(selected.id); close(); };
  const handleAssign = (team: TeamMember[]) => { if (selected) assign(selected.id, team); close(); };

  // Count tasks per project for the table
  const taskCount = (projectId: string) => tasks.filter(t => t.projectId === projectId).length;
  const incompleteCount = (projectId: string) =>
    tasks.filter(t => t.projectId === projectId && t.status !== 'Completed').length;

  const columns = [
    {
      header: "PROJECT",
      render: (p: Project) => (
        <div>
          <div className="font-semibold text-gray-800 text-sm">{p.name}</div>
          <div className="text-xs text-gray-400 mt-0.5">{p.id}</div>
          <div className="mt-1.5"><PriorityBadge priority={p.priority} /></div>
        </div>
      ),
    },
    { header: "CLIENT", render: (p: Project) => <span className="text-sm text-gray-600">{p.client}</span> },
    {
      header: "MANAGER",
      render: (p: Project) => (
        <div className="flex items-center gap-2">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0 ${p.managerColor}`}>{p.managerInitials}</span>
          <span className="text-sm text-gray-700">{p.manager}</span>
        </div>
      ),
    },
    {
      header: "DATES",
      render: (p: Project) => (
        <div className="text-xs text-gray-500 leading-relaxed">
          {p.startDate}<br /><span className="text-gray-300">→</span> {p.endDate}
        </div>
      ),
    },
    { header: "STATUS", render: (p: Project) => <StatusBadge status={p.status} /> },
    {
      header: "PROGRESS",
      render: (p: Project) => (
        <div className="flex items-center gap-2 min-w-[110px]">
          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full ${PROGRESS_COLOR[p.status]}`} style={{ width: `${p.progress}%` }} />
          </div>
          <span className="text-xs font-medium text-gray-500 w-8 text-right">{p.progress}%</span>
        </div>
      ),
    },
    {
      header: "TASKS",
      render: (p: Project) => {
        const total = taskCount(p.id);
        const incomplete = incompleteCount(p.id);
        return (
          <div className="text-xs">
            <span className="font-semibold text-gray-700">{total}</span>
            <span className="text-gray-400"> total</span>
            {incomplete > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold">
                {incomplete} open
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "TEAM",
      render: (p: Project) => (
        <div className="flex items-center -space-x-1.5">
          {p.team.map((m, i) => (
            <span key={i} className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-xs ${m.color}`}>{m.initials}</span>
          ))}
          {p.extraTeam && (
            <span className="w-7 h-7 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-white text-xs">+{p.extraTeam}</span>
          )}
        </div>
      ),
    },
    {
      header: "ACTIONS",
      render: (p: Project) => (
        <div className="flex items-center gap-0.5">
          <ActionBtn title="Task Report" onClick={() => open("taskReport", p)}
            className="hover:text-indigo-600 hover:bg-indigo-50">
            {/* Bar chart icon */}
            <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </ActionBtn>
          <ActionBtn title="Assign" onClick={() => open("assign", p)}><IUserPlus /></ActionBtn>
          <ActionBtn title="View" onClick={() => open("view", p)}><IEye /></ActionBtn>
          <ActionBtn title="Edit" onClick={() => open("edit", p)} className="hover:text-blue-600 hover:bg-blue-50"><IEdit /></ActionBtn>
          <ActionBtn title="Delete" onClick={() => open("delete", p)} className="hover:text-red-500 hover:bg-red-50"><ITrash /></ActionBtn>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 bg-gray-50 min-h-screen p-8 font-sans">

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Projects</h1>
          <p className="text-sm text-gray-400 mt-0.5">{projects.length} projects · {activeCount} active</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <IDownload /> Export
          </button>
          <button onClick={() => open("new")} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            <IPlus /> New Project
          </button>
        </div>
      </div>

      {/* Status pills */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {(["All", ...ALL_STATUSES] as const).map(s => {
          const isAll = s === "All";
          const active = statusFilter === s;
          const c = !isAll ? STATUS_CFG[s as Status] : null;
          const count = isAll ? projects.length : (statusCounts[s] ?? 0);
          return (
            <button key={s} onClick={() => { setStatusFilter(s as Status | "All"); setPage(1); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${active
                ? isAll ? "bg-gray-800 text-white border-gray-800" : `${c!.bg} ${c!.text} ${c!.border}`
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
              {!isAll && <span className={`w-2 h-2 rounded-full ${c!.dot}`} />}
              {s}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? (isAll ? "bg-white/20 text-white" : "bg-white/60") : "bg-gray-100 text-gray-500"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <SearchInput value={search} onChange={(v: string) => { setSearch(v); setPage(1); }} placeholder="Search projects, clients, managers..." />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as Status | "All"); setPage(1); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-blue-400 text-gray-600 min-w-[140px]">
            <option value="All">All Status</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
            <button onClick={() => setViewMode("list")} className={`p-2 transition-colors ${viewMode === "list" ? "bg-gray-100 text-gray-700" : "bg-white text-gray-400 hover:bg-gray-50"}`}><IList /></button>
            <button onClick={() => setViewMode("grid")} className={`p-2 transition-colors ${viewMode === "grid" ? "bg-gray-100 text-gray-700" : "bg-white text-gray-400 hover:bg-gray-50"}`}><IGrid /></button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => (
              <ProjectCard key={p.id} p={p}
                onEdit={q => open("edit", q)} onDelete={q => open("delete", q)}
                onView={q => open("view", q)} onAssign={q => open("assign", q)} />
            ))}
            {filtered.length === 0 && <div className="col-span-3 py-16 text-center text-gray-400 text-sm">No projects found</div>}
          </div>
        ) : (
          <Table columns={columns} data={filtered} rowsPerPage={5} emptyMessage="No projects found" page={page} setPage={setPage} />
        )}
      </div>

      {/* Modals */}
      {activeModal === "new" && <NewProjectModal onClose={close} onCreate={handleCreate} />}
      {activeModal === "view" && selected && <ViewModal p={selected} onClose={close} onEdit={() => { close(); setTimeout(() => open("edit", selected), 50); }} />}
      {activeModal === "edit" && selected && <EditModal p={selected} onClose={close} onSave={handleEdit} />}
      {activeModal === "delete" && selected && <DeleteModal p={selected} onClose={close} onConfirm={handleDelete} />}
      {activeModal === "assign" && selected && <AssignModal p={selected} onClose={close} onSave={handleAssign} />}

      {/* Task Report Modal */}
      {activeModal === "taskReport" && selected && (
        <ProjectTaskReport
          projectId={selected.id}
          projectName={selected.name}
          tasks={tasks}
          onClose={close}
        />
      )}
    </div>
  );
}