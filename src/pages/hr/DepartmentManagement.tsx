import { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../../service/department.service';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import Button from '../../components/shared/Button';
import DepartmentCard from '../../components/shared/DepartmentCard';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Department {
  _id: string;
  name: string;
  manager: string;
  description: string;
  employeeCount: number;
  createdAt: string;
}

interface FormState {
  name: string;
  manager: string;
  description: string;
}

const DEFAULT_FORM: FormState = { name: '', manager: '', description: '' };

const COLORS = [
  'bg-primary-100 text-primary-700',
  'bg-purple-100 text-purple-700',
  'bg-cyan-100 text-cyan-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
];

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Department | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  // ✅ GET all departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsLoading(true);
        const data = await getDepartments();
        console.log('✅ GET all departments:', data);
        setDepartments(data as Department[]);
      } catch (err) {
        console.error('❌ Failed to fetch departments:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  const openAdd = () => {
    setForm(DEFAULT_FORM);
    setError('');
    setModal('add');
  };

  const openEdit = (d: Department) => {
    setSelected(d);
    setForm({ name: d.name, manager: d.manager, description: d.description });
    setError('');
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm(DEFAULT_FORM);
    setError('');
  };

  // ✅ POST create department
  const handleAdd = async () => {
    if (!form.name.trim()) {
      setError('Department name is required.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const created = await createDepartment({
        name: form.name,
        manager: form.manager,
        description: form.description,
        employeeCount: 0,
      });
      console.log('✅ POST create department:', created);
      setDepartments(prev => [...prev, created as Department]);
      closeModal();
    } catch (err) {
      console.error('❌ Failed to create department:', err);
      setError('Failed to create department. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ✅ PUT update department
  const handleUpdate = async () => {
    if (!selected) return;
    if (!form.name.trim()) {
      setError('Department name is required.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const updated = await updateDepartment(selected._id, {
        name: form.name,
        manager: form.manager,
        description: form.description,
      });
      console.log('✅ PUT update department:', updated);
      setDepartments(prev =>
        prev.map(d => d._id === selected._id ? { ...d, ...updated } as Department : d)
      );
      closeModal();
    } catch (err) {
      console.error('❌ Failed to update department:', err);
      setError('Failed to update department. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ✅ DELETE department
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const result = await deleteDepartment(deleteId);
      console.log('✅ DELETE department:', result);
      setDepartments(prev => prev.filter(d => d._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error('❌ Failed to delete department:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="page-subtitle">{departments.length} departments</p>
        </div>
        <Button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add Department
        </Button>
      </div>

      {/* Department Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : departments.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-slate-500 font-medium">No departments found</p>
          <p className="text-slate-400 text-sm mt-1">Add your first department above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {departments.map((dept, i) => (
            <DepartmentCard
              key={dept._id}
              dept={{ ...dept, id: dept._id }}
              color={COLORS[i % COLORS.length]}
              onEdit={() => openEdit(dept)}
              onDelete={() => setDeleteId(dept._id)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modal !== null}
        onClose={closeModal}
        title={modal === 'add' ? 'Add Department' : 'Edit Department'}
      >
        <div className="space-y-4">

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="label">Department Name *</label>
            <input
              className="input"
              placeholder="e.g. Engineering"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Manager</label>
            <input
              className="input"
              placeholder="Manager name"
              value={form.manager}
              onChange={e => setForm(p => ({ ...p, manager: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Department description"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={closeModal} className="btn-secondary flex-1 justify-center">
            Cancel
          </Button>
          <Button
            onClick={modal === 'add' ? handleAdd : handleUpdate}
            disabled={saving}
            className="btn-primary flex-1 justify-center"
          >
            {saving
              ? <><Loader2 size={15} className="animate-spin" /> {modal === 'add' ? 'Adding...' : 'Saving...'}</>
              : modal === 'add' ? 'Add Department' : 'Save Changes'
            }
          </Button>
        </div>
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Delete Department"
        message="Are you sure you want to delete this department? This action cannot be undone."
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
      />
    </div>
  );
}