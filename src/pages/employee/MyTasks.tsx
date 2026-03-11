import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_PROJECTS, PERSONS } from '../../data/mockProjects';
import { ProjectStatus, Project, Task } from '../../types';

interface MyTask {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  status: ProjectStatus;
  dueDate: string;
}

export default function MyTasks() {
  const { user } = useAuth();
  const empId = user?.employeeId || '';

  const initialTasks: MyTask[] = useMemo(() => {
    return INITIAL_PROJECTS.flatMap((p: Project) =>
      p.tasks
        .filter((t: Task) => {
          const person = PERSONS.find((x) => x.id === t.assigneeId);
          return person?.employeeId === empId;
        })
        .map((t: Task) => ({
          id: t.id,
          title: t.title,
          projectId: p.id,
          projectName: p.name,
          status: t.status,
          dueDate: t.dueDate,
        }))
    );
  }, [empId]);

  const [tasks, setTasks] = useState<MyTask[]>(initialTasks);

  const handleStatusChange = (taskId: string, status: ProjectStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="page-title">My Tasks</h1><p className="page-subtitle">Tasks assigned to you</p></div>
      {tasks.length > 0 ? (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="table-header">Project</th>
                <th className="table-header">Task</th>
                <th className="table-header">Status</th>
                <th className="table-header">Due Date</th>
                <th className="table-header">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50">
                  <td className="table-cell font-medium">{t.projectName}</td>
                  <td className="table-cell">{t.title}</td>
                  <td className="table-cell capitalize">{t.status.replace('_', ' ')}</td>
                  <td className="table-cell">{t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="table-cell">
                    <select
                      value={t.status}
                      onChange={(e) => handleStatusChange(t.id, e.target.value as ProjectStatus)}
                      className="input text-sm"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="on_hold">On Hold</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card text-center py-12 text-slate-400">No tasks assigned.</div>
      )}
    </div>
  );
}
