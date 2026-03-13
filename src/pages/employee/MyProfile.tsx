import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockEmployees } from '../../data/mockData';
import Avatar from '../../components/shared/Avatar';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';
import InputField from '../../components/shared/InputField';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { Pencil, Save, X } from 'lucide-react';

export default function MyProfile() {
  const { user } = useAuth();
  const emp = mockEmployees.find(e => e.employeeId === user?.employeeId) || mockEmployees[0];

  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(emp.phone);
  const [address, setAddress] = useState(emp.address);
  const [emergency, setEmergency] = useState(emp.emergencyContact);
  const [activeTab, setActiveTab] = useState('personal');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="page-title">My Profile</h1>
        {!editing ? (
          <Button variant="secondary" onClick={() => setEditing(true)}>
            <Pencil size={15} /> Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setEditing(false)}>
              <X size={15} /> Cancel
            </Button>
            <Button variant="primary" onClick={() => setEditing(false)}>
              <Save size={15} /> Save
            </Button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="card">
        {/* Avatar & Info */}
        <div className="flex items-center gap-5 mb-6">
          <Avatar name={emp.fullName} size="xl" />
          <div>
            <h2 className="text-xl font-black text-slate-900">{emp.fullName}</h2>
            <p className="text-slate-500">{emp.designation} · {emp.department}</p>
            <div className="flex gap-3 mt-2">
              <Badge status={emp.status} />
              <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">{emp.employeeId}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['personal', 'job'].map(t => (
            <Button key={t} variant={activeTab === t ? 'primary' : 'secondary'} onClick={() => setActiveTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Button>
          ))}
        </div>

        {/* Personal Tab */}
        {activeTab === 'personal' && (
          <div className="grid grid-cols-4 gap-4">
            {editing ? (
              <>
                <div className="col-span-1">
                  <InputField label="Phone" value={phone} onChange={e => setPhone(e.target.value)} className="py-3" />
                </div>
                <div className="col-span-1">
                  <InputField label="Email" value={emp.email} disabled className="py-3" />
                </div>
                <div className="col-span-2">
                  <InputField label="Address" value={address} onChange={e => setAddress(e.target.value)} className="py-3" />
                </div>
                <div className="col-span-2">
                  <InputField label="Emergency Contact" value={emergency} onChange={e => setEmergency(e.target.value)} className="py-3" />
                </div>
              </>
            ) : (
              [
                ['Full Name', emp.fullName], ['Email', emp.email], ['Phone', phone],
                ['Gender', emp.gender || '-'], ['Date of Birth', formatDate(emp.dateOfBirth || '')],
                ['Blood Group', emp.bloodGroup || '-'], ['Address', address], ['Emergency Contact', emergency],
              ].map(([k, v]) => (
                <div key={k} className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">{k}</p>
                  <p className="font-semibold text-slate-900 text-sm">{v}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Job Tab */}
        {activeTab === 'job' && (
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Department', emp.department], ['Designation', emp.designation],
              ['Joining Date', formatDate(emp.joiningDate)], ['Salary', formatCurrency(emp.salary)],
              ['Manager', emp.manager || '-'], ['Status', emp.status],
            ].map(([k, v]) => (
              <div key={k} className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">{k}</p>
                <p className="font-semibold text-slate-900 text-sm">{v}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}