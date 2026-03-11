import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockNotifications } from '../../data/mockData';
import { useState } from 'react';
import Avatar from './Avatar';
import { formatDateTime } from '../../utils/helpers';
import IconButton from './IconButton';

export default function TopBar({ title }: { title?: string }) {
  const { user } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const unread = mockNotifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-100 px-6 py-3.5 flex items-center justify-between">
      <div>
        {title && <h1 className="text-lg font-bold text-slate-900">{title}</h1>}
      </div>
      <div className="flex items-center gap-2">
        <IconButton size="md" variant="secondary">
          <Search size={17} />
        </IconButton>
       
        <div className="relative">
          <IconButton
            size="md"
            variant="secondary"
            className="relative"
            onClick={() => setShowNotif(!showNotif)}
          >
            <Bell size={17} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </IconButton>
          {showNotif && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-slide-up">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                <span className="badge bg-primary-100 text-primary-700">{unread} new</span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {mockNotifications.map(n => (
                  <div key={n.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-primary-50/30' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === 'success' ? 'bg-emerald-500' : n.type === 'warning' ? 'bg-amber-500' : 'bg-primary-500'}`} />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{formatDateTime(n.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
          <Avatar name={user?.name || ''} size="sm" />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 leading-tight">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.employeeId}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
