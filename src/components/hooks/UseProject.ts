import { useState, useMemo } from "react";
import { INITIAL_PROJECTS as SEED_PROJECTS, PERSONS } from "../../data/mockProjects";
import { ROLE_COLOR_MAP, ALL_STATUSES } from "../constants/Project.constants";  
import type { Project, TeamMember, Status } from "../../types/Project.types";

const personById = (id: string) => PERSONS.find(p => p.id === id);

// ── Seed → normalised ─────────────────────────────────────────────────────────
const buildInitialProjects = (): Project[] =>
  SEED_PROJECTS.map((sp) => {
    const manager  = sp.managerId ? personById(sp.managerId) : undefined;
    const initials = manager?.avatar ?? "??";
    const color    = ROLE_COLOR_MAP[manager?.role ?? ""] ?? "bg-blue-500";

    const team: TeamMember[] = sp.team
      .map(tid => {
        const m = personById(tid);
        return m ? { initials: m.avatar, color: ROLE_COLOR_MAP[m.role] ?? "bg-gray-400", name: m.name } : null;
      })
      .filter((m): m is TeamMember => m !== null);

    const extraTeam = team.length > 3 ? team.length - 3 : undefined;

    const statusMap: Record<string, Status> = {
      in_progress: "Active", not_started: "Planning",
      completed: "Completed", on_hold: "On Hold", overdue: "Overdue",
    };
    const priorityMap: Record<string, "Critical" | "High" | "Medium" | "Low"> = {
      critical: "Critical", high: "High", medium: "Medium", low: "Low",
    };

    const total = sp.tasks?.length ?? 0;
    const done  = sp.tasks?.filter(t => t.status === "completed").length ?? 0;

    return {
      id: sp.code, name: sp.name, client: sp.client,
      description: (sp as any).description ?? "",
      manager: manager?.name ?? "Unknown",
      managerInitials: initials, managerColor: color,
      startDate: sp.startDate, endDate: sp.endDate,
      status:   statusMap[sp.status]   ?? "Planning",
      progress: total > 0 ? Math.round((done / total) * 100) : 0,
      priority: priorityMap[sp.priority] ?? "Medium",
      budget: Math.floor(Math.random() * 150 + 50) * 1000,
      spent:  Math.floor(Math.random() * 90  + 10) * 1000,
      team: team.slice(0, 5), extraTeam,
    };
  });

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useProjects(search: string, statusFilter: Status | "All") {
  const [projects, setProjects] = useState<Project[]>(buildInitialProjects);

  const filtered = useMemo(() =>
    projects.filter(p => {
      const q = search.toLowerCase();
      return (
        (!search ||
          p.name.toLowerCase().includes(q) ||
          p.client.toLowerCase().includes(q) ||
          p.manager.toLowerCase().includes(q))
        && (statusFilter === "All" || p.status === statusFilter)
      );
    }),
    [projects, search, statusFilter],
  );

  const activeCount  = projects.filter(p => p.status === "Active").length;
  const statusCounts = ALL_STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: projects.filter(p => p.status === s).length }),
    {} as Record<string, number>,
  );

  const create = (p: Project)             => setProjects(prev => [p, ...prev]);
  const update = (id: string, data: Partial<Project>) =>
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  const remove = (id: string)             => setProjects(prev => prev.filter(p => p.id !== id));
  const assign = (id: string, team: TeamMember[]) =>
    setProjects(prev => prev.map(p => p.id === id ? { ...p, team } : p));

  return { projects, filtered, activeCount, statusCounts, create, update, remove, assign };
}
