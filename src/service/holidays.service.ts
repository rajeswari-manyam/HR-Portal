const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HolidayPayload {
    name: string;
    date: string;
    type: 'national' | 'regional' | 'company';
    description?: string;
}

export interface HolidayResponse {
    _id: string;
    name: string;
    date: string;
    type: 'national' | 'regional' | 'company';
    description?: string;
}

// ─── POST /api/holidays ───────────────────────────────────────────────────────

export const createHoliday = async (data: HolidayPayload): Promise<HolidayResponse> => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    const body = new URLSearchParams();
    Object.entries(data).forEach(([key, val]) => {
        if (val !== undefined && val !== '') body.append(key, String(val));
    });

    const response = await fetch(`${API_BASE_URL}/holidays`, {
        method: 'POST',
        headers,
        body,
        redirect: 'follow',
    });

    if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Failed to create holiday');
    }

    return response.json();
};

// ─── GET /api/holidays ────────────────────────────────────────────────────────

export const getAllHolidays = async (): Promise<HolidayResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/holidays`, {
        method: 'GET',
        redirect: 'follow',
    });

    if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Failed to fetch holidays');
    }

    return response.json();
};

// ─── PUT /api/holidays/:id ────────────────────────────────────────────────────

export const updateHoliday = async (
    id: string,
    data: Partial<HolidayPayload>
): Promise<HolidayResponse> => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    const body = new URLSearchParams();
    Object.entries(data).forEach(([key, val]) => {
        if (val !== undefined && val !== '') body.append(key, String(val));
    });

    const response = await fetch(`${API_BASE_URL}/holidays/${id}`, {
        method: 'PUT',
        headers,
        body,
        redirect: 'follow',
    });

    if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Failed to update holiday');
    }

    return response.json();
};

// ─── DELETE /api/holidays/:id ─────────────────────────────────────────────────

export const deleteHoliday = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/holidays/${id}`, {
        method: 'DELETE',
        redirect: 'follow',
    });

    if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Failed to delete holiday');
    }
};