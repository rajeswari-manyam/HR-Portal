const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const registerUser = async (data: any) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const body = new URLSearchParams();
    Object.keys(data).forEach(key => {
        body.append(key, data[key]);
    });

    const requestOptions: RequestInit = {
        method: "POST",
        headers,
        body,
        redirect: "follow"
    };

    const response = await fetch(`${API_BASE_URL}/auth/register`, requestOptions);

    if (!response.ok) {
        throw new Error("Registration Failed");
    }

    return response.json();
};

export const loginUser = async (identifier: string, password: string) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const body = new URLSearchParams();

    // Detect if input is an email or Employee ID
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    if (isEmail) {
        body.append("email", identifier);
    } else {
        body.append("employeeId", identifier);
    }
    body.append("password", password);

    const requestOptions: RequestInit = {
        method: "POST",
        headers,
        body
    };

    const response = await fetch(`${API_BASE_URL}/auth/login`, requestOptions);

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Login failed");
    }

    return response.json();
};