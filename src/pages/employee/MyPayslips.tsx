import { Download } from 'lucide-react';
import { mockPayslips } from '../../data/mockData';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';
export default function MyPayslips() {
  const myPayslips = mockPayslips.filter(p => p.employeeId === 'EMP001');

  function downloadPayslip(payslip: typeof myPayslips[0]) {
    const content = `Payslip for ${payslip.employeeName} (${payslip.employeeId})\nMonth: ${payslip.month} ${payslip.year}\n\nBasic Salary: ${formatCurrency(payslip.basicSalary)}\nHRA: ${formatCurrency(payslip.hra)}\nAllowances: ${formatCurrency(payslip.allowances)}\nGross Salary: ${formatCurrency(payslip.basicSalary + payslip.hra + payslip.allowances)}\nDeductions: -${formatCurrency(payslip.deductions)}\nNet Salary: ${formatCurrency(payslip.netSalary)}\nStatus: ${payslip.status}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payslip_${payslip.employeeName}_${payslip.month}_${payslip.year}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="page-title">My Payslips</h1><p className="page-subtitle">View and download your salary slips</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myPayslips.map(p => (
          <div key={p.id} className="card hover:shadow-card-hover transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-slate-900 text-lg">{p.month} {p.year}</p>
                <p className="text-xs text-slate-400">Generated: {formatDate(p.generatedOn)}</p>
              </div>
              <Badge status={p.status} />
            </div>
            <div className="space-y-2 mb-4 bg-slate-50 p-4 rounded-xl">
              {[
                { label: 'Basic Salary', value: p.basicSalary, color: 'text-slate-900' },
                { label: 'HRA', value: p.hra, color: 'text-blue-600' },
                { label: 'Allowances', value: p.allowances, color: 'text-emerald-600' },
                { label: 'Deductions', value: p.deductions, color: 'text-red-600', neg: true },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{item.label}</span>
                  <span className={`font-semibold ${item.color}`}>{item.neg ? '-' : ''}{formatCurrency(item.value)}</span>
                </div>
              ))}
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold">
                <span className="text-slate-900">Net Salary</span>
                <span className="text-primary-600 text-xl">{formatCurrency(p.netSalary)}</span>
              </div>
            </div>
            <Button className="w-full justify-center" onClick={() => downloadPayslip(p)}><Download size={15} /> Download Payslip</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
