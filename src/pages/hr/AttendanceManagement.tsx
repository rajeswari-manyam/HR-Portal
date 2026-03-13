import { useState, useEffect } from 'react';
import { Calendar, Download, CheckCircle, XCircle, Clock, AlertCircle, Plus } from 'lucide-react';
import { getAttendance, updateAttendance, markAttendance, calcWorkHours } from '../../service/attendance.service';
import Badge from '../../components/shared/Badge';
import SearchInput from '../../components/shared/SearchInput';
import Modal from '../../components/shared/Modal';
import { formatDate } from '../../utils/helpers';
import Button from '../../components/shared/Button';
import StatCard from '../../components/shared/StatCard';
import InputField from '../../components/shared/InputField';
import Select from '../../components/shared/Select';
import Table from '../../components/shared/Table';

// ── Types ─────────────────────────────────────────────────────────────────────
interface AttendanceRecord {
  _id: string;
  employeeId: string;
  date: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
  workHours?: number;
  employeeName?: string;
}

interface AddAttendanceForm {
  employeeId: string;
  date: string;
  status: string;
  checkIn: string;
  checkOut: string;
}

// ── Derive attendance status from work hours ──────────────────────────────────
function deriveStatus(checkIn?: string, checkOut?: string, manualStatus?: string): string {
  if (manualStatus) return manualStatus;
  if (!checkIn) return 'absent';
  const wh = calcWorkHours(checkIn, checkOut);
  if (wh === undefined) return 'present';
  if (wh < 4) return 'half-day';
  if (wh < 6) return 'late';
  return 'present';
}

// ── Format "09:05" → "09:05 AM" ──────────────────────────────────────────────
function fmt12(time?: string): string {
  if (!time) return '—';
  if (/AM|PM/i.test(time)) return time;
  const [hStr, mStr] = time.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr ?? '00';
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${m} ${period}`;
}

const EMPTY_ADD_FORM: AddAttendanceForm = {
  employeeId: '',
  date: new Date().toISOString().split('T')[0],
  status: 'present',
  checkIn: '',
  checkOut: '',
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function AttendanceManagement() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState<'edit' | 'add' | null>(null);
  const [selected, setSelected] = useState<AttendanceRecord | null>(null);
  const [form, setForm] = useState<Partial<AttendanceRecord>>({});
  const [addForm, setAddForm] = useState<AddAttendanceForm>(EMPTY_ADD_FORM);
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // ── Fetch all attendance ──────────────────────────────────────────────────
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const data = await getAttendance();
      const enriched = (data as AttendanceRecord[]).map(r => ({
        ...r,
        workHours: r.workHours ?? calcWorkHours(r.checkIn, r.checkOut),
      }));
      setRecords(enriched);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = records.filter(r => {
    const name = r.employeeName ?? r.employeeId;
    const matchSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      r.employeeId.toLowerCase().includes(search.toLowerCase());
    const matchDate = !dateFilter || r.date === dateFilter;
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchDate && matchStatus;
  });

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    late: records.filter(r => r.status === 'late').length,
    halfDay: records.filter(r => r.status === 'half-day').length,
  };

  // ── Edit modal ────────────────────────────────────────────────────────────
  const openEdit = (r: AttendanceRecord) => {
    setSelected(r);
    setForm({ ...r });
    setModal('edit');
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const autoStatus = form.status !== selected.status
        ? form.status
        : deriveStatus(form.checkIn, form.checkOut);

      const updated = await updateAttendance(selected._id, {
        date: form.date,
        status: autoStatus,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
      });

      const enriched: AttendanceRecord = {
        ...selected,
        ...updated,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        status: autoStatus ?? updated.status,
        workHours: calcWorkHours(form.checkIn, form.checkOut),
      };

      setRecords(prev => prev.map(r => r._id === selected._id ? enriched : r));
      setModal(null);
    } catch (err) {
      console.error('Failed to update attendance:', err);
    } finally {
      setSaving(false);
    }
  };

  // ── Add Attendance ────────────────────────────────────────────────────────
  const openAdd = () => {
    setAddForm(EMPTY_ADD_FORM);
    setAddError(null);
    setModal('add');
  };

  const handleAdd = async () => {
    if (!addForm.employeeId.trim()) {
      setAddError('Employee ID is required.');
      return;
    }
    if (!addForm.date) {
      setAddError('Date is required.');
      return;
    }
    setSaving(true);
    setAddError(null);
    try {
      // Auto-derive status from times if not manually chosen as absent
      const autoStatus =
        addForm.status === 'absent'
          ? 'absent'
          : deriveStatus(addForm.checkIn || undefined, addForm.checkOut || undefined, addForm.status);

      const newRecord = await markAttendance({
        employeeId: addForm.employeeId.trim(),
        date: addForm.date,
        status: autoStatus,
        checkIn: addForm.checkIn || undefined,
        checkOut: addForm.checkOut || undefined,
      });

      // Enrich with calculated work hours and add to list
      const enriched: AttendanceRecord = {
        ...newRecord,
        workHours: calcWorkHours(addForm.checkIn || undefined, addForm.checkOut || undefined),
      };

      setRecords(prev => [enriched, ...prev]);
      setModal(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add attendance';
      setAddError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Live previews in modals ───────────────────────────────────────────────
  const modalWorkHours = calcWorkHours(form.checkIn, form.checkOut);
  const modalStatus = deriveStatus(form.checkIn, form.checkOut, form.status);

  const addWorkHours = calcWorkHours(
    addForm.checkIn || undefined,
    addForm.checkOut || undefined
  );
  const addAutoStatus = deriveStatus(
    addForm.checkIn || undefined,
    addForm.checkOut || undefined,
    addForm.status
  );

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      header: 'Employee',
      render: (r: AttendanceRecord) => (
        <div>
          <p className="font-semibold text-slate-900">{r.employeeName ?? r.employeeId}</p>
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
      render: (r: AttendanceRecord) =>
        r.checkIn ? (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
            <span className="font-mono text-sm text-emerald-700 font-semibold">{fmt12(r.checkIn)}</span>
          </div>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      header: 'Check Out',
      render: (r: AttendanceRecord) =>
        r.checkOut ? (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />
            <span className="font-mono text-sm text-rose-700 font-semibold">{fmt12(r.checkOut)}</span>
          </div>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
    {
      header: 'Work Hours',
      render: (r: AttendanceRecord) => {
        const wh = r.workHours ?? calcWorkHours(r.checkIn, r.checkOut);
        if (wh === undefined) return <span className="text-slate-300">—</span>;
        return (
          <span className={`text-sm font-semibold ${wh >= 8 ? 'text-emerald-600' : wh >= 6 ? 'text-emerald-500' : wh >= 4 ? 'text-amber-500' : 'text-red-500'}`}>
            {wh}h
          </span>
        );
      },
    },
    {
      header: 'Status',
      render: (r: AttendanceRecord) => <Badge status={r.status} />,
    },
    {
      header: 'Actions',
      render: (r: AttendanceRecord) => (
        <button
          onClick={() => openEdit(r)}
          className="text-xs font-semibold text-primary-600 hover:text-primary-700"
        >
          Edit
        </button>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">Track and manage employee attendance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={openAdd} className="btn-primary">
            <Plus size={16} /> Add Attendance
          </Button>
          <Button className="btn-secondary">
            <Download size={16} /> Export
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Present', value: stats.present, icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600' },
          { label: 'Absent', value: stats.absent, icon: XCircle, color: 'bg-red-100 text-red-600' },
          { label: 'Late', value: stats.late, icon: Clock, color: 'bg-amber-100 text-amber-600' },
          { label: 'Half Day', value: stats.halfDay, icon: AlertCircle, color: 'bg-blue-100 text-blue-600' },
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
          <div className="flex items-center gap-2">
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
              <button
                onClick={() => { setDateFilter(''); setStatusFilter(''); }}
                className="btn-secondary py-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <Table
          columns={columns}
          data={filtered}
          rowsPerPage={10}
          emptyMessage="No attendance records found"
        />
      )}

      {/* ── Add Attendance Modal ─────────────────────────────────────────── */}
      <Modal isOpen={modal === 'add'} onClose={() => setModal(null)} title="Add Attendance">
        <div className="space-y-4">

          {/* Employee ID */}
          <InputField
            label="Employee ID"
            type="text"
            placeholder="e.g. EMP001"
            value={addForm.employeeId}
            onChange={e => setAddForm(p => ({ ...p, employeeId: e.target.value }))}
          />

          {/* Date */}
          <InputField
            label="Date"
            type="date"
            value={addForm.date}
            onChange={e => setAddForm(p => ({ ...p, date: e.target.value }))}
          />

          {/* Check In & Check Out */}
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Check In"
              type="time"
              value={addForm.checkIn}
              onChange={e => setAddForm(p => ({ ...p, checkIn: e.target.value }))}
            />
            <InputField
              label="Check Out"
              type="time"
              value={addForm.checkOut}
              onChange={e => setAddForm(p => ({ ...p, checkOut: e.target.value }))}
            />
          </div>

          {/* Auto-calculated preview */}
          {(addForm.checkIn || addForm.checkOut) && (
            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Calculated work hours</span>
                <span className="font-bold text-slate-900">
                  {addWorkHours !== undefined ? `${addWorkHours}h` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Auto status</span>
                <Badge status={addAutoStatus} />
              </div>
            </div>
          )}

          {/* Status override */}
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={addForm.status}
              onChange={e => setAddForm(p => ({ ...p, status: e.target.value }))}
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Auto-detected from check-in/out times, or override manually.
            </p>
          </div>

          {/* Error */}
          {addError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {addError}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={() => setModal(null)} className="btn-secondary flex-1 justify-center">
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            className="btn-primary flex-1 justify-center"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Add Record'}
          </Button>
        </div>
      </Modal>

      {/* ── Edit Attendance Modal ────────────────────────────────────────── */}
      <Modal isOpen={modal === 'edit'} onClose={() => setModal(null)} title="Edit Attendance">
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

          {(form.checkIn || form.checkOut) && (
            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Calculated work hours</span>
                <span className="font-bold text-slate-900">
                  {modalWorkHours !== undefined ? `${modalWorkHours}h` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Auto status</span>
                <Badge status={modalStatus} />
              </div>
            </div>
          )}

          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={form.status || 'present'}
              onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Leave as auto-detected or override manually above.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={() => setModal(null)} className="btn-secondary flex-1 justify-center">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="btn-primary flex-1 justify-center"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}