import { mockAttendance } from '../../data/mockData';
import { formatDate } from '../../utils/helpers';
import Badge from '../../components/shared/Badge';

export default function MyAttendance() {
  const myAtt = mockAttendance.filter(a => a.employeeId === 'EMP001');
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="page-title">My Attendance</h1><p className="page-subtitle">Track your daily attendance</p></div>
      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr><th className="table-header">Date</th><th className="table-header">Check In</th><th className="table-header">Check Out</th><th className="table-header">Hours</th><th className="table-header">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {myAtt.map(a => (
              <tr key={a.id} className="hover:bg-slate-50/50">
                <td className="table-cell font-medium">{formatDate(a.date)}</td>
                <td className="table-cell font-mono text-emerald-600 font-semibold">{a.checkIn || '—'}</td>
                <td className="table-cell font-mono text-slate-600 font-semibold">{a.checkOut || '—'}</td>
                <td className="table-cell">{a.workHours ? `${a.workHours}h` : '—'}</td>
                <td className="table-cell"><Badge status={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
