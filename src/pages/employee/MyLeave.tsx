import { useState, useEffect } from 'react';
import { Plus, CheckCircle } from 'lucide-react';
import { mockLeaveBalance } from '../../data/mockData';
import { LeaveRequest } from '../../types';
import Badge from '../../components/shared/Badge';
import Modal from '../../components/shared/Modal';
import Button from '../../components/shared/Button';
import InputField from '../../components/shared/InputField';
import Table from '../../components/shared/Table';
import { formatDate } from '../../utils/helpers';
import { useLeave } from '../../context/LeaveContext';
import {
  submitLeaveRequest,
  getAllLeaves,
  getLeaveBalance,
} from "../../service/leave.service";

function getDayCount(start: string, end: string): number {
  if (!start || !end) return 0;
  const diff =
    Math.ceil(
      (new Date(end).getTime() - new Date(start).getTime()) /
      (1000 * 60 * 60 * 24)
    ) + 1;
  return diff > 0 ? diff : 0;
}

export default function MyLeave() {
  const { requests, addLeave } = useLeave();
  const myLeaves = requests.filter((l) => l.employeeId === 'EMP001');

  const [modal, setModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState(mockLeaveBalance);

  // Always guarantee at least mockLeaveBalance is available for the dropdown
  const leaveTypes = (leaveBalance && leaveBalance.length > 0 ? leaveBalance : mockLeaveBalance)
    .map((lb) => lb.leaveType);

  const [form, setForm] = useState<Partial<LeaveRequest>>({
    leaveType: mockLeaveBalance[0]?.leaveType || 'Annual Leave',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── GET: Fetch all leaves for EMP001 on mount ───────────────────────────
  useEffect(() => {
    const fetchLeaves = async () => {
      setIsLoadingLeaves(true);
      try {
        const data = await getAllLeaves('EMP001');
        // Sync fetched leaves into context / local state if needed
        // e.g. data.forEach(leave => addLeave(leave));
        console.log('Fetched leaves from API:', data);
      } catch (err: any) {
        console.error('Failed to fetch leaves:', err.message);
      } finally {
        setIsLoadingLeaves(false);
      }
    };

    fetchLeaves();
  }, []);
    console.log(myLeaves);
  // ─── GET: Fetch leave balance for EMP001 on mount ────────────────────────
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const data = await getLeaveBalance('EMP001');
        if (data && Array.isArray(data)) {
          setLeaveBalance(data);
        }
        console.log('Fetched leave balance from API:', data);
      } catch (err: any) {
        console.error('Failed to fetch leave balance:', err.message);
        // Falls back to mockLeaveBalance already set as default
      }
    };

    fetchBalance();
  }, []);

  // ─── Validation ──────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.startDate) e.startDate = 'Start date is required';
    if (!form.endDate) e.endDate = 'End date is required';
    if (
      form.startDate &&
      form.endDate &&
      form.endDate < form.startDate
    )
      e.endDate = 'End date must be after start date';
    if (!form.reason?.trim()) e.reason = 'Reason is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── POST: Submit leave request ──────────────────────────────────────────
  const applyLeave = async () => {
    if (!validate()) return;

    const payload = {
      employeeId: 'EMP001',
      employeeName: 'Arjun Sharma',
      department: 'Engineering',
      leaveType: form.leaveType || 'Annual Leave',
      startDate: form.startDate!,
      endDate: form.endDate!,
      days: getDayCount(form.startDate!, form.endDate!),
      reason: form.reason || '',
      status: 'pending' as const,
      appliedOn: new Date().toISOString().slice(0, 10),
    };

    setIsSubmitting(true);
    setApiError(null);

    try {
      // POST to API
      const response = await submitLeaveRequest(payload);
      console.log('Leave request submitted via API:', response);

      // Also update local context so UI reflects immediately
      addLeave({
        id: response?.id || `LR${Date.now()}`,
        ...payload,
      });

      setModal(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setForm({ leaveType: leaveTypes[0] || 'Annual Leave', startDate: '', endDate: '', reason: '' });
      setErrors({});
    } catch (err: any) {
      setApiError(err.message || 'Failed to submit leave request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setModal(false);
    setErrors({});
    setApiError(null);
    setForm({ leaveType: leaveTypes[0] || 'Annual Leave', startDate: '', endDate: '', reason: '' });
  };

  const columns = [
    {
      header: 'Leave Type',
      render: (r: LeaveRequest) => (
        <span className="font-medium text-slate-800">{r.leaveType}</span>
      ),
    },
    {
      header: 'Duration',
      render: (r: LeaveRequest) =>
        `${formatDate(r.startDate)} – ${formatDate(r.endDate)}`,
    },
    {
      header: 'Days',
      render: (r: LeaveRequest) => (
        <span className="font-semibold text-slate-700">{r.days}d</span>
      ),
    },
    {
      header: 'Reason',
      render: (r: LeaveRequest) => (
        <span className="text-sm text-slate-500 line-clamp-1">{r.reason}</span>
      ),
    },
    {
      header: 'Status',
      render: (r: LeaveRequest) => <Badge status={r.status} />,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">My Leave</h1>
          <p className="page-subtitle">Manage your leave requests</p>
        </div>
        <Button variant="primary" onClick={() => setModal(true)}>
          <Plus size={16} /> Apply Leave
        </Button>
      </div>

      {success && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-semibold">
          <CheckCircle size={16} className="text-emerald-500 shrink-0" />
          Leave request submitted! Pending HR approval.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {leaveBalance.map((lb) => (
          <div key={lb.leaveType} className="card text-center">
            <p className="text-3xl font-black text-primary-600">{lb.remaining}</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">{lb.leaveType}</p>
            <p className="text-xs text-slate-400">
              {lb.used} used of {lb.total}
            </p>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-primary-500 rounded-full"
                style={{ width: `${(lb.remaining / lb.total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-bold text-slate-800 mb-3">Leave History</h2>
        {isLoadingLeaves ? (
          <p className="text-sm text-slate-400">Loading leave history...</p>
        ) : (
          <Table
            columns={columns}
            data={myLeaves}
            rowsPerPage={5}
            emptyMessage="No leave requests yet"
          />
        )}
      </div>

      <Modal isOpen={modal} onClose={handleClose} title="Apply for Leave">
        <div className="space-y-4">
          <InputField
            label="Leave Type *"
            as="select"
            value={form.leaveType || leaveTypes[0]}
            onChange={(e) => setForm((p) => ({ ...p, leaveType: e.target.value }))}
          >
            {leaveTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </InputField>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <InputField
                label="Start Date *"
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, startDate: e.target.value }))
                }
              />
              {errors.startDate && (
                <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>
              )}
            </div>
            <div>
              <InputField
                label="End Date *"
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, endDate: e.target.value }))
                }
              />
              {errors.endDate && (
                <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          {form.startDate &&
            form.endDate &&
            getDayCount(form.startDate, form.endDate) > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 border border-primary-100 rounded-xl text-sm text-primary-700 font-semibold">
                <CheckCircle size={14} className="text-primary-500" />
                {getDayCount(form.startDate, form.endDate)} day
                {getDayCount(form.startDate, form.endDate) !== 1 ? 's' : ''} selected
              </div>
            )}

          <div>
            <InputField
              label="Reason *"
              as="textarea"
              rows={3}
              value={form.reason}
              onChange={(e) =>
                setForm((p) => ({ ...p, reason: e.target.value }))
              }
            />
            {errors.reason && (
              <p className="text-xs text-red-500 mt-1">{errors.reason}</p>
            )}
          </div>

          {/* API error banner */}
          {apiError && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {apiError}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="secondary" fullWidth onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={applyLeave}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}