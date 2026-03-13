const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface LeaveRequestPayload {
    employeeId: string;
    employeeName: string;
    department: string;
    leaveType: string;
    startDate: string;       // "YYYY-MM-DD"
    endDate: string;         // "YYYY-MM-DD"
    days: number;
    reason: string;
    status?: 'pending' | 'approved' | 'rejected';
    appliedOn: string;       // "YYYY-MM-DD"
    approvedBy?: string;
}

export interface LeaveStatusPayload {
    status: 'approved' | 'rejected';
    approvedBy: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────────────────────────────────────

function buildFormBody(data: Record<string, any>): URLSearchParams {
    const body = new URLSearchParams();
    Object.keys(data).forEach((key) => {
        const val = data[key];
        if (val !== undefined && val !== null && val !== '') {
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
// 1. POST  /api/leave  →  Submit a new leave request
// ─────────────────────────────────────────────────────────────────────────────

export const submitLeaveRequest = async (
    data: LeaveRequestPayload
): Promise<any> => {
    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const response = await fetch(`${API_BASE_URL}/leave`, {
        method: "POST",
        headers,
        body: buildFormBody(data),
        redirect: "follow",
    });

    return handleResponse(response);
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET   /api/leave  →  Get all leave requests (optionally filter by employeeId)
// ─────────────────────────────────────────────────────────────────────────────

export const getAllLeaves = async (employeeId?: string): Promise<any[]> => {
    const url = employeeId
        ? `${API_BASE_URL}/leave?employeeId=${employeeId}`
        : `${API_BASE_URL}/leave`;

    const response = await fetch(url, {
        method: "GET",
        redirect: "follow",
    });

    return handleResponse(response);
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. GET   /api/leave/balance/:employeeId  →  Get leave balance for an employee
// ─────────────────────────────────────────────────────────────────────────────

export const getLeaveBalance = async (employeeId: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/leave/balance/${employeeId}`, {
        method: "GET",
        redirect: "follow",
    });

    return handleResponse(response);
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. PUT   /api/leave/:id  →  Update leave status (approve / reject)
// ─────────────────────────────────────────────────────────────────────────────

export const updateLeaveStatus = async (
    id: string,
    status: 'approved' | 'rejected',
    approvedBy: string
): Promise<any> => {
    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const payload: LeaveStatusPayload = { status, approvedBy };

    const response = await fetch(
        `${API_BASE_URL}/leave/${id}?status=${status}&approvedBy=${approvedBy}`,
        {
            method: "PUT",
            headers,
            body: buildFormBody(payload),
            redirect: "follow",
        }
    );

    return handleResponse(response);
};