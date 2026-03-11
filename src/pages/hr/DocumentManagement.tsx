import { useState } from 'react';
import { Upload, Download, Trash2, FileText } from 'lucide-react';
import { mockDocuments } from '../../data/mockData';
import { Document } from '../../types';
import Badge from '../../components/shared/Badge';
import { formatDate } from '../../utils/helpers';
import Modal from '../../components/shared/Modal';
import Button from '../../components/shared/Button';
import DocumentCard from '../../components/shared/DocumentCard';
export default function DocumentManagement() {
  const [docs, setDocs] = useState<Document[]>(mockDocuments);
  const [showUpload, setShowUpload] = useState(false);
  const [newDoc, setNewDoc] = useState<Partial<Document>>({
    name: '',
    type: 'other',
    size: '',
    uploadedOn: ''
  });

  const deleteDoc = (id: string) => setDocs(prev => prev.filter(d => d.id !== id));

  const downloadDoc = (doc: Document) => {
    // simulate download by creating a blob; in real app you'd use doc.url
    const content = `You downloaded: ${doc.name}`;
    const blob = new Blob([content], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const icons: Record<string, string> = {
    'offer-letter': 'text-primary-600', 'resume': 'text-emerald-600',
    'certificate': 'text-amber-600', 'id-proof': 'text-purple-600', 'other': 'text-slate-600'
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">Documents</h1><p className="page-subtitle">Manage employee documents</p></div>
        <Button className="btn-primary" onClick={() => { setShowUpload(true); setNewDoc({ name:'', type:'other', size:'', uploadedOn:'' }); }}><Upload size={16} /> Upload Document</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {docs.map(doc => (
          <DocumentCard
          key={doc.id}
          doc={doc}
          iconClass={icons[doc.type]}
          formatDate={formatDate}
          onDownload={downloadDoc}
          onDelete={deleteDoc}
          BadgeComponent={Badge}
        />
        ))}
      </div>

      {showUpload && (
        <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Document" size="md">
          <div className="space-y-4">
            <div>
              <label className="label">Select File</label>
              <input
                type="file"
                className="input w-full"
                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setNewDoc({
                    ...newDoc,
                    name: file.name,
                    size: `${(file.size / 1024).toFixed(1)} KB`,
                  });
                }}
              />
            </div>
            <div>
              <label className="label">Type</label>
              <select
                className="input w-full"
                value={newDoc.type || 'other'}
                onChange={e => setNewDoc({ ...newDoc, type: e.target.value as Document['type'] })}
              >
                <option value="offer-letter">Offer Letter</option>
                <option value="resume">Resume</option>
                <option value="certificate">Certificate</option>
                <option value="id-proof">ID Proof</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">File Name</label>
              <input
                className="input w-full"
                value={newDoc.name || ''}
                onChange={e => setNewDoc({ ...newDoc, name: e.target.value })}
                placeholder="Select or enter file name"
              />
            </div>
            <div>
              <label className="label">Size</label>
              <input
                className="input w-full"
                value={newDoc.size || ''}
                onChange={e => setNewDoc({ ...newDoc, size: e.target.value })}
                placeholder="Auto-filled or enter size"
              />
            </div>
            <div className="flex justify-end gap-4">
              <Button className="btn-secondary" onClick={() => setShowUpload(false)}>Cancel</Button>
              <Button
                className="btn-primary"
                disabled={!newDoc.name || !newDoc.size}
                onClick={() => {
                  const full: Document = {
                    id: Math.random().toString(36).slice(2,10),
                    employeeId: '',
                    name: newDoc.name || '',
                    type: newDoc.type as Document['type'],
                    size: newDoc.size || '',
                    uploadedOn: new Date().toISOString()
                  };
                  setDocs(prev => [...prev, full]);
                  setShowUpload(false);
                }}
              >Upload</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
