import { useState, useEffect } from 'react';
import { Plus, Bell, Loader2, Pencil, Trash2 } from 'lucide-react';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../../service/announcement.service";
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/shared/Badge';
import Modal from '../../components/shared/Modal';
import { formatDate } from '../../utils/helpers';
import Button from '../../components/shared/Button';
import AnnouncementCard from '../../components/shared/AnnouncementCard';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  targetRole: 'all' | 'hr' | 'employee';
  createdBy: string;
  createdAt: string;
}

interface FormState {
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  targetRole: 'all' | 'hr' | 'employee';
}

const DEFAULT_FORM: FormState = {
  title: '',
  content: '',
  priority: 'medium',
  targetRole: 'all',
};

export default function Announcements() {
  const { user } = useAuth();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // modal modes
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Announcement | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // ✅ GET all announcements on mount
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true);
        const data = await getAnnouncements();
        setAnnouncements(data as Announcement[]);
      } catch (err) {
        console.error('Failed to fetch announcements:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);
  console.log("Announcements:", announcements);
  const openCreate = () => {
    setSelected(null);
    setForm(DEFAULT_FORM);
    setError('');
    setModal('create');
  };

  const openEdit = (a: Announcement) => {
    setSelected(a);
    setForm({
      title: a.title,
      content: a.content,
      priority: a.priority,
      targetRole: a.targetRole,
    });
    setError('');
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm(DEFAULT_FORM);
    setError('');
  };

  // ✅ POST — create announcement
  const handleCreate = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const created = await createAnnouncement({
        title: form.title,
        content: form.content,
        priority: form.priority,
        targetRole: form.targetRole,
        createdBy: user?.name || 'Admin',
        createdAt: new Date().toISOString().slice(0, 10),
      });
      setAnnouncements(prev => [created as Announcement, ...prev]);
      closeModal();
    } catch (err) {
      console.error('Failed to create:', err);
      setError('Failed to publish. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ✅ PUT — update announcement
  const handleUpdate = async () => {
    if (!selected) return;
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const updated = await updateAnnouncement(selected._id, {
        title: form.title,
        content: form.content,
        priority: form.priority,
        targetRole: form.targetRole,
      });
      setAnnouncements(prev =>
        prev.map(a => a._id === selected._id ? { ...a, ...updated } as Announcement : a)
      );
      closeModal();
    } catch (err) {
      console.error('Failed to update:', err);
      setError('Failed to update. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ✅ DELETE — delete announcement
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const priorityBg: Record<string, string> = {
    high: 'border-l-4 border-red-400',
    medium: 'border-l-4 border-amber-400',
    low: 'border-l-4 border-blue-400',
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Announcements</h1>
          <p className="page-subtitle">Company-wide communications</p>
        </div>
        <Button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> Create Announcement
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="card text-center py-16">
          <Bell size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No announcements yet</p>
          <p className="text-slate-400 text-sm mt-1">Create your first announcement above</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map(a => (
            <div key={a._id} className="relative group">
              <AnnouncementCard
                announcement={{ ...a, id: a._id }}
                priorityBg={priorityBg}
                formatDate={formatDate}
                BadgeComponent={Badge}
              />
              {/* ✅ Edit & Delete actions on hover */}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(a)}
                  className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 px-2 py-1 bg-primary-50 rounded-lg"
                >
                  <Pencil size={11} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(a._id)}
                  disabled={deletingId === a._id}
                  className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 px-2 py-1 bg-red-50 rounded-lg disabled:opacity-50"
                >
                  {deletingId === a._id
                    ? <Loader2 size={11} className="animate-spin" />
                    : <Trash2 size={11} />
                  }
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modal !== null}
        onClose={closeModal}
        title={modal === 'edit' ? 'Edit Announcement' : 'Create Announcement'}
      >
        <div className="space-y-4">

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="label">Title *</label>
            <input
              className="input"
              placeholder="Announcement title"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            />
          </div>

          <div>
            <label className="label">Content *</label>
            <textarea
              className="input resize-none"
              rows={4}
              placeholder="Write your announcement..."
              value={form.content}
              onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Priority</label>
              <select
                className="input"
                value={form.priority}
                onChange={e => setForm(p => ({ ...p, priority: e.target.value as FormState['priority'] }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="label">Target Audience</label>
              <select
                className="input"
                value={form.targetRole}
                onChange={e => setForm(p => ({ ...p, targetRole: e.target.value as FormState['targetRole'] }))}
              >
                <option value="all">All</option>
                <option value="hr">HR Only</option>
                <option value="employee">Employees</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={closeModal} className="btn-secondary flex-1 justify-center">
            Cancel
          </Button>
          <Button
            onClick={modal === 'edit' ? handleUpdate : handleCreate}
            disabled={saving}
            className="btn-primary flex-1 justify-center"
          >
            {saving
              ? <><Loader2 size={15} className="animate-spin" /> {modal === 'edit' ? 'Updating...' : 'Publishing...'}</>
              : <><Bell size={15} /> {modal === 'edit' ? 'Update' : 'Publish'}</>
            }
          </Button>
        </div>
      </Modal>
    </div>
  );
}