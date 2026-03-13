import { useState, useEffect } from 'react';
import { DollarSign, Download, FileText, TrendingUp, Plus, X, RefreshCw } from 'lucide-react';
import { Payslip } from '../../types';
import Badge from '../../components/shared/Badge';
import Avatar from '../../components/shared/Avatar';
import Modal from '../../components/shared/Modal';
import { formatCurrency } from '../../utils/helpers';
import Button from '../../components/shared/Button';
import StatCard from '../../components/shared/StatCard';
import Table from '../../components/shared/Table';
import InputField from '../../components/shared/InputField';
import {
  createPayslip,
  getAllPayslips,
  PayslipResponse,
} from "../../service/payslip.service";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const mapPayslip = (p: PayslipResponse): Payslip => ({
  id: p._id,
  employeeId: p.employeeId,
  employeeName: p.employeeName,
  month: p.month,
  year: p.year,
  basicSalary: p.basicSalary,
  hra: p.hra,
  allowances: p.allowances,
  deductions: p.deductions,
  netSalary: p.netSalary,
  status: p.status,
  generatedOn: p.generatedOn || new Date().toISOString().split('T')[0],
});

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface GenerateForm {
  employeeId: string;
  employeeName: string;
  month: string;
  year: string;
  basicSalary: string;
  hra: string;
  allowances: string;
  deductions: string;
}

const emptyForm: GenerateForm = {
  employeeId: '',
  employeeName: '',
  month: MONTHS[new Date().getMonth()],
  year: String(new Date().getFullYear()),
  basicSalary: '',
  hra: '',
  allowances: '',
  deductions: '',
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function PayrollManagement() {
  // ── State ───────────────────────────────────────────────────────────────────
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Generate modal
  const [generateModal, setGenerateModal] = useState(false);
  const [form, setForm] = useState<GenerateForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // View modal
  const [selected, setSelected] = useState<Payslip | null>(null);
  const [viewModal, setViewModal] = useState(false);

  // ── Net salary live preview ─────────────────────────────────────────────────
  const previewNet =
    (Number(form.basicSalary) || 0) +
    (Number(form.hra) || 0) +
    (Number(form.allowances) || 0) -
    (Number(form.deductions) || 0);

  // ── Fetch all payslips ──────────────────────────────────────────────────────
  const fetchPayslips = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllPayslips();
      setPayslips(data.map(mapPayslip));
    } catch (err: any) {
      setError(err.message || 'Failed to load payslips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, []);

  // ── Generate payslip (POST) ─────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!form.employeeId.trim() || !form.employeeName.trim() || !form.basicSalary) {
      setFormError('Employee ID, Name and Basic Salary are required.');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const created = await createPayslip({
        employeeId: form.employeeId.trim(),
        employeeName: form.employeeName.trim(),
        month: form.month,
        year: Number(form.year),
        basicSalary: Number(form.basicSalary),
        hra: Number(form.hra) || 0,
        allowances: Number(form.allowances) || 0,
        deductions: Number(form.deductions) || 0,
        netSalary: previewNet,
        status: 'generated',
      });

      setPayslips(prev => [mapPayslip(created), ...prev]);
      setGenerateModal(false);
      setForm(emptyForm);
      setSuccessMsg('Payslip generated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to generate payslip');
    } finally {
      setSaving(false);
    }
  };

  // ── Download payslip ────────────────────────────────────────────────────────
  const downloadPayslip = (p: Payslip) => {
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
  };

  // ── Stats ───────────────────────────────────────────────────────────────────
  const totalPayroll = payslips.reduce((s, p) => s + p.netSalary, 0);
  const totalDeductions = payslips.reduce((s, p) => s + p.deductions, 0);
  const avgSalary = payslips.length ? totalPayroll / payslips.length : 0;
  const generatedCount = payslips.filter(p => p.status === 'generated').length;

  // ── Table columns ───────────────────────────────────────────────────────────
  const columns = [
    {
      header: 'Employee',
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
      header: 'Period',
      render: (p: Payslip) => (
        <span className="text-sm text-slate-600">{p.month} {p.year}</span>
      ),
    },
    {
      header: 'Basic',
      render: (p: Payslip) => <span className="text-sm">{formatCurrency(p.basicSalary)}</span>,
    },
    {
      header: 'HRA',
      render: (p: Payslip) => (
        <span className="text-blue-600 font-medium text-sm">{formatCurrency(p.hra)}</span>
      ),
    },
    {
      header: 'Allowances',
      render: (p: Payslip) => (
        <span className="text-emerald-600 font-medium text-sm">{formatCurrency(p.allowances)}</span>
      ),
    },
    {
      header: 'Deductions',
      render: (p: Payslip) => (
        <span className="text-red-600 font-medium text-sm">-{formatCurrency(p.deductions)}</span>
      ),
    },
    {
      header: 'Net Salary',
      render: (p: Payslip) => (
        <span className="font-bold text-slate-900">{formatCurrency(p.netSalary)}</span>
      ),
    },
    {
      header: 'Status',
      render: (p: Payslip) => <Badge status={p.status} />,
    },
    {
      header: 'Actions',
      render: (p: Payslip) => (
        <div className="flex gap-1 items-center">
          <button
            onClick={() => { setSelected(p); setViewModal(true); }}
            className="text-xs font-semibold text-primary-600 hover:text-primary-800"
          >
            View
          </button>
          <span className="text-slate-200 mx-1">|</span>
          <button
            onClick={() => downloadPayslip(p)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            Download
          </button>
        </div>
      ),
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">

      {/* Success banner */}
      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm text-center">
          {successMsg}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Payroll</h1>
          <p className="page-subtitle">Manage employee salaries and payslips</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchPayslips}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <Button className="btn-secondary">
            <Download size={16} /> Export Report
          </Button>
          <Button
            className="btn-primary"
            onClick={() => { setForm(emptyForm); setFormError(null); setGenerateModal(true); }}
          >
            <Plus size={16} /> Generate Payslip
          </Button>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Payroll', value: formatCurrency(totalPayroll), icon: DollarSign, color: 'bg-primary-100 text-primary-600' },
          { label: 'Avg. Salary', value: formatCurrency(avgSalary), icon: TrendingUp, color: 'bg-emerald-100 text-emerald-600' },
          { label: 'Total Deductions', value: formatCurrency(totalDeductions), icon: FileText, color: 'bg-red-100 text-red-600' },
          { label: 'Payslips Generated', value: String(generatedCount), icon: FileText, color: 'bg-amber-100 text-amber-600' },
        ].map(s => (
          <StatCard
            key={s.label}
            title={s.label}
            value={s.value}
            icon={<s.icon size={20} />}
            color={s.color}
          />
        ))}
      </div>

      {/* ── Salary Structure Overview ───────────────────────────────────────── */}
      <div className="card">
        <h3 className="font-bold text-slate-900 mb-4">Salary Structure Overview</h3>
        <div className="grid grid-cols-5 gap-4 text-center">
          {[
            { label: 'Basic Salary', total: payslips.reduce((s, p) => s + p.basicSalary, 0), color: 'text-slate-900' },
            { label: 'HRA', total: payslips.reduce((s, p) => s + p.hra, 0), color: 'text-blue-600' },
            { label: 'Allowances', total: payslips.reduce((s, p) => s + p.allowances, 0), color: 'text-emerald-600' },
            { label: 'Deductions', total: payslips.reduce((s, p) => s + p.deductions, 0), color: 'text-red-600' },
            { label: 'Net Salary', total: payslips.reduce((s, p) => s + p.netSalary, 0), color: 'text-primary-600' },
          ].map(item => (
            <StatCard
              key={item.label}
              title={item.label}
              value={formatCurrency(item.total)}
              color={item.color}
            />
          ))}
        </div>
      </div>

      {/* ── Payslips Table ──────────────────────────────────────────────────── */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Payslips</h3>
          <span className="text-xs text-slate-400">{payslips.length} total</span>
        </div>

        {loading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : payslips.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3 text-center">
            <FileText size={36} className="text-slate-300" />
            <p className="text-slate-500 font-medium">No payslips yet</p>
            <p className="text-slate-400 text-sm">Click "Generate Payslip" to create the first one</p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={payslips}
            rowsPerPage={5}
            emptyMessage="No payslips available"
          />
        )}
      </div>

      {/* ── Generate Payslip Modal (POST) ───────────────────────────────────── */}
      <Modal
        isOpen={generateModal}
        onClose={() => setGenerateModal(false)}
        title="Generate Payslip"
      >
        <div className="space-y-4">

          {/* Row 1: Employee ID + Name */}
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Employee ID *"
              value={form.employeeId}
              onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))}
              placeholder="e.g. EMP001"
            />
            <InputField
              label="Employee Name *"
              value={form.employeeName}
              onChange={e => setForm(p => ({ ...p, employeeName: e.target.value }))}
              placeholder="e.g. Arjun Sharma"
            />
          </div>

          {/* Row 2: Month + Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Month *</label>
              <select
                className="input w-full"
                value={form.month}
                onChange={e => setForm(p => ({ ...p, month: e.target.value }))}
              >
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <InputField
              label="Year *"
              type="number"
              value={form.year}
              onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
              placeholder="e.g. 2026"
            />
          </div>

          {/* Row 3: Basic + HRA */}
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Basic Salary *"
              type="number"
              value={form.basicSalary}
              onChange={e => setForm(p => ({ ...p, basicSalary: e.target.value }))}
              placeholder="e.g. 50000"
            />
            <InputField
              label="HRA"
              type="number"
              value={form.hra}
              onChange={e => setForm(p => ({ ...p, hra: e.target.value }))}
              placeholder="e.g. 10000"
            />
          </div>

          {/* Row 4: Allowances + Deductions */}
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Allowances"
              type="number"
              value={form.allowances}
              onChange={e => setForm(p => ({ ...p, allowances: e.target.value }))}
              placeholder="e.g. 5000"
            />
            <InputField
              label="Deductions"
              type="number"
              value={form.deductions}
              onChange={e => setForm(p => ({ ...p, deductions: e.target.value }))}
              placeholder="e.g. 2000"
            />
          </div>

          {/* Net Salary Preview */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary-50 rounded-xl border border-primary-100">
            <span className="text-sm font-semibold text-slate-700">Net Salary (Preview)</span>
            <span className={`text-lg font-black ${previewNet < 0 ? 'text-red-500' : 'text-primary-600'}`}>
              {formatCurrency(previewNet)}
            </span>
          </div>

          {formError && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{formError}</p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={() => setGenerateModal(false)} className="btn-secondary flex-1 justify-center">
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={saving} className="btn-primary flex-1 justify-center">
            {saving ? 'Generating…' : 'Generate Payslip'}
          </Button>
        </div>
      </Modal>

      {/* ── View Payslip Modal ──────────────────────────────────────────────── */}
      {selected && (
        <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="Payslip Details">
          <div className="space-y-4">

            {/* Header row */}
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

            {/* Breakdown */}
            <div className="space-y-2">
              {[
                { label: 'Basic Salary', value: selected.basicSalary, type: 'earning' },
                { label: 'HRA', value: selected.hra, type: 'earning' },
                { label: 'Allowances', value: selected.allowances, type: 'earning' },
                { label: 'Gross Salary', value: selected.basicSalary + selected.hra + selected.allowances, type: 'total' },
                { label: 'Total Deductions', value: selected.deductions, type: 'deduction' },
                { label: 'Net Salary', value: selected.netSalary, type: 'net' },
              ].map(item => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between p-3 rounded-xl ${item.type === 'net' ? 'bg-primary-50 border border-primary-100'
                    : item.type === 'total' ? 'bg-slate-100'
                      : 'bg-slate-50'
                    }`}
                >
                  <span className={`text-sm font-medium ${item.type === 'net' ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                    {item.label}
                  </span>
                  <span className={`font-bold text-sm ${item.type === 'deduction' ? 'text-red-600'
                    : item.type === 'net' ? 'text-primary-600 text-base'
                      : 'text-slate-900'
                    }`}>
                    {item.type === 'deduction' ? '-' : ''}{formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>

            <Button className="w-full justify-center" onClick={() => downloadPayslip(selected)}>
              <Download size={16} /> Download Payslip
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}