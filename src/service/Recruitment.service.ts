const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface JobPayload {
  title: string;
  department: string;
  skills: string[];
  experience: string;
  salaryRange: string;
  status: 'open' | 'draft' | 'closed';
  applicants?: number;
  postedOn?: string;
}

export interface JobResponse {
  _id: string;
  title: string;
  department: string;
  skills: string[];
  experience: string;
  salaryRange: string;
  status: 'open' | 'draft' | 'closed';
  applicants: number;
  postedOn: string;
}

// Re-export CandidateResponse so existing imports don't break
export type { CandidateResponse } from "./candidates.service";

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
// JOBS APIs
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/jobs
export const createJob = async (data: JobPayload): Promise<JobResponse> => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/x-www-form-urlencoded');

  const response = await fetch(`${API_BASE_URL}/jobs`, {
    method: 'POST',
    headers,
    body: buildFormBody({
      ...data,
      postedOn: data.postedOn || new Date().toISOString().split('T')[0],
    }),
    redirect: 'follow',
  });

  return handleResponse<JobResponse>(response);
};

// GET /api/jobs
export const getAllJobs = async (): Promise<JobResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    method: 'GET',
    redirect: 'follow',
  });

  return handleResponse<JobResponse[]>(response);
};

// GET /api/jobs/:id
export const getJobById = async (id: string): Promise<JobResponse> => {
  const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
    method: 'GET',
    redirect: 'follow',
  });

  return handleResponse<JobResponse>(response);
};

// PUT /api/jobs/:id
export const updateJob = async (
  id: string,
  data: Partial<JobPayload>
): Promise<JobResponse> => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/x-www-form-urlencoded');

  const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
    method: 'PUT',
    headers,
    body: buildFormBody(data),
    redirect: 'follow',
  });

  return handleResponse<JobResponse>(response);
};

// DELETE /api/jobs/:id
export const deleteJob = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
    method: 'DELETE',
    redirect: 'follow',
  });

  return handleResponse<void>(response);
};