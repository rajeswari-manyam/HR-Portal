import { mockHolidays } from '../../data/mockData';
import { formatDate } from '../../utils/helpers';
import Badge from '../../components/shared/Badge';

export default function MyHolidays() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="page-title">Holiday Calendar</h1><p className="page-subtitle">{mockHolidays.length} holidays this year</p></div>
      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr><th className="table-header">Holiday</th><th className="table-header">Date</th><th className="table-header">Day</th><th className="table-header">Type</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {mockHolidays.map(h => (
              <tr key={h.id} className="hover:bg-slate-50/50">
                <td className="table-cell font-semibold text-slate-900">{h.name}</td>
                <td className="table-cell">{formatDate(h.date)}</td>
                <td className="table-cell text-slate-500">{new Date(h.date).toLocaleDateString('en-IN', { weekday: 'long' })}</td>
                <td className="table-cell"><Badge status={h.type} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
