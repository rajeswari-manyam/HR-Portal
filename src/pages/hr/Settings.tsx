import { useState, useEffect } from 'react';
import { Save, Building2, Mail, Shield, Settings2, Activity, X, Loader2 } from 'lucide-react';
import Button from '../../components/shared/Button';
import InputField from '../../components/shared/InputField';
import Select from '../../components/shared/Select';
import { getSettings, updateSettings, SettingsResponse } from "../../service/setting.service";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CompanyForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  logo: string;
  workStartTime: string;
  workEndTime: string;
  weeklyOff: string[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultForm: CompanyForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  website: '',
  logo: '',
  workStartTime: '09:00',
  workEndTime: '18:00',
  weeklyOff: ['Saturday', 'Sunday'],
};

// ─────────────────────────────────────────────────────────────────────────────
// Normalize API response → form shape
// ─────────────────────────────────────────────────────────────────────────────

function normalizeSettings(data: SettingsResponse): CompanyForm {
  return {
    name: data.name ?? '',
    email: data.email ?? '',
    phone: data.phone ?? '',
    address: data.address ?? '',
    website: data.website ?? '',
    logo: data.logo ?? '',
    workStartTime: data.workingHours?.start ?? '09:00',
    workEndTime: data.workingHours?.end ?? '18:00',
    weeklyOff: Array.isArray(data.weeklyOff) ? data.weeklyOff : ['Saturday', 'Sunday'],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function Settings() {
  const [activeTab, setActiveTab] = useState('company');

  // Company form state
  const [company, setCompany] = useState<CompanyForm>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const tabs = [
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'logs', label: 'System Logs', icon: Activity },
    { id: 'integrations', label: 'Integrations', icon: Settings2 },
  ];

  // ── Fetch settings on mount ─────────────────────────────────────────────────
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSettings();
      setCompany(normalizeSettings(data));
    } catch (err: any) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // ── Save settings ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      await updateSettings({
        name: company.name,
        email: company.email,
        phone: company.phone,
        address: company.address,
        website: company.website,
        logo: company.logo,
        workingHours: {
          start: company.workStartTime,
          end: company.workEndTime,
        },
        weeklyOff: company.weeklyOff,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle weekly off day ───────────────────────────────────────────────────
  const toggleWeeklyOff = (day: string) => {
    setCompany(p => ({
      ...p,
      weeklyOff: p.weeklyOff.includes(day)
        ? p.weeklyOff.filter(d => d !== day)
        : [...p.weeklyOff, day],
    }));
  };

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure your HR portal</p>
      </div>

      {/* Error / Success banners */}
      {error && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}
      {success && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          <span>✓ Settings saved successfully</span>
          <button onClick={() => setSuccess(false)}><X size={14} /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 tab-btn ${activeTab === t.id ? 'active' : ''}`}
          >
            <t.icon size={15} />{t.label}
          </button>
        ))}
      </div>

      {/* ── Company Tab ──────────────────────────────────────────────────────── */}
      {activeTab === 'company' && (
        <div className="card max-w-2xl">
          <h3 className="font-bold text-slate-900 mb-6">Company Information</h3>
          <div className="space-y-5">

            <InputField
              label="Company Name"
              value={company.name}
              onChange={e => setCompany(p => ({ ...p, name: e.target.value }))}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <InputField
                label="Email"
                type="email"
                value={company.email}
                onChange={e => setCompany(p => ({ ...p, email: e.target.value }))}
              />
              <InputField
                label="Phone"
                value={company.phone}
                onChange={e => setCompany(p => ({ ...p, phone: e.target.value }))}
              />
            </div>

            <InputField
              label="Address"
              value={company.address}
              onChange={e => setCompany(p => ({ ...p, address: e.target.value }))}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <InputField
                label="Website"
                value={company.website}
                onChange={e => setCompany(p => ({ ...p, website: e.target.value }))}
              />
              <InputField
                label="Logo URL"
                value={company.logo}
                onChange={e => setCompany(p => ({ ...p, logo: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            {/* Working Hours */}
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Work Start Time"
                type="time"
                value={company.workStartTime}
                onChange={e => setCompany(p => ({ ...p, workStartTime: e.target.value }))}
              />
              <InputField
                label="Work End Time"
                type="time"
                value={company.workEndTime}
                onChange={e => setCompany(p => ({ ...p, workEndTime: e.target.value }))}
              />
            </div>

            {/* Weekly Off */}
            <div>
              <label className="label mb-2 block">Weekly Off Days</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleWeeklyOff(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${company.weeklyOff.includes(day)
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-primary-300'
                      }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            className="btn-primary mt-6"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
              : <><Save size={16} /> Save Settings</>
            }
          </Button>
        </div>
      )}

      {/* ── Permissions Tab ───────────────────────────────────────────────────── */}
      {activeTab === 'permissions' && (
        <div className="card max-w-2xl">
          <h3 className="font-bold text-slate-900 mb-6">Role Permissions</h3>
          <div className="space-y-3">
            {[
              { module: 'Employee Management', hr: true, employee: false },
              { module: 'Attendance Management', hr: true, employee: true },
              { module: 'Leave Management', hr: true, employee: true },
              { module: 'Payroll Access', hr: true, employee: false },
              { module: 'Download Payslips', hr: true, employee: true },
              { module: 'Recruitment', hr: true, employee: false },
              { module: 'Performance Reviews', hr: true, employee: true },
              { module: 'Document Management', hr: true, employee: true },
              { module: 'Reports', hr: true, employee: false },
              { module: 'Settings', hr: true, employee: false },
            ].map(p => (
              <div key={p.module} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-sm font-medium text-slate-700">{p.module}</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked={p.hr} className="w-4 h-4 text-primary-600 rounded" />
                    <span className="text-xs text-slate-500">HR</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked={p.employee} className="w-4 h-4 text-primary-600 rounded" />
                    <span className="text-xs text-slate-500">Employee</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
          <Button className="btn-primary mt-6"><Save size={16} /> Save Permissions</Button>
        </div>
      )}

      {/* ── System Logs Tab ───────────────────────────────────────────────────── */}
      {activeTab === 'logs' && (
        <div className="card">
          <h3 className="font-bold text-slate-900 mb-4">System Logs</h3>
          <div className="space-y-2">
            {[
              { action: 'Payroll generated for January 2024', user: 'Rahul Verma', time: '2024-01-31 18:02:44', type: 'success' },
              { action: 'Employee EMP008 status changed to inactive', user: 'Rahul Verma', time: '2024-01-30 11:24:18', type: 'warning' },
              { action: 'New employee EMP008 added', user: 'Rahul Verma', time: '2024-01-25 09:15:32', type: 'info' },
              { action: 'Leave request LVR003 approved', user: 'Rahul Verma', time: '2024-01-20 14:42:00', type: 'success' },
              { action: 'Department Design created', user: 'Rahul Verma', time: '2024-01-15 10:00:00', type: 'info' },
            ].map((log, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${log.type === 'success' ? 'bg-emerald-500' :
                    log.type === 'warning' ? 'bg-amber-500' : 'bg-primary-500'
                  }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{log.action}</p>
                  <p className="text-xs text-slate-400">by {log.user}</p>
                </div>
                <span className="text-xs text-slate-400 font-mono">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Email / Integrations placeholder ─────────────────────────────────── */}
      {['email', 'integrations'].includes(activeTab) && (
        <div className="card max-w-2xl">
          <div className="py-12 text-center">
            <Settings2 size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">Configuration coming soon</p>
          </div>
        </div>
      )}
    </div>
  );
}