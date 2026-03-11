import { Users, UserPlus, CalendarCheck, ClipboardList, DollarSign, Gift, TrendingUp, Clock } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { mockLeaveRequests,  mockHolidays, employeeGrowthData, attendanceSummaryData, departmentDistribution } from '../../data/mockData';
import { formatDate } from '../../utils/helpers';


const stats = [
  { label: 'Total Employees', value: '47', change: '+3 this month', icon: Users, color: 'bg-primary-100 text-primary-600' },
  { label: 'New Joiners', value: '3', change: 'This month', icon: UserPlus, color: 'bg-emerald-100 text-emerald-600' },
  { label: 'Present Today', value: '42', change: '89% attendance', icon: CalendarCheck, color: 'bg-cyan-100 text-cyan-600' },
  { label: 'Pending Leaves', value: '5', change: 'Awaiting approval', icon: ClipboardList, color: 'bg-amber-100 text-amber-600' },
  { label: 'Payroll Status', value: '₹38.2L', change: 'January 2024', icon: DollarSign, color: 'bg-purple-100 text-purple-600' },
  { label: 'Upcoming Holidays', value: '2', change: 'Next 30 days', icon: Gift, color: 'bg-rose-100 text-rose-600' },
];

export default function HRDashboard() {
  const pendingLeaves = mockLeaveRequests.filter(l => l.status === 'pending').slice(0, 4);
  const upcomingHolidays = mockHolidays.slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Good morning, Rahul! 👋</h1>
          <p className="page-subtitle">Here's what's happening across your organization today.</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-900">{new Date().toLocaleDateString('en-IN', { weekday: 'long' })}</p>
          <p className="text-xs text-slate-400">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.color}`}>
              <s.icon size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-black text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5 font-medium truncate">{s.label}</p>
              <p className="text-xs text-slate-400 truncate">{s.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Growth */}
        <div className="card lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Employee Growth</h3>
            <TrendingUp size={16} className="text-primary-500" />
          </div>
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
        </div>

        {/* Attendance Summary */}
        <div className="card lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Attendance This Week</h3>
            <CalendarCheck size={16} className="text-emerald-500" />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={attendanceSummaryData} barSize={20}>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" fill="#fee2e2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department Distribution */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Dept. Distribution</h3>
            <Users size={16} className="text-purple-500" />
          </div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={departmentDistribution} cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={2} dataKey="value">
                  {departmentDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {departmentDistribution.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-xs text-slate-600 truncate max-w-[70px]">{d.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Leave Requests */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Pending Leave Requests</h3>
            <span className="badge bg-amber-100 text-amber-700">{pendingLeaves.length} pending</span>
          </div>
          <div className="space-y-3">
            {pendingLeaves.map(leave => (
              <div key={leave.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{leave.employeeName}</p>
                  <p className="text-xs text-slate-500">{leave.leaveType} · {leave.days} day{leave.days > 1 ? 's' : ''}</p>
                  <p className="text-xs text-slate-400">{formatDate(leave.startDate)} – {formatDate(leave.endDate)}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">Approve</button>
                  <button className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">Reject</button>
                </div>
              </div>
            ))}
            {pendingLeaves.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No pending requests</p>}
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-rows-2 gap-4">
          {/* Upcoming Holidays */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900">Upcoming Holidays</h3>
              <Gift size={16} className="text-rose-400" />
            </div>
            <div className="space-y-2">
              {upcomingHolidays.map(h => (
                <div key={h.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                      <span className="text-xs font-bold text-rose-600">{new Date(h.date).getDate()}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-700">{h.name}</span>
                  </div>
                  <span className="text-xs text-slate-400">{new Date(h.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900">Recent Activity</h3>
              <Clock size={16} className="text-slate-400" />
            </div>
            <div className="space-y-2">
              {[
                { msg: 'Payroll generated for January 2024', time: '2h ago', color: 'bg-emerald-500' },
                { msg: 'Karthik Rajan applied for sick leave', time: '4h ago', color: 'bg-amber-500' },
                { msg: 'New employee Meera K. onboarded', time: '1d ago', color: 'bg-primary-500' },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${a.color} mt-2 flex-shrink-0`} />
                  <div className="flex-1 flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-600">{a.msg}</p>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
