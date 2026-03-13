import React, { useState } from 'react';
import { mockDocuments } from '../../data/mockData';
import { formatDate } from '../../utils/helpers';
import { Download, Upload } from 'lucide-react';
import Button from '../../components/shared/Button';
export default function MyDocuments() {
  const [docs, setDocs] = useState(mockDocuments.filter(d => d.employeeId === 'EMP001'));
  const [uploading, setUploading] = useState(false);

  function downloadDocument(doc: { name: string; size: string; uploadedOn: string }) {
    const content = `Document: ${doc.name}\nSize: ${doc.size}\nUploaded: ${formatDate(doc.uploadedOn)}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.name.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">My Documents</h1></div>
        <Button
  variant="primary"
  onClick={() => {
    const input = document.querySelector<HTMLInputElement>('input[type="file"]');
    input?.click(); // now TypeScript knows `.click()` exists
  }}
>
  <Upload size={16} /> Upload
  <input
    type="file"
    accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    className="hidden"
    onChange={async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      // Simulate upload
      await new Promise((r) => setTimeout(r, 800));
      setDocs((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          uploadedOn: new Date().toISOString(),
          employeeId: 'EMP001',
          type: 'other',
        },
      ]);
      setUploading(false);
      e.target.value = '';
    }}
  />
</Button>
      </div>
      {uploading && <div className="text-xs text-primary-600 mb-2">Uploading...</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docs.map(d => (
          <div key={d.id} className="card flex items-center gap-4 hover:shadow-card-hover transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
              <span className="text-primary-600 font-bold text-xs">PDF</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 text-sm">{d.name}</p>
              <p className="text-xs text-slate-400">{d.size} · {formatDate(d.uploadedOn)}</p>
            </div>
            <button className="btn-secondary py-2 px-3 text-xs" onClick={() => downloadDocument(d)}><Download size={13} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
