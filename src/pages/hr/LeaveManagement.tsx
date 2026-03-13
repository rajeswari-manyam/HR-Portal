import { useState, useEffect } from 'react';
import { Check, X, Clock, Calendar } from 'lucide-react';
import { LeaveRequest } from '../../types';
import Badge from '../../components/shared/Badge';
import SearchInput from '../../components/shared/SearchInput';
import Modal from '../../components/shared/Modal';
import Avatar from '../../components/shared/Avatar';
import { formatDate } from '../../utils/helpers';
import StatCard from '../../components/shared/StatCard';
import Table from '../../components/shared/Table';
import { getAllLeaves, updateLeaveStatus } from "../../service/leave.service";

export default function LeaveManagement() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewModal, setViewModal] = useState(false);
  const [selected, setSelected] = useState<LeaveRequest | null>(null);

  // ── Fetch all leaves on mount ──────────────────────────────────────────────
  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError(null);
      const data: any = await getAllLeaves();

      // Normalize API response to match LeaveRequest type
      const rawList: any[] = Array.isArray(data) ? data : (data?.leaves ?? data?.data ?? []);
      const normalized = rawList.map((item: any) => ({
        id: item._id ?? item.id ?? '',
        employeeId: item.employeeId ?? item.employee_id ?? '',
        employeeName: item.employeeName ?? item.employee_name ?? '',
        department: item.department ?? '',
        leaveType: item.leaveType ?? item.leave_type ?? '',
        startDate: item.startDate ?? item.start_date ?? '',
        endDate: item.endDate ?? item.end_date ?? '',
        days: item.days ?? 0,
        reason: item.reason ?? '',
        status: item.status ?? 'pending',
        appliedOn: item.appliedOn ?? item.applied_on ?? '',
        approvedBy: item.approvedBy ?? item.approved_by ?? '',
      }));

      setRequests(normalized);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  // ── Update leave status via API ────────────────────────────────────────────
  const handleUpdateStatus = async (
    id: string,
    status: 'approved' | 'rejected'
  ) => {
    try {
      await updateLeaveStatus(id, status, 'HR001'); // replace 'HR001' with logged-in user id
      await fetchLeaves();
      if (selected?.id === id) {
        setSelected(prev => prev ? { ...prev, status } : prev);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update leave status');
    }
  };

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = requests.filter(r => {
    const matchSearch = (r.employeeName ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pending = requests.filter(r => r.status === 'pending').length;
  const approved = requests.filter(r => r.status === 'approved').length;
  const rejected = requests.filter(r => r.status === 'rejected').length;

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns = [
    {
      header: 'Employee',
      render: (r: LeaveRequest) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.employeeName} size="sm" />
          <div>
            <p className="font-semibold text-slate-900 text-sm">{r.employeeName}</p>
            <p className="text-xs text-slate-400">{r.department}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Leave Type',
      render: (r: LeaveRequest) => (
        <span className="flex items-center gap-1.5 text-sm">
          <Calendar size={13} className="text-slate-400" />
          {r.leaveType}
        </span>
      ),
    },
    {
      header: 'Duration',
      render: (r: LeaveRequest) => (
        <span className="text-sm text-slate-600">
          {formatDate(r.startDate)} – {formatDate(r.endDate)}
        </span>
      ),
    },
    {
      header: 'Days',
      render: (r: LeaveRequest) => (
        <span className="font-bold text-slate-900">
          {r.days} day{r.days > 1 ? 's' : ''}
        </span>
      ),
    },
    {
      header: 'Reason',
      render: (r: LeaveRequest) => (
        <p className="text-sm text-slate-600 truncate max-w-[200px]">{r.reason}</p>
      ),
    },
    {
      header: 'Applied',
      render: (r: LeaveRequest) => (
        <span className="text-sm text-slate-500">{formatDate(r.appliedOn)}</span>
      ),
    },
    {
      header: 'Status',
      render: (r: LeaveRequest) => <Badge status={r.status} />,
    },
    {
      header: 'Actions',
      render: (r: LeaveRequest) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setSelected(r); setViewModal(true); }}
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 mr-1">
            View
          </button>
          {r.status === 'pending' && (
            <>
              <button
                onClick={() => handleUpdateStatus(r.id, 'approved')}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                <Check size={13} />
              </button>
              <button
                onClick={() => handleUpdateStatus(r.id, 'rejected')}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                <X size={13} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  // ── Loading / Error states ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading leave requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <X size={20} className="text-red-500" />
          </div>
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <button
            onClick={fetchLeaves}
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
          <h1 className="page-title">Leave Management</h1>
          <p className="page-subtitle">Review and manage leave requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', value: pending, icon: Clock, color: 'bg-amber-100 text-amber-600' },
          { label: 'Approved', value: approved, icon: Check, color: 'bg-emerald-100 text-emerald-600' },
          { label: 'Rejected', value: rejected, icon: X, color: 'bg-red-100 text-red-600' },
        ].map(s => (
          <StatCard
            key={s.label}
            title={s.label}
            value={s.value}
            icon={<s.icon size={20} />}
            color={s.color}
          />
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search employee..."
          />
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {(['', 'pending', 'approved', 'rejected'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${statusFilter === s
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}>
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filtered}
        rowsPerPage={6}
        emptyMessage="No leave requests found"
      />

      {/* View Modal */}
      {selected && (
        <Modal
          isOpen={viewModal}
          onClose={() => setViewModal(false)}
          title="Leave Request Details">
          <div className="space-y-4">

            {/* Employee info */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <Avatar name={selected.employeeName} size="lg" />
              <div>
                <p className="font-bold text-slate-900">{selected.employeeName}</p>
                <p className="text-sm text-slate-500">{selected.department}</p>
              </div>
              <Badge status={selected.status} />
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Leave Type', selected.leaveType],
                ['Days', `${selected.days} day${selected.days > 1 ? 's' : ''}`],
                ['Start Date', formatDate(selected.startDate)],
                ['End Date', formatDate(selected.endDate)],
                ['Applied On', formatDate(selected.appliedOn)],
                ['Approved By', selected.approvedBy || 'Pending'],
              ].map(([k, v]) => (
                <div key={k} className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">{k}</p>
                  <p className="font-semibold text-slate-900 text-sm">{v}</p>
                </div>
              ))}
            </div>

            {/* Reason */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-400 mb-1">Reason</p>
              <p className="text-sm text-slate-700">{selected.reason}</p>
            </div>

            {/* Action buttons (only for pending) */}
            {selected.status === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    await handleUpdateStatus(selected.id, 'rejected');
                    setViewModal(false);
                  }}
                  className="btn-danger flex-1 justify-center">
                  Reject
                </button>
                <button
                  onClick={async () => {
                    await handleUpdateStatus(selected.id, 'approved');
                    setViewModal(false);
                  }}
                  className="btn-success flex-1 justify-center">
                  Approve
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}