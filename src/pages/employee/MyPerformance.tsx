import { mockPerformanceReviews } from '../../data/mockData';

import { Star } from 'lucide-react';

export default function MyPerformance() {
  const myReviews = mockPerformanceReviews.filter(r => r.employeeId === 'EMP001');
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="page-title">My Performance</h1></div>
      {myReviews.map(r => (
        <div key={r.id} className="card">
          <div className="flex items-center justify-between mb-4">
            <div><p className="font-bold text-slate-900 text-lg">{r.period}</p><p className="text-sm text-slate-500">Reviewed by {r.reviewedBy}</p></div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} size={18} className={i <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />)}
              <span className="ml-1 font-bold text-slate-900">{r.rating}/5</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="label">Goals</p>
            {r.goals.map((g, i) => <div key={i} className="flex gap-2 p-2 text-sm text-slate-700"><span className="text-primary-500 font-bold">✓</span>{g}</div>)}
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-400 mb-1">Feedback</p>
            <p className="text-sm text-slate-700">{r.feedback}</p>
          </div>
        </div>
      ))}
      {myReviews.length === 0 && <div className="card text-center py-12 text-slate-400">No performance reviews yet</div>}
    </div>
  );
}
