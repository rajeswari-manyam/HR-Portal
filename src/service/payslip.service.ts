const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface PayslipPayload {
    employeeId: string;
    employeeName: string;
    month: string;
    year: number | string;
    basicSalary: number;
    hra: number;
    allowances: number;
    deductions: number;
    netSalary: number;
    status?: 'pending' | 'generated';
}

export interface PayslipResponse {
    _id: string;
    employeeId: string;
    employeeName: string;
    month: string;
    year: number;
    basicSalary: number;
    hra: number;
    allowances: number;
    deductions: number;
    netSalary: number;
    status: 'pending' | 'generated';
    generatedOn?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────────────────────────────────────

function buildFormBody(data: Record<string, any>): URLSearchParams {
    const body = new URLSearchParams();
    Object.entries(data).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
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
// 1. POST /api/payslips → Create / Generate a new payslip
// ─────────────────────────────────────────────────────────────────────────────

export const createPayslip = async (data: PayslipPayload): Promise<PayslipResponse> => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    const response = await fetch(`${API_BASE_URL}/payslips`, {
        method: 'POST',
        headers,
        body: buildFormBody(data),
        redirect: 'follow',
    });

    return handleResponse<PayslipResponse>(response);
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET /api/payslips → Get all payslips
// ─────────────────────────────────────────────────────────────────────────────

export const getAllPayslips = async (): Promise<PayslipResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/payslips`, {
        method: 'GET',
        redirect: 'follow',
    });

    return handleResponse<PayslipResponse[]>(response);
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. GET /api/payslips?employeeId=EMP001 → Get payslips by employee
// ─────────────────────────────────────────────────────────────────────────────

export const getPayslipsByEmployee = async (employeeId: string): Promise<PayslipResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/payslips?employeeId=${employeeId}`, {
        method: 'GET',
        redirect: 'follow',
    });

    // 404 = no payslips found, return empty array instead of throwing
    if (response.status === 404) return [];

    return handleResponse<PayslipResponse[]>(response);
};