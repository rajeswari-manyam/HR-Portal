import { FileText, Download, Trash2 } from "lucide-react";

export interface DocumentItem {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedOn: string;
  employeeId?: string;   // ← added (optional so existing usages don't break)
  url?: string;          // ← added (used by downloadDocument service)
}

interface DocumentCardProps {
  doc: DocumentItem;
  iconClass: string;
  formatDate: (date: string) => string;
  onDownload: (doc: DocumentItem) => void;
  onDelete: (id: string) => void;
  BadgeComponent: React.ComponentType<{ status: string; label: string }>;
}

export default function DocumentCard({
  doc,
  iconClass,
  formatDate,
  onDownload,
  onDelete,
  BadgeComponent,
}: DocumentCardProps) {
  return (
    <div className="card flex items-center gap-4 hover:shadow-card-hover transition-all duration-300 group">

      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
        <FileText size={22} className={iconClass || "text-slate-400"} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 text-sm truncate">
          {doc.name}
        </p>

        <p className="text-xs text-slate-400">
          {doc.size} · {formatDate(doc.uploadedOn)}
        </p>

        <BadgeComponent
          status={doc.type.replace("-", " ")}
          label={doc.type
            .replace("-", " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())}
        />
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">

        <button
          onClick={() => onDownload(doc)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary-50 text-slate-400 hover:text-primary-600 transition-colors"
        >
          <Download size={14} />
        </button>

        <button
          onClick={() => onDelete(doc.id)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={14} />
        </button>

      </div>
    </div>
  );
}