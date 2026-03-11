import { CalendarCheck, CalendarDays, Gift, DollarSign, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockLeaveBalance, mockPayslips, mockHolidays, mockAnnouncements, mockAttendance } from '../../data/mockData';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Avatar from '../../components/shared/Avatar';
import Badge from '../../components/shared/Badge';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const myAttendance = mockAttendance.filter(a => a.employeeId === 'EMP001').slice(0, 5);
  const myPayslips = mockPayslips.filter(p => p.employeeId === 'EMP001').slice(0, 2);
  const upcomingHolidays = mockHolidays.slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
        <div className="flex items-center gap-4">
          <Avatar name={user?.name || ''} size="xl" />
          <div>
            <h1 className="text-2xl font-black">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-primary-200 mt-1">{user?.designation} · {user?.department}</p>
            <div className="flex gap-3 mt-3">
              <span className="px-3 py-1.5 bg-white/10 rounded-xl text-sm font-medium">{user?.employeeId}</span>
              <span className="px-3 py-1.5 bg-white/10 rounded-xl text-sm font-medium">Joined {formatDate(user?.joinDate || '')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Days Present', value: myAttendance.filter(a => a.status === 'present').length.toString(), sub: 'This month', icon: CalendarCheck, color: 'bg-emerald-100 text-emerald-600' },
          { label: 'Leave Balance', value: '13', sub: 'Annual leave days', icon: CalendarDays, color: 'bg-blue-100 text-blue-600' },
          { label: 'Upcoming Holiday', value: '2', sub: 'Next 30 days', icon: Gift, color: 'bg-rose-100 text-rose-600' },
          { label: 'Net Salary', value: formatCurrency(myPayslips[0]?.netSalary || 0), sub: 'January 2024', icon: DollarSign, color: 'bg-primary-100 text-primary-600' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.color}`}><s.icon size={22} /></div>
            <div><p className="text-xl font-black text-slate-900">{s.value}</p><p className="text-xs text-slate-500 font-medium">{s.label}</p><p className="text-xs text-slate-400">{s.sub}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leave Balance */}
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

        {/* Recent Attendance */}
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

        {/* Upcoming Holidays */}
        <div className="card">
          <h3 className="font-bold text-slate-900 mb-4">Upcoming Holidays</h3>
          <div className="space-y-2">
            {upcomingHolidays.map(h => (
              <div key={h.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs font-black text-rose-600">{new Date(h.date).getDate()}</span>
                  <span className="text-xs text-rose-400">{new Date(h.date).toLocaleDateString('en-IN', { month: 'short' })}</span>
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
