import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockEmployees } from '../../data/mockData';
import Avatar from '../../components/shared/Avatar';
import Badge from '../../components/shared/Badge';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { Pencil, Save, X } from 'lucide-react';
import Button from '../../components/shared/Button';
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
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">My Profile</h1></div>
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

      <div className="card">
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

        <div className="flex gap-2 mb-6 flex-wrap">
          {['personal', 'job'].map(t => (
            <Button key={t} variant={activeTab === t ? 'primary' : 'secondary'} onClick={() => setActiveTab(t)}>
              {t}
            </Button>
          ))}
        </div>

        {activeTab === 'personal' && (
          <div className="grid grid-cols-2 gap-4">
            {editing ? (
              <>
                <div><label className="label">Phone</label><input className="input" value={phone} onChange={e => setPhone(e.target.value)} /></div>
                <div className="col-span-2"><label className="label">Address</label><textarea className="input resize-none" rows={2} value={address} onChange={e => setAddress(e.target.value)} /></div>
                <div className="col-span-2"><label className="label">Emergency Contact</label><input className="input" value={emergency} onChange={e => setEmergency(e.target.value)} /></div>
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
