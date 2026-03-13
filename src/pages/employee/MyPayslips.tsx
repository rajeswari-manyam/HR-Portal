import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { getPayslipsByEmployee, PayslipResponse } from '../../service/payslip.service';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';
import { useAuth } from '../../context/AuthContext';

export default function MyPayslips() {
  const { user, isLoading: authLoading } = useAuth();

  const [payslips, setPayslips] = useState<PayslipResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    const employeeId = user?.employeeId;

    if (!employeeId) {
      setError('Employee ID not found. Please log out and log in again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    getPayslipsByEmployee(employeeId)
      .then(setPayslips)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user?.employeeId, authLoading]);

  function downloadPayslip(p: PayslipResponse) {
    const content = [
      `PAYSLIP`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Employee  : ${p.employeeName} (${p.employeeId})`,
      `Period    : ${p.month} ${p.year}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Basic Salary  : ${formatCurrency(p.basicSalary)}`,
      `HRA           : ${formatCurrency(p.hra)}`,
      `Allowances    : ${formatCurrency(p.allowances)}`,
      `Gross Salary  : ${formatCurrency(p.basicSalary + p.hra + p.allowances)}`,
      `Deductions    : -${formatCurrency(p.deductions)}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Net Salary    : ${formatCurrency(p.netSalary)}`,
      `Status        : ${p.status}`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payslip_${p.employeeName}_${p.month}_${p.year}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">My Payslips</h1>
        <p className="page-subtitle">View and download your salary slips</p>
      </div>

      {(loading || authLoading) && (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !authLoading && error && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {!loading && !authLoading && !error && payslips.length === 0 && (
        <p className="text-slate-400 text-sm text-center py-12">No payslips found.</p>
      )}

      {!loading && !authLoading && !error && payslips.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {payslips.map((p) => (
            <div
              key={p._id}
              className="card hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold text-slate-900 text-lg">{p.month} {p.year}</p>
                  <p className="text-xs text-slate-400">
                    Generated: {p.generatedOn ? formatDate(p.generatedOn) : '—'}
                  </p>
                </div>
                <Badge status={p.status} />
              </div>

              <div className="space-y-2 mb-4 bg-slate-50 p-4 rounded-xl">
                {[
                  { label: 'Basic Salary', value: p.basicSalary, color: 'text-slate-900' },
                  { label: 'HRA', value: p.hra, color: 'text-blue-600' },
                  { label: 'Allowances', value: p.allowances, color: 'text-emerald-600' },
                  { label: 'Deductions', value: p.deductions, color: 'text-red-600', neg: true },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-slate-500">{item.label}</span>
                    <span className={`font-semibold ${item.color}`}>
                      {item.neg ? '-' : ''}{formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold">
                  <span className="text-slate-900">Net Salary</span>
                  <span className="text-primary-600 text-xl">{formatCurrency(p.netSalary)}</span>
                </div>
              </div>

              <Button className="w-full justify-center" onClick={() => downloadPayslip(p)}>
                <Download size={15} /> Download Payslip
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}