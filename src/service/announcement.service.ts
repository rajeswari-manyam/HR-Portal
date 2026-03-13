const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ Get all announcements
export const getAnnouncements = async () => {
    const response = await fetch(`${API_BASE_URL}/announcements`, {
        method: "GET",
        redirect: "follow",
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to fetch announcements");
    }
    return response.json();
};

// ✅ Get announcements by targetRole
export const getAnnouncementsByRole = async (targetRole: string) => {
    const response = await fetch(
        `${API_BASE_URL}/announcements?targetRole=${targetRole}`,
        { method: "GET", redirect: "follow" }
    );
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to fetch announcements");
    }
    return response.json();
};

// ✅ Get single announcement by ID
export const getAnnouncementById = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/announcements/${id}`, {
        method: "GET",
        redirect: "follow",
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to fetch announcement");
    }
    return response.json();
};

// ✅ Create new announcement
export const createAnnouncement = async (data: {
    title: string;
    content: string;
    priority: string;
    targetRole: string;
    createdBy: string;
    createdAt: string;
}) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const body = new URLSearchParams();
    Object.keys(data).forEach((key) => {
        const val = (data as any)[key];
        if (val !== undefined && val !== '') body.append(key, val);
    });

    const response = await fetch(`${API_BASE_URL}/announcements`, {
        method: "POST",
        headers,
        body,
        redirect: "follow",
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to create announcement");
    }
    return response.json();
};

// ✅ Update announcement by ID
export const updateAnnouncement = async (id: string, data: {
    title?: string;
    content?: string;
    priority?: string;
    targetRole?: string;
}) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const body = new URLSearchParams();
    Object.keys(data).forEach((key) => {
        const val = (data as any)[key];
        if (val !== undefined && val !== '') body.append(key, val);
    });

    const response = await fetch(`${API_BASE_URL}/announcements/${id}`, {
        method: "PUT",
        headers,
        body,
        redirect: "follow",
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to update announcement");
    }
    return response.json();
};

// ✅ Delete announcement by ID
export const deleteAnnouncement = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/announcements/${id}`, {
        method: "DELETE",
        redirect: "follow",
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to delete announcement");
    }
    return response.json();
};