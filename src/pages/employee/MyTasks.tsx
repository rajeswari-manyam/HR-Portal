import React, { useState } from "react";
import Button from "../../components/shared/Button";
import InputField from "../../components/shared/InputField";
import Select from "../../components/shared/Select";

import { Task, TaskStatus, useTaskContext } from "../../context/TaskContext";
import { MEMBERS, STATUS_LIST, PRIORITY_LIST } from "../../components/constants/Task.constants";
import { SummaryCard } from "../../components/TaskUiComponent";
import { TaskTable, TaskKanban } from "../../modals/TaskViews";
import { ViewDrawer, EditTaskModal, AddTaskModal, DeleteConfirm } from "../../modals/TaskModals";
import { IncompleteTaskPopup } from "../../components/InCompleteTaskPopUp";

type ModalState =
  | null
  | { type: "view"; task: Task }
  | { type: "edit"; task: Task }
  | { type: "add" }
  | { type: "delete"; task: Task };

export default function MyTasks() {
  const { tasks, addTask, updateTask, deleteTask, setIncompleteReason } = useTaskContext();

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriority] = useState<string>("All");
  const [statusFilter, setStatus] = useState<string>("All");
  const [assigneeFilter, setAssignee] = useState("Assignee");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<ModalState>(null);

  const toggleExpand = (id: string) =>
    setExpanded((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const changeStatus = (id: string, status: TaskStatus) => {
    const task = tasks.find(t => t.id === id);
    if (task) updateTask({ ...task, status });
  };

  const saveTask = (updated: Task) => { updateTask(updated); setModal(null); };
  const createTask = (t: Task) => { addTask(t); setModal(null); };
  const handleDelete = (id: string) => { deleteTask(id); setModal(null); };
  const resolve = (t: Task) => tasks.find((x) => x.id === t.id) ?? t;

  const filtered = tasks.filter((t) => {
    const q = search.toLowerCase();
    return (
      (!q || t.title.toLowerCase().includes(q) || t.assignee.toLowerCase().includes(q)) &&
      (priorityFilter === "All" || t.priority === priorityFilter) &&
      (statusFilter === "All" || t.status === statusFilter) &&
      (assigneeFilter === "Assignee" || t.assignee === assigneeFilter)
    );
  });

  const countOf = (s: TaskStatus) => tasks.filter((t) => t.status === s).length;
  const uniqueAssignees = Array.from(new Set(tasks.map((t) => t.assignee)));

  return (
    <>
      <style>{`
        @keyframes slideInRight { from { transform: translateX(40px); opacity: 0; } to { transform: none; opacity: 1; } }
        @keyframes zoomIn       { from { transform: scale(.96);       opacity: 0; } to { transform: none; opacity: 1; } }
        .row-hover .row-actions       { opacity: 0; transition: opacity .15s; }
        .row-hover:hover .row-actions { opacity: 1; }
      `}</style>

      {/* Auto-popup for overdue incomplete tasks */}
      <IncompleteTaskPopup tasks={tasks} onSubmit={setIncompleteReason} />

      <div className="flex-1 bg-gray-50 min-h-screen p-8 font-sans">
        {/* Header */}
        <div className="flex items-start justify-between mb-7">
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:bg-gray-50 shadow-sm transition-colors">
              <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">Task Management</h1>
              <p className="text-sm text-gray-400 font-medium mt-0.5">Dashboard Redesign</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              {(["list", "kanban"] as const).map((v) => (
                <button key={v} onClick={() => setViewMode(v)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-all ${viewMode === v ? "bg-indigo-500 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                  {v === "list"
                    ? <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                    : <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x={3} y={3} width={7} height={7} rx={1} /><rect x={14} y={3} width={7} height={7} rx={1} /><rect x={3} y={14} width={7} height={7} rx={1} /><rect x={14} y={14} width={7} height={7} rx={1} /></svg>
                  }
                  {v === "list" ? "List" : "Kanban"}
                </button>
              ))}
            </div>
            <Button variant="primary" onClick={() => setModal({ type: "add" })}>
              <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} className="mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add Task
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {STATUS_LIST.map((s) => <SummaryCard key={s} status={s} count={countOf(s)} />)}
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5 mb-5 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <InputField value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..."
              icon={<svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" /></svg>}
            />
          </div>
          <Select label="Priority" value={priorityFilter} onChange={setPriority}
            options={[{ label: "All", value: "All" }, ...PRIORITY_LIST.map(p => ({ label: p, value: p }))]} />
          <Select label="Status" value={statusFilter} onChange={setStatus}
            options={[{ label: "All", value: "All" }, ...STATUS_LIST.map(s => ({ label: s, value: s }))]} />
          <Select label="Assignee" value={assigneeFilter} onChange={setAssignee}
            options={[{ label: "Assignee", value: "Assignee" }, ...uniqueAssignees.map(a => ({ label: a, value: a }))]} />
          <span className="ml-auto text-sm font-semibold text-gray-400 whitespace-nowrap">
            {filtered.length} task{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Views */}
        {viewMode === "list" && (
          <TaskTable tasks={filtered} expanded={expanded} onToggleExpand={toggleExpand}
            onStatusChange={changeStatus} onSetModal={setModal} />
        )}
        {viewMode === "kanban" && <TaskKanban tasks={filtered} onSetModal={setModal} />}
      </div>

      {modal?.type === "view" && (
        <ViewDrawer task={resolve(modal.task)} onClose={() => setModal(null)}
          onEdit={() => setModal({ type: "edit", task: modal.task })} />
      )}
      {modal?.type === "edit" && (
        <EditTaskModal task={resolve(modal.task)} onClose={() => setModal(null)} onSave={saveTask} />
      )}
      {modal?.type === "add" && <AddTaskModal onClose={() => setModal(null)} onSave={createTask} />}
      {modal?.type === "delete" && (
        <DeleteConfirm taskTitle={modal.task.title}
          onConfirm={() => handleDelete(modal.task.id)} onCancel={() => setModal(null)} />
      )}
    </>
  );
}