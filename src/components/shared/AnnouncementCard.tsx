import { Megaphone } from "lucide-react";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  priority: string;
  targetRole: string;
}

interface AnnouncementCardProps {
  announcement: Announcement;
  priorityBg: Record<string, string>;
  formatDate: (date: string) => string;
  BadgeComponent: React.ComponentType<{ status: string; label?: string }>;
}

export default function AnnouncementCard({
  announcement,
  priorityBg,
  formatDate,
  BadgeComponent,
}: AnnouncementCardProps) {
  const { title, content, createdBy, createdAt, priority, targetRole } =
    announcement;

  return (
    <div
      className={`card ${priorityBg[priority]} hover:shadow-card-hover transition-all duration-300`}
    >
      <div className="flex items-start justify-between mb-2">

        <div className="flex items-center gap-3">

          <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
            <Megaphone size={16} className="text-primary-600" />
          </div>

          <div>
            <h3 className="font-bold text-slate-900">{title}</h3>

            <p className="text-xs text-slate-400">
              By {createdBy} · {formatDate(createdAt)}
            </p>
          </div>

        </div>

        <div className="flex gap-2 items-center">

          <BadgeComponent status={priority} />

          <BadgeComponent
            status={targetRole}
            label={targetRole === "all" ? "All" : targetRole.toUpperCase()}
          />

        </div>

      </div>

      <p className="text-sm text-slate-600 leading-relaxed mt-3">
        {content}
      </p>
    </div>
  );
}