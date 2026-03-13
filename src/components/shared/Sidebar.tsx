
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Building2, CalendarCheck, CalendarDays,
  DollarSign, Briefcase, TrendingUp, FileText, Megaphone,
  Gift, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight,
  UserCircle, Menu, X
} from 'lucide-react';
import Avatar from './Avatar';
import { useState, useEffect } from 'react';

const hrNav = [
  { to: '/hr/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/hr/employees', icon: Users, label: 'Employees' },
  { to: '/hr/departments', icon: Building2, label: 'Departments' },
  { to: '/hr/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/hr/projects', icon: CalendarCheck, label: 'Project Management' },
  { to: '/hr/leave', icon: CalendarDays, label: 'Leave Management' },
  { to: '/hr/payroll', icon: DollarSign, label: 'Payroll' },
  { to: '/hr/recruitment', icon: Briefcase, label: 'Recruitment' },
  { to: '/hr/performance', icon: TrendingUp, label: 'Performance' },
  { to: '/hr/documents', icon: FileText, label: 'Documents' },
  { to: '/hr/announcements', icon: Megaphone, label: 'Announcements' },
  { to: '/hr/holidays', icon: Gift, label: 'Holidays' },
  { to: '/hr/reports', icon: BarChart3, label: 'Reports' },
  { to: '/hr/settings', icon: Settings, label: 'Settings' },
];

const employeeNav = [
  { to: '/employee/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employee/profile', icon: UserCircle, label: 'My Profile' },
  { to: '/employee/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/employee/leave', icon: CalendarDays, label: 'Leave' },
  { to: '/employee/payslips', icon: DollarSign, label: 'Payslips' },
  { to: '/employee/performance', icon: TrendingUp, label: 'Performance' },
  { to: '/employee/documents', icon: FileText, label: 'Documents' },
  { to: '/employee/announcements', icon: Megaphone, label: 'Announcements' },
  { to: '/employee/holidays', icon: Gift, label: 'Holidays' },
  { to: '/employee/my-projects', icon: CalendarCheck, label: 'My Projects' },
  { to: '/employee/tasks', icon: CalendarCheck, label: 'My Tasks' },
];

// Bottom nav items (mobile) — show top 5 most important


export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = user?.role === 'hr' ? hrNav : employeeNav;

  // Close drawer on route change (mobile)
  useEffect(() => {
    setMobileOpen(false);
  }, [navigate]);

  // Close drawer on ESC key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

 

  return (
    <>
      {/* ─── DESKTOP SIDEBAR (md+) ─────────────────────────────────── */}
      <aside
        className={`
          hidden md:flex relative flex-col bg-white border-r border-slate-100 h-screen
          transition-all duration-300 flex-shrink-0
          ${collapsed ? 'w-16' : 'w-64'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-sm">W</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="font-black text-slate-900 text-sm leading-tight">WorkForce</p>
              <p className="text-xs text-slate-400 font-medium">HR Portal</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-slate-100 p-3">
          {!collapsed ? (
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
              <Avatar name={user?.name || ''} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate capitalize">
                  {user?.role === 'hr' ? 'HR Manager' : 'Employee'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="sidebar-link justify-center px-0 w-full"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow z-10"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* ─── MOBILE TOP BAR ────────────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
            <span className="text-white font-black text-xs">W</span>
          </div>
          <div>
            <p className="font-black text-slate-900 text-sm leading-tight">WorkForce</p>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* ─── MOBILE DRAWER OVERLAY ─────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── MOBILE DRAWER ─────────────────────────────────────────── */}
      <div
        className={`
          md:hidden fixed top-0 left-0 h-full w-72 z-50 bg-white shadow-2xl
          flex flex-col transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">W</span>
            </div>
            <div>
              <p className="font-black text-slate-900 text-sm leading-tight">WorkForce</p>
              <p className="text-xs text-slate-400 font-medium">HR Portal</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Drawer user */}
        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <Avatar name={user?.name || ''} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate capitalize">
                {user?.role === 'hr' ? 'HR Manager' : 'Employee'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>

      
    </>
  );
}