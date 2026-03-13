import { useState } from 'react';
import { Star, Plus, TrendingUp } from 'lucide-react';
import { mockPerformanceReviews } from '../../data/mockData';
import { PerformanceReview } from '../../types';
import Badge from '../../components/shared/Badge';
import Avatar from '../../components/shared/Avatar';
import Modal from '../../components/shared/Modal';
import { formatDate } from '../../utils/helpers';
import Button from '../../components/shared/Button';
import StatCard from '../../components/shared/StatCard';
import InputField from '../../components/shared/InputField';
import Select from '../../components/shared/Select';

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} size={14} className={i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
      ))}
      <span className="ml-1 text-xs font-bold text-slate-700">{rating}</span>
    </div>
  );
}

export default function PerformanceManagement() {
  const [reviews, setReviews] = useState<PerformanceReview[]>(mockPerformanceReviews);
  const [selected, setSelected] = useState<PerformanceReview | null>(null);
  const [modal, setModal] = useState(false);
  const [showNewReview, setShowNewReview] = useState(false);
  const [newReview, setNewReview] = useState<Partial<PerformanceReview>>({
    employeeName: '',
    period: '',
    rating: 0,
    goals: [],
    feedback: '',
    status: 'draft',
    reviewedBy: '',
    createdAt: ''
  });

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Performance</h1><p className="page-subtitle">Track and manage employee performance</p></div>
        <Button className="btn-primary" onClick={() => { setShowNewReview(true); setNewReview({ employeeName:'', period:'', rating:0, goals:[], feedback:'', status:'draft', reviewedBy:'', createdAt:'' }); }}><Plus size={16} /> Create Review</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Reviews', value: reviews.length, color: 'bg-primary-100 text-primary-600' },
          { label: 'Avg Rating', value: avgRating.toFixed(1) + ' / 5', color: 'bg-amber-100 text-amber-600' },
          { label: 'Reviewed', value: reviews.filter(r => r.status === 'reviewed').length, color: 'bg-emerald-100 text-emerald-600' },
        ].map((s, index) => (
         
           <StatCard
              title={s.label}
              value={s.value}
              icon={<TrendingUp size={20} />}
             
            
              color={s.color}
            />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {reviews.map(r => (
          <div key={r.id} className="card hover:shadow-card-hover transition-all duration-300 cursor-pointer" onClick={() => { setSelected(r); setModal(true); }}>
            <div className="flex items-center gap-4 mb-4">
              <Avatar name={r.employeeName} size="md" />
              <div className="flex-1">
                <p className="font-bold text-slate-900">{r.employeeName}</p>
                <p className="text-sm text-slate-500">{r.period}</p>
              </div>
              <Badge status={r.status} />
            </div>
            <StarRating rating={r.rating} />
            <p className="text-sm text-slate-600 mt-3 line-clamp-2">{r.feedback}</p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Reviewed by: {r.reviewedBy || 'Pending'}</span>
              <span>{formatDate(r.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <Modal isOpen={modal} onClose={() => setModal(false)} title="Performance Review" size="lg">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <Avatar name={selected.employeeName} size="lg" />
              <div>
                <p className="font-bold text-slate-900">{selected.employeeName}</p>
                <p className="text-sm text-slate-500">Period: {selected.period}</p>
                <StarRating rating={selected.rating} />
              </div>
            </div>
            <div>
              <p className="label">Goals</p>
              <div className="space-y-2">
                {selected.goals.map((g, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-emerald-600">{i + 1}</span>
                    </div>
                    <p className="text-sm text-slate-700">{g}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="label">Feedback</p>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-slate-700">{selected.feedback}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-500 pt-2">
              <span>Reviewed by: <strong className="text-slate-900">{selected.reviewedBy}</strong></span>
              <Badge status={selected.status} />
            </div>
          </div>
        </Modal>
      )}

      {showNewReview && (
        <Modal isOpen={showNewReview} onClose={() => setShowNewReview(false)} title="Create Performance Review" size="lg">
          <div className="space-y-4">
            <div>
            <InputField
  label="Employee Name"
  value={newReview.employeeName || ''}
  onChange={(e) =>
    setNewReview({ ...newReview, employeeName: e.target.value })
  }
/>
            </div>
            <div>
           
            <InputField
  label="Period"
  placeholder="e.g. Q1 2025"
  value={newReview.period || ''}
  onChange={(e) =>
    setNewReview({ ...newReview, period: e.target.value })
  }
/>
            </div>
            <div>
<Select
  label="Rating"
  value={String(newReview.rating || 0)}
  options={[
    { label: "0", value: "0" },
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4", value: "4" },
    { label: "5", value: "5" },
  ]}
  onChange={(value) =>
    setNewReview({ ...newReview, rating: Number(value) })
  }
/>
            </div>
            <div>

            <InputField
  label="Goals (comma separated)"
  value={(newReview.goals || []).join(', ')}
  onChange={(e) =>
    setNewReview({
      ...newReview,
      goals: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
    })
  }
/>
            </div>
            <div>
             
          
  <label className="label">Feedback</label>
  <textarea
    className="input w-full resize-none"
    rows={4}
    value={newReview.feedback || ''}
    onChange={(e) =>
      setNewReview({ ...newReview, feedback: e.target.value })
    }
  />

            </div>
            <div className="flex justify-end gap-4">
              <Button className="btn-secondary" onClick={() => setShowNewReview(false)}>Cancel</Button>
              <Button
                className="btn-primary"
                disabled={!newReview.employeeName || !newReview.period}
                onClick={() => {
                  const full: PerformanceReview = {
                    id: Math.random().toString(36).slice(2,10),
                    employeeId: '',
                    employeeName: newReview.employeeName || '',
                    period: newReview.period || '',
                    rating: newReview.rating || 0,
                    goals: newReview.goals || [],
                    feedback: newReview.feedback || '',
                    status: newReview.status as any || 'draft',
                    reviewedBy: newReview.reviewedBy || '',
                    createdAt: new Date().toISOString(),
                  };
                  setReviews(prev => [...prev, full]);
                  setShowNewReview(false);
                }}
              >Save</Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
