import { useState } from 'react';
import { Calendar, Download, Filter, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { mockAttendance } from '../../data/mockData';
import { AttendanceRecord } from '../../types';
import Badge from '../../components/shared/Badge';
import SearchInput from '../../components/shared/SearchInput';
import Modal from '../../components/shared/Modal';
import { formatDate } from '../../utils/helpers';
import Button from '../../components/shared/Button';
export default function AttendanceManagement() {
  const [records, setRecords] = useState<AttendanceRecord[]>(mockAttendance);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [selected, setSelected] = useState<AttendanceRecord | null>(null);
  const [form, setForm] = useState<Partial<AttendanceRecord>>({});

  const filtered = records.filter(r => {
    const matchSearch = r.employeeName.toLowerCase().includes(search.toLowerCase()) || r.employeeId.toLowerCase().includes(search.toLowerCase());
    const matchDate = !dateFilter || r.date === dateFilter;
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchDate && matchStatus;
  });

  const stats = {
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    late: records.filter(r => r.status === 'late').length,
    halfDay: records.filter(r => r.status === 'half-day').length,
  };

  const openEdit = (r: AttendanceRecord) => { setSelected(r); setForm({ ...r }); setModal('edit'); };

  const handleSave = () => {
    if (modal === 'edit' && selected) {
      setRecords(prev => prev.map(r => r.id === selected.id ? { ...r, ...form } as AttendanceRecord : r));
    } else if (modal === 'add') {
      setRecords(prev => [...prev, { ...form, id: Date.now().toString() } as AttendanceRecord]);
    }
    setModal(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Attendance</h1><p className="page-subtitle">Track and manage employee attendance</p></div>
        <div className="flex gap-2">
          <Button className="btn-secondary"><Download size={16} /> Export</Button>
          <Button onClick={() => { setForm({ date: new Date().toISOString().split('T')[0], status: 'present' }); setModal('add'); }} className="btn-primary"><Calendar size={16} /> Mark Attendance</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Present', value: stats.present, icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Absent', value: stats.absent, icon: XCircle, color: 'bg-red-100 text-red-600', bg: 'bg-red-50' },
          { label: 'Late', value: stats.late, icon: Clock, color: 'bg-amber-100 text-amber-600', bg: 'bg-amber-50' },
          { label: 'Half Day', value: stats.halfDay, icon: AlertCircle, color: 'bg-blue-100 text-blue-600', bg: 'bg-blue-50' },
        ].map(s => (
          <div key={s.label} className={`card flex items-center gap-4 ${s.bg}`}>
            <div className={`stat-icon ${s.color}`}><s.icon size={20} /></div>
            <div><p className="text-2xl font-black text-slate-900">{s.value}</p><p className="text-sm text-slate-500 font-medium">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search employee..." />
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="input max-w-[160px]" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input max-w-[140px]">
            <option value="">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="half-day">Half Day</option>
          </select>
          {(dateFilter || statusFilter) && (
            <button onClick={() => { setDateFilter(''); setStatusFilter(''); }} className="btn-secondary py-2">Clear</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="table-header">Employee</th>
                <th className="table-header">Date</th>
                <th className="table-header">Check In</th>
                <th className="table-header">Check Out</th>
                <th className="table-header">Work Hours</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="table-cell">
                    <p className="font-semibold text-slate-900">{r.employeeName}</p>
                    <p className="text-xs text-slate-400">{r.employeeId}</p>
                  </td>
                  <td className="table-cell">{formatDate(r.date)}</td>
                  <td className="table-cell">
                    {r.checkIn ? <span className="font-mono text-sm text-emerald-600 font-semibold">{r.checkIn}</span> : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="table-cell">
                    {r.checkOut ? <span className="font-mono text-sm text-slate-600 font-semibold">{r.checkOut}</span> : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="table-cell">
                    {r.workHours ? <span className="text-sm font-semibold text-slate-700">{r.workHours}h</span> : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="table-cell"><Badge status={r.status} /></td>
                  <td className="table-cell">
                    <button onClick={() => openEdit(r)} className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">Edit</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-sm">No attendance records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={modal !== null} onClose={() => setModal(null)} title={modal === 'add' ? 'Mark Attendance' : 'Edit Attendance'}>
        <div className="space-y-4">
          {modal === 'add' && (
            <div><label className="label">Employee ID</label><input className="input" placeholder="e.g. EMP001" value={form.employeeId || ''} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))} /></div>
          )}
          <div><label className="label">Date</label><input type="date" className="input" value={form.date || ''} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Check In</label><input type="time" className="input" value={form.checkIn || ''} onChange={e => setForm(p => ({ ...p, checkIn: e.target.value }))} /></div>
            <div><label className="label">Check Out</label><input type="time" className="input" value={form.checkOut || ''} onChange={e => setForm(p => ({ ...p, checkOut: e.target.value }))} /></div>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status || 'present'} onChange={e => setForm(p => ({ ...p, status: e.target.value as AttendanceRecord['status'] }))}>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button onClick={() => setModal(null)} className="btn-secondary flex-1 justify-center">Cancel</Button>
          <Button onClick={handleSave} className="btn-primary flex-1 justify-center">Save</Button>
        </div>
      </Modal>
    </div>
  );
}
