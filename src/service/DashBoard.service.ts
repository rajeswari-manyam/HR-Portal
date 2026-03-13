import { getEmployees }                    from "./Employee.service";
import { getAttendance }                   from "./attendance.service";
import { getAllLeaves, updateLeaveStatus } from "./leave.service";
import { getAllPayslips }                  from "./payslip.service";
import { getAllHolidays }                  from "./holidays.service";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalEmployees:   number;
  newJoiners:       number;
  presentToday:     number;
  pendingLeaves:    number;
  payrollTotal:     string;
  upcomingHolidays: number;
}

export interface PendingLeaveItem {
  id:           string;
  employeeName: string;
  leaveType:    string;
  days:         number;
  startDate:    string;
  endDate:      string;
  status:       string;
}

export interface HolidayItem {
  id:   string;
  name: string;
  date: string;
  type: string;
}

export interface AttendanceSummary {
  day:     string;
  present: number;
  absent:  number;
}

export interface DepartmentDist {
  name:  string;
  value: number;
  color: string;
}

export interface EmployeeGrowth {
  month: string;
  count: number;
}

export interface RecentActivity {
  msg:   string;
  time:  string;
  color: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const DEPT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
const WEEK_DAYS   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS      = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN — fetch & aggregate all dashboard data in one call
// ─────────────────────────────────────────────────────────────────────────────

export const fetchDashboardData = async () => {
  // Fire all API calls in parallel — individual failures won't crash the dashboard
  const [employees, attendance, leaves, payslips, holidays] = await Promise.all([
    getEmployees().catch(() => []),
    getAttendance().catch(() => []),
    getAllLeaves().catch(() => []),
    getAllPayslips().catch(() => []),
    getAllHolidays().catch(() => []),
  ]);

  const today     = new Date().toISOString().split('T')[0];
  const now       = new Date();
  const thisMonth = now.getMonth();     // 0-indexed
  const thisYear  = now.getFullYear();

  // ── 1. STATS ───────────────────────────────────────────────────────────────

  // Total employees
  const totalEmployees = employees.length;

  // New joiners this calendar month
  const newJoiners = employees.filter((e: any) => {
    const joined = e.joiningDate ?? e.joining_date ?? '';
    if (!joined) return false;
    const d = new Date(joined);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  // Present today — match attendance.date === today and status === 'present'
  const presentToday = attendance.filter((a: any) => {
    const aDate   = (a.date ?? '').split('T')[0];          // handles ISO strings too
    const aStatus = (a.status ?? '').toLowerCase();
    return aDate === today && aStatus === 'present';
  }).length;

  // Pending leaves count
  const pendingList = leaves.filter((l: any) => l.status === 'pending');

  // Payroll total — sum netSalary from payslips for current month + year
  const currentMonthName = MONTHS[thisMonth];
  const monthlyPayslips  = payslips.filter((p: any) => {
    const pMonth = String(p.month  ?? '').toLowerCase();
    const pYear  = Number(p.year   ?? 0);
    return pMonth === currentMonthName.toLowerCase() && pYear === thisYear;
  });
  const payrollTotal = monthlyPayslips.reduce(
    (sum: number, p: any) => sum + (Number(p.netSalary) || 0),
    0
  );
  const payrollStr = payrollTotal > 0
    ? `₹${(payrollTotal / 100_000).toFixed(1)}L`
    : '—';

  // Upcoming holidays in next 30 days
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const upcomingHolidays = holidays.filter((h: any) => {
    const d = new Date(h.date ?? '');
    return d >= now && d <= in30Days;
  }).length;

  // ── 2. PENDING LEAVE LIST (top 4 for dashboard widget) ────────────────────

  const pendingLeaveList: PendingLeaveItem[] = pendingList.slice(0, 4).map((l: any) => ({
    id:           l._id           ?? l.id            ?? '',
    employeeName: l.employeeName  ?? l.employee_name ?? '',
    leaveType:    l.leaveType     ?? l.leave_type    ?? '',
    days:         Number(l.days)  || 0,
    startDate:    l.startDate     ?? l.start_date    ?? '',
    endDate:      l.endDate       ?? l.end_date      ?? '',
    status:       l.status        ?? 'pending',
  }));

  // ── 3. UPCOMING HOLIDAYS LIST (next 3) ────────────────────────────────────

  const upcomingHolidayList: HolidayItem[] = holidays
    .filter((h: any) => new Date(h.date ?? '') >= now)
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)
    .map((h: any) => ({
      id:   h._id  ?? h.id  ?? '',
      name: h.name ?? '',
      date: h.date ?? '',
      type: h.type ?? '',
    }));

  // ── 4. DEPARTMENT DISTRIBUTION ────────────────────────────────────────────

  const deptMap: Record<string, number> = {};
  employees.forEach((e: any) => {
    const dept = e.department ?? 'Other';
    deptMap[dept] = (deptMap[dept] || 0) + 1;
  });
  const departmentDistribution: DepartmentDist[] = Object.entries(deptMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({
      name,
      value,
      color: DEPT_COLORS[i % DEPT_COLORS.length],
    }));

  // ── 5. EMPLOYEE GROWTH (last 6 months, cumulative) ────────────────────────

  const growthMap: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d   = new Date(thisYear, thisMonth - i, 1);
    const key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    growthMap[key] = 0;
  }
  employees.forEach((e: any) => {
    const joined = e.joiningDate ?? e.joining_date ?? '';
    if (!joined) return;
    const d   = new Date(joined);
    const key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    if (key in growthMap) growthMap[key]++;
  });

  // Build cumulative totals
  let base = Math.max(
    0,
    totalEmployees - Object.values(growthMap).reduce((a, b) => a + b, 0)
  );
  const employeeGrowthData: EmployeeGrowth[] = Object.entries(growthMap).map(([fullKey, added]) => {
    base += added;
    return { month: fullKey.split(' ')[0], count: base };
  });

  // ── 6. ATTENDANCE THIS WEEK (Mon → Sun) ───────────────────────────────────

  const dayOfWeek = now.getDay(); // 0 = Sunday
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  weekStart.setHours(0, 0, 0, 0);

  const attendanceSummaryData: AttendanceSummary[] = WEEK_DAYS.map((day, i) => {
    const d       = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];

    const dayRecords = attendance.filter(
      (a: any) => (a.date ?? '').split('T')[0] === dateStr
    );
    const present = dayRecords.filter(
      (a: any) => (a.status ?? '').toLowerCase() === 'present'
    ).length;
    const absent  = dayRecords.filter(
      (a: any) => (a.status ?? '').toLowerCase() === 'absent'
    ).length;

    return { day, present, absent };
  });

  // ── 7. RECENT ACTIVITY (from leaves + employee joins) ─────────────────────

  const leaveActivity = leaves
    .filter((l: any) => l.appliedOn)
    .sort((a: any, b: any) =>
      new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime()
    )
    .slice(0, 3)
    .map((l: any) => ({
      msg:   `${l.employeeName ?? 'Employee'} applied for ${l.leaveType ?? 'leave'}`,
      time:  l.appliedOn,
      color: 'bg-amber-500',
    }));

  const joinerActivity = employees
    .filter((e: any) => e.joiningDate)
    .sort((a: any, b: any) =>
      new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime()
    )
    .slice(0, 2)
    .map((e: any) => ({
      msg:   `${e.fullName ?? e.name ?? 'Employee'} joined as ${e.designation ?? 'employee'}`,
      time:  e.joiningDate,
      color: 'bg-primary-500',
    }));

  const recentActivity: RecentActivity[] = [...leaveActivity, ...joinerActivity]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 5)
    .map(a => ({ ...a, time: formatRelativeTime(a.time) }));

  // ── Return aggregated dashboard data ──────────────────────────────────────

  return {
    stats: {
      totalEmployees,
      newJoiners,
      presentToday,
      pendingLeaves:    pendingList.length,
      payrollTotal:     payrollStr,
      upcomingHolidays,
    },
    pendingLeaveList,
    upcomingHolidayList,
    departmentDistribution,
    employeeGrowthData,
    attendanceSummaryData,
    recentActivity,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Re-export updateLeaveStatus so HRDashboard can approve/reject inline
// ─────────────────────────────────────────────────────────────────────────────

export { updateLeaveStatus };

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}