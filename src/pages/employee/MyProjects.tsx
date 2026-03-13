import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_PROJECTS, PERSONS } from '../../data/mockProjects';
import { Project } from '../../types';
import Table from '../../components/shared/Table';

export default function MyProjects() {
  const { user } = useAuth();

  // get the corresponding person id
  const personId = useMemo(() => {
    if (!user) return null;
    const person = PERSONS.find((p) => p.employeeId === user.employeeId);
    return person?.id ?? null;
  }, [user]);

  // get all projects related to the person
  const projects: Project[] = useMemo(() => {
    if (!personId) return [];
    return INITIAL_PROJECTS.filter(
      (p) =>
        p.managerId === personId ||
        p.team.includes(personId) ||
        p.tasks.some((t) => t.assigneeId === personId)
    );
  }, [personId]);

  const columns = useMemo(
    () => [
      {
        header: 'Name',
        render: (p: Project) => <span className="font-medium">{p.name}</span>,
      },
      {
        header: 'Code',
        render: (p: Project) => p.code,
      },
      {
        header: 'Status',
        render: (p: Project) => p.status.replace('_', ' '),
      },
      {
        header: 'End Date',
        render: (p: Project) =>
          p.endDate ? new Date(p.endDate).toLocaleDateString('en-IN') : '—',
      },
      {
        header: 'Progress',
        render: (p: Project) => {
          const completed = p.tasks.filter((t) => t.status === 'completed').length;
          const total = p.tasks.length;
          const percent = total ? Math.round((completed / total) * 100) : 0;
          return (
            <div className="bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                style={{ width: `${percent}%`, backgroundColor: '#4f46e5' }}
                className="h-full rounded-full"
              />
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">My Projects</h1>
        <p className="page-subtitle">Projects you are involved in</p>
      </div>

      {projects.length > 0 ? (
        <Table columns={columns} data={projects} rowsPerPage={5} emptyMessage="No projects assigned." />
      ) : (
        <div className="card text-center py-12 text-slate-400">No projects assigned.</div>
      )}
    </div>
  );
}