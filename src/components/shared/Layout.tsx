import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const pageTitles: Record<string, string> = {
  '/hr/dashboard': 'Dashboard',
  '/hr/employees': 'Employee Management',
  '/hr/departments': 'Departments',
  '/hr/attendance': 'Attendance',
  '/hr/leave': 'Leave Management',
  '/hr/payroll': 'Payroll',
  '/hr/recruitment': 'Recruitment',
  '/hr/performance': 'Performance',
  '/hr/documents': 'Documents',
  '/hr/announcements': 'Announcements',
  '/hr/holidays': 'Holidays',
  '/hr/reports': 'Reports',
  '/hr/settings': 'Settings',
  '/employee/dashboard': 'Dashboard',
  '/employee/profile': 'My Profile',
  '/employee/attendance': 'My Attendance',
  '/employee/leave': 'Leave',
  '/employee/payslips': 'My Payslips',
  '/employee/performance': 'Performance',
  '/employee/documents': 'Documents',
  '/employee/announcements': 'Announcements',
  '/employee/holidays': 'Holidays',
};

export default function Layout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || '';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
