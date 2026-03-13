const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface CandidatePayload {
  name: string;
  email: string;
  phone: string;
  jobId: string;
  experience?: string;
  skills: string[];
  status?: 'applied' | 'screening' | 'interview' | 'offered' | 'rejected';
  appliedOn?: string;
}

export interface CandidateUpdatePayload {
  name?: string;
  email?: string;
  phone?: string;
  jobId?: string;
  experience?: string;
  skills?: string[];
  status?: 'applied' | 'screening' | 'interview' | 'offered' | 'rejected';
}

export interface CandidateResponse {
  _id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  skills: string[];
  status: 'applied' | 'screening' | 'interview' | 'offered' | 'rejected';
  appliedOn: string;
}

export interface CandidateFilterParams {
  jobId?: string;
  status?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function buildFormBody(data: Record<string, any>): URLSearchParams {
  const body = new URLSearchParams();
  Object.entries(data).forEach(([key, val]) => {
    if (val === undefined || val === null || val === '') return;
    if (Array.isArray(val)) {
      val.forEach(v => body.append(key, String(v)));
    } else {
      body.append(key, String(val));
    }
  });
  return body;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Request failed with status ${response.status}`);
  }
  return response.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. POST  /api/candidates  →  Create a new candidate
// ─────────────────────────────────────────────────────────────────────────────

export const createCandidate = async (
  data: CandidatePayload
): Promise<CandidateResponse> => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/x-www-form-urlencoded');

  const response = await fetch(`${API_BASE_URL}/candidates`, {
    method: 'POST',
    headers,
    body: buildFormBody(data),
    redirect: 'follow',
  });

  return handleResponse<CandidateResponse>(response);
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET   /api/candidates  →  Get all candidates (optional filters)
// ─────────────────────────────────────────────────────────────────────────────

export const getAllCandidates = async (
  filters?: CandidateFilterParams
): Promise<CandidateResponse[]> => {
  const params = new URLSearchParams();
  if (filters?.jobId)  params.append('jobId',  filters.jobId);
  if (filters?.status) params.append('status', filters.status);

  const url = params.toString()
    ? `${API_BASE_URL}/candidates?${params.toString()}`
    : `${API_BASE_URL}/candidates`;

  const response = await fetch(url, {
    method: 'GET',
    redirect: 'follow',
  });

  return handleResponse<CandidateResponse[]>(response);
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. GET   /api/candidates/:id  →  Get a single candidate by ID
// ─────────────────────────────────────────────────────────────────────────────

export const getCandidateById = async (
  id: string
): Promise<CandidateResponse> => {
  const response = await fetch(`${API_BASE_URL}/candidates/${id}`, {
    method: 'GET',
    redirect: 'follow',
  });

  return handleResponse<CandidateResponse>(response);
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. PUT   /api/candidates/:id  →  Update a candidate
// ─────────────────────────────────────────────────────────────────────────────

export const updateCandidate = async (
  id: string,
  data: CandidateUpdatePayload
): Promise<CandidateResponse> => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/x-www-form-urlencoded');

  const response = await fetch(`${API_BASE_URL}/candidates/${id}`, {
    method: 'PUT',
    headers,
    body: buildFormBody(data),
    redirect: 'follow',
  });

  return handleResponse<CandidateResponse>(response);
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. DELETE /api/candidates/:id  →  Delete a candidate
// ─────────────────────────────────────────────────────────────────────────────

export const deleteCandidate = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/candidates/${id}`, {
    method: 'DELETE',
    redirect: 'follow',
  });

  return handleResponse<void>(response);
};