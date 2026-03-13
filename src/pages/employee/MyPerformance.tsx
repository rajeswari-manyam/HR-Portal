import { useState, useEffect } from 'react';
import { Star, Target, MessageSquare, Clock } from 'lucide-react';
import { getAllPerformanceReviews } from '../../service/performance.service';
import { useAuth } from '../../context/AuthContext';

interface PerformanceReview {
  _id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  rating: number;
  goals: string[];
  feedback?: string;
  status: 'draft' | 'submitted' | 'reviewed';
  reviewedBy?: string;
}

const STATUS_STYLES: Record<string, string> = {
  reviewed: 'bg-emerald-100 text-emerald-700',
  submitted: 'bg-blue-100 text-blue-700',
  draft: 'bg-slate-100 text-slate-500',
};

export default function MyPerformance() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.employeeId) return;

    setLoading(true);
    setError(null);

    getAllPerformanceReviews()
      .then((all: PerformanceReview[]) => {
        const mine = all.filter(r => r.employeeId === user.employeeId);
        setReviews(mine);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user?.employeeId]);

  // Parse goals — backend stores them as JSON string array or plain strings
  function parseGoals(goals: string[]): string[] {
    if (!goals?.length) return [];
    try {
      const first = goals[0];
      if (first.startsWith('[')) {
        const parsed = JSON.parse(first);
        return Array.isArray(parsed) ? parsed : goals;
      }
    } catch { }
    return goals;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">My Performance</h1>
        <p className="page-subtitle">Track your performance reviews and goals</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-56 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          Failed to load reviews: {error}
        </p>
      )}

      {/* Empty */}
      {!loading && !error && reviews.length === 0 && (
        <div className="card text-center py-12 text-slate-400">
          No performance reviews yet
        </div>
      )}

      {/* Reviews */}
      {!loading && !error && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r._id} className="card hover:shadow-card-hover transition-all duration-300">

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold text-slate-900 text-lg">{r.period}</p>
                  {r.reviewedBy && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Reviewed by {r.reviewedBy}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_STYLES[r.status] ?? STATUS_STYLES.draft}`}>
                    {r.status}
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star
                        key={i}
                        size={18}
                        className={i <= r.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200 fill-slate-200'
                        }
                      />
                    ))}
                    <span className="ml-1 font-bold text-slate-900">{r.rating}/5</span>
                  </div>
                </div>
              </div>

              {/* Goals */}
              <div className="mb-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Target size={14} className="text-primary-500" />
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Goals</p>
                </div>
                <div className="space-y-1.5">
                  {parseGoals(r.goals).map((g, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-lg text-sm text-slate-700">
                      <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                      <span>{g}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              {r.feedback && (
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <MessageSquare size={13} className="text-slate-400" />
                    <p className="text-xs text-slate-400 font-medium">Feedback</p>
                  </div>
                  <p className="text-sm text-slate-700">{r.feedback}</p>
                </div>
              )}

              {/* No feedback */}
              {!r.feedback && (
                <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-2 text-slate-400">
                  <Clock size={13} />
                  <p className="text-xs">Feedback pending</p>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}