const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ GET all departments
export const getDepartments = async () => {
  const response = await fetch(`${API_BASE_URL}/departments`, {
    method: "GET",
    redirect: "follow",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to fetch departments");
  }
  return response.json();
};

// ✅ GET single department by ID
export const getDepartmentById = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
    method: "GET",
    redirect: "follow",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to fetch department");
  }
  return response.json();
};

// ✅ POST create department
export const createDepartment = async (data: {
  name: string;
  manager: string;
  description: string;
  employeeCount?: number;
}) => {
  const headers = new Headers();
  headers.append("Content-Type", "application/x-www-form-urlencoded");

  const body = new URLSearchParams();
  Object.keys(data).forEach((key) => {
    const val = (data as any)[key];
    if (val !== undefined && val !== '') body.append(key, String(val));
  });

  const response = await fetch(`${API_BASE_URL}/departments`, {
    method: "POST",
    headers,
    body,
    redirect: "follow",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to create department");
  }
  return response.json();
};

// ✅ PUT update department by ID
export const updateDepartment = async (id: string, data: {
  name?: string;
  manager?: string;
  description?: string;
  employeeCount?: number;
}) => {
  const headers = new Headers();
  headers.append("Content-Type", "application/x-www-form-urlencoded");

  const body = new URLSearchParams();
  Object.keys(data).forEach((key) => {
    const val = (data as any)[key];
    if (val !== undefined && val !== '') body.append(key, String(val));
  });

  const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
    method: "PUT",
    headers,
    body,
    redirect: "follow",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to update department");
  }
  return response.json();
};

// ✅ DELETE department by ID
export const deleteDepartment = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
    method: "DELETE",
    redirect: "follow",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to delete department");
  }
  return response.json();
};