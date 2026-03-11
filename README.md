# WorkForce Pro — HR Portal

A production-level HR Management System built with **React 18**, **TypeScript**, **Tailwind CSS**, and **Vite**.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔐 Demo Credentials

| Role     | Email                  | Password    |
|----------|------------------------|-------------|
| HR Admin | hr@company.com         | password123 |
| Employee | employee@company.com   | password123 |

## 📦 Tech Stack

- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (styling)
- **React Router DOM v6** (routing)
- **Recharts** (charts & analytics)
- **Lucide React** (icons)
- **React Hot Toast** (notifications)

## 🗂️ Modules

### HR Admin
1. **Dashboard** — KPIs, charts, recent activity
2. **Employee Management** — Full CRUD, profile, status
3. **Department Management** — Add/edit/delete departments
4. **Attendance Management** — Mark, edit, filter, export
5. **Leave Management** — Approve/reject, leave calendar
6. **Payroll Management** — Payslips, salary breakdown
7. **Recruitment** — Job postings, candidate pipeline
8. **Performance Management** — Reviews, ratings, goals
9. **Document Management** — Upload/download employee docs
10. **Announcements** — Create and broadcast announcements
11. **Holiday Management** — Add/edit holidays calendar
12. **Reports** — Export-ready analytics reports
13. **Settings** — Company info, permissions, system logs

### Employee Self-Service
1. **Dashboard** — Personal KPIs, leave balance, upcoming events
2. **My Profile** — View/edit personal information
3. **My Attendance** — View attendance history
4. **Leave** — Apply for leave, view balance & history
5. **My Payslips** — View and download salary slips
6. **Performance** — View own reviews and goals
7. **Documents** — Upload/download personal documents
8. **Announcements** — View company announcements
9. **Holidays** — View holiday calendar

## 🔒 Authentication
- JWT-based auth flow (simulated)
- Role-based access control (HR / Employee)
- Remember me session persistence
- Auto-redirect based on role

## 📁 Project Structure

```
src/
├── components/
│   └── shared/        # Layout, Sidebar, TopBar, Table, Modal, reusable button components (Button, IconButton), etc.
├── context/           # Auth context
├── data/              # Mock data
├── pages/
│   ├── auth/          # Login
│   ├── hr/            # All HR module pages
│   └── employee/      # Employee self-service pages
├── types/             # TypeScript interfaces
└── utils/             # Helper functions
```
