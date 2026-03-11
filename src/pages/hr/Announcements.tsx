import { useState } from 'react';
import { Plus, Megaphone, Bell } from 'lucide-react';
import { mockAnnouncements } from '../../data/mockData';
import { Announcement } from '../../types';
import Badge from '../../components/shared/Badge';
import Modal from '../../components/shared/Modal';
import { formatDate, generateId } from '../../utils/helpers';
import Button from '../../components/shared/Button';
import AnnouncementCard from '../../components/shared/AnnouncementCard';
export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Partial<Announcement>>({ title: '', content: '', priority: 'medium', targetRole: 'all' });

  const addAnnouncement = () => {
    setAnnouncements(prev => [{
      ...form, id: generateId(),
      createdBy: 'Rahul Verma',
      createdAt: new Date().toISOString(),
    } as Announcement, ...prev]);
    setModal(false);
    setForm({ title: '', content: '', priority: 'medium', targetRole: 'all' });
  };

  const priorityBg: Record<string, string> = {
    high: 'border-l-4 border-red-400', medium: 'border-l-4 border-amber-400', low: 'border-l-4 border-blue-400'
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Announcements</h1><p className="page-subtitle">Company-wide communications</p></div>
        <Button onClick={() => setModal(true)} className="btn-primary"><Plus size={16} /> Create Announcement</Button>
      </div>

      <div className="space-y-4">
        {announcements.map(a => (
          <AnnouncementCard
          key={a.id}
          announcement={a}
          priorityBg={priorityBg}
          formatDate={formatDate}
          BadgeComponent={Badge}
        />
        ))}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Create Announcement">
        <div className="space-y-4">
          <div><label className="label">Title *</label><input className="input" value={form.title || ''} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
          <div><label className="label">Content *</label><textarea className="input resize-none" rows={4} value={form.content || ''} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as Announcement['priority'] }))}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </div>
            <div><label className="label">Target Audience</label>
              <select className="input" value={form.targetRole} onChange={e => setForm(p => ({ ...p, targetRole: e.target.value as Announcement['targetRole'] }))}>
                <option value="all">All</option><option value="hr">HR Only</option><option value="employee">Employees</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button onClick={() => setModal(false)} className="btn-secondary flex-1 justify-center">Cancel</Button>
          <Button onClick={addAnnouncement} className="btn-primary flex-1 justify-center"><Bell size={15} /> Publish</Button>
        </div>
      </Modal>
    </div>
  );
}
