// import { Download, DollarSign } from 'lucide-react';
// import { mockPayslips } from '../../data/mockData';
// import { formatCurrency, formatDate } from '../../utils/helpers';
// import Badge from '../../components/shared/Badge';

// export function MyPayslips() {
//   const myPayslips = mockPayslips.filter(p => p.employeeId === 'EMP001');
//   return (
//     <div className="space-y-6 animate-fade-in">
//       <h1 className="page-title">My Payslips</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {myPayslips.map(p => (
//           <div key={p.id} className="card hover:shadow-card-hover transition-all duration-300">
//             <div className="flex items-center justify-between mb-4">
//               <div>
//                 <p className="font-bold text-slate-900">{p.month} {p.year}</p>
//                 <p className="text-xs text-slate-400">Generated: {formatDate(p.generatedOn)}</p>
//               </div>
//               <Badge status={p.status} />
//             </div>
//             <div className="space-y-2 mb-4">
//               {[
//                 { label: 'Basic Salary', value: p.basicSalary, color: 'text-slate-900' },
//                 { label: 'HRA', value: p.hra, color: 'text-blue-600' },
//                 { label: 'Allowances', value: p.allowances, color: 'text-emerald-600' },
//                 { label: 'Deductions', value: -p.deductions, color: 'text-red-600' },
//               ].map(item => (
//                 <div key={item.label} className="flex justify-between text-sm">
//                   <span className="text-slate-500">{item.label}</span>
//                   <span className={`font-semibold ${item.color}`}>{item.value < 0 ? '-' : ''}{formatCurrency(Math.abs(item.value))}</span>
//                 </div>
//               ))}
//               <div className="border-t border-slate-100 pt-2 flex justify-between">
//                 <span className="font-bold text-slate-900">Net Salary</span>
//                 <span className="font-black text-primary-600 text-lg">{formatCurrency(p.netSalary)}</span>
//               </div>
//             </div>
//             <button className="btn-secondary w-full justify-center text-sm"><Download size={15} /> Download Payslip</button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export function MyAttendance() {
//   const { mockAttendance } = require('../../data/mockData');
//   const myAtt = mockAttendance.filter((a: any) => a.employeeId === 'EMP001');
//   return (
//     <div className="space-y-6 animate-fade-in">
//       <h1 className="page-title">My Attendance</h1>
//       <div className="card p-0 overflow-hidden">
//         <table className="w-full">
//           <thead className="bg-slate-50 border-b border-slate-100">
//             <tr>
//               <th className="table-header">Date</th>
//               <th className="table-header">Check In</th>
//               <th className="table-header">Check Out</th>
//               <th className="table-header">Work Hours</th>
//               <th className="table-header">Status</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-50">
//             {myAtt.map((a: any) => (
//               <tr key={a.id} className="hover:bg-slate-50/50">
//                 <td className="table-cell font-medium">{formatDate(a.date)}</td>
//                 <td className="table-cell font-mono text-emerald-600">{a.checkIn || '—'}</td>
//                 <td className="table-cell font-mono text-slate-600">{a.checkOut || '—'}</td>
//                 <td className="table-cell">{a.workHours ? `${a.workHours}h` : '—'}</td>
//                 <td className="table-cell"><Badge status={a.status} /></td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
