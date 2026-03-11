import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/shared/Layout';

// Auth
import Login from './pages/auth/Login';

// HR Pages
import HRDashboard from './pages/hr/HRDashboard';
import EmployeeManagement from './pages/hr/EmployeeManagement';
import DepartmentManagement from './pages/hr/DepartmentManagement';
import AttendanceManagement from './pages/hr/AttendanceManagement';
import LeaveManagement from './pages/hr/LeaveManagement';
import PayrollManagement from './pages/hr/PayrollManagement';
import Recruitment from './pages/hr/Recruitment';
import PerformanceManagement from './pages/hr/PerformanceManagement';
import DocumentManagement from './pages/hr/DocumentManagement';
import Announcements from './pages/hr/Announcements';
import HolidayManagement from './pages/hr/HolidayManagement';
import Reports from './pages/hr/Reports';
import Settings from './pages/hr/Settings';
import ProjectManagement from './pages/hr/ProjectManagement';
// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyProfile from './pages/employee/MyProfile';
import MyLeave from './pages/employee/MyLeave';
import MyPayslips from './pages/employee/MyPayslips';
import { MyAttendance, MyPerformance, MyDocuments, MyAnnouncements, MyHolidays } from './pages/employee/EmployeePages';
import MyTasks from './pages/employee/MyTasks';
import MyProjects from './pages/employee/MyProjects';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'hr' | 'employee' }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole) return <Navigate to={user?.role === 'hr' ? '/hr/dashboard' : '/employee/dashboard'} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to={user?.role === 'hr' ? '/hr/dashboard' : '/employee/dashboard'} replace /> : <Login />} />

      {/* HR Routes */}
      <Route path="/hr" element={<ProtectedRoute requiredRole="hr"><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<HRDashboard />} />
        <Route path="employees" element={<EmployeeManagement />} />
        <Route path="departments" element={<DepartmentManagement />} />
        <Route path="attendance" element={<AttendanceManagement />} />
        <Route path="leave" element={<LeaveManagement />} />
        <Route path="payroll" element={<PayrollManagement />} />
        <Route path="recruitment" element={<Recruitment />} />
        <Route path="performance" element={<PerformanceManagement />} />
        <Route path="documents" element={<DocumentManagement />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="holidays" element={<HolidayManagement />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="projects" element={<ProjectManagement />} />
      </Route>

      {/* Employee Routes */}
      <Route path="/employee" element={<ProtectedRoute requiredRole="employee"><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="attendance" element={<MyAttendance />} />
        <Route path="leave" element={<MyLeave />} />
        <Route path="payslips" element={<MyPayslips />} />
        <Route path="performance" element={<MyPerformance />} />
        <Route path="documents" element={<MyDocuments />} />
        <Route path="announcements" element={<MyAnnouncements />} />
        <Route path="holidays" element={<MyHolidays />} />
        <Route path="my-projects" element={<MyProjects />} />
        <Route path="tasks" element={<MyTasks />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '13px' } }} />
      </BrowserRouter>
    </AuthProvider>
  );
}
