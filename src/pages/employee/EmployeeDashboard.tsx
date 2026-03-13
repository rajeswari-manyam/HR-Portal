import { CalendarCheck, CalendarDays, Gift, Clock, Timer, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';
import Avatar from '../../components/shared/Avatar';
import Badge from '../../components/shared/Badge';
import StatCard from '../../components/shared/StateCard';
import { useState, useEffect, useRef } from 'react';

// ─── API imports ──────────────────────────────────────────────────────────────
import { getLeaveBalance, getAllLeaves } from "../../service/leave.service";
import { getAttendance } from "../../service/attendance.service";
import { getAllHolidays } from "../../service/holidays.service";
import { getAnnouncementsByRole } from "../../service/announcement.service";

// ─── Types ────────────────────────────────────────────────────────────────────
interface TrackerState {
  date: string;
  accumulatedSeconds: number;
  sessionStart: number | null;
  checkInTime: string | null;
  lastCheckOut: string | null;
  isClockedIn: boolean;
}

interface LeaveBalance {
  leaveType: string;
  total: number;
  used: number;
  remaining: number;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
}

interface Holiday {
  _id: string;
  name: string;
  date: string;
  type: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  createdAt: string;
}

// ─── Time Tracker Hook ────────────────────────────────────────────────────────
function useDailyTimeTracker() {
  const STORAGE_KEY = 'employee_time_tracker';
  // Separate key that only ever stores YYYY-MM-DD of the last known day.
  // We compare this on every load — if it differs, we nuke everything.
  const DATE_KEY = 'employee_time_tracker_date';

  const getTodayKey = (): string => new Date().toISOString().split('T')[0];

  const loadState = (): TrackerState | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as TrackerState;
    } catch {
      return null;
    }
  };

  const saveState = (state: TrackerState): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(DATE_KEY, state.date);
  };

  const makeFresh = (today: string): TrackerState => {
    const fresh: TrackerState = {
      date: today,
      accumulatedSeconds: 0,
      sessionStart: null,
      checkInTime: null,
      lastCheckOut: null,
      isClockedIn: false,
    };
    saveState(fresh);
    return fresh;
  };

  const initState = (): TrackerState => {
    const today = getTodayKey();

    // Primary guard: the dedicated date key must match today exactly.
    // This catches every cross-midnight scenario regardless of what
    // the tracker object itself says (clocked-in or out).
    const lastKnownDate = localStorage.getItem(DATE_KEY);
    if (!lastKnownDate || lastKnownDate !== today) {
      return makeFresh(today);
    }

    const saved = loadState();
    if (!saved || saved.date !== today) {
      return makeFresh(today);
    }

    // Extra guard: if sessionStart is from a previous calendar day, reset.
    if (saved.sessionStart !== null) {
      const sessionDate = new Date(saved.sessionStart).toISOString().split('T')[0];
      if (sessionDate !== today) {
        return makeFresh(today);
      }
    }

    return saved;
  };

  const [tracker, setTracker] = useState<TrackerState>(initState);
  const [displaySeconds, setDisplaySeconds] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const computeDisplay = (t: TrackerState): number => {
    if (t.isClockedIn && t.sessionStart !== null) {
      const today = getTodayKey();
      const sessionDate = new Date(t.sessionStart).toISOString().split('T')[0];
      // If sessionStart is from a previous day, don't count cross-midnight seconds
      if (sessionDate !== today) return t.accumulatedSeconds;
      const liveSecs = Math.floor((Date.now() - t.sessionStart) / 1000);
      return t.accumulatedSeconds + liveSecs;
    }
    return t.accumulatedSeconds;
  };

  // Track the date so we can detect midnight rollover
  const trackerDateRef = useRef<string>(getTodayKey());

  useEffect(() => {
    setDisplaySeconds(computeDisplay(tracker));
    if (tracker.isClockedIn) {
      intervalRef.current = setInterval(() => {
        // Midnight reset: if the calendar date has changed, start fresh
        const today = getTodayKey();
        if (today !== trackerDateRef.current) {
          trackerDateRef.current = today;
          if (intervalRef.current !== null) clearInterval(intervalRef.current);
          setTracker(makeFresh(today));
          setDisplaySeconds(0);
          return;
        }
        setDisplaySeconds((prev: number) => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const clockIn = (): void => {
    const now = Date.now();
    const timeStr = new Date(now).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    setTracker((prev: TrackerState) => {
      const updated: TrackerState = {
        ...prev,
        isClockedIn: true,
        sessionStart: now,
        checkInTime: prev.checkInTime ?? timeStr,
      };
      saveState(updated);
      return updated;
    });
    if (intervalRef.current !== null) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDisplaySeconds((prev: number) => prev + 1);
    }, 1000);
  };

  const clockOut = (): void => {
    const now = Date.now();
    const timeStr = new Date(now).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    setTracker((prev: TrackerState) => {
      const liveSecs = prev.sessionStart !== null ? Math.floor((now - prev.sessionStart) / 1000) : 0;
      const updated: TrackerState = {
        ...prev,
        isClockedIn: false,
        accumulatedSeconds: prev.accumulatedSeconds + liveSecs,
        sessionStart: null,
        lastCheckOut: timeStr,
      };
      saveState(updated);
      return updated;
    });
    if (intervalRef.current !== null) clearInterval(intervalRef.current);
  };

  const formatTime = (totalSecs: number): string => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return {
    isClockedIn: tracker.isClockedIn,
    checkInTime: tracker.checkInTime,
    lastCheckOut: tracker.lastCheckOut,
    displayTime: formatTime(displaySeconds),
    displaySeconds,
    clockIn,
    clockOut,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function EmployeeDashboard() {
  const { user } = useAuth();
  const {
    isClockedIn,
    checkInTime,
    lastCheckOut,
    displayTime,
    displaySeconds,
    clockIn,
    clockOut,
  } = useDailyTimeTracker();

  // ── API state ──
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance[]>([]);
  const [myAttendance, setMyAttendance] = useState<AttendanceRecord[]>([]);
  const [upcomingHolidays, setUpcomingHolidays] = useState<Holiday[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysPresent, setDaysPresent] = useState(0);
  const [annualLeaveRemaining, setAnnualLeaveRemaining] = useState(0);
  const [upcomingHolidayCount, setUpcomingHolidayCount] = useState(0);

  // ── Fetch all data on mount ──
  useEffect(() => {
    if (!user?.employeeId) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [balanceData, attendanceData, holidaysData, announcementsData] =
          await Promise.allSettled([
            getLeaveBalance(user.employeeId),
            getAttendance(user.employeeId),
            getAllHolidays(),
            getAnnouncementsByRole(user.role ?? 'employee'),
          ]);

        // Leave balance
        if (balanceData.status === 'fulfilled') {
          const raw = balanceData.value;
          // API may return array or object with leaveBalances key
          const balArr: LeaveBalance[] = Array.isArray(raw)
            ? raw
            : raw.leaveBalances ?? raw.data ?? [];
          setLeaveBalance(balArr);
          const annual = balArr.find(
            (b: LeaveBalance) =>
              b.leaveType?.toLowerCase().includes('annual') ||
              b.leaveType?.toLowerCase().includes('casual')
          );
          setAnnualLeaveRemaining(annual?.remaining ?? 0);
        }

        // Attendance — last 5 records, count present this month
        if (attendanceData.status === 'fulfilled') {
          const raw = attendanceData.value;
          const arr: AttendanceRecord[] = Array.isArray(raw)
            ? raw
            : raw.attendance ?? raw.data ?? [];

          // Sort descending by date
          const sorted = [...arr].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setMyAttendance(sorted.slice(0, 5));

          // Count present days this month
          const now = new Date();
          const presentThisMonth = arr.filter((a) => {
            const d = new Date(a.date);
            return (
              d.getMonth() === now.getMonth() &&
              d.getFullYear() === now.getFullYear() &&
              a.status === 'present'
            );
          });
          setDaysPresent(presentThisMonth.length);
        }

        // Holidays — upcoming (today onwards), max 4
        if (holidaysData.status === 'fulfilled') {
          const raw = holidaysData.value as any;
          const arr: Holiday[] = Array.isArray(raw)
            ? raw
            : raw.holidays ?? raw.data ?? [];
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const upcoming = arr
            .filter((h) => new Date(h.date) >= today)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          // Count holidays in next 30 days
          const in30 = new Date(today);
          in30.setDate(in30.getDate() + 30);
          setUpcomingHolidayCount(upcoming.filter((h) => new Date(h.date) <= in30).length);
          setUpcomingHolidays(upcoming.slice(0, 4));
        }

        // Announcements — latest 2
        if (announcementsData.status === 'fulfilled') {
          const raw = announcementsData.value;
          const arr: Announcement[] = Array.isArray(raw)
            ? raw
            : raw.announcements ?? raw.data ?? [];
          const sorted = [...arr].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setAnnouncements(sorted.slice(0, 2));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user?.employeeId]);

  const hours = Math.floor(displaySeconds / 3600);
  const timerColor =
    hours >= 8
      ? 'text-emerald-600'
      : hours >= 4
        ? 'text-amber-600'
        : 'text-blue-600';

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="card bg-gradient-to-r from-primary-600 to-primary-700 h-32" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-24 bg-slate-100" />
          ))}
        </div>
        <div className="card h-48 bg-slate-100" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-48 bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
        <div className="flex items-center gap-4">
          <Avatar name={user?.name ?? ''} size="xl" />
          <div>
            <h1 className="text-2xl font-black">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-primary-200 mt-1">
              {user?.designation} · {user?.department}
            </p>
            <div className="flex gap-3 mt-3">
              <span className="px-3 py-1.5 bg-white/10 rounded-xl text-sm font-medium">
                {user?.employeeId}
              </span>
              <span className="px-3 py-1.5 bg-white/10 rounded-xl text-sm font-medium">
                Joined {formatDate(user?.joinDate ?? '')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Days Present',
            value: daysPresent.toString(),
            sub: 'This month',
            icon: CalendarCheck,
            color: 'bg-emerald-100 text-emerald-600',
          },
          {
            label: 'Leave Balance',
            value: annualLeaveRemaining.toString(),
            sub: 'Annual leave days',
            icon: CalendarDays,
            color: 'bg-blue-100 text-blue-600',
          },
          {
            label: 'Upcoming Holiday',
            value: upcomingHolidayCount.toString(),
            sub: 'Next 30 days',
            icon: Gift,
            color: 'bg-rose-100 text-rose-600',
          },
          {
            label: 'Time Worked Today',
            value: displayTime,
            sub: isClockedIn
              ? '🟢 Currently clocked in'
              : checkInTime
                ? '⏹ Clocked out'
                : 'Not started',
            icon: Timer,
            color: isClockedIn
              ? 'bg-violet-100 text-violet-600'
              : 'bg-slate-100 text-slate-500',
          },
        ].map((s) => (
          <StatCard
            key={s.label}
            title={s.label}
            value={s.value}
            icon={<s.icon size={20} />}
            change={s.sub}
            color={s.color}
          />
        ))}
      </div>

      {/* Daily Time Tracker */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900">Today's Time Tracker</h3>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Timer display */}
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
              Time Worked
            </p>
            <p
              className={`text-4xl font-black font-mono tracking-tight ${timerColor} transition-colors duration-500`}
            >
              {displayTime}
            </p>
            {isClockedIn && (
              <span className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live counting...
              </span>
            )}
          </div>

          {/* Clock in/out controls */}
          <div className="flex-1 space-y-3 w-full">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <LogIn size={14} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Check-in Time</p>
                <p className="text-sm font-semibold text-slate-700">
                  {checkInTime ?? '— Not checked in yet'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                <LogOut size={14} className="text-rose-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Last Check-out</p>
                <p className="text-sm font-semibold text-slate-700">
                  {lastCheckOut ?? '— Still working'}
                </p>
              </div>
            </div>

            <button
              onClick={isClockedIn ? clockOut : clockIn}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${isClockedIn
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-200'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-200'
                }`}
            >
              {isClockedIn ? (
                <>
                  <LogOut size={16} /> Clock Out
                </>
              ) : (
                <>
                  <LogIn size={16} /> Clock In
                </>
              )}
            </button>

            <p className="text-xs text-center text-slate-400">
              {isClockedIn
                ? 'Timer continues if you log out and return today'
                : 'New day resets the timer automatically'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leave Balance */}
        <div className="card">
          <h3 className="font-bold text-slate-900 mb-4">Leave Balance</h3>
          {leaveBalance.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No leave data available</p>
          ) : (
            <div className="space-y-3">
              {leaveBalance.map((lb) => (
                <div key={lb.leaveType}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{lb.leaveType}</span>
                    <span className="text-slate-500">
                      {lb.remaining}/{lb.total}
                    </span>
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
          )}
        </div>

        {/* Recent Attendance */}
        <div className="card">
          <h3 className="font-bold text-slate-900 mb-4">Recent Attendance</h3>
          {myAttendance.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No attendance records</p>
          ) : (
            <div className="space-y-2">
              {myAttendance.map((a) => (
                <div
                  key={a.id ?? a.date}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50"
                >
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">
                      {formatDate(a.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.checkIn && (
                      <span className="text-xs font-mono text-slate-500">{a.checkIn}</span>
                    )}
                    <Badge status={a.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Holidays */}
        <div className="card">
          <h3 className="font-bold text-slate-900 mb-4">Upcoming Holidays</h3>
          {upcomingHolidays.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No upcoming holidays</p>
          ) : (
            <div className="space-y-2">
              {upcomingHolidays.map((h) => (
                <div
                  key={h._id}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs font-black text-rose-600">
                      {new Date(h.date).getDate()}
                    </span>
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
          )}
        </div>
      </div>

      {/* Announcements */}
      <div className="card">
        <h3 className="font-bold text-slate-900 mb-4">Latest Announcements</h3>
        {announcements.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No announcements</p>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id ?? a.title} className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-slate-900 text-sm">{a.title}</p>
                  <Badge status={a.priority} />
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{a.content}</p>
                <p className="text-xs text-slate-400 mt-2">{formatDate(a.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}