import { useState, useEffect } from 'react';
import { Download, FileBarChart, Users, CalendarCheck, DollarSign, Building2, RefreshCw, X } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

import Button from "../../components/shared/Button";
import Table from "../../components/shared/Table";
import StatCard from '../../components/shared/StatCard';

import {
  fetchDashboardData,
  DepartmentDist,
  AttendanceSummary,
  EmployeeGrowth,
} from '../../service/DashBoard.service';

// ─────────────────────────────────────────────────────────────────────────────
// REPORT TYPES
// ─────────────────────────────────────────────────────────────────────────────

const reportTypes = [
  { label: 'Employee Report', icon: Users, desc: 'Full employee list with details', color: 'bg-primary-100 text-primary-600' },
  { label: 'Attendance Report', icon: CalendarCheck, desc: 'Monthly attendance summary', color: 'bg-emerald-100 text-emerald-600' },
  { label: 'Leave Report', icon: FileBarChart, desc: 'Leave statistics by department', color: 'bg-amber-100 text-amber-600' },
  { label: 'Payroll Report', icon: DollarSign, desc: 'Salary and deductions breakdown', color: 'bg-purple-100 text-purple-600' },
  { label: 'Department Report', icon: Building2, desc: 'Department-wise analytics', color: 'bg-cyan-100 text-cyan-600' },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function Reports() {
  const [employeeGrowthData, setEmployeeGrowthData] = useState<EmployeeGrowth[]>([]);
  const [attendanceSummaryData, setAttendanceSummaryData] = useState<AttendanceSummary[]>([]);
  const [departmentDistribution, setDepartmentDistribution] = useState<DepartmentDist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboardData();
      setEmployeeGrowthData(data.employeeGrowthData);
      setAttendanceSummaryData(data.attendanceSummaryData);
      setDepartmentDistribution(data.departmentDistribution);
    } catch (err: any) {
      setError(err.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ── Export helpers ────────────────────────────────────────────────────────
  function exportExcel(type: string) {
    const blob = new Blob([`${type} Report\nExported as Excel`], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type.replace(/\s+/g, '_')}_Report.xlsx`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  function exportPDF(type: string) {
    const blob = new Blob([`${type} Report\nExported as PDF`], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type.replace(/\s+/g, '_')}_Report.pdf`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  // ── Department table columns ──────────────────────────────────────────────
  const deptColumns = [
    {
      header: 'Department',
      render: (d: DepartmentDist) => (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
          <span className="font-medium text-slate-700">{d.name}</span>
        </div>
      ),
    },
    {
      header: 'Employees',
      render: (d: DepartmentDist) => (
        <span className="font-semibold text-slate-900">{d.value}</span>
      ),
    },
    {
      header: 'Share',
      render: (d: DepartmentDist) => {
        const total = departmentDistribution.reduce((s, x) => s + x.value, 0);
        const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : '0.0';
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-24">
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, background: d.color }}
              />
            </div>
            <span className="text-xs text-slate-500 w-10">{pct}%</span>
          </div>
        );
      },
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">

      {/* Error banner */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Generate and export business intelligence reports</p>
        </div>
        <button
          onClick={loadData}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Quick export cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reportTypes.map(r => (
          <div key={r.label} className="card flex items-center gap-4 hover:shadow-card-hover transition-all duration-300 group cursor-pointer">
            <div className={`stat-icon ${r.color}`}><r.icon size={22} /></div>
            <div className="flex-1">
              <p className="font-bold text-slate-900 text-sm">{r.label}</p>
              <p className="text-xs text-slate-400">{r.desc}</p>
            </div>
            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => exportPDF(r.label)}>PDF</Button>
              <Button variant="success" className="px-3 py-1.5 text-xs" onClick={() => exportExcel(r.label)}>Excel</Button>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-1/2 mb-4" />
              <div className="h-52 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Employee Growth */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Employee Growth Trend</h3>
              <Button variant="secondary" className="py-1.5 text-xs">
                <Download size={13} /> Export
              </Button>
            </div>
            {employeeGrowthData.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-slate-400 text-sm">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={employeeGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }} />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Weekly Attendance */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Weekly Attendance</h3>
              <Button variant="secondary" className="py-1.5 text-xs">
                <Download size={13} /> Export
              </Button>
            </div>
            {attendanceSummaryData.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-slate-400 text-sm">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={attendanceSummaryData} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }} />
                  <Bar dataKey="present" fill="#10b981" name="Present" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" fill="#fca5a5" name="Absent" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>
      )}

      {/* Department Distribution Table */}
      {!loading && (
        <div className="card p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Department Distribution</h3>
            <span className="text-xs text-slate-400">{departmentDistribution.length} departments</span>
          </div>
          {departmentDistribution.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-slate-400 text-sm">
              No department data available
            </div>
          ) : (
            <Table
              columns={deptColumns}
              data={departmentDistribution}
              rowsPerPage={10}
              emptyMessage="No departments found"
            />
          )}
        </div>
      )}

    </div>
  );
}