import { Document } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ─── GET ALL DOCUMENTS ────────────────────────────────────────────────────────
export const getAllDocuments = async (): Promise<Document[]> => {
    const response = await fetch(`${API_BASE_URL}/documents`, { method: 'GET', redirect: 'follow' });

    if (!response.ok) throw new Error('Failed to fetch documents');

    const data = await response.json();
    return data.map(mapDoc);
};

// ─── GET DOCUMENTS BY EMPLOYEE ────────────────────────────────────────────────
export const getDocumentsByEmployee = async (employeeId: string): Promise<Document[]> => {
    const response = await fetch(
        `${API_BASE_URL}/documents?employeeId=${encodeURIComponent(employeeId)}`,
        { method: 'GET', redirect: 'follow' }
    );

    if (!response.ok) throw new Error(`Failed to fetch documents for employee ${employeeId}`);

    const data = await response.json();
    return data.map(mapDoc);
};

// ─── GET SINGLE DOCUMENT ──────────────────────────────────────────────────────
export const getDocumentById = async (id: string): Promise<Document> => {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, { method: 'GET', redirect: 'follow' });

    if (!response.ok) throw new Error(`Failed to fetch document with id ${id}`);

    return mapDoc(await response.json());
};

// ─── CREATE / UPLOAD DOCUMENT ─────────────────────────────────────────────────
export interface CreateDocumentPayload {
    employeeId: string;
    name: string;
    type: Document['type'];
    size: string;
    uploadedOn: string;
    url?: string;
}

export const createDocument = async (payload: CreateDocumentPayload): Promise<Document> => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    const body = new URLSearchParams();
    body.append('employeeId', payload.employeeId);
    body.append('name', payload.name);
    body.append('type', payload.type);
    body.append('size', payload.size);
    body.append('uploadedOn', payload.uploadedOn);
    if (payload.url) body.append('url', payload.url);

    const response = await fetch(`${API_BASE_URL}/documents`, {
        method: 'POST',
        headers,
        body,
        redirect: 'follow',
    });

    if (!response.ok) throw new Error('Failed to upload document');

    return mapDoc(await response.json());
};

// ─── UPDATE DOCUMENT ──────────────────────────────────────────────────────────
export type UpdateDocumentPayload = Partial<CreateDocumentPayload>;

export const updateDocument = async (id: string, payload: UpdateDocumentPayload): Promise<Document> => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    const body = new URLSearchParams();

    // ✅ Fix: cast entries to [string, string | undefined][] and guard null/undefined
    (Object.entries(payload) as [string, string | undefined][]).forEach(([key, value]) => {
        if (value != null) body.append(key, String(value));
    });

    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
        method: 'PUT',
        headers,
        body,
        redirect: 'follow',
    });

    if (!response.ok) throw new Error(`Failed to update document with id ${id}`);

    return mapDoc(await response.json());
};

// ─── DELETE DOCUMENT ──────────────────────────────────────────────────────────
export const deleteDocument = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
        method: 'DELETE',
        redirect: 'follow',
    });

    if (!response.ok) throw new Error(`Failed to delete document with id ${id}`);
};

// ─── DOWNLOAD DOCUMENT ────────────────────────────────────────────────────────
export const downloadDocument = (doc: { name: string; url?: string }): void => {
    if (doc.url) {
        const a = document.createElement('a');
        a.href = doc.url;
        a.download = doc.name;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
    }

    // Fallback blob if no URL
    const blob = new Blob([`Downloaded: ${doc.name}`], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// ─── INTERNAL MAPPER ──────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDoc(doc: any): Document {
    return {
        id: doc._id,
        employeeId: doc.employeeId,
        name: doc.name,
        type: doc.type as Document['type'],
        size: doc.size,
        uploadedOn: doc.uploadedOn,
        url: doc.url,
    };
}