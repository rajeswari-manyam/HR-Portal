import { useState, useEffect } from 'react';
import { Megaphone } from 'lucide-react';
import { getAnnouncementsByRole } from '../../service/announcement.service';
import { formatDate } from '../../utils/helpers';
import Badge from '../../components/shared/Badge';
import { useAuth } from '../../context/AuthContext';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  targetRole: 'all' | 'hr' | 'employee';
}

export default function MyAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const role = user?.role ?? 'employee';

    setLoading(true);
    setError(null);

    // Fetch role-specific + all announcements in parallel
    Promise.all([
      getAnnouncementsByRole(role),
      getAnnouncementsByRole('all'),
    ])
      .then(([roleAnnouncements, allAnnouncements]) => {
        // Merge and deduplicate by _id
        const merged = [...roleAnnouncements, ...allAnnouncements];
        const unique = merged.filter(
          (a, index, self) => self.findIndex(x => x._id === a._id) === index
        );
        // Sort newest first
        unique.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setAnnouncements(unique);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user?.role]);

  const PRIORITY_COLORS: Record<string, string> = {
    high: 'bg-red-50 border-red-200',
    medium: 'bg-amber-50 border-amber-200',
    low: 'bg-slate-50 border-slate-200',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Announcements</h1>
        <p className="page-subtitle">Company-wide updates and notices</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          Failed to load announcements: {error}
        </p>
      )}

      {/* Empty */}
      {!loading && !error && announcements.length === 0 && (
        <div className="card text-center py-12">
          <Megaphone size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No announcements yet</p>
        </div>
      )}

      {/* Announcements list */}
      {!loading && !error && announcements.length > 0 && (
        <div className="space-y-4">
          {announcements.map(a => (
            <div
              key={a._id}
              className={`card hover:shadow-card-hover transition-all duration-300 border ${PRIORITY_COLORS[a.priority] ?? PRIORITY_COLORS.low}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-bold text-slate-900">{a.title}</h3>
                <Badge status={a.priority} />
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{a.content}</p>
              <p className="text-xs text-slate-400 mt-3">
                By {a.createdBy} · {formatDate(a.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}