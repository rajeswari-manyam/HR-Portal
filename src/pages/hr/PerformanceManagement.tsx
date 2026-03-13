import { useState, useEffect } from 'react';
import { Star, Plus, TrendingUp, X } from 'lucide-react';
import { PerformanceReview } from '../../types';
import Badge from '../../components/shared/Badge';
import Avatar from '../../components/shared/Avatar';
import Modal from '../../components/shared/Modal';
import { formatDate } from '../../utils/helpers';
import Button from '../../components/shared/Button';
import StatCard from '../../components/shared/StatCard';
import InputField from '../../components/shared/InputField';
import Select from '../../components/shared/Select';
import {
  createPerformanceReview,
  getAllPerformanceReviews,
  updatePerformanceReview,
} from "../../service/performance.service";

// ─────────────────────────────────────────────────────────────────────────────
// Star Rating Component
// ─────────────────────────────────────────────────────────────────────────────

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={
            i < Math.round(rating)
              ? 'text-amber-400 fill-amber-400'
              : 'text-slate-200 fill-slate-200'
          }
        />
      ))}
      <span className="ml-1 text-xs font-bold text-slate-700">{rating}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalize API response → PerformanceReview shape
// ─────────────────────────────────────────────────────────────────────────────

function normalizeReview(item: any): PerformanceReview {
  return {
    id: item._id ?? item.id ?? '',
    employeeId: item.employeeId ?? '',
    employeeName: item.employeeName ?? item.employee_name ?? '',
    period: item.period ?? '',
    rating: item.rating ?? 0,
    goals: Array.isArray(item.goals) ? item.goals : [],
    feedback: item.feedback ?? '',
    status: item.status ?? 'draft',
    reviewedBy: item.reviewedBy ?? item.reviewed_by ?? '',
    createdAt: item.createdAt ?? item.created_at ?? '',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function PerformanceManagement() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PerformanceReview | null>(null);
  const [modal, setModal] = useState(false);
  const [showNewReview, setShowNewReview] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newReview, setNewReview] = useState<Partial<PerformanceReview>>({
    employeeName: '',
    period: '',
    rating: 0,
    goals: [],
    feedback: '',
    status: 'draft',
    reviewedBy: '',
  });

  // ── Fetch all reviews on mount ─────────────────────────────────────────────
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: any = await getAllPerformanceReviews();
      const rawList: any[] = Array.isArray(data) ? data : (data?.reviews ?? data?.data ?? []);
      setReviews(rawList.map(normalizeReview));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch performance reviews');
    } finally {
      setLoading(false);
    }
  };

  // ── Create new review via API ──────────────────────────────────────────────
  const handleCreateReview = async () => {
    if (!newReview.employeeName || !newReview.period) return;
    try {
      setSaving(true);
      await createPerformanceReview({
        employeeId: '',                             // replace with logged-in employee id
        employeeName: newReview.employeeName || '',
        period: newReview.period || '',
        rating: newReview.rating || 0,
        goals: newReview.goals || [],
        feedback: newReview.feedback || '',
        status: (newReview.status as any) || 'draft',
        reviewedBy: newReview.reviewedBy || '',
      });
      await fetchReviews();
      setShowNewReview(false);
      setNewReview({ employeeName: '', period: '', rating: 0, goals: [], feedback: '', status: 'draft', reviewedBy: '' });
    } catch (err: any) {
      alert(err.message || 'Failed to create review');
    } finally {
      setSaving(false);
    }
  };

  // ── Update existing review via API ────────────────────────────────────────
  const handleUpdateReview = async (id: string, data: Partial<PerformanceReview>) => {
    try {
      await updatePerformanceReview(id, {
        employeeName: data.employeeName,
        period: data.period,
        rating: data.rating,
        goals: data.goals,
        feedback: data.feedback,
        status: data.status as any,
        reviewedBy: data.reviewedBy,
      });
      await fetchReviews();
    } catch (err: any) {
      alert(err.message || 'Failed to update review');
    }
  };

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading performance reviews...</p>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <X size={20} className="text-red-500" />
          </div>
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <button
            onClick={fetchReviews}
            className="text-xs text-primary-600 hover:underline font-semibold">
            Try again
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Performance</h1>
          <p className="page-subtitle">Track and manage employee performance</p>
        </div>
        <Button
          className="btn-primary"
          onClick={() => {
            setNewReview({ employeeName: '', period: '', rating: 0, goals: [], feedback: '', status: 'draft', reviewedBy: '' });
            setShowNewReview(true);
          }}>
          <Plus size={16} /> Create Review
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Reviews', value: reviews.length, color: 'bg-primary-100 text-primary-600' },
          { label: 'Avg Rating', value: avgRating.toFixed(1) + ' / 5', color: 'bg-amber-100 text-amber-600' },
          { label: 'Reviewed', value: reviews.filter(r => r.status === 'reviewed').length, color: 'bg-emerald-100 text-emerald-600' },
        ].map(s => (
          <StatCard
            key={s.label}
            title={s.label}
            value={s.value}
            icon={<TrendingUp size={20} />}
            color={s.color}
          />
        ))}
      </div>

      {/* Review Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {reviews.map(r => (
          <div
            key={r.id}
            className="card hover:shadow-card-hover transition-all duration-300 cursor-pointer"
            onClick={() => { setSelected(r); setModal(true); }}>
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

      {/* View Modal */}
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

            {/* Update status buttons */}
            {selected.status !== 'reviewed' && (
              <div className="flex gap-3 pt-2">
                {selected.status === 'draft' && (
                  <Button
                    className="btn-primary flex-1 justify-center"
                    onClick={async () => {
                      await handleUpdateReview(selected.id, { ...selected, status: 'submitted' });
                      setModal(false);
                    }}>
                    Submit Review
                  </Button>
                )}
                {selected.status === 'submitted' && (
                  <Button
                    className="btn-success flex-1 justify-center"
                    onClick={async () => {
                      await handleUpdateReview(selected.id, { ...selected, status: 'reviewed' });
                      setModal(false);
                    }}>
                    Mark as Reviewed
                  </Button>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Create Review Modal */}
      {showNewReview && (
        <Modal isOpen={showNewReview} onClose={() => setShowNewReview(false)} title="Create Performance Review" size="lg">
          <div className="space-y-4">
            <InputField
              label="Employee Name"
              value={newReview.employeeName || ''}
              onChange={(e) => setNewReview({ ...newReview, employeeName: e.target.value })}
            />
            <InputField
              label="Period"
              placeholder="e.g. Q1 2026"
              value={newReview.period || ''}
              onChange={(e) => setNewReview({ ...newReview, period: e.target.value })}
            />
            <Select
              label="Rating"
              value={String(newReview.rating || 0)}
              options={[
                { label: '0', value: '0' },
                { label: '1', value: '1' },
                { label: '2', value: '2' },
                { label: '3', value: '3' },
                { label: '4', value: '4' },
                { label: '5', value: '5' },
              ]}
              onChange={(value) => setNewReview({ ...newReview, rating: Number(value) })}
            />
            <InputField
              label="Goals (comma separated)"
              value={(newReview.goals || []).join(', ')}
              onChange={(e) =>
                setNewReview({
                  ...newReview,
                  goals: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                })
              }
            />
            <div>
              <label className="label">Feedback</label>
              <textarea
                className="input w-full resize-none"
                rows={4}
                value={newReview.feedback || ''}
                onChange={(e) => setNewReview({ ...newReview, feedback: e.target.value })}
              />
            </div>
            <InputField
              label="Reviewed By"
              value={newReview.reviewedBy || ''}
              onChange={(e) => setNewReview({ ...newReview, reviewedBy: e.target.value })}
            />
            <Select
              label="Status"
              value={newReview.status || 'draft'}
              options={[
                { label: 'Draft', value: 'draft' },
                { label: 'Submitted', value: 'submitted' },
                { label: 'Reviewed', value: 'reviewed' },
              ]}
              onChange={(value) => setNewReview({ ...newReview, status: value as any })}
            />
            <div className="flex justify-end gap-4">
              <Button className="btn-secondary" onClick={() => setShowNewReview(false)}>
                Cancel
              </Button>
              <Button
                className="btn-primary"
                disabled={!newReview.employeeName || !newReview.period || saving}
                onClick={handleCreateReview}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}