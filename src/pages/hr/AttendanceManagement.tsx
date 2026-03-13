import { useState } from 'react';
import { Calendar, Download, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { mockAttendance } from '../../data/mockData';
import { AttendanceRecord } from '../../types';
import Badge from '../../components/shared/Badge';
import SearchInput from '../../components/shared/SearchInput';
import Modal from '../../components/shared/Modal';
import { formatDate } from '../../utils/helpers';
import Button from '../../components/shared/Button';
import StatCard from '../../components/shared/StatCard';
import InputField from '../../components/shared/InputField';
import Select from '../../components/shared/Select';
import Table from '../../components/shared/Table';

export default function AttendanceManagement() {
  const [records, setRecords] = useState<AttendanceRecord[]>(mockAttendance);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState<'edit' | null>(null);
  const [selected, setSelected] = useState<AttendanceRecord | null>(null);
  const [form, setForm] = useState<Partial<AttendanceRecord>>({});

  const filtered = records.filter(r => {
    const matchSearch = r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      r.employeeId.toLowerCase().includes(search.toLowerCase());
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
    if (selected) {
      setRecords(prev => prev.map(r => r.id === selected.id ? { ...r, ...form } as AttendanceRecord : r));
    }
    setModal(null);
  };

  const columns = [
    {
      header: 'Employee',
      render: (r: AttendanceRecord) => (
        <div>
          <p className="font-semibold text-slate-900">{r.employeeName}</p>
          <p className="text-xs text-slate-400">{r.employeeId}</p>
        </div>
      ),
    },
    {
      header: 'Date',
      render: (r: AttendanceRecord) => formatDate(r.date),
    },
    {
      header: 'Check In',
      render: (r: AttendanceRecord) => r.checkIn
        ? <span className="font-mono text-sm text-emerald-600 font-semibold">{r.checkIn}</span>
        : <span className="text-slate-300">—</span>,
    },
    {
      header: 'Check Out',
      render: (r: AttendanceRecord) => r.checkOut
        ? <span className="font-mono text-sm text-slate-600 font-semibold">{r.checkOut}</span>
        : <span className="text-slate-300">—</span>,
    },
    {
      header: 'Work Hours',
      render: (r: AttendanceRecord) => r.workHours
        ? <span className="text-sm font-semibold text-slate-700">{r.workHours}h</span>
        : <span className="text-slate-300">—</span>,
    },
    {
      header: 'Status',
      render: (r: AttendanceRecord) => <Badge status={r.status} />,
    },
    {
      header: 'Actions',
      render: (r: AttendanceRecord) => (
        <button onClick={() => openEdit(r)} className="text-xs font-semibold text-primary-600 hover:text-primary-700">
          Edit
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">Track and manage employee attendance</p>
        </div>
        <Button className="btn-secondary">
          <Download size={16} /> Export
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Present', value: stats.present, icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600' },
          { label: 'Absent', value: stats.absent, icon: XCircle, color: 'bg-red-100 text-red-600' },
          { label: 'Late', value: stats.late, icon: Clock, color: 'bg-amber-100 text-amber-600' },
          { label: 'Half Day', value: stats.halfDay, icon: AlertCircle, color: 'bg-blue-100 text-blue-600' },
        ].map(s => (
          <StatCard key={s.label} title={s.label} value={s.value} icon={<s.icon size={20} />} color={s.color} />
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <SearchInput value={search} onChange={setSearch} placeholder="Search employee..." />
          <div className="relative">
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="input pr-10"
            />
            <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <div>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'Present', value: 'present' },
              { label: 'Absent', value: 'absent' },
              { label: 'Late', value: 'late' },
              { label: 'Half Day', value: 'half-day' },
            ]}
            placeholder="All Status"
            className="max-w-[140px]"
          />
          {(dateFilter || statusFilter) && (
            <button onClick={() => { setDateFilter(''); setStatusFilter(''); }} className="btn-secondary py-2">
              Clear
            </button>
          )}
        
        </div>
      </div>
</div>
      {/* Table */}
      <Table
        columns={columns}
        data={filtered}
        rowsPerPage={4}
        emptyMessage="No attendance records found"
      />

      {/* Edit Modal */}
      <Modal isOpen={modal !== null} onClose={() => setModal(null)} title="Edit Attendance">
        <div className="space-y-4">
          <InputField
            label="Date"
            type="date"
            value={form.date || ''}
            onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Check In"
              type="time"
              value={form.checkIn || ''}
              onChange={e => setForm(p => ({ ...p, checkIn: e.target.value }))}
            />
            <InputField
              label="Check Out"
              type="time"
              value={form.checkOut || ''}
              onChange={e => setForm(p => ({ ...p, checkOut: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={form.status || 'present'}
              onChange={e => setForm(p => ({ ...p, status: e.target.value as AttendanceRecord['status'] }))}
            >
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