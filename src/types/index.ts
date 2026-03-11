export type Role = 'hr' | 'employee';

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  designation: string;
  avatar?: string;
  joinDate: string;
  phone: string;
  status: 'active' | 'inactive';
}

export interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joiningDate: string;
  salary: number;
  address: string;
  emergencyContact: string;
  status: 'active' | 'inactive';
  avatar?: string;
  gender?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  manager?: string;
}

export interface Department {
  id: string;
  name: string;
  manager: string;
  description: string;
  employeeCount: number;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
  workHours?: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedOn: string;
  approvedBy?: string;
}

export interface LeaveBalance {
  leaveType: string;
  total: number;
  used: number;
  remaining: number;
}

export interface Payslip {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  basicSalary: number;
  hra: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'generated' | 'pending';
  generatedOn: string;
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  skills: string[];
  experience: string;
  salaryRange: string;
  status: 'open' | 'closed' | 'draft';
  applicants: number;
  postedOn: string;
}

export interface Candidate {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  skills: string[];
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'hired';
  appliedOn: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  rating: number;
  goals: string[];
  feedback: string;
  status: 'draft' | 'submitted' | 'reviewed';
  reviewedBy?: string;
  createdAt: string;
}

export interface Document {
  id: string;
  employeeId: string;
  name: string;
  type: 'offer-letter' | 'resume' | 'certificate' | 'id-proof' | 'other';
  size: string;
  uploadedOn: string;
  url?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  targetRole: 'all' | 'hr' | 'employee';
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'national' | 'regional' | 'company';
  description?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface CompanySettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  logo?: string;
  workingHours: { start: string; end: string };
  weeklyOff: string[];
}
// ─── Project management types ──────────────────────────────────────────────

export interface Person {
  id: string;
  employeeId: string;
  name: string;
  avatar: string;
  role: string;
  color: string;
}

export type Priority = "critical" | "high" | "medium" | "low";
// status values used by projects/tasks; 'overdue' is computed but included here for convenience
export type ProjectStatus = "not_started" | "in_progress" | "completed" | "on_hold" | "overdue";

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
  isIncompleteReason?: boolean;
}

export interface SubTask {
  id: string;
  title: string;
  assigneeId: string ;
  status: ProjectStatus;
  dueDate: string;
  completedAt?: string;
  incompleteReason?: string;
  comments: Comment[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string | null;
  priority: Priority;
  status: ProjectStatus;
  dueDate: string;
  completedAt?: string;
  incompleteReason?: string;
  comments: Comment[];
  subtasks: SubTask[];
}

export interface Project {
  id: string;
  code: string;
  name: string;
  client: string;
  description: string;
  managerId: string | null;
  team: string[]; // array of person/employee ids
  priority: Priority;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  completedAt?: string;
  tasks: Task[];
  color: string;
}
