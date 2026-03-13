const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ GET all employees
export const getEmployees = async () => {
  const response = await fetch(`${API_BASE_URL}/employees`, {
    method: "GET",
    redirect: "follow",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to fetch employees");
  }
  return response.json();
};

// ✅ GET single employee by ID
export const getEmployeeById = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
    method: "GET",
    redirect: "follow",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to fetch employee");
  }
  return response.json();
};

// ✅ POST create employee
export const createEmployee = async (data: {
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joiningDate: string;
  salary: number;
  address: string;
  emergencyContact: string;
  status: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup?: string;
}) => {
  const headers = new Headers();
  headers.append("Content-Type", "application/x-www-form-urlencoded");

  const body = new URLSearchParams();
  Object.keys(data).forEach((key) => {
    const val = (data as any)[key];
    if (val !== undefined && val !== '') body.append(key, String(val));
  });

  const response = await fetch(`${API_BASE_URL}/employees`, {
    method: "POST",
    headers,
    body,
    redirect: "follow",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to create employee");
  }
  return response.json();
};

// ✅ PUT update employee by ID
export const updateEmployee = async (id: string, data: Partial<{
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  joiningDate: string;
  salary: number;
  address: string;
  emergencyContact: string;
  status: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup: string;
}>) => {
  const headers = new Headers();
  headers.append("Content-Type", "application/x-www-form-urlencoded");

  const body = new URLSearchParams();
  Object.keys(data).forEach((key) => {
    const val = (data as any)[key];
    if (val !== undefined && val !== '') body.append(key, String(val));
  });

  const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
    method: "PUT",
    headers,
    body,
    redirect: "follow",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to update employee");
  }
  return response.json();
};

// ✅ DELETE employee by ID
export const deleteEmployee = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
    method: "DELETE",
    redirect: "follow",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to delete employee");
  }
  return response.json();
};