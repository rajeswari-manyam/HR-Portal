import { useState } from 'react';
import { Plus, Pencil, Trash2, Building2, Users } from 'lucide-react';
import { mockDepartments } from '../../data/mockData';
import { Department } from '../../types';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { generateId } from '../../utils/helpers';
import Button from '../../components/shared/Button';
import DepartmentCard from '../../components/shared/DepartmentCard';
const empty: Partial<Department> = { name: '', manager: '', description: '' };

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Department | null>(null);
  const [form, setForm] = useState<Partial<Department>>(empty);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => { setForm(empty); setModal('add'); };
  const openEdit = (d: Department) => { setSelected(d); setForm({ ...d }); setModal('edit'); };

  const handleSave = () => {
    if (modal === 'add') {
      setDepartments(prev => [...prev, { ...form, id: generateId(), employeeCount: 0, createdAt: new Date().toISOString().split('T')[0] } as Department]);
    } else if (modal === 'edit' && selected) {
      setDepartments(prev => prev.map(d => d.id === selected.id ? { ...d, ...form } as Department : d));
    }
    setModal(null);
  };

  const handleDelete = () => {
    if (deleteId) setDepartments(prev => prev.filter(d => d.id !== deleteId));
    setDeleteId(null);
  };

  const colors = ['bg-primary-100 text-primary-700', 'bg-purple-100 text-purple-700', 'bg-cyan-100 text-cyan-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Departments</h1><p className="page-subtitle">{departments.length} departments</p></div>
        <Button onClick={openAdd} className="btn-primary"><Plus size={16} /> Add Department</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {departments.map((dept, i) => (
           <DepartmentCard
          key={dept.id}
          dept={dept}
          color={colors[i % colors.length]}
          onEdit={openEdit}
          onDelete={setDeleteId}
        />
        ))}
      </div>

      <Modal isOpen={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Department' : 'Edit Department'}>
        <div className="space-y-4">
          <div><label className="label">Department Name *</label><input className="input" placeholder="e.g. Engineering" value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div><label className="label">Manager</label><input className="input" placeholder="Manager name" value={form.manager || ''} onChange={e => setForm(p => ({ ...p, manager: e.target.value }))} /></div>
          <div><label className="label">Description</label><textarea className="input resize-none" rows={3} placeholder="Department description" value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setModal(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handleSave} className="btn-primary flex-1 justify-center">{modal === 'add' ? 'Add' : 'Save'}</button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} title="Delete Department" message="Are you sure you want to delete this department?" confirmLabel="Delete" />
    </div>
  );
}
