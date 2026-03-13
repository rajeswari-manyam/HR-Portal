import { useMemo } from 'react';
import { INITIAL_PROJECTS } from '../../data/mockProjects';
import { Project } from '../../types';
import Table from '../../components/shared/Table';

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-700',
  in_progress: 'bg-blue-100 text-blue-700',
  not_started: 'bg-slate-100 text-slate-500',
  on_hold: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-700',
};

export default function MyProjects() {
  const projects: Project[] = INITIAL_PROJECTS;

  const columns = useMemo(
    () => [
      {
        header: 'Name',
        render: (p: Project) => (
          <span className="font-semibold text-slate-900">{p.name}</span>
        ),
      },
      {
        header: 'Code',
        render: (p: Project) => (
          <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded-md text-slate-600">
            {p.code}
          </span>
        ),
      },
      {
        header: 'Client',
        render: (p: Project) => p.client || '—',
      },
      {
        header: 'Status',
        render: (p: Project) => (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[p.status] ?? STATUS_COLORS.not_started}`}>
            {p.status.replace(/_/g, ' ')}
          </span>
        ),
      },
      {
        header: 'End Date',
        render: (p: Project) =>
          p.endDate ? new Date(p.endDate).toLocaleDateString('en-IN') : '—',
      },
      {
        header: 'Progress',
        render: (p: Project) => {
          const completed = p.tasks.filter(t => t.status === 'completed').length;
          const total = p.tasks.length;
          const percent = total ? Math.round((completed / total) * 100) : 0;
          return (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden min-w-[80px]">
                <div
                  style={{ width: `${percent}%` }}
                  className="h-full rounded-full bg-primary-500 transition-all"
                />
              </div>
              <span className="text-xs text-slate-500 w-8 text-right">{percent}%</span>
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
        <Table
          columns={columns}
          data={projects}
          rowsPerPage={5}
          emptyMessage="No projects assigned."
        />
      ) : (
        <div className="card text-center py-12 text-slate-400">
          No projects assigned.
        </div>
      )}
    </div>
  );
}