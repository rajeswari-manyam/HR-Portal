import { useState, useEffect } from 'react';
import {
  Users, UserPlus, CalendarCheck, ClipboardList,
  Gift, TrendingUp, Clock, X, RefreshCw,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { formatDate } from '../../utils/helpers';
import StatCard from '../../components/shared/StatCard';
import { useAuth } from '../../context/AuthContext';
import {
  fetchDashboardData,
  updateLeaveStatus,
  PendingLeaveItem,
  HolidayItem,
  DepartmentDist,
  EmployeeGrowth,
  AttendanceSummary,
  RecentActivity,
} from '../../service/DashBoard.service';

// ─────────────────────────────────────────────────────────────────────────────
// Greeting helper
// ─────────────────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface DashboardState {
  stats: {
    totalEmployees: number;
    newJoiners: number;
    presentToday: number;
    pendingLeaves: number;
    upcomingHolidays: number;
  };
  pendingLeaveList: PendingLeaveItem[];
  upcomingHolidayList: HolidayItem[];
  departmentDistribution: DepartmentDist[];
  employeeGrowthData: EmployeeGrowth[];
  attendanceSummaryData: AttendanceSummary[];
  recentActivity: RecentActivity[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function HRDashboard() {
  const [data, setData] = useState<DashboardState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuth();
  const loginName: string = user?.name || user?.email || 'User';
  const greeting = getGreeting();

  // ── Load dashboard ─────────────────────────────────────────────────────────
  const loadDashboard = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const result = await fetchDashboardData();
      setData(result as DashboardState);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  // ── Approve / Reject leave inline ──────────────────────────────────────────
  const handleLeaveAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateLeaveStatus(id, status, user?.employeeId || 'HR001');
      setData(prev => prev ? {
        ...prev,
        pendingLeaveList: prev.pendingLeaveList.filter(l => l.id !== id),
        stats: {
          ...prev.stats,
          pendingLeaves: Math.max(0, prev.stats.pendingLeaves - 1),
        },
      } : prev);
    } catch (err: any) {
      setError(err.message || 'Failed to update leave');
    }
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-64 bg-slate-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card animate-pulse space-y-3">
              <div className="h-8 w-8 bg-slate-200 rounded-lg" />
              <div className="h-6 bg-slate-200 rounded w-1/2" />
              <div className="h-3 bg-slate-100 rounded w-3/4" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse h-52" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <X size={20} className="text-red-500" />
          </div>
          <p className="text-sm text-red-600 font-medium">{error || 'Something went wrong'}</p>
          <button onClick={() => loadDashboard()} className="text-xs text-primary-600 hover:underline font-semibold">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const {
    stats,
    pendingLeaveList,
    upcomingHolidayList,
    departmentDistribution,
    employeeGrowthData,
    attendanceSummaryData,
    recentActivity,
  } = data;

  const statCards = [
    {
      label: 'Total Employees',
      value: String(stats.totalEmployees),
      change: `+${stats.newJoiners} this month`,
      icon: Users,
      color: 'bg-primary-100 text-primary-600',
    },
    {
      label: 'New Joiners',
      value: String(stats.newJoiners),
      change: 'This month',
      icon: UserPlus,
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      label: 'Present Today',
      value: String(stats.presentToday),
      change: stats.totalEmployees > 0
        ? `${Math.round((stats.presentToday / stats.totalEmployees) * 100)}% attendance`
        : '0% attendance',
      icon: CalendarCheck,
      color: 'bg-cyan-100 text-cyan-600',
    },
    {
      label: 'Pending Leaves',
      value: String(stats.pendingLeaves),
      change: 'Awaiting approval',
      icon: ClipboardList,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      label: 'Upcoming Holidays',
      value: String(stats.upcomingHolidays),
      change: 'Next 30 days',
      icon: Gift,
      color: 'bg-rose-100 text-rose-600',
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">

      {/* Error banner */}
      {error && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{greeting}, {loginName}! 👋</h1>
          <p className="page-subtitle">Here's what's happening across your organization today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDashboard(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long' })}
            </p>
            <p className="text-xs text-slate-400">
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards — 5 cards, no payroll */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map(s => (
          <StatCard
            key={s.label}
            title={s.label}
            value={s.value}
            icon={<s.icon size={20} />}
            change={s.change}
            changeType="increase"
            color={s.color}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Employee Growth */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Employee Growth</h3>
            <TrendingUp size={16} className="text-primary-500" />
          </div>
          {employeeGrowthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={employeeGrowthData}>
                <defs>
                  <linearGradient id="empGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#empGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-300 text-sm">No data available</div>
          )}
        </div>

        {/* Attendance This Week */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Attendance This Week</h3>
            <CalendarCheck size={16} className="text-emerald-500" />
          </div>
          {attendanceSummaryData.some(d => d.present > 0 || d.absent > 0) ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={attendanceSummaryData} barSize={20}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Bar dataKey="present" name="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#fca5a5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-300 text-sm">No attendance this week</div>
          )}
        </div>

        {/* Department Distribution */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Dept. Distribution</h3>
            <Users size={16} className="text-purple-500" />
          </div>
          {departmentDistribution.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie
                    data={departmentDistribution}
                    cx="50%" cy="50%"
                    innerRadius={30} outerRadius={55}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {departmentDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {departmentDistribution.slice(0, 6).map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <span className="text-xs text-slate-600 truncate max-w-[70px]">{d.name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-slate-300 text-sm">No department data</div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pending Leave Requests */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Pending Leave Requests</h3>
            <span className="badge bg-amber-100 text-amber-700">{stats.pendingLeaves} pending</span>
          </div>
          <div className="space-y-3">
            {pendingLeaveList.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No pending requests</p>
            ) : (
              pendingLeaveList.map(leave => (
                <div key={leave.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{leave.employeeName}</p>
                    <p className="text-xs text-slate-500">{leave.leaveType} · {leave.days} day{leave.days > 1 ? 's' : ''}</p>
                    <p className="text-xs text-slate-400">{formatDate(leave.startDate)} – {formatDate(leave.endDate)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLeaveAction(leave.id, 'approved')}
                      className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                      Approve
                    </button>
                    <button
                      onClick={() => handleLeaveAction(leave.id, 'rejected')}
                      className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="grid grid-rows-2 gap-4">

          {/* Upcoming Holidays */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900">Upcoming Holidays</h3>
              <Gift size={16} className="text-rose-400" />
            </div>
            {upcomingHolidayList.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-3">No upcoming holidays</p>
            ) : (
              <div className="space-y-2">
                {upcomingHolidayList.map(h => (
                  <div key={h.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-rose-600">
                          {new Date(h.date).getDate()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{h.name}</p>
                        <p className="text-xs text-slate-400 capitalize">{h.type}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(h.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900">Recent Activity</h3>
              <Clock size={16} className="text-slate-400" />
            </div>
            {recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-2">No recent activity</p>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${a.color} mt-2 flex-shrink-0`} />
                    <div className="flex-1 flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-600">{a.msg}</p>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{a.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}