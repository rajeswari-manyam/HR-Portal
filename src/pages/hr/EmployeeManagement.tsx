import { useState } from 'react';
import { Plus, Pencil, Trash2, Eye, Upload, UserCheck, UserX, Phone, Mail, Building2, Calendar } from 'lucide-react';
import { mockEmployees } from '../../data/mockData';
import { Employee } from '../../types';
import Avatar from '../../components/shared/Avatar';
import Badge from '../../components/shared/Badge';
import SearchInput from '../../components/shared/SearchInput';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { formatDate, formatCurrency, generateId } from '../../utils/helpers';
import Button from '../../components/shared/Button';
import Select from '../../components/shared/Select';
import InputField from '../../components/shared/InputField';
import Table from "../../components/shared/Table";
const emptyEmployee: Partial<Employee> = {
  fullName: '', email: '', phone: '', department: '', designation: '',
  joiningDate: '', salary: 0, address: '', emergencyContact: '', status: 'active',
  gender: '', dateOfBirth: '', bloodGroup: '',
};

const departments = ['Engineering', 'HR', 'Marketing', 'Finance', 'Design', 'Management'];
const designations = ['Developer', 'Senior Developer', 'Team Lead', 'Manager', 'Analyst', 'Designer', 'HR Executive', 'Finance Analyst'];

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deptFilter, setDeptFilter] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | 'view' | null>(null);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [form, setForm] = useState<Partial<Employee>>(emptyEmployee);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('personal');

  const filtered = employees.filter(e => {
    const matchSearch = e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === 'all' || e.status === filter;
    const matchDept = !deptFilter || e.department === deptFilter;
    return matchSearch && matchStatus && matchDept;
  });

  const openAdd = () => { setForm({ ...emptyEmployee, employeeId: `EMP${String(employees.length + 1).padStart(3, '0')}` }); setModal('add'); };
  const openEdit = (e: Employee) => { setSelected(e); setForm({ ...e }); setModal('edit'); };
  const openView = (e: Employee) => { setSelected(e); setActiveTab('personal'); setModal('view'); };

  const handleSave = () => {
    if (modal === 'add') {
      setEmployees(prev => [...prev, { ...form, id: generateId() } as Employee]);
    } else if (modal === 'edit' && selected) {
      setEmployees(prev => prev.map(e => e.id === selected.id ? { ...e, ...form } as Employee : e));
    }
    setModal(null);
  };

  const handleDelete = () => {
    if (deleteId) setEmployees(prev => prev.filter(e => e.id !== deleteId));
    setDeleteId(null);
  };

  const toggleStatus = (id: string) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: e.status === 'active' ? 'inactive' : 'active' } : e));
  };

  const update = (key: keyof Employee, val: string | number) => setForm(prev => ({ ...prev, [key]: val }));
const columns = [
  {
    header: "Employee",
    render: (emp: Employee) => (
      <div className="flex items-center gap-3">
        <Avatar name={emp.fullName} size="sm" />
        <div>
          <p className="font-semibold text-slate-900 text-sm">{emp.fullName}</p>
          <p className="text-xs text-slate-400">{emp.email}</p>
        </div>
      </div>
    )
  },
  {
    header: "ID",
    render: (emp: Employee) => (
      <span className="font-mono text-xs text-slate-500">
        {emp.employeeId}
      </span>
    )
  },
  {
    header: "Department",
    render: (emp: Employee) => emp.department
  },
  {
    header: "Designation",
    render: (emp: Employee) => emp.designation
  },
  {
    header: "Joining Date",
    render: (emp: Employee) => formatDate(emp.joiningDate)
  },
  {
    header: "Salary",
    render: (emp: Employee) => formatCurrency(emp.salary)
  },
  {
    header: "Status",
    render: (emp: Employee) => <Badge status={emp.status} />
  },
  {
    header: "Actions",
    render: (emp: Employee) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openView(emp)}>
          <Eye size={15} />
        </button>

        <button onClick={() => openEdit(emp)}>
          <Pencil size={15} />
        </button>

        <button onClick={() => toggleStatus(emp.id)}>
          {emp.status === "active"
            ? <UserX size={15} />
            : <UserCheck size={15} />}
        </button>

        <button onClick={() => setDeleteId(emp.id)}>
          <Trash2 size={15} />
        </button>
      </div>
    )
  }
];
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">{filtered.length} of {employees.length} employees</p>
        </div>
        <Button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add Employee
        </Button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <SearchInput value={search} onChange={setSearch} placeholder="Search employees..." />
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {(['all', 'active', 'inactive'] as const).map(s => (
              <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${filter === s ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>{s}</button>
            ))}
          </div>
          {/* <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="input max-w-[160px] py-2">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d}>{d}</option>)}
          </select> */}
          <Select
  value={deptFilter}
  onChange={setDeptFilter}
 options={departments.map(d => ({
  label: d,
  value: d
}))}
  placeholder="All Departments"
  className="max-w-[160px]"
/>
        </div>
      </div>

    
      <Table
  columns={columns}
  data={filtered}
  rowsPerPage={5}
  emptyMessage="No employees found"
/>
      {/* Add/Edit Modal */}
      <Modal isOpen={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Employee' : 'Edit Employee'} size="lg">
        <div className="grid grid-cols-2 gap-4">
        <InputField
  label="Employee ID"
  value={form.employeeId || ""}
  onChange={(e) => update("employeeId", e.target.value)}
/>
        <InputField
  label="Full Name *"
  value={form.fullName || ""}
  onChange={(e) => update("fullName", e.target.value)}
/>
 <InputField
  label="Email"
  icon={<Mail size={16} />}
  value={form.email || ""}
  onChange={(e) => update("email", e.target.value)}
/>
  <InputField
  label="Phone"
  icon={<Phone size={16} />}
  value={form.phone || ""}
  onChange={(e) => update("phone", e.target.value)}
/>
   <Select
  label="Department"
  value={form.department || ""}
  onChange={(val: string) => update("department", val)}
  options={departments.map(d => ({
    label: d,
    value: d
  }))}
/>
         <Select
  label="Designation"
  value={form.designation || ""}
  onChange={(val) => update("designation", val)}
  options={designations.map(d => ({
    label: d,
    value: d
  }))}
/>
         <InputField
  label="Joining Date"
  type="date"
  value={form.joiningDate || ""}
  onChange={(e) => update("joiningDate", e.target.value)}
/>
        <InputField
  label="Salary (₹)"
  type="number"
  value={form.salary || ""}
  onChange={(e) => update("salary", Number(e.target.value))}
/>
        <Select
  label="Gender"
  value={form.gender || ""}
  onChange={(val) => update("gender", val)}
  options={["Male", "Female", "Other"].map(g => ({
    label: g,
    value: g
  }))}
/>
         <InputField
  label="Date of Birth"
  type="date"
  value={form.dateOfBirth || ""}
  onChange={(e) => update("dateOfBirth", e.target.value)}
/>
       <div className="col-span-2">
  <label className="block text-sm font-medium text-slate-700 mb-1">
    Address
  </label>

  <textarea
    rows={2}
    className="input resize-none"
    value={form.address || ""}
    onChange={(e) => update("address", e.target.value)}
  />
</div>
          <InputField
  label="Emergency Contact"
  value={form.emergencyContact || ""}
  onChange={(e) => update("emergencyContact", e.target.value)}
/>
        </div>
        <div className="flex gap-3 mt-6">
          <Button onClick={() => setModal(null)} className="btn-secondary flex-1 justify-center">Cancel</Button>
          <Button onClick={handleSave} className="btn-primary flex-1 justify-center">{modal === 'add' ? 'Add Employee' : 'Save Changes'}</Button>
        </div>
      </Modal>

      {/* View Modal */}
      {selected && (
        <Modal isOpen={modal === 'view'} onClose={() => setModal(null)} title="Employee Profile" size="lg">
          <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
            <Avatar name={selected.fullName} size="xl" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">{selected.fullName}</h3>
              <p className="text-sm text-slate-500">{selected.designation} · {selected.department}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-xs text-slate-400"><Mail size={12} />{selected.email}</span>
                <span className="flex items-center gap-1 text-xs text-slate-400"><Phone size={12} />{selected.phone}</span>
              </div>
            </div>
            <Badge status={selected.status} />
          </div>
          <div className="flex gap-2 mb-4 flex-wrap">
            {['personal', 'job', 'attendance', 'leave', 'payroll', 'documents'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`tab-btn capitalize ${activeTab === tab ? 'active' : ''}`}>{tab}</button>
            ))}
          </div>
          {activeTab === 'personal' && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Employee ID', selected.employeeId], ['Full Name', selected.fullName],
                ['Email', selected.email], ['Phone', selected.phone],
                ['Gender', selected.gender || '-'], ['Date of Birth', formatDate(selected.dateOfBirth || '')],
                ['Blood Group', selected.bloodGroup || '-'], ['Address', selected.address],
                ['Emergency Contact', selected.emergencyContact],
              ].map(([k, v]) => (
                <div key={k} className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">{k}</p>
                  <p className="font-semibold text-slate-900">{v}</p>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'job' && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Department', selected.department], ['Designation', selected.designation],
                ['Joining Date', formatDate(selected.joiningDate)], ['Salary', formatCurrency(selected.salary)],
                ['Status', selected.status], ['Manager', selected.manager || '-'],
              ].map(([k, v]) => (
                <div key={k} className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">{k}</p>
                  <p className="font-semibold text-slate-900">{v}</p>
                </div>
              ))}
            </div>
          )}
          {['attendance', 'leave', 'payroll', 'documents'].includes(activeTab) && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">Navigate to the {activeTab} module to view detailed records.</p>
            </div>
          )}
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone."
        confirmLabel="Delete Employee"
      />
    </div>
  );
}
