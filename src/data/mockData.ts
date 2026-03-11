import { Employee, Department, AttendanceRecord, LeaveRequest, Payslip, JobPosting, Candidate, PerformanceReview, Document, Announcement, Holiday, Notification, LeaveBalance } from '../types';

export const mockEmployees: Employee[] = [
  { id: '1', employeeId: 'EMP001', fullName: 'Arjun Sharma', email: 'arjun@company.com', phone: '+91 98765 43210', department: 'Engineering', designation: 'Senior Developer', joiningDate: '2022-01-15', salary: 95000, address: '123 MG Road, Bangalore', emergencyContact: '+91 87654 32109', status: 'active', gender: 'Male', dateOfBirth: '1992-05-12', bloodGroup: 'O+', manager: 'Priya Nair' },
  { id: '2', employeeId: 'EMP002', fullName: 'Priya Nair', email: 'priya@company.com', phone: '+91 98765 43211', department: 'Engineering', designation: 'Engineering Manager', joiningDate: '2020-03-01', salary: 140000, address: '456 Koramangala, Bangalore', emergencyContact: '+91 87654 32110', status: 'active', gender: 'Female', dateOfBirth: '1988-11-23', bloodGroup: 'A+', manager: 'Vikram Mehta' },
  { id: '3', employeeId: 'EMP003', fullName: 'Rahul Verma', email: 'rahul@company.com', phone: '+91 98765 43212', department: 'HR', designation: 'HR Manager', joiningDate: '2021-06-10', salary: 80000, address: '789 Indiranagar, Bangalore', emergencyContact: '+91 87654 32111', status: 'active', gender: 'Male', dateOfBirth: '1990-08-15', bloodGroup: 'B+' },
  { id: '4', employeeId: 'EMP004', fullName: 'Sneha Patel', email: 'sneha@company.com', phone: '+91 98765 43213', department: 'Marketing', designation: 'Marketing Lead', joiningDate: '2022-09-05', salary: 75000, address: '321 Whitefield, Bangalore', emergencyContact: '+91 87654 32112', status: 'active', gender: 'Female', dateOfBirth: '1993-03-28', bloodGroup: 'AB+' },
  { id: '5', employeeId: 'EMP005', fullName: 'Vikram Mehta', email: 'vikram@company.com', phone: '+91 98765 43214', department: 'Management', designation: 'CTO', joiningDate: '2019-01-01', salary: 250000, address: '654 HSR Layout, Bangalore', emergencyContact: '+91 87654 32113', status: 'active', gender: 'Male', dateOfBirth: '1985-07-04', bloodGroup: 'O-' },
  { id: '6', employeeId: 'EMP006', fullName: 'Ananya Roy', email: 'ananya@company.com', phone: '+91 98765 43215', department: 'Finance', designation: 'Finance Analyst', joiningDate: '2023-02-14', salary: 65000, address: '987 BTM Layout, Bangalore', emergencyContact: '+91 87654 32114', status: 'active', gender: 'Female', dateOfBirth: '1995-12-10', bloodGroup: 'A-' },
  { id: '7', employeeId: 'EMP007', fullName: 'Karthik Rajan', email: 'karthik@company.com', phone: '+91 98765 43216', department: 'Engineering', designation: 'Frontend Developer', joiningDate: '2023-04-20', salary: 70000, address: '147 Jayanagar, Bangalore', emergencyContact: '+91 87654 32115', status: 'active', gender: 'Male', dateOfBirth: '1996-09-17', bloodGroup: 'B-' },
  { id: '8', employeeId: 'EMP008', fullName: 'Meera Krishnan', email: 'meera@company.com', phone: '+91 98765 43217', department: 'Design', designation: 'UI/UX Designer', joiningDate: '2023-07-01', salary: 72000, address: '258 Marathahalli, Bangalore', emergencyContact: '+91 87654 32116', status: 'inactive', gender: 'Female', dateOfBirth: '1994-01-25', bloodGroup: 'O+' },
];

export const mockDepartments: Department[] = [
  { id: '1', name: 'Engineering', manager: 'Priya Nair', description: 'Software development and infrastructure team', employeeCount: 15, createdAt: '2019-01-01' },
  { id: '2', name: 'HR', manager: 'Rahul Verma', description: 'Human resources and talent management', employeeCount: 5, createdAt: '2019-01-01' },
  { id: '3', name: 'Marketing', manager: 'Sneha Patel', description: 'Brand and digital marketing operations', employeeCount: 8, createdAt: '2019-06-01' },
  { id: '4', name: 'Finance', manager: 'Ananya Roy', description: 'Financial planning and accounting', employeeCount: 6, createdAt: '2019-01-01' },
  { id: '5', name: 'Design', manager: 'Meera Krishnan', description: 'Product design and user experience', employeeCount: 4, createdAt: '2020-03-15' },
  { id: '6', name: 'Management', manager: 'Vikram Mehta', description: 'Executive leadership', employeeCount: 3, createdAt: '2019-01-01' },
];

export const mockAttendance: AttendanceRecord[] = [
  { id: '1', employeeId: 'EMP001', employeeName: 'Arjun Sharma', date: '2024-01-15', checkIn: '09:02', checkOut: '18:05', status: 'present', workHours: 9.05 },
  { id: '2', employeeId: 'EMP002', employeeName: 'Priya Nair', date: '2024-01-15', checkIn: '09:30', checkOut: '18:30', status: 'late', workHours: 9.0 },
  { id: '3', employeeId: 'EMP003', employeeName: 'Rahul Verma', date: '2024-01-15', checkIn: '08:55', checkOut: '17:55', status: 'present', workHours: 9.0 },
  { id: '4', employeeId: 'EMP004', employeeName: 'Sneha Patel', date: '2024-01-15', checkIn: '', checkOut: '', status: 'absent', workHours: 0 },
  { id: '5', employeeId: 'EMP005', employeeName: 'Vikram Mehta', date: '2024-01-15', checkIn: '10:00', checkOut: '14:00', status: 'half-day', workHours: 4.0 },
  { id: '6', employeeId: 'EMP001', employeeName: 'Arjun Sharma', date: '2024-01-14', checkIn: '09:00', checkOut: '18:00', status: 'present', workHours: 9.0 },
  { id: '7', employeeId: 'EMP001', employeeName: 'Arjun Sharma', date: '2024-01-13', checkIn: '09:15', checkOut: '13:30', status: 'half-day', workHours: 4.25 },
];

export const mockLeaveRequests: LeaveRequest[] = [
  { id: '1', employeeId: 'EMP004', employeeName: 'Sneha Patel', department: 'Marketing', leaveType: 'Casual Leave', startDate: '2024-01-20', endDate: '2024-01-22', days: 3, reason: 'Personal work', status: 'pending', appliedOn: '2024-01-15' },
  { id: '2', employeeId: 'EMP007', employeeName: 'Karthik Rajan', department: 'Engineering', leaveType: 'Sick Leave', startDate: '2024-01-18', endDate: '2024-01-18', days: 1, reason: 'Not feeling well', status: 'approved', appliedOn: '2024-01-17', approvedBy: 'Rahul Verma' },
  { id: '3', employeeId: 'EMP001', employeeName: 'Arjun Sharma', department: 'Engineering', leaveType: 'Annual Leave', startDate: '2024-02-01', endDate: '2024-02-05', days: 5, reason: 'Family vacation', status: 'pending', appliedOn: '2024-01-10' },
  { id: '4', employeeId: 'EMP006', employeeName: 'Ananya Roy', department: 'Finance', leaveType: 'Casual Leave', startDate: '2024-01-10', endDate: '2024-01-10', days: 1, reason: 'Personal', status: 'rejected', appliedOn: '2024-01-08', approvedBy: 'Rahul Verma' },
];

export const mockLeaveBalance: LeaveBalance[] = [
  { leaveType: 'Annual Leave', total: 21, used: 8, remaining: 13 },
  { leaveType: 'Sick Leave', total: 10, used: 2, remaining: 8 },
  { leaveType: 'Casual Leave', total: 7, used: 3, remaining: 4 },
  { leaveType: 'Maternity Leave', total: 90, used: 0, remaining: 90 },
];

export const mockPayslips: Payslip[] = [
  { id: '1', employeeId: 'EMP001', employeeName: 'Arjun Sharma', month: 'January', year: 2024, basicSalary: 95000, hra: 28500, allowances: 12000, deductions: 18500, netSalary: 117000, status: 'generated', generatedOn: '2024-01-31' },
  { id: '2', employeeId: 'EMP001', employeeName: 'Arjun Sharma', month: 'December', year: 2023, basicSalary: 95000, hra: 28500, allowances: 12000, deductions: 18500, netSalary: 117000, status: 'generated', generatedOn: '2023-12-31' },
  { id: '3', employeeId: 'EMP002', employeeName: 'Priya Nair', month: 'January', year: 2024, basicSalary: 140000, hra: 42000, allowances: 18000, deductions: 27500, netSalary: 172500, status: 'generated', generatedOn: '2024-01-31' },
  { id: '4', employeeId: 'EMP003', employeeName: 'Rahul Verma', month: 'January', year: 2024, basicSalary: 80000, hra: 24000, allowances: 10000, deductions: 15500, netSalary: 98500, status: 'generated', generatedOn: '2024-01-31' },
   { id: '5', employeeId: 'EMP005', employeeName: 'Audit', month: 'January', year: 2024, basicSalary: 80000, hra: 24000, allowances: 10000, deductions: 15500, netSalary: 98500, status: 'generated', generatedOn: '2024-01-31' },
];

export const mockJobs: JobPosting[] = [
  { id: '1', title: 'Senior React Developer', department: 'Engineering', skills: ['React', 'TypeScript', 'Node.js'], experience: '4-6 years', salaryRange: '₹18L - ₹25L', status: 'open', applicants: 23, postedOn: '2024-01-10' },
  { id: '2', title: 'Product Marketing Manager', department: 'Marketing', skills: ['SEO', 'Content Marketing', 'Analytics'], experience: '3-5 years', salaryRange: '₹12L - ₹18L', status: 'open', applicants: 15, postedOn: '2024-01-08' },
  { id: '3', title: 'DevOps Engineer', department: 'Engineering', skills: ['AWS', 'Docker', 'Kubernetes'], experience: '3-5 years', salaryRange: '₹15L - ₹22L', status: 'draft', applicants: 0, postedOn: '2024-01-12' },
];

export const mockCandidates: Candidate[] = [
  { id: '1', jobId: '1', name: 'Deepak Nair', email: 'deepak@gmail.com', phone: '+91 98765 11111', experience: '5 years', skills: ['React', 'TypeScript'], status: 'interview', appliedOn: '2024-01-12' },
  { id: '2', jobId: '1', name: 'Soumya Rao', email: 'soumya@gmail.com', phone: '+91 98765 22222', experience: '4 years', skills: ['React', 'Vue', 'Node.js'], status: 'screening', appliedOn: '2024-01-14' },
  { id: '3', jobId: '2', name: 'Aditya Kumar', email: 'aditya@gmail.com', phone: '+91 98765 33333', experience: '4 years', skills: ['SEO', 'Analytics'], status: 'applied', appliedOn: '2024-01-11' },
];

export const mockPerformanceReviews: PerformanceReview[] = [
  { id: '1', employeeId: 'EMP001', employeeName: 'Arjun Sharma', period: 'Q4 2023', rating: 4.2, goals: ['Complete microservices migration', 'Mentor junior developers', 'Improve test coverage to 80%'], feedback: 'Excellent technical skills and team collaboration. Consistently delivers high-quality code.', status: 'reviewed', reviewedBy: 'Priya Nair', createdAt: '2024-01-05' },
  { id: '2', employeeId: 'EMP002', employeeName: 'Priya Nair', period: 'Q4 2023', rating: 4.7, goals: ['Scale engineering team', 'Establish CI/CD pipeline', 'Quarterly planning'], feedback: 'Outstanding leadership and strategic thinking. Team productivity increased by 30%.', status: 'reviewed', reviewedBy: 'Vikram Mehta', createdAt: '2024-01-06' },
];

export const mockDocuments: Document[] = [
  { id: '1', employeeId: 'EMP001', name: 'Offer Letter - 2022.pdf', type: 'offer-letter', size: '245 KB', uploadedOn: '2022-01-15' },
  { id: '2', employeeId: 'EMP001', name: 'Resume_Arjun_Sharma.pdf', type: 'resume', size: '189 KB', uploadedOn: '2022-01-10' },
  { id: '3', employeeId: 'EMP001', name: 'Aadhaar Card.pdf', type: 'id-proof', size: '512 KB', uploadedOn: '2022-01-15' },
  { id: '4', employeeId: 'EMP001', name: 'B.Tech Certificate.pdf', type: 'certificate', size: '1.2 MB', uploadedOn: '2022-01-15' },
];

export const mockAnnouncements: Announcement[] = [
  { id: '1', title: 'Annual Company Retreat 2024', content: 'We are excited to announce our annual company retreat scheduled for March 15-17, 2024 at Coorg. All employees are requested to confirm their participation by February 28.', createdBy: 'Rahul Verma', createdAt: '2024-01-15', priority: 'high', targetRole: 'all' },
  { id: '2', title: 'New Leave Policy Update', content: 'The HR department has updated the leave policy effective February 1, 2024. Key changes include addition of 3 wellness days and revised carry-forward rules.', createdBy: 'Rahul Verma', createdAt: '2024-01-12', priority: 'medium', targetRole: 'all' },
  { id: '3', title: 'IT Security Training Mandatory', content: 'All employees must complete the annual IT security awareness training by January 31. Access the training portal from your dashboard.', createdBy: 'Vikram Mehta', createdAt: '2024-01-10', priority: 'high', targetRole: 'all' },
];

export const mockHolidays: Holiday[] = [
  { id: '1', name: 'Republic Day', date: '2024-01-26', type: 'national' },
  { id: '2', name: 'Holi', date: '2024-03-25', type: 'national' },
  { id: '3', name: 'Good Friday', date: '2024-03-29', type: 'national' },
  { id: '4', name: 'Eid ul-Fitr', date: '2024-04-10', type: 'national' },
  { id: '5', name: 'Independence Day', date: '2024-08-15', type: 'national' },
  { id: '6', name: 'Gandhi Jayanti', date: '2024-10-02', type: 'national' },
  { id: '7', name: 'Diwali', date: '2024-11-01', type: 'national' },
  { id: '8', name: 'Christmas', date: '2024-12-25', type: 'national' },
  { id: '9', name: 'Company Foundation Day', date: '2024-06-15', type: 'company', description: 'Annual celebration of company founding' },
];

export const mockNotifications: Notification[] = [
  { id: '1', title: 'Leave Request Approved', message: 'Your sick leave request for Jan 18 has been approved.', type: 'success', read: false, createdAt: '2024-01-17T10:30:00' },
  { id: '2', title: 'Payslip Generated', message: 'Your payslip for January 2024 is now available.', type: 'info', read: false, createdAt: '2024-01-31T18:00:00' },
  { id: '3', title: 'Performance Review Due', message: 'Please complete your Q4 self-assessment by Jan 31.', type: 'warning', read: true, createdAt: '2024-01-10T09:00:00' },
];

export const employeeGrowthData = [
  { month: 'Aug', count: 38 },
  { month: 'Sep', count: 40 },
  { month: 'Oct', count: 42 },
  { month: 'Nov', count: 43 },
  { month: 'Dec', count: 45 },
  { month: 'Jan', count: 47 },
];

export const attendanceSummaryData = [
  { day: 'Mon', present: 44, absent: 3 },
  { day: 'Tue', present: 43, absent: 4 },
  { day: 'Wed', present: 45, absent: 2 },
  { day: 'Thu', present: 42, absent: 5 },
  { day: 'Fri', present: 40, absent: 7 },
];

export const departmentDistribution = [
  { name: 'Engineering', value: 15, color: '#6366f1' },
  { name: 'HR', value: 5, color: '#8b5cf6' },
  { name: 'Marketing', value: 8, color: '#06b6d4' },
  { name: 'Finance', value: 6, color: '#10b981' },
  { name: 'Design', value: 4, color: '#f59e0b' },
  { name: 'Management', value: 3, color: '#ef4444' },
];
