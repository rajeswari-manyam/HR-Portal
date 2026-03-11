import { mockAnnouncements } from '../../data/mockData';
import { formatDate } from '../../utils/helpers';
import Badge from '../../components/shared/Badge';

export default function MyAnnouncements() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="page-title">Announcements</h1></div>
      <div className="space-y-4">
        {mockAnnouncements.map(a => (
          <div key={a.id} className="card hover:shadow-card-hover transition-all">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-900">{a.title}</h3>
              <Badge status={a.priority} />
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{a.content}</p>
            <p className="text-xs text-slate-400 mt-3">By {a.createdBy} · {formatDate(a.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
