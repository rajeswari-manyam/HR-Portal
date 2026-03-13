import { useState, useEffect } from 'react';
import { Plus, Gift, Pencil, Trash2, RefreshCw } from 'lucide-react';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import Button from '../../components/shared/Button';
import InputField from '../../components/shared/InputField';
import Select from '../../components/shared/Select';
import {
  createHoliday,
  getAllHolidays,
  updateHoliday,
  deleteHoliday,
  HolidayResponse,
} from '../../service/holidays.service';

// ─── Local Type ───────────────────────────────────────────────────────────────

interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'national' | 'regional' | 'company';
  description?: string;
}

// ─── Helper: map API response → local shape ───────────────────────────────────

const mapHoliday = (h: HolidayResponse): Holiday => ({
  id: h._id,
  name: h.name,
  date: h.date,
  type: h.type,
  description: h.description,
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function HolidayManagement() {
  // State
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [form, setForm] = useState<Partial<Holiday>>({ name: '', date: '', type: 'national', description: '' });
  const [selected, setSelected] = useState<Holiday | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ── Fetch all holidays from API ─────────────────────────────────────────────
  const fetchHolidays = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllHolidays();
      const mapped = data.map(mapHoliday).sort((a, b) => a.date.localeCompare(b.date));
      setHolidays(mapped);
    } catch (err: any) {
      setError(err.message || 'Failed to load holidays');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  // ── Open Add modal ──────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm({ name: '', date: '', type: 'national', description: '' });
    setFormError(null);
    setModal('add');
  };

  // ── Open Edit modal ─────────────────────────────────────────────────────────
  const openEdit = (h: Holiday) => {
    setSelected(h);
    setForm({ ...h });
    setFormError(null);
    setModal('edit');
  };

  // ── Save (create or update) ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name?.trim() || !form.date) {
      setFormError('Name and Date are required.');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      if (modal === 'add') {
        const created = await createHoliday({
          name: form.name.trim(),
          date: form.date,
          type: form.type || 'national',
          description: form.description?.trim(),
        });
        setHolidays(prev =>
          [...prev, mapHoliday(created)].sort((a, b) => a.date.localeCompare(b.date))
        );
      } else if (modal === 'edit' && selected) {
        const updated = await updateHoliday(selected.id, {
          name: form.name.trim(),
          date: form.date,
          type: form.type || 'national',
          description: form.description?.trim(),
        });
        setHolidays(prev =>
          prev.map(h => (h.id === selected.id ? mapHoliday(updated) : h))
        );
      }
      setModal(null);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save holiday');
    } finally {
      setSaving(false);
    }
  };

  // ── Confirm delete ──────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteHoliday(deleteId);
      setHolidays(prev => prev.filter(h => h.id !== deleteId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete holiday');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  // ── Group holidays by month ─────────────────────────────────────────────────
  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const byMonth = MONTHS.reduce((acc, m, i) => {
    const list = holidays.filter(h => new Date(h.date + 'T00:00:00').getMonth() === i);
    if (list.length > 0) acc[m] = list;
    return acc;
  }, {} as Record<string, Holiday[]>);

  // ── Badge colors ────────────────────────────────────────────────────────────
  const typeColors: Record<string, string> = {
    national: 'bg-primary-100 text-primary-700',
    regional: 'bg-purple-100 text-purple-700',
    company: 'bg-emerald-100 text-emerald-700',
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Holidays</h1>
          <p className="page-subtitle">
            {loading ? 'Loading…' : `${holidays.length} holidays this year`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchHolidays}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <Button onClick={openAdd} className="btn-primary">
            <Plus size={16} /> Add Holiday
          </Button>
        </div>
      </div>

      {/* ── Global Error Banner ── */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-4 text-lg leading-none">&times;</button>
        </div>
      )}

      {/* ── Loading Skeleton ── */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 w-24 bg-slate-200 rounded mb-4" />
              <div className="space-y-2">
                {[1, 2].map(j => (
                  <div key={j} className="h-14 bg-slate-100 rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && holidays.length === 0 && (
        <div className="card flex flex-col items-center py-16 gap-3 text-center">
          <Gift size={36} className="text-slate-300" />
          <p className="text-slate-500 font-medium">No holidays added yet</p>
          <p className="text-slate-400 text-sm">Click "Add Holiday" to get started</p>
        </div>
      )}

      {/* ── Holiday List grouped by Month ── */}
      {!loading && holidays.length > 0 && (
        <div className="space-y-6">
          {Object.entries(byMonth).map(([month, mHolidays]) => (
            <div key={month} className="card">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Gift size={16} className="text-rose-400" />
                {month}
              </h3>
              <div className="space-y-2">
                {mHolidays.map(h => {
                  const d = new Date(h.date + 'T00:00:00');
                  return (
                    <div
                      key={h.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
                    >
                      {/* Date box + name */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 flex flex-col items-center justify-center shrink-0">
                          <span className="text-xs font-black text-rose-600 leading-tight">
                            {d.getDate()}
                          </span>
                          <span className="text-xs text-rose-400">
                            {d.toLocaleDateString('en-IN', { weekday: 'short' })}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{h.name}</p>
                          {h.description && (
                            <p className="text-xs text-slate-400">{h.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Badge + actions */}
                      <div className="flex items-center gap-2">
                        <span className={`badge ${typeColors[h.type]} capitalize`}>
                          {h.type}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button
                            onClick={() => openEdit(h)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600"
                            title="Edit"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => setDeleteId(h.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      <Modal
        isOpen={modal !== null}
        onClose={() => setModal(null)}
        title={modal === 'add' ? 'Add Holiday' : 'Edit Holiday'}
      >
        <div className="space-y-4">
          <InputField
            label="Holiday Name *"
            value={form.name || ''}
            onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Diwali"
          />
          <InputField
            label="Date *"
            type="date"
            value={form.date || ''}
            onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))}
          />
          <Select
            label="Type"
            value={form.type || 'national'}
            onChange={(value) =>
              setForm(p => ({ ...p, type: value as Holiday['type'] }))
            }
            options={[
              { label: 'National', value: 'national' },
              { label: 'Regional', value: 'regional' },
              { label: 'Company', value: 'company' },
            ]}
          />
          <InputField
            label="Description"
            value={form.description || ''}
            onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="Optional note"
          />

          {/* Form-level error */}
          {formError && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{formError}</p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={() => setModal(null)}
            className="btn-secondary flex-1 justify-center"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex-1 justify-center"
          >
            {saving ? 'Saving…' : modal === 'add' ? 'Add Holiday' : 'Save Changes'}
          </Button>
        </div>
      </Modal>

      {/* ── Delete Confirm Dialog ── */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Delete Holiday"
        message="Are you sure you want to delete this holiday? This action cannot be undone."
      />
    </div>
  );
}