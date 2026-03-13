import { useState, useEffect, useCallback } from 'react';
import { Upload } from 'lucide-react';
import { Document } from '../../types';
import Badge from '../../components/shared/Badge';
import { formatDate } from '../../utils/helpers';
import Modal from '../../components/shared/Modal';
import Button from '../../components/shared/Button';
import DocumentCard, { DocumentItem } from '../../components/shared/DocumentCard';
import {
  getAllDocuments,
  createDocument,
  deleteDocument,
  downloadDocument,
} from "../../service/Document.service";

export default function DocumentManagement() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [newDoc, setNewDoc] = useState<{
    name: string;
    type: Document['type'];
    size: string;
    employeeId: string;
    url: string;
  }>({
    name: '',
    type: 'other',
    size: '',
    employeeId: '',
    url: '',
  });

  // ─── FETCH ALL DOCS ON MOUNT ───────────────────────────────────────────────
  const fetchDocs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllDocuments();
      setDocs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  // ─── DELETE ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id);
      setDocs(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete document');
    }
  };

 // After — DocumentItem is accepted, only needed fields passed
const handleDownload = (doc: DocumentItem) => {
  downloadDocument({ name: doc.name, url: doc.url });
};

  // ─── UPLOAD ────────────────────────────────────────────────────────────────
  const resetUploadForm = () => {
    setNewDoc({ name: '', type: 'other', size: '', employeeId: '', url: '' });
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (!newDoc.name || !newDoc.size) return;

    try {
      setUploading(true);
      setUploadError(null);

      const created = await createDocument({
        employeeId: newDoc.employeeId,
        name: newDoc.name,
        type: newDoc.type,
        size: newDoc.size,
        uploadedOn: new Date().toISOString(),
        url: newDoc.url || undefined,
      });

      setDocs(prev => [...prev, created]);
      setShowUpload(false);
      resetUploadForm();
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // ─── ICON COLOURS ──────────────────────────────────────────────────────────
  const icons: Record<string, string> = {
    'offer-letter': 'text-primary-600',
    resume: 'text-emerald-600',
    certificate: 'text-amber-600',
    'id-proof': 'text-purple-600',
    other: 'text-slate-600',
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Documents</h1>
          <p className="page-subtitle">Manage employee documents</p>
        </div>
        <Button
          className="btn-primary"
          onClick={() => {
            resetUploadForm();
            setShowUpload(true);
          }}
        >
          <Upload size={16} /> Upload Document
        </Button>
      </div>

      {/* Loading / Error / Empty */}
      {loading && (
        <p className="text-slate-500 text-sm">Loading documents…</p>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 text-sm">
          {error}{' '}
          <button className="underline ml-2" onClick={fetchDocs}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && docs.length === 0 && (
        <p className="text-slate-500 text-sm">No documents found.</p>
      )}

      {/* Document Grid */}
      {!loading && !error && docs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {docs.map(doc => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              iconClass={icons[doc.type] ?? icons.other}
              formatDate={formatDate}
              onDownload={handleDownload}
              onDelete={handleDelete}
              BadgeComponent={Badge}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <Modal
          isOpen={showUpload}
          onClose={() => {
            setShowUpload(false);
            resetUploadForm();
          }}
          title="Upload Document"
          size="md"
        >
          <div className="space-y-4">
            {/* File picker — auto-fills name & size */}
            <div>
              <label className="label">Select File</label>
              <input
                type="file"
                className="input w-full"
                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setNewDoc(prev => ({
                    ...prev,
                    name: file.name,
                    size: `${(file.size / 1024).toFixed(1)} KB`,
                  }));
                }}
              />
            </div>

            {/* Document type */}
            <div>
              <label className="label">Type</label>
              <select
                className="input w-full"
                value={newDoc.type}
                onChange={e =>
                  setNewDoc(prev => ({
                    ...prev,
                    type: e.target.value as Document['type'],
                  }))
                }
              >
                <option value="offer-letter">Offer Letter</option>
                <option value="resume">Resume</option>
                <option value="certificate">Certificate</option>
                <option value="id-proof">ID Proof</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* File name */}
            <div>
              <label className="label">File Name</label>
              <input
                className="input w-full"
                value={newDoc.name}
                onChange={e =>
                  setNewDoc(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder="Auto-filled or enter manually"
              />
            </div>

            {/* Size */}
            <div>
              <label className="label">Size</label>
              <input
                className="input w-full"
                value={newDoc.size}
                onChange={e =>
                  setNewDoc(prev => ({ ...prev, size: e.target.value }))
                }
                placeholder="Auto-filled or enter size"
              />
            </div>

            {/* Employee ID */}
            <div>
              <label className="label">Employee ID</label>
              <input
                className="input w-full"
                value={newDoc.employeeId}
                onChange={e =>
                  setNewDoc(prev => ({ ...prev, employeeId: e.target.value }))
                }
                placeholder="e.g. EMP001"
              />
            </div>

            {/* Optional URL */}
            <div>
              <label className="label">File URL (optional)</label>
              <input
                className="input w-full"
                value={newDoc.url}
                onChange={e =>
                  setNewDoc(prev => ({ ...prev, url: e.target.value }))
                }
                placeholder="https://example.com/file.pdf"
              />
            </div>

            {uploadError && (
              <p className="text-red-500 text-sm">{uploadError}</p>
            )}

            <div className="flex justify-end gap-4">
              <Button
                className="btn-secondary"
                onClick={() => {
                  setShowUpload(false);
                  resetUploadForm();
                }}
              >
                Cancel
              </Button>
              <Button
                className="btn-primary"
                disabled={!newDoc.name || !newDoc.size || uploading}
                onClick={handleUpload}
              >
                {uploading ? 'Uploading…' : 'Upload'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}