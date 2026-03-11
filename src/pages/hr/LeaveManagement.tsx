import { useState } from 'react';
import { Check, X, Clock, Calendar } from 'lucide-react';
import { mockLeaveRequests } from '../../data/mockData';
import { LeaveRequest } from '../../types';
import Badge from '../../components/shared/Badge';
import SearchInput from '../../components/shared/SearchInput';
import Modal from '../../components/shared/Modal';
import Avatar from '../../components/shared/Avatar';
import { formatDate } from '../../utils/helpers';

export default function LeaveManagement() {
  const [requests, setRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewModal, setViewModal] = useState(false);
  const [selected, setSelected] = useState<LeaveRequest | null>(null);

  const filtered = requests.filter(r => {
    const matchSearch = r.employeeName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pending = requests.filter(r => r.status === 'pending').length;
  const approved = requests.filter(r => r.status === 'approved').length;
  const rejected = requests.filter(r => r.status === 'rejected').length;

  const updateStatus = (id: string, status: 'approved' | 'rejected') => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status, approvedBy: 'Rahul Verma' } : r));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Leave Management</h1><p className="page-subtitle">Review and manage leave requests</p></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', value: pending, color: 'bg-amber-50 border-amber-200', icon: Clock, iconColor: 'bg-amber-100 text-amber-600' },
          { label: 'Approved', value: approved, color: 'bg-emerald-50 border-emerald-200', icon: Check, iconColor: 'bg-emerald-100 text-emerald-600' },
          { label: 'Rejected', value: rejected, color: 'bg-red-50 border-red-200', icon: X, iconColor: 'bg-red-100 text-red-600' },
        ].map(s => (
          <div key={s.label} className={`card border ${s.color} flex items-center gap-4`}>
            <div className={`stat-icon ${s.iconColor}`}><s.icon size={20} /></div>
            <div><p className="text-2xl font-black text-slate-900">{s.value}</p><p className="text-sm text-slate-500 font-medium">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search employee..." />
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {['', 'pending', 'approved', 'rejected'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${statusFilter === s ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="table-header">Employee</th>
                <th className="table-header">Leave Type</th>
                <th className="table-header">Duration</th>
                <th className="table-header">Days</th>
                <th className="table-header">Reason</th>
                <th className="table-header">Applied</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.employeeName} size="sm" />
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{r.employeeName}</p>
                        <p className="text-xs text-slate-400">{r.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="flex items-center gap-1.5 text-sm"><Calendar size={13} className="text-slate-400" />{r.leaveType}</span>
                  </td>
                  <td className="table-cell text-sm text-slate-600">
                    {formatDate(r.startDate)} – {formatDate(r.endDate)}
                  </td>
                  <td className="table-cell">
                    <span className="font-bold text-slate-900">{r.days}</span>
                    <span className="text-slate-400 text-xs ml-1">day{r.days > 1 ? 's' : ''}</span>
                  </td>
                  <td className="table-cell max-w-[200px]">
                    <p className="text-sm text-slate-600 truncate">{r.reason}</p>
                  </td>
                  <td className="table-cell text-sm text-slate-500">{formatDate(r.appliedOn)}</td>
                  <td className="table-cell"><Badge status={r.status} /></td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setSelected(r); setViewModal(true); }} className="text-xs font-semibold text-primary-600 hover:text-primary-700 mr-1">View</button>
                      {r.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(r.id, 'approved')} className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors">
                            <Check size={13} />
                          </button>
                          <button onClick={() => updateStatus(r.id, 'rejected')} className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors">
                            <X size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400 text-sm">No leave requests found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="Leave Request Details">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
              <Avatar name={selected.employeeName} size="lg" />
              <div>
                <p className="font-bold text-slate-900">{selected.employeeName}</p>
                <p className="text-sm text-slate-500">{selected.department}</p>
              </div>
              <Badge status={selected.status} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Leave Type', selected.leaveType], ['Days', `${selected.days} day${selected.days > 1 ? 's' : ''}`],
                ['Start Date', formatDate(selected.startDate)], ['End Date', formatDate(selected.endDate)],
                ['Applied On', formatDate(selected.appliedOn)], ['Approved By', selected.approvedBy || 'Pending'],
              ].map(([k, v]) => (
                <div key={k} className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">{k}</p>
                  <p className="font-semibold text-slate-900 text-sm">{v}</p>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-400 mb-1">Reason</p>
              <p className="text-sm text-slate-700">{selected.reason}</p>
            </div>
            {selected.status === 'pending' && (
              <div className="flex gap-3">
                <button onClick={() => { updateStatus(selected.id, 'rejected'); setViewModal(false); }} className="btn-danger flex-1 justify-center">Reject</button>
                <button onClick={() => { updateStatus(selected.id, 'approved'); setViewModal(false); }} className="btn-success flex-1 justify-center">Approve</button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
