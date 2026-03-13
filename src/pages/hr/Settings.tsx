import { useState } from 'react';
import { Save, Building2, Mail, Shield, Settings2, Activity } from 'lucide-react';
import Button from '../../components/shared/Button';
import InputField from '../../components/shared/InputField';
import Select from '../../components/shared/Select';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import Badge from '../../components/shared/Badge';
export default function Settings() {
  const [activeTab, setActiveTab] = useState('company');
  const [company, setCompany] = useState({
    name: 'WorkForce Technologies Pvt Ltd',
    email: 'hr@company.com',
    phone: '+91 80 1234 5678',
    address: '100 Outer Ring Road, Marathahalli, Bangalore 560037',
    website: 'https://workforce.com',
    workStartTime: '09:00',
    workEndTime: '18:00',
  });

  const tabs = [
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'logs', label: 'System Logs', icon: Activity },
    { id: 'integrations', label: 'Integrations', icon: Settings2 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="page-title">Settings</h1><p className="page-subtitle">Configure your HR portal</p></div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 tab-btn ${activeTab === t.id ? 'active' : ''}`}>
            <t.icon size={15} />{t.label}
          </button>
        ))}
      </div>

      {activeTab === 'company' && (
        <div className="card max-w-2xl">
          <h3 className="font-bold text-slate-900 mb-6">Company Information</h3>
          <div className="space-y-5">
         <InputField 
    label="Company Name" 
    value={company.name} 
    onChange={e => setCompany(p => ({ ...p, name: e.target.value }))}
      className="h-12"
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
                className="h-20"
              />
            <InputField 
              label="Website" 
              value={company.website} 
              onChange={e => setCompany(p => ({ ...p, website: e.target.value }))} 
            />
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
          </div>
          <Button className="btn-primary mt-6"><Save size={16} /> Save Settings</Button>
        </div>
      )}

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
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${log.type === 'success' ? 'bg-emerald-500' : log.type === 'warning' ? 'bg-amber-500' : 'bg-primary-500'}`} />
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
