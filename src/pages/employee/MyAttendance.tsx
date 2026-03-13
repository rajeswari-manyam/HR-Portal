import { useState, useEffect } from 'react';
import { mockAttendance } from '../../data/mockData';
import { formatDate } from '../../utils/helpers';
import Badge from '../../components/shared/Badge';
import Table from '../../components/shared/Table';
import { todayKey } from '../../context/AuthContext';

// ── Live today row builder ────────────────────────────────────────────────────
function getTodayRow() {
  const raw = localStorage.getItem('session_data');
  if (!raw) return null;
  const stored = JSON.parse(raw);
  if (stored.date !== todayKey()) return null;

  const accSec = stored.accumulatedSeconds || 0;
  const liveSec = stored.loginAt
    ? Math.floor((Date.now() - stored.loginAt) / 1000)
    : 0;
  const totalSec = accSec + liveSec;

  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const workHours = parseFloat((totalSec / 3600).toFixed(1));

  // Derive status from hours worked
  const status =
    totalSec === 0 ? 'absent' :
      hours < 4 ? 'half-day' :
        hours < 6 ? 'late' :
          'present';

  // Check-in = loginAt of first session today (stored when date was first set)
  const checkInTime = stored.loginAt
    ? new Date(stored.loginAt - (accSec * 1000)) // approximate first login
    : null;

  // Use the very first loginAt stored — re-read raw for firstLoginAt if you store it
  const checkInStr = stored.firstLoginAt
    ? new Date(stored.firstLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : stored.loginAt
      ? new Date(stored.loginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '--:--';

  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    id: 'today-live',
    employeeId: 'EMP001',
    date: todayKey(),
    status,
    checkIn: checkInStr,
    checkOut: stored.loginAt ? null : nowStr, // null means still active
    workHours,
    isLive: !!stored.loginAt,
  };
}

type TodayRow = NonNullable<ReturnType<typeof getTodayRow>>;
type AttRow = TodayRow | (typeof mockAttendance)[number];

// ── Live clock for today's hours cell ────────────────────────────────────────
function LiveHours() {
  const [sec, setSec] = useState(0);

  useEffect(() => {
    const tick = () => {
      const raw = localStorage.getItem('session_data');
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s.date !== todayKey()) return;
      const acc = s.accumulatedSeconds || 0;
      const live = s.loginAt ? Math.floor((Date.now() - s.loginAt) / 1000) : 0;
      setSec(acc + live);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <span className="font-mono text-emerald-600 font-bold text-sm">
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MyAttendance() {
  const [todayRow, setTodayRow] = useState(getTodayRow);

  // Refresh today row every minute (status might change half-day → present etc.)
  useEffect(() => {
    const id = setInterval(() => setTodayRow(getTodayRow()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Merge: replace any existing today entry in mock data, or prepend
  const pastRows = mockAttendance.filter(
    a => a.employeeId === 'EMP001' && a.date !== todayKey()
  );
  const allRows: AttRow[] = todayRow ? [todayRow, ...pastRows] : pastRows;

  // Summary stats (from merged data)
  const stats = {
    present: allRows.filter(a => a?.status === 'present').length,
    absent: allRows.filter(a => a?.status === 'absent').length,
    late: allRows.filter(a => a?.status === 'late').length,
    halfDay: allRows.filter(a => a?.status === 'half-day').length,
  };

  const statCards = [
    { label: 'Present', value: stats.present, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Absent', value: stats.absent, color: 'bg-red-50 text-red-700 border-red-200' },
    { label: 'Late', value: stats.late, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'Half Day', value: stats.halfDay, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="page-title">My Attendance</h1>
        <p className="page-subtitle">Track your daily attendance</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className={`border rounded-2xl px-5 py-4 ${s.color}`}>
            <p className="text-xs font-bold uppercase tracking-wider opacity-70">{s.label}</p>
            <p className="text-3xl font-black mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <Table
          columns={[
            {
              header: 'Date',
              render: (r: AttRow) => (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{formatDate(r!.date)}</span>
                  {(r as any).isLive && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      TODAY
                    </span>
                  )}
                </div>
              ),
            },
            {
              header: 'Status',
              render: (r: AttRow) => <Badge status={r!.status} />,
            },
            {
              header: 'Check-in',
              render: (r: AttRow) => (
                <span className="text-sm font-mono">{r!.checkIn || '—'}</span>
              ),
            },
            {
              header: 'Check-out',
              render: (r: AttRow) => (
                (r as any).isLive
                  ? <span className="text-xs text-gray-400 italic">Active session</span>
                  : <span className="text-sm font-mono">{r!.checkOut || '—'}</span>
              ),
            },
            {
              header: 'Hours Worked',
              render: (r: AttRow) => (
                (r as any).isLive
                  ? <LiveHours />
                  : <span className="text-sm">{r!.workHours ? `${r!.workHours}h` : '—'}</span>
              ),
            },
          ]}
          data={allRows}
        />
      </div>
    </div>
  );
}