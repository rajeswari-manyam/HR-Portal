import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_PROJECTS, PERSONS } from '../../data/mockProjects';
import { Project } from '../../types';

export default function MyProjects() {
  const { user } = useAuth();
  // determine the corresponding person id from mock data
  const personId = useMemo(() => {
    if (!user) return null;
    const person = PERSONS.find((p) => p.employeeId === user.employeeId);
    return person?.id ?? null;
  }, [user]);

  const projects: Project[] = useMemo(() => {
    if (!personId) return [];
    return INITIAL_PROJECTS.filter(
      (p) =>
        p.managerId === personId ||
        p.team.includes(personId) ||
        p.tasks.some((t) => t.assigneeId === personId)
    );
  }, [personId]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">My Projects</h1>
        <p className="page-subtitle">Projects you are involved in</p>
      </div>

      {projects.length > 0 ? (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Code</th>
                <th className="table-header">Status</th>
                <th className="table-header">End Date</th>
                <th className="table-header">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="table-cell font-medium">{p.name}</td>
                  <td className="table-cell">{p.code}</td>
                  <td className="table-cell capitalize">{p.status.replace('_', ' ')}</td>
                  <td className="table-cell">
                    {p.endDate ? new Date(p.endDate).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="table-cell">
                    <div className="bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${p.tasks.length ? Math.round((p.tasks.filter(t => t.status === 'completed').length / p.tasks.length) * 100) : 0}%`,
                          backgroundColor: '#4f46e5',
                        }}
                        className="h-full rounded-full"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card text-center py-12 text-slate-400">No projects assigned.</div>
      )}
    </div>
  );
}
