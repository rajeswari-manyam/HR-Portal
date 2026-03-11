import { useState } from 'react';
import { Plus, Gift, Pencil, Trash2 } from 'lucide-react';
import { mockHolidays } from '../../data/mockData';
import { Holiday } from '../../types';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import Badge from '../../components/shared/Badge';
import { formatDate, generateId } from '../../utils/helpers';
import Button from '../../components/shared/Button';
export default function HolidayManagement() {
  const [holidays, setHolidays] = useState<Holiday[]>(mockHolidays);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [form, setForm] = useState<Partial<Holiday>>({ name: '', date: '', type: 'national' });
  const [selected, setSelected] = useState<Holiday | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const save = () => {
    if (modal === 'add') {
      setHolidays(prev => [...prev, { ...form, id: generateId() } as Holiday].sort((a, b) => a.date.localeCompare(b.date)));
    } else if (modal === 'edit' && selected) {
      setHolidays(prev => prev.map(h => h.id === selected.id ? { ...h, ...form } as Holiday : h));
    }
    setModal(null);
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const byMonth = months.reduce((acc, m, i) => {
    const mHolidays = holidays.filter(h => new Date(h.date).getMonth() === i);
    if (mHolidays.length > 0) acc[m] = mHolidays;
    return acc;
  }, {} as Record<string, Holiday[]>);

  const typeColors: Record<string, string> = {
    national: 'bg-primary-100 text-primary-700',
    regional: 'bg-purple-100 text-purple-700',
    company: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Holidays</h1><p className="page-subtitle">{holidays.length} holidays this year</p></div>
        <Button onClick={() => { setForm({ name: '', date: '', type: 'national' }); setModal('add'); }} className="btn-primary"><Plus size={16} /> Add Holiday</Button>
      </div>

      <div className="space-y-6">
        {Object.entries(byMonth).map(([month, mHolidays]) => (
          <div key={month} className="card">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><Gift size={16} className="text-rose-400" />{month}</h3>
            <div className="space-y-2">
              {mHolidays.map(h => (
                <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex flex-col items-center justify-center">
                      <span className="text-xs font-black text-rose-600 leading-tight">{new Date(h.date).getDate()}</span>
                      <span className="text-xs text-rose-400">{new Date(h.date).toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{h.name}</p>
                      {h.description && <p className="text-xs text-slate-400">{h.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${typeColors[h.type]} capitalize`}>{h.type}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button onClick={() => { setSelected(h); setForm({ ...h }); setModal('edit'); }} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => setDeleteId(h.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modal !== null} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Holiday' : 'Edit Holiday'}>
        <div className="space-y-4">
          <div><label className="label">Holiday Name *</label><input className="input" value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div><label className="label">Date *</label><input type="date" className="input" value={form.date || ''} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
          <div><label className="label">Type</label>
            <select className="input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as Holiday['type'] }))}>
              <option value="national">National</option>
              <option value="regional">Regional</option>
              <option value="company">Company</option>
            </select>
          </div>
          <div><label className="label">Description</label><input className="input" value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button onClick={() => setModal(null)} className="btn-secondary flex-1 justify-center">Cancel</Button>
          <Button onClick={save} className="btn-primary flex-1 justify-center">Save</Button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onConfirm={() => { setHolidays(prev => prev.filter(h => h.id !== deleteId)); setDeleteId(null); }} onCancel={() => setDeleteId(null)} title="Delete Holiday" message="Are you sure?" />
    </div>
  );
}
