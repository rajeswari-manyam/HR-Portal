import { Download, FileBarChart, Users, CalendarCheck, DollarSign, Building2 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { employeeGrowthData, attendanceSummaryData, departmentDistribution } from '../../data/mockData';

const reportTypes = [
  { label: 'Employee Report', icon: Users, desc: 'Full employee list with details', color: 'bg-primary-100 text-primary-600' },
  { label: 'Attendance Report', icon: CalendarCheck, desc: 'Monthly attendance summary', color: 'bg-emerald-100 text-emerald-600' },
  { label: 'Leave Report', icon: FileBarChart, desc: 'Leave statistics by department', color: 'bg-amber-100 text-amber-600' },
  { label: 'Payroll Report', icon: DollarSign, desc: 'Salary and deductions breakdown', color: 'bg-purple-100 text-purple-600' },
  { label: 'Department Report', icon: Building2, desc: 'Department-wise analytics', color: 'bg-cyan-100 text-cyan-600' },
];

export default function Reports() {
    function exportExcel(type: string) {
      // Simulate Excel export
      const content = `${type} Report\nExported as Excel\n\nSample data...`;
      const blob = new Blob([content], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type.replace(/\s+/g, '_')}_Report.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  function exportPDF(type: string) {
    // Simulate PDF export
    const content = `${type} Report\nExported as PDF\n\nSample data...`;
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type.replace(/\s+/g, '_')}_Report.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Generate and export business intelligence reports</p>
      </div>

      {/* Quick export */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reportTypes.map(r => (
          <div key={r.label} className="card flex items-center gap-4 hover:shadow-card-hover transition-all duration-300 group cursor-pointer">
            <div className={`stat-icon ${r.color}`}><r.icon size={22} /></div>
            <div className="flex-1">
              <p className="font-bold text-slate-900 text-sm">{r.label}</p>
              <p className="text-xs text-slate-400">{r.desc}</p>
            </div>
            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-600 transition-colors" onClick={() => exportPDF(r.label)}>PDF</button>
              <button className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-xs font-semibold text-emerald-700 transition-colors" onClick={() => exportExcel(r.label)}>Excel</button>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Employee Growth Trend</h3>
            <button className="btn-secondary py-1.5 text-xs"><Download size={13} /> Export</button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={employeeGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Weekly Attendance</h3>
            <button className="btn-secondary py-1.5 text-xs"><Download size={13} /> Export</button>
          </div>
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
        </div>
      </div>

      {/* Department stats table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900">Department Summary</h3>
          <button className="btn-secondary py-1.5 text-xs"><Download size={13} /> Export</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="table-header">Department</th>
                <th className="table-header">Employees</th>
                <th className="table-header">Avg Attendance</th>
                <th className="table-header">Pending Leaves</th>
                <th className="table-header">Avg Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {departmentDistribution.map(d => (
                <tr key={d.name} className="hover:bg-slate-50/50">
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                      <span className="font-semibold text-slate-900">{d.name}</span>
                    </div>
                  </td>
                  <td className="table-cell font-semibold">{d.value}</td>
                  <td className="table-cell text-emerald-600 font-semibold">{Math.floor(Math.random() * 10 + 85)}%</td>
                  <td className="table-cell text-amber-600">{Math.floor(Math.random() * 4)}</td>
                  <td className="table-cell font-semibold">₹{(Math.floor(Math.random() * 50 + 60) * 1000).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
