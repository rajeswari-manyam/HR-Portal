const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface WorkingHours {
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
}

export interface SettingsPayload {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  logo?: string;
  workingHours: WorkingHours;
  weeklyOff: string[];
}

export interface SettingsResponse {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  logo: string;
  workingHours: WorkingHours;
  weeklyOff: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function buildFormBody(data: SettingsPayload): URLSearchParams {
  const body = new URLSearchParams();

  if (data.name)    body.append('name',    data.name);
  if (data.email)   body.append('email',   data.email);
  if (data.phone)   body.append('phone',   data.phone);
  if (data.address) body.append('address', data.address);
  if (data.website) body.append('website', data.website);
  if (data.logo)    body.append('logo',    data.logo);

  // Nested object: workingHours.start / workingHours.end
  if (data.workingHours?.start) body.append('workingHours.start', data.workingHours.start);
  if (data.workingHours?.end)   body.append('workingHours.end',   data.workingHours.end);

  // Array: weeklyOff[0], weeklyOff[1], ...
  (data.weeklyOff || []).forEach((day, i) => {
    body.append(`weeklyOff[${i}]`, day);
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
// 1. GET  /api/settings  →  Fetch company settings
// ─────────────────────────────────────────────────────────────────────────────

export const getSettings = async (): Promise<SettingsResponse> => {
  const response = await fetch(`${API_BASE_URL}/settings`, {
    method: 'GET',
    redirect: 'follow',
  });

  return handleResponse<SettingsResponse>(response);
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. PUT  /api/settings  →  Update company settings
// ─────────────────────────────────────────────────────────────────────────────

export const updateSettings = async (
  data: SettingsPayload
): Promise<SettingsResponse> => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/x-www-form-urlencoded');

  const response = await fetch(`${API_BASE_URL}/settings`, {
    method: 'PUT',
    headers,
    body: buildFormBody(data),
    redirect: 'follow',
  });

  return handleResponse<SettingsResponse>(response);
};