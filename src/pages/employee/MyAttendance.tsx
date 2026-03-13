import { useState, useEffect } from 'react';
import { formatDate } from '../../utils/helpers';
import Badge from '../../components/shared/Badge';
import Table from '../../components/shared/Table';
import { getAttendance, calcWorkHours } from '../../service/attendance.service';
import { useAuth } from '../../context/AuthContext';

// ── Types ─────────────────────────────────────────────────────────────────────
interface AttendanceRecord {
  _id: string;
  employeeId: string;
  date: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
  workHours?: number;
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

// ── Main Component ────────────────────────────────────────────────────────────
export default function MyAttendance() {
  const { user } = useAuth();
  const employeeId = user?.employeeId ?? '';

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Fetch attendance by employeeId ────────────────────────────────────────
  useEffect(() => {
    if (!employeeId) return;
    (async () => {
      try {
        setIsLoading(true);
        const data = await getAttendance(employeeId);
        const enriched = (data as AttendanceRecord[])
          .map(r => ({
            ...r,
            workHours: r.workHours ?? calcWorkHours(r.checkIn, r.checkOut),
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecords(enriched);
      } catch (err) {
        console.error('Failed to fetch attendance:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [employeeId]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    late: records.filter(r => r.status === 'late').length,
    halfDay: records.filter(r => r.status === 'half-day').length,
  };

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      header: 'Date',
      render: (r: AttendanceRecord) => (
        <span className="text-sm font-medium">{formatDate(r.date)}</span>
      ),
    },
    {
      header: 'Status',
      render: (r: AttendanceRecord) => <Badge status={r.status} />,
    },
    {
      header: 'Check In',
      render: (r: AttendanceRecord) =>
        r.checkIn ? (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
            <span className="text-sm font-mono font-semibold text-emerald-700">
              {fmt12(r.checkIn)}
            </span>
          </div>
        ) : (
          <span className="text-slate-300 text-sm">—</span>
        ),
    },
    {
      header: 'Check Out',
      render: (r: AttendanceRecord) =>
        r.checkOut ? (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />
            <span className="text-sm font-mono font-semibold text-rose-700">
              {fmt12(r.checkOut)}
            </span>
          </div>
        ) : (
          <span className="text-slate-300 text-sm">—</span>
        ),
    },
    {
      header: 'Hours Worked',
      render: (r: AttendanceRecord) =>
        r.workHours !== undefined ? (
          <span
            className={`text-sm font-bold ${r.workHours >= 8
                ? 'text-emerald-600'
                : r.workHours >= 4
                  ? 'text-amber-500'
                  : 'text-red-500'
              }`}
          >
            {r.workHours}h
          </span>
        ) : (
          <span className="text-slate-300 text-sm">—</span>
        ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">My Attendance</h1>
        <p className="page-subtitle">Track your daily attendance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Present', value: stats.present, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          { label: 'Absent', value: stats.absent, color: 'bg-red-50 text-red-700 border-red-200' },
          { label: 'Late', value: stats.late, color: 'bg-amber-50 text-amber-700 border-amber-200' },
          { label: 'Half Day', value: stats.halfDay, color: 'bg-blue-50 text-blue-700 border-blue-200' },
        ].map(s => (
          <div key={s.label} className={`border rounded-2xl px-5 py-4 ${s.color}`}>
            <p className="text-xs font-bold uppercase tracking-wider opacity-70">{s.label}</p>
            <p className="text-3xl font-black mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <Table
            columns={columns}
            data={records}
            emptyMessage="No attendance records found"
          />
        )}
      </div>
    </div>
  );
}