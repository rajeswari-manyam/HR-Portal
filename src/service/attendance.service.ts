const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ Calculate work hours from checkIn/checkOut strings
export function calcWorkHours(checkIn?: string, checkOut?: string): number | undefined {
    if (!checkIn || !checkOut) return undefined;
    const [inH, inM] = checkIn.split(':').map(Number);
    const [outH, outM] = checkOut.split(':').map(Number);
    const totalMin = (outH * 60 + outM) - (inH * 60 + inM);
    if (totalMin <= 0) return undefined;
    return parseFloat((totalMin / 60).toFixed(1));
}

export const markAttendance = async (data: {
    employeeId: string;
    date: string;
    status: string;
    checkIn?: string;
}) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const body = new URLSearchParams();
    Object.keys(data).forEach((key) => {
        const val = (data as any)[key];
        if (val !== undefined && val !== '') body.append(key, val);
    });

    const response = await fetch(`${API_BASE_URL}/attendance`, {
        method: "POST",
        headers,
        body,
        redirect: "follow",
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Attendance submission failed");
    }

    return response.json();
};

export const getAttendance = async (employeeId?: string) => {
    const url = employeeId
        ? `${API_BASE_URL}/attendance?employeeId=${employeeId}`
        : `${API_BASE_URL}/attendance`;

    const response = await fetch(url, { method: "GET", redirect: "follow" });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to fetch attendance");
    }

    return response.json();
};

export const updateAttendance = async (id: string, data: {
    date?: string;
    status?: string;
    checkIn?: string;
    checkOut?: string;
}) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const body = new URLSearchParams();
    Object.keys(data).forEach((key) => {
        const val = (data as any)[key];
        if (val !== undefined && val !== '') body.append(key, val);
    });

    const response = await fetch(`${API_BASE_URL}/attendance/${id}`, {
        method: "PUT",
        headers,
        body,
        redirect: "follow",
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to update attendance");
    }

    return response.json();
};