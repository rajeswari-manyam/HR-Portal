import { useState, useEffect, useRef } from 'react';
import { CalendarCheck, CalendarDays, Gift, Clock, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { todayKey } from '../../context/AuthContext';
import { mockLeaveBalance, mockHolidays, mockAnnouncements, mockAttendance, mockPayslips } from '../../data/mockData';
import { formatDate } from '../../utils/helpers';
import Avatar from '../../components/shared/Avatar';
import Badge from '../../components/shared/Badge';
import StatCard from '../../components/shared/StatCard';

// ── Session Timer Hook ────────────────────────────────────────────────────────
// Reads accumulatedSeconds (from previous logins today) + live elapsed since loginAt.
// Resets automatically if the stored date is not today.
function useSessionTimer() {
  const getState = () => {
    const raw = localStorage.getItem('session_data');
    if (!raw) return { accumulatedSeconds: 0, loginAt: Date.now() };
    const stored = JSON.parse(raw);
    // If it's a new day, treat as zero
    if (stored.date !== todayKey()) return { accumulatedSeconds: 0, loginAt: Date.now() };
    return {
      accumulatedSeconds: stored.accumulatedSeconds || 0,
      loginAt: stored.loginAt || Date.now(),
    };
  };

  const [totalSeconds, setTotalSeconds] = useState(() => {
    const { accumulatedSeconds, loginAt } = getState();
    return accumulatedSeconds + Math.floor((Date.now() - loginAt) / 1000);
  });

  useEffect(() => {
    const id = setInterval(() => {
      const { accumulatedSeconds, loginAt } = getState();
      setTotalSeconds(accumulatedSeconds + Math.floor((Date.now() - loginAt) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  // First login time today
  const loginAt = (() => {
    const raw = localStorage.getItem('session_data');
    if (!raw) return null;
    const s = JSON.parse(raw);
    return s.date === todayKey() ? s.loginAt : null;
  })();

  return { display: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`, hours, loginAt };
}

// ── Session Timer Card ────────────────────────────────────────────────────────
function SessionTimerCard() {
  const { display, hours, loginAt } = useSessionTimer();

  const dotColor = hours < 3 ? 'bg-emerald-400' : hours < 6 ? 'bg-amber-400' : 'bg-rose-400';
  const ringColor = hours < 3 ? 'ring-emerald-200' : hours < 6 ? 'ring-amber-200' : 'ring-rose-200';
  const textColor = hours < 3 ? 'text-emerald-600' : hours < 6 ? 'text-amber-600' : 'text-rose-600';
  const bgColor = hours < 3 ? 'bg-emerald-50' : hours < 6 ? 'bg-amber-50' : 'bg-rose-50';
  const borderHex = hours < 3 ? '#6ee7b7' : hours < 6 ? '#fcd34d' : '#fca5a5';

  const loginStr = loginAt
    ? new Date(loginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  return (
    <div
      className={`${bgColor} border rounded-2xl px-5 py-4 flex items-center justify-between col-span-1`}
      style={{ borderColor: borderHex }}
    >
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <span className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Today's Session</p>
        </div>
        <p className={`text-2xl font-black tracking-widest font-mono ${textColor}`}>{display}</p>
        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <LogIn size={11} />
          First login at {loginStr}
        </p>
      </div>
      <div className={`w-12 h-12 rounded-full ring-4 ${ringColor} ${bgColor} flex items-center justify-center`}>
        <Clock size={22} className={textColor} />
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function EmployeeDashboard() {
  const { user } = useAuth();
  const myAttendance = mockAttendance.filter(a => a.employeeId === 'EMP001').slice(0, 5);
  const upcomingHolidays = mockHolidays.slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Welcome Banner */}
      <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
        <div className="flex items-center gap-4">
          <Avatar name={user?.name || ''} size="xl" />
          <div>
            <h1 className="text-2xl font-black">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-primary-200 mt-1">{user?.designation} · {user?.department}</p>
            <div className="flex gap-3 mt-3">
              <span className="px-3 py-1.5 bg-white/10 rounded-xl text-sm font-medium">{user?.employeeId}</span>
              <span className="px-3 py-1.5 bg-white/10 rounded-xl text-sm font-medium">
                Joined {formatDate(user?.joinDate || '')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Days Present"
          value={myAttendance.filter(a => a.status === 'present').length.toString()}
          icon={<CalendarCheck size={20} />}
          change="This month"
          color="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          title="Leave Balance"
          value="13"
          icon={<CalendarDays size={20} />}
          change="Annual leave days"
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Upcoming Holidays"
          value="2"
          icon={<Gift size={20} />}
          change="Next 30 days"
          color="bg-rose-100 text-rose-600"
        />
        {/* Live accumulated daily session timer */}
        <SessionTimerCard />
      </div>

      {/* Leave Balance · Attendance · Holidays */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="card">
          <h3 className="font-bold text-slate-900 mb-4">Leave Balance</h3>
          <div className="space-y-3">
            {mockLeaveBalance.map(lb => (
              <div key={lb.leaveType}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{lb.leaveType}</span>
                  <span className="text-slate-500">{lb.remaining}/{lb.total}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-500"
                    style={{ width: `${(lb.remaining / lb.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-slate-900 mb-4">Recent Attendance</h3>
          <div className="space-y-2">
            {myAttendance.map(a => (
              <div key={a.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">{formatDate(a.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {a.checkIn && <span className="text-xs font-mono text-slate-500">{a.checkIn}</span>}
                  <Badge status={a.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-slate-900 mb-4">Upcoming Holidays</h3>
          <div className="space-y-2">
            {upcomingHolidays.map(h => (
              <div key={h.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs font-black text-rose-600">{new Date(h.date).getDate()}</span>
                  <span className="text-xs text-rose-400">
                    {new Date(h.date).toLocaleDateString('en-IN', { month: 'short' })}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{h.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{h.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Announcements */}
      <div className="card">
        <h3 className="font-bold text-slate-900 mb-4">Latest Announcements</h3>
        <div className="space-y-3">
          {mockAnnouncements.slice(0, 2).map(a => (
            <div key={a.id} className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-slate-900 text-sm">{a.title}</p>
                <Badge status={a.priority} />
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{a.content}</p>
              <p className="text-xs text-slate-400 mt-2">{formatDate(a.createdAt)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}