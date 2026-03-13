import { useState } from 'react';
import { DollarSign, Download, FileText, TrendingUp } from 'lucide-react';
import { mockPayslips } from '../../data/mockData';
import { Payslip } from '../../types';
import Badge from '../../components/shared/Badge';
import Avatar from '../../components/shared/Avatar';
import Modal from '../../components/shared/Modal';
import { formatCurrency } from '../../utils/helpers';
import Button from '../../components/shared/Button';
import StatCard from '../../components/shared/StatCard';
import Table from '../../components/shared/Table';
import InputField from '../../components/shared/InputField';
export default function PayrollManagement() {
  const [payslips, setPayslips] = useState<Payslip[]>(mockPayslips);
  const [selected, setSelected] = useState<Payslip | null>(null);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // Production-level payslip download
  function downloadPayslip(payslip: Payslip) {
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

  const totalPayroll = payslips.reduce((s, p) => s + p.netSalary, 0);
  const totalDeductions = payslips.reduce((s, p) => s + p.deductions, 0);
const columns = [
  {
    header: "Employee",
    render: (p: Payslip) => (
      <div className="flex items-center gap-3">
        <Avatar name={p.employeeName} size="sm" />
        <div>
          <p className="font-semibold text-slate-900 text-sm">{p.employeeName}</p>
          <p className="text-xs text-slate-400">{p.employeeId}</p>
        </div>
      </div>
    ),
  },
  {
    header: "Basic",
    render: (p: Payslip) => formatCurrency(p.basicSalary),
  },
  {
    header: "HRA",
    render: (p: Payslip) => (
      <span className="text-blue-600 font-medium">
        {formatCurrency(p.hra)}
      </span>
    ),
  },
  {
    header: "Allowances",
    render: (p: Payslip) => (
      <span className="text-emerald-600 font-medium">
        {formatCurrency(p.allowances)}
      </span>
    ),
  },
  {
    header: "Deductions",
    render: (p: Payslip) => (
      <span className="text-red-600 font-medium">
        -{formatCurrency(p.deductions)}
      </span>
    ),
  },
  {
    header: "Net Salary",
    render: (p: Payslip) => (
      <span className="font-bold text-slate-900">
        {formatCurrency(p.netSalary)}
      </span>
    ),
  },
  {
    header: "Status",
    render: (p: Payslip) => <Badge status={p.status} />,
  },
  {
    header: "Actions",
    render: (p: Payslip) => (
      <div className="flex gap-1">
        <button
          onClick={() => {
            setSelected(p);
            setModal(true);
          }}
          className="text-xs font-semibold text-primary-600"
        >
          View
        </button>

        <span className="text-slate-200 mx-1">|</span>

        <button
          onClick={() => downloadPayslip(p)}
          className="text-xs font-semibold text-slate-500"
        >
          Download
        </button>
      </div>
    ),
  },
];
  return (
    <div className="space-y-6 animate-fade-in">
      {loading && (
        <div className="mb-4 p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-700 text-sm text-center">
          Generating payroll...
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-sm text-center">
          {success}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Payroll</h1><p className="page-subtitle">Manage employee salaries and payslips</p></div>
        <div className="flex gap-2">
          <Button className="btn-secondary"><Download size={16} /> Export Report</Button>
          <Button
            className="btn-primary"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              setSuccess("");
              // Simulate payroll generation
              await new Promise(r => setTimeout(r, 1200));
              setPayslips(prev => prev.map(p => ({ ...p, status: "generated" })));
              setLoading(false);
              setSuccess("Payroll generated successfully!");
              setTimeout(() => setSuccess(""), 2000);
            }}
          >
            <DollarSign size={16} /> Generate Payroll
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Payroll', value: formatCurrency(totalPayroll), icon: DollarSign, color: 'bg-primary-100 text-primary-600' },
          { label: 'Avg. Salary', value: formatCurrency(totalPayroll / payslips.length || 0), icon: TrendingUp, color: 'bg-emerald-100 text-emerald-600' },
          { label: 'Total Deductions', value: formatCurrency(totalDeductions), icon: FileText, color: 'bg-red-100 text-red-600' },
          { label: 'Payslips Generated', value: payslips.filter(p => p.status === 'generated').length.toString(), icon: FileText, color: 'bg-amber-100 text-amber-600' },
        ].map(s => (
           <StatCard
              title={s.label}
              value={s.value}
              icon={<s.icon size={20} />}
             
            
              color={s.color}
            />
        ))}
      </div>

      {/* Salary Structure Summary */}
      <div className="card">
        <h3 className="font-bold text-slate-900 mb-4">Salary Structure Overview</h3>
        <div className="grid grid-cols-5 gap-4 text-center">
          {[
            { label: 'Basic Salary', total: mockPayslips.reduce((s, p) => s + p.basicSalary, 0), color: 'text-slate-900' },
            { label: 'HRA', total: mockPayslips.reduce((s, p) => s + p.hra, 0), color: 'text-blue-600' },
            { label: 'Allowances', total: mockPayslips.reduce((s, p) => s + p.allowances, 0), color: 'text-emerald-600' },
            { label: 'Deductions', total: mockPayslips.reduce((s, p) => s + p.deductions, 0), color: 'text-red-600' },
            { label: 'Net Salary', total: mockPayslips.reduce((s, p) => s + p.netSalary, 0), color: 'text-primary-600' },
          ].map(item => (
            // <div key={item.label} className="p-4 bg-slate-50 rounded-xl">
            //   <p className={`text-lg font-black ${item.color}`}>{formatCurrency(item.total)}</p>
            //   <p className="text-xs text-slate-500 mt-1 font-medium">{item.label}</p>
            // </div>
             <StatCard
                          title={item.label}
                          value={item.total}
                         
                          color={item.color}
                        />
          ))}
        </div>
      </div>
<div className="card p-0 overflow-hidden">
  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
    <h3 className="font-bold text-slate-900">Payslips</h3>

    <select className="input max-w-[160px] py-2">
      <option>January 2024</option>
      <option>December 2023</option>
    </select>
  </div>

  <Table
    columns={columns}
    data={payslips}
    rowsPerPage={2}
    emptyMessage="No payslips available"
  />
</div>
      {selected && (
        <Modal isOpen={modal} onClose={() => setModal(false)} title="Payslip Details">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Avatar name={selected.employeeName} size="md" />
                <div>
                  <p className="font-bold text-slate-900">{selected.employeeName}</p>
                  <p className="text-sm text-slate-500">{selected.employeeId} · {selected.month} {selected.year}</p>
                </div>
              </div>
              <p className="text-2xl font-black text-primary-600">{formatCurrency(selected.netSalary)}</p>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Basic Salary', value: selected.basicSalary, type: 'earning' },
                { label: 'HRA', value: selected.hra, type: 'earning' },
                { label: 'Allowances', value: selected.allowances, type: 'earning' },
                { label: 'Gross Salary', value: selected.basicSalary + selected.hra + selected.allowances, type: 'total' },
                { label: 'Total Deductions', value: selected.deductions, type: 'deduction' },
                { label: 'Net Salary', value: selected.netSalary, type: 'net' },
              ].map(item => (
                <div key={item.label} className={`flex items-center justify-between p-3 rounded-xl ${item.type === 'net' ? 'bg-primary-50 border border-primary-100' : item.type === 'total' ? 'bg-slate-100' : 'bg-slate-50'}`}>
                  <span className={`text-sm font-medium ${item.type === 'net' ? 'font-bold text-slate-900' : 'text-slate-600'}`}>{item.label}</span>
                  <span className={`font-bold text-sm ${item.type === 'deduction' ? 'text-red-600' : item.type === 'net' ? 'text-primary-600 text-base' : 'text-slate-900'}`}>
                    {item.type === 'deduction' ? '-' : ''}{formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>
            
                      <Button className=" w-full justify-center" onClick={() => downloadPayslip(selected)}><Download size={16} /> Download Payslip</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
