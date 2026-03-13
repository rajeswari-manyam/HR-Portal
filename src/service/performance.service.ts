const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface PerformancePayload {
    employeeId: string;
    employeeName: string;
    period: string;
    rating: number;
    goals: string[];
    feedback?: string;
    status?: 'draft' | 'submitted' | 'reviewed';
    reviewedBy?: string;
}

export interface PerformanceUpdatePayload {
    employeeId?: string;
    employeeName?: string;
    period?: string;
    rating?: number;
    goals?: string[];
    feedback?: string;
    status?: 'draft' | 'submitted' | 'reviewed';
    reviewedBy?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────────────────────────────────────

function buildFormBody(data: Record<string, any>): URLSearchParams {
    const body = new URLSearchParams();
    Object.keys(data).forEach((key) => {
        const val = data[key];
        if (val === undefined || val === null || val === '') return;
        // Arrays: send as JSON string
        if (Array.isArray(val)) {
            body.append(key, JSON.stringify(val));
        } else {
            body.append(key, String(val));
        }
    });
    return body;
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Request failed with status ${response.status}`);
    }
    return response.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. POST  /api/performance  →  Create a new performance review
// ─────────────────────────────────────────────────────────────────────────────

export const createPerformanceReview = async (
    data: PerformancePayload
): Promise<any> => {
    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const response = await fetch(`${API_BASE_URL}/performance`, {
        method: "POST",
        headers,
        body: buildFormBody(data),
        redirect: "follow",
    });

    return handleResponse(response);
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET   /api/performance  →  Get all performance reviews
// ─────────────────────────────────────────────────────────────────────────────

export const getAllPerformanceReviews = async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/performance`, {
        method: "GET",
        redirect: "follow",
    });

    return handleResponse(response);
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. GET   /api/performance/:id  →  Get a single performance review by ID
// ─────────────────────────────────────────────────────────────────────────────

export const getPerformanceReviewById = async (id: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/performance/${id}`, {
        method: "GET",
        redirect: "follow",
    });

    return handleResponse(response);
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. PUT   /api/performance/:id  →  Update a performance review
// ─────────────────────────────────────────────────────────────────────────────

export const updatePerformanceReview = async (
    id: string,
    data: PerformanceUpdatePayload
): Promise<any> => {
    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const response = await fetch(`${API_BASE_URL}/performance/${id}`, {
        method: "PUT",
        headers,
        body: buildFormBody(data),
        redirect: "follow",
    });

    return handleResponse(response);
};