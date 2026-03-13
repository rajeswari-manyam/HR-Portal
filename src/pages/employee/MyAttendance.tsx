import { useState, useEffect } from 'react';
import { formatDate } from '../../utils/helpers';
import Badge from '../../components/shared/Badge';
import Table from '../../components/shared/Table';
import { todayKey, sessionKey } from '../../context/AuthContext';
import { markAttendance, getAttendance } from "../../service/attendance.service";
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
  isLive?: boolean;
}

// ── Live today row builder ────────────────────────────────────────────────────
function getTodayRow(employeeId: string): AttendanceRecord | null {
  const raw = localStorage.getItem(sessionKey(employeeId)); // ✅ scoped key
  if (!raw) return null;
  const stored = JSON.parse(raw);
  if (stored.date !== todayKey()) return null;

  const accSec = stored.accumulatedSeconds || 0;
  const liveSec = stored.loginAt
    ? Math.floor((Date.now() - stored.loginAt) / 1000)
    : 0;
  const totalSec = accSec + liveSec;
  const hours = Math.floor(totalSec / 3600);
  const workHours = parseFloat((totalSec / 3600).toFixed(1));

  const status =
    totalSec === 0 ? 'absent' :
      hours < 4 ? 'half-day' :
        hours < 6 ? 'late' :
          'present';

  const checkInStr = stored.firstLoginAt
    ? new Date(stored.firstLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : stored.loginAt
      ? new Date(stored.loginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '--:--';

  return {
    _id: 'today-live',
    employeeId,
    date: todayKey(),
    status,
    checkIn: checkInStr,
    checkOut: stored.loginAt ? undefined : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    workHours,
    isLive: !!stored.loginAt,
  };
}

// ── Live clock ────────────────────────────────────────────────────────────────
function LiveHours({ employeeId }: { employeeId: string }) {
  const [sec, setSec] = useState(0);

  useEffect(() => {
    const tick = () => {
      const raw = localStorage.getItem(sessionKey(employeeId)); // ✅ scoped key
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
  }, [employeeId]);

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
  const { user } = useAuth();
  const employeeId = user?.employeeId ?? '';

  const [apiRows, setApiRows] = useState<AttendanceRecord[]>([]);
  const [todayRow, setTodayRow] = useState<AttendanceRecord | null>(() => getTodayRow(employeeId));
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Fetch all attendance from API
  useEffect(() => {
    if (!employeeId) return;

    const fetchAttendance = async () => {
      try {
        setIsLoading(true);
        const data = await getAttendance(employeeId);
        const past = (data as AttendanceRecord[]).filter(r => r.date !== todayKey());
        setApiRows(past);
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, [employeeId]);

  // ✅ Mark attendance once per day
  useEffect(() => {
    if (!employeeId) return;

    const alreadyMarked = localStorage.getItem(`attendance_marked_${todayKey()}_${employeeId}`);
    if (alreadyMarked) return;
     
    const sendAttendance = async () => {
      try {
        await markAttendance({ employeeId, date: todayKey(), status: 'present' });
        localStorage.setItem(`attendance_marked_${todayKey()}_${employeeId}`, 'true');
      } catch (error) {
        console.error('Attendance Error:', error);

      }
    };
     console.log("Marking attendance");
    sendAttendance();
  }, [employeeId]);

  // Refresh live today row every minute
  useEffect(() => {
    const id = setInterval(() => setTodayRow(getTodayRow(employeeId)), 60_000);
    return () => clearInterval(id);
  }, [employeeId]);

  // ✅ Merge: live today row on top + past API rows
  const allRows: AttendanceRecord[] = todayRow ? [todayRow, ...apiRows] : apiRows;

  const stats = {
    present: allRows.filter(a => a.status === 'present').length,
    absent: allRows.filter(a => a.status === 'absent').length,
    late: allRows.filter(a => a.status === 'late').length,
    halfDay: allRows.filter(a => a.status === 'half-day').length,
  };

  const statCards = [
    { label: 'Present', value: stats.present, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Absent', value: stats.absent, color: 'bg-red-50 text-red-700 border-red-200' },
    { label: 'Late', value: stats.late, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'Half Day', value: stats.halfDay, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">My Attendance</h1>
        <p className="page-subtitle">Track your daily attendance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className={`border rounded-2xl px-5 py-4 ${s.color}`}>
            <p className="text-xs font-bold uppercase tracking-wider opacity-70">{s.label}</p>
            <p className="text-3xl font-black mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <Table
            columns={[
              {
                header: 'Date',
                render: (r: AttendanceRecord) => (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{formatDate(r.date)}</span>
                    {r.isLive && (
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
                render: (r: AttendanceRecord) => <Badge status={r.status} />,
              },
              {
                header: 'Check-in',
                render: (r: AttendanceRecord) => (
                  <span className="text-sm font-mono">{r.checkIn || '—'}</span>
                ),
              },
              {
                header: 'Check-out',
                render: (r: AttendanceRecord) => (
                  r.isLive
                    ? <span className="text-xs text-gray-400 italic">Active session</span>
                    : <span className="text-sm font-mono">{r.checkOut || '—'}</span>
                ),
              },
              {
                header: 'Hours Worked',
                render: (r: AttendanceRecord) => (
                  r.isLive
                    ? <LiveHours employeeId={employeeId} /> // ✅ pass employeeId
                    : <span className="text-sm">{r.workHours ? `${r.workHours}h` : '—'}</span>
                ),
              },
            ]}
            data={allRows}
          />
        )}
      </div>
    </div>
  );
}