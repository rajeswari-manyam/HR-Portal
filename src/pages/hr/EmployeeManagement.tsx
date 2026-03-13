import { useState, useEffect } from 'react';
import {
  Plus, Pencil, Trash2, Eye, UserCheck, UserX,
  Phone, Mail, Loader2
} from 'lucide-react';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../../service/Employee.service";
import Avatar from '../../components/shared/Avatar';
import Badge from '../../components/shared/Badge';
import SearchInput from '../../components/shared/SearchInput';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { formatDate, formatCurrency } from '../../utils/helpers';
import Button from '../../components/shared/Button';
import Select from '../../components/shared/Select';
import InputField from '../../components/shared/InputField';
import Table from '../../components/shared/Table';
import { DEPARTMENT_NAMES, getRolesByDepartment } from "../../data/department";
import { getAttendance, calcWorkHours } from '../../service/attendance.service';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Employee {
  _id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joiningDate: string;
  salary: number;
  address: string;
  emergencyContact: string;
  status: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup?: string;
  manager?: string;
}

interface FormState {
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joiningDate: string;
  salary: number;
  address: string;
  emergencyContact: string;
  status: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup: string;
}

const DEFAULT_FORM: FormState = {
  employeeId: '', fullName: '', email: '', phone: '',
  department: '', designation: '', joiningDate: '',
  salary: 0, address: '', emergencyContact: '',
  status: 'active', gender: '', dateOfBirth: '', bloodGroup: '',
};

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deptFilter, setDeptFilter] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | 'view' | null>(null);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [error, setError] = useState('');

  // ── Attendance state ───────────────────────────────────────────────────────
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Derived: roles for currently selected department
  const availableRoles = getRolesByDepartment(form.department);

  // ✅ GET all employees on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const data = await getEmployees();
        setEmployees(data as Employee[]);
      } catch (err) {
        console.error('❌ Failed to fetch employees:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const filtered = employees.filter(e => {
    const matchSearch =
      e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === 'all' || e.status === filter;
    const matchDept = !deptFilter || e.department === deptFilter;
    return matchSearch && matchStatus && matchDept;
  });

  const openAdd = () => {
    setForm({
      ...DEFAULT_FORM,
      employeeId: `EMP${String(employees.length + 1).padStart(3, '0')}`,
    });
    setError('');
    setModal('add');
  };

  const openEdit = (e: Employee) => {
    setSelected(e);
    setForm({
      employeeId: e.employeeId,
      fullName: e.fullName,
      email: e.email,
      phone: e.phone,
      department: e.department,
      designation: e.designation,
      joiningDate: e.joiningDate,
      salary: e.salary,
      address: e.address,
      emergencyContact: e.emergencyContact,
      status: e.status,
      gender: e.gender,
      dateOfBirth: e.dateOfBirth,
      bloodGroup: e.bloodGroup || '',
    });
    setError('');
    setModal('edit');
  };

  const openView = (e: Employee) => {
    setSelected(e);
    setActiveTab('personal');
    setAttendanceRecords([]);
    setModal('view');
  };

  const fetchAttendanceForEmployee = async (employeeId: string) => {
    setAttendanceLoading(true);
    try {
      const data = await getAttendance(employeeId);
      setAttendanceRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Failed to fetch attendance:', err);
      setAttendanceRecords([]);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm(DEFAULT_FORM);
    setError('');
  };

  const update = (key: keyof FormState, val: string | number) => {
    setForm(prev => {
      const next = { ...prev, [key]: val };
      // Reset designation when department changes so stale role isn't kept
      if (key === 'department') next.designation = '';
      return next;
    });
  };

  // ✅ POST create employee
  const handleAdd = async () => {
    if (!form.fullName.trim() || !form.employeeId.trim()) {
      setError('Employee ID and Full Name are required.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const created = await createEmployee(form);
      setEmployees(prev => [...prev, created as Employee]);
      closeModal();
    } catch (err) {
      console.error('❌ Failed to create employee:', err);
      setError('Failed to add employee. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ✅ PUT update employee
  const handleUpdate = async () => {
    if (!selected) return;
    if (!form.fullName.trim()) {
      setError('Full Name is required.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const updated = await updateEmployee(selected._id, form);
      setEmployees(prev =>
        prev.map(e => e._id === selected._id ? { ...e, ...updated } as Employee : e)
      );
      closeModal();
    } catch (err) {
      console.error('❌ Failed to update employee:', err);
      setError('Failed to update employee. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ✅ DELETE employee
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteEmployee(deleteId);
      setEmployees(prev => prev.filter(e => e._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error('❌ Failed to delete employee:', err);
    } finally {
      setDeleting(false);
    }
  };

  // ✅ Toggle status via PUT
  const toggleStatus = async (emp: Employee) => {
    const newStatus = emp.status === 'active' ? 'inactive' : 'active';
    try {
      await updateEmployee(emp._id, { status: newStatus });
      setEmployees(prev =>
        prev.map(e => e._id === emp._id ? { ...e, status: newStatus } : e)
      );
    } catch (err) {
      console.error('❌ Failed to toggle status:', err);
    }
  };

  const columns = [
    {
      header: 'Employee',
      render: (emp: Employee) => (
        <div className="flex items-center gap-3">
          <Avatar name={emp.fullName} size="sm" />
          <div>
            <p className="font-semibold text-slate-900 text-sm">{emp.fullName}</p>
            <p className="text-xs text-slate-400">{emp.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'ID',
      render: (emp: Employee) => (
        <span className="font-mono text-xs text-slate-500">{emp.employeeId}</span>
      ),
    },
    { header: 'Department', render: (emp: Employee) => emp.department },
    { header: 'Designation', render: (emp: Employee) => emp.designation },
    { header: 'Joining Date', render: (emp: Employee) => formatDate(emp.joiningDate) },
    { header: 'Salary', render: (emp: Employee) => formatCurrency(emp.salary) },
    { header: 'Status', render: (emp: Employee) => <Badge status={emp.status} /> },
    {
      header: 'Actions',
      render: (emp: Employee) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openView(emp)} className="p-1 hover:text-primary-600 text-slate-400 transition-colors">
            <Eye size={15} />
          </button>
          <button onClick={() => openEdit(emp)} className="p-1 hover:text-amber-600 text-slate-400 transition-colors">
            <Pencil size={15} />
          </button>
          <button onClick={() => toggleStatus(emp)} className="p-1 hover:text-emerald-600 text-slate-400 transition-colors">
            {emp.status === 'active' ? <UserX size={15} /> : <UserCheck size={15} />}
          </button>
          <button onClick={() => setDeleteId(emp._id)} className="p-1 hover:text-red-600 text-slate-400 transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
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
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${filter === s ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {s}
              </button>
            ))}
          </div>
          <Select
            value={deptFilter}
            onChange={setDeptFilter}
            options={DEPARTMENT_NAMES.map(d => ({ label: d, value: d }))}
            placeholder="All Departments"
            className="max-w-[160px]"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <Table
          columns={columns}
          data={filtered}
          rowsPerPage={5}
          emptyMessage="No employees found"
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modal === 'add' || modal === 'edit'}
        onClose={closeModal}
        title={modal === 'add' ? 'Add Employee' : 'Edit Employee'}
        size="lg"
      >
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            ⚠️ {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Employee ID" value={form.employeeId} onChange={e => update('employeeId', e.target.value)} />
          <InputField label="Full Name *" value={form.fullName} onChange={e => update('fullName', e.target.value)} />
          <InputField label="Email" icon={<Mail size={16} />} value={form.email} onChange={e => update('email', e.target.value)} />
          <InputField label="Phone" icon={<Phone size={16} />} value={form.phone} onChange={e => update('phone', e.target.value)} />

          {/* Department — drives the Designation options below */}
          <Select
            label="Department"
            value={form.department}
            onChange={val => update('department', val)}
            options={DEPARTMENT_NAMES.map(d => ({ label: d, value: d }))}
            placeholder="Select Department"
          />

          {/* Designation — options come from selected department */}
          <Select
            label="Designation"
            value={form.designation}
            onChange={val => update('designation', val)}
            options={availableRoles.map(r => ({ label: r, value: r }))}
            placeholder={form.department ? 'Select Designation' : 'Select Department first'}
          />

          <InputField label="Joining Date" type="date" value={form.joiningDate} onChange={e => update('joiningDate', e.target.value)} />
          <InputField label="Salary (₹)" type="number" value={form.salary || ''} onChange={e => update('salary', Number(e.target.value))} />
          <Select label="Gender" value={form.gender} onChange={val => update('gender', val)} options={['Male', 'Female', 'Other'].map(g => ({ label: g, value: g }))} />
          <InputField label="Date of Birth" type="date" value={form.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} />
          <InputField label="Blood Group" value={form.bloodGroup} onChange={e => update('bloodGroup', e.target.value)} />
          <InputField label="Emergency Contact" value={form.emergencyContact} onChange={e => update('emergencyContact', e.target.value)} />
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <textarea rows={2} className="input resize-none" value={form.address} onChange={e => update('address', e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button onClick={closeModal} className="btn-secondary flex-1 justify-center">Cancel</Button>
          <Button
            onClick={modal === 'add' ? handleAdd : handleUpdate}
            disabled={saving}
            className="btn-primary flex-1 justify-center"
          >
            {saving
              ? <><Loader2 size={15} className="animate-spin" /> {modal === 'add' ? 'Adding...' : 'Saving...'}</>
              : modal === 'add' ? 'Add Employee' : 'Save Changes'
            }
          </Button>
        </div>
      </Modal>

      {/* View Modal */}
      {selected && (
        <Modal isOpen={modal === 'view'} onClose={closeModal} title="Employee Profile" size="lg">
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
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'attendance' && selected) {
                    fetchAttendanceForEmployee(selected.employeeId);
                  }
                }}
                className={`tab-btn capitalize ${activeTab === tab ? 'active' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'personal' && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Employee ID', selected.employeeId],
                ['Full Name', selected.fullName],
                ['Email', selected.email],
                ['Phone', selected.phone],
                ['Gender', selected.gender || '-'],
                ['Date of Birth', formatDate(selected.dateOfBirth || '')],
                ['Blood Group', selected.bloodGroup || '-'],
                ['Address', selected.address],
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
                ['Department', selected.department],
                ['Designation', selected.designation],
                ['Joining Date', formatDate(selected.joiningDate)],
                ['Salary', formatCurrency(selected.salary)],
                ['Status', selected.status],
                ['Manager', selected.manager || '-'],
              ].map(([k, v]) => (
                <div key={k} className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">{k}</p>
                  <p className="font-semibold text-slate-900">{v}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'attendance' && (
            <div>
              {attendanceLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : attendanceRecords.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm">No attendance records found for this employee.</p>
                </div>
              ) : (
                <div className="overflow-auto max-h-72 rounded-xl border border-slate-100">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        {['Date', 'Status', 'Check In', 'Check Out', 'Hours'].map(h => (
                          <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-slate-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.map((rec: any, i: number) => {
                        const hours = calcWorkHours(rec.checkIn, rec.checkOut);
                        const statusColor: Record<string, string> = {
                          present: 'bg-emerald-100 text-emerald-700',
                          absent: 'bg-red-100 text-red-700',
                          late: 'bg-amber-100 text-amber-700',
                          'half-day': 'bg-blue-100 text-blue-700',
                        };
                        return (
                          <tr key={rec._id ?? i} className="border-t border-slate-100 hover:bg-slate-50">
                            <td className="px-3 py-2 text-slate-700">{formatDate(rec.date)}</td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColor[rec.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                {rec.status}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-slate-600">{rec.checkIn ?? '—'}</td>
                            <td className="px-3 py-2 text-slate-600">{rec.checkOut ?? '—'}</td>
                            <td className="px-3 py-2 text-slate-600">{hours != null ? `${hours}h` : '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {['leave', 'payroll', 'documents'].includes(activeTab) && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">Navigate to the {activeTab} module to view detailed records.</p>
            </div>
          )}
        </Modal>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone."
        confirmLabel={deleting ? 'Deleting...' : 'Delete Employee'}
      />
    </div>
  );
}