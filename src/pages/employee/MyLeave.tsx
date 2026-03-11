import { useState } from 'react';
import { Plus } from 'lucide-react';
import { mockLeaveRequests, mockLeaveBalance } from '../../data/mockData';
import { LeaveRequest } from '../../types';
import Badge from '../../components/shared/Badge';
import Modal from '../../components/shared/Modal';
import Button from '../../components/shared/Button';
import { formatDate, generateId } from '../../utils/helpers';

export default function MyLeave() {
  const myLeaves = mockLeaveRequests.filter(l => l.employeeId === 'EMP001');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Partial<LeaveRequest>>({ leaveType: 'Annual Leave', startDate: '', endDate: '', reason: '' });

  const applyLeave = () => {
    setModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Leave</h1></div>
        <Button variant="primary" onClick={() => setModal(true)}>
          <Plus size={16} /> Apply Leave
        </Button>
      </div>

      {/* Balance */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {mockLeaveBalance.map(lb => (
          <div key={lb.leaveType} className="card text-center">
            <p className="text-3xl font-black text-primary-600">{lb.remaining}</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">{lb.leaveType}</p>
            <p className="text-xs text-slate-400">{lb.used} used of {lb.total}</p>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(lb.remaining / lb.total) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Leave History */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-slate-900">My Leave Requests</div>
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="table-header">Leave Type</th>
              <th className="table-header">Duration</th>
              <th className="table-header">Days</th>
              <th className="table-header">Reason</th>
              <th className="table-header">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {myLeaves.map(l => (
              <tr key={l.id} className="hover:bg-slate-50/50">
                <td className="table-cell font-medium">{l.leaveType}</td>
                <td className="table-cell text-sm text-slate-500">{formatDate(l.startDate)} – {formatDate(l.endDate)}</td>
                <td className="table-cell font-bold">{l.days}</td>
                <td className="table-cell text-sm text-slate-600 max-w-[200px] truncate">{l.reason}</td>
                <td className="table-cell"><Badge status={l.status} /></td>
              </tr>
            ))}
            {myLeaves.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-slate-400 text-sm">No leave requests</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Apply for Leave">
        <div className="space-y-4">
          <div><label className="label">Leave Type *</label>
            <select className="input" value={form.leaveType} onChange={e => setForm(p => ({ ...p, leaveType: e.target.value }))}>
              {mockLeaveBalance.map(lb => <option key={lb.leaveType}>{lb.leaveType}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Start Date *</label><input type="date" className="input" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} /></div>
            <div><label className="label">End Date *</label><input type="date" className="input" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} /></div>
          </div>
          <div><label className="label">Reason *</label><textarea className="input resize-none" rows={3} value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} /></div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" fullWidth onClick={() => setModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" fullWidth onClick={applyLeave}>
            Submit Request
          </Button>
        </div>
      </Modal>
    </div>
  );
}
