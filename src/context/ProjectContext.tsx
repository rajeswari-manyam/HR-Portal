import { createContext, useContext, useState, ReactNode } from 'react';
import { Project, Task, Comment } from "../types/index";
import { INITIAL_PROJECTS } from "../data/mockProjects";

// ─── Notification ─────────────────────────────────────────────────────────────

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'comment' | 'task' | 'incomplete';
  read: boolean;
  createdAt: string;
  taskId?: string;
  projectId?: string;
}

// ─── Context Shape ────────────────────────────────────────────────────────────

interface ProjectContextValue {
  projects: Project[];
  notifications: AppNotification[];
  unreadCount: number;
  // Project mutations
  addProject: (p: Project) => void;
  updateProject: (p: Project) => void;
  // Task mutations (scoped to a project)
  addTask: (projectId: string, task: Task) => void;
  updateTask: (projectId: string, task: Task) => void;
  // Comment / notification helpers
  addCommentToTask: (projectId: string, taskId: string, comment: Comment) => void;
  addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  function uid() { return Math.random().toString(36).slice(2, 10); }

  // ── Project mutations ──────────────────────────────────────────────────────

  function addProject(p: Project) {
    setProjects(prev => [...prev, p]);
  }

  function updateProject(updated: Project) {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  }

  // ── Task mutations ─────────────────────────────────────────────────────────

  function addTask(projectId: string, task: Task) {
    setProjects(prev =>
      prev.map(p => p.id === projectId ? { ...p, tasks: [...p.tasks, task] } : p)
    );
  }

  function updateTask(projectId: string, updated: Task) {
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? { ...p, tasks: p.tasks.map(t => t.id === updated.id ? updated : t) }
          : p
      )
    );
  }

  // ── Comment helpers ────────────────────────────────────────────────────────

  function addCommentToTask(projectId: string, taskId: string, comment: Comment) {
    setProjects(prev =>
      prev.map(p =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map(t =>
                t.id === taskId
                  ? { ...t, comments: [...t.comments, comment] }
                  : t
              ),
            }
          : p
      )
    );
  }

  // ── Notifications ──────────────────────────────────────────────────────────

  function addNotification(n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) {
    setNotifications(prev => [
      { ...n, id: uid(), read: false, createdAt: new Date().toISOString() },
      ...prev,
    ]);
  }

  function markNotificationRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  return (
    <ProjectContext.Provider value={{
      projects,
      notifications,
      unreadCount,
      addProject,
      updateProject,
      addTask,
      updateTask,
      addCommentToTask,
      addNotification,
      markNotificationRead,
      markAllRead,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjects must be used inside <ProjectProvider>');
  return ctx;
}