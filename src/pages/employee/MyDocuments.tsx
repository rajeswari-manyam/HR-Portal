import React, { useState, useEffect } from 'react';
import { formatDate } from '../../utils/helpers';
import { Download, Upload, Trash2, FileText, Loader2 } from 'lucide-react';
import Button from '../../components/shared/Button';
import {
  getDocumentsByEmployee,
  getDocumentById,
  createDocument,
  deleteDocument,
  downloadDocument as downloadDocumentApi,
} from "../../service/Document.service";
import { Document } from '../../types';

const EMPLOYEE_ID = 'EMP-04';

export default function MyDocuments() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── GET: Fetch all documents for employee on mount ──────────────────────
  useEffect(() => {
    const fetchDocs = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const data = await getDocumentsByEmployee(EMPLOYEE_ID);
        setDocs(data);
      } catch (err: any) {
        console.error('Failed to fetch documents:', err.message);
        setError('Failed to load documents. Please try again.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchDocs();
  }, []);

  // ─── GET: Fetch single document by ID and download it ────────────────────
  const handleDownload = async (doc: Document) => {
    setLoadingId(doc.id);
    try {
      // Fetch latest document details by ID before downloading
      const freshDoc = await getDocumentById(doc.id);
      downloadDocumentApi(freshDoc);
    } catch (err: any) {
      console.error('Failed to fetch document:', err.message);
      // Fallback to existing doc data
      downloadDocumentApi(doc);
    } finally {
      setLoadingId(null);
    }
  };

  // ─── POST: Upload / create a new document ────────────────────────────────
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const newDoc = await createDocument({
        employeeId: EMPLOYEE_ID,
        name: file.name,
        type: 'other',
        size: `${(file.size / 1024).toFixed(1)} KB`,
        uploadedOn: new Date().toISOString().slice(0, 10),
      });

      setDocs((prev) => [newDoc, ...prev]);
    } catch (err: any) {
      console.error('Failed to upload document:', err.message);
      setError('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // ─── DELETE: Remove a document ───────────────────────────────────────────
  const handleDelete = async (doc: Document) => {
    if (!window.confirm(`Delete "${doc.name}"? This cannot be undone.`)) return;

    setDeletingId(doc.id);
    setError(null);

    try {
      await deleteDocument(doc.id);
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err: any) {
      console.error('Failed to delete document:', err.message);
      setError('Failed to delete document. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">My Documents</h1>
          <p className="page-subtitle">View and manage your documents</p>
        </div>

        <Button
          variant="primary"
          disabled={uploading}
          onClick={() => document.getElementById('doc-upload-input')?.click()}
        >
          {uploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Upload size={16} />
          )}
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>

        {/* Hidden file input */}
        <input
          id="doc-upload-input"
          type="file"
          accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ── Loading State ── */}
      {isFetching ? (
        <div className="flex items-center gap-2 text-sm text-slate-400 py-8 justify-center">
          <Loader2 size={16} className="animate-spin" />
          Loading documents...
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          No documents found. Upload one to get started.
        </div>
      ) : (
        /* ── Document Grid ── */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.map((d) => (
            <div
              key={d.id}
              className="card flex items-center gap-4 hover:shadow-card-hover transition-all"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                <FileText size={20} className="text-primary-600" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{d.name}</p>
                <p className="text-xs text-slate-400">
                  {d.size} · {formatDate(d.uploadedOn)}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-500 capitalize">
                  {d.type}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Download */}
                <button
                  className="btn-secondary py-2 px-3 text-xs flex items-center gap-1"
                  onClick={() => handleDownload(d)}
                  disabled={loadingId === d.id}
                  title="Download"
                >
                  {loadingId === d.id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Download size={13} />
                  )}
                </button>

                {/* Delete */}
                <button
                  className="py-2 px-3 text-xs rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1"
                  onClick={() => handleDelete(d)}
                  disabled={deletingId === d.id}
                  title="Delete"
                >
                  {deletingId === d.id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Trash2 size={13} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}