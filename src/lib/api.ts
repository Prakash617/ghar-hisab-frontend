const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://gharhisab.pythonanywhere.com";


interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.headers) {
    const h = options.headers as Record<string, string>;
    Object.keys(h).forEach((key) => {
      headers[key] = h[key];
    });
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401) {
    const refreshToken = getRefreshToken();
    if (refreshToken && !endpoint.includes("/token/")) {
      const refreshed = await refreshAccessToken(refreshToken);
      if (refreshed) {
        return request(endpoint, {
          ...options,
          token: refreshed.access,
        });
      }
      clearTokens();
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || error.message || "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Token management
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

async function refreshAccessToken(refresh: string): Promise<{ access: string } | null> {
  try {
    const response = await fetch(`${API_BASE}/api/accounts/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    localStorage.setItem("access_token", data.access);
    return data;
  } catch {
    return null;
  }
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    request<{ access: string; refresh: string }>("/api/accounts/token/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password1: string, password2: string) =>
    request<{ detail: string }>("/api/accounts/register/", {
      method: "POST",
      body: JSON.stringify({ email, password1, password2 }),
    }),

  getMe: () =>
    request<{ id: number; email: string; first_name: string; last_name: string }>("/api/accounts/me/", {
      token: getAccessToken() || undefined,
    }),

  verifyEmail: (token: string) =>
    request<{ detail: string }>(`/api/accounts/verify-email/?token=${token}`),
};

// Houses API
export const housesApi = {
  list: () =>
    request<any[]>("/api/houses/", { token: getAccessToken() || undefined }),

  get: (id: number) =>
    request<any>(`/api/houses/${id}/`, { token: getAccessToken() || undefined }),

  create: (data: any) =>
    request<any>("/api/houses/", {
      method: "POST",
      body: JSON.stringify(data),
      token: getAccessToken() || undefined,
    }),

  update: (id: number, data: any) =>
    request<any>(`/api/houses/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
      token: getAccessToken() || undefined,
    }),

  delete: (id: number) =>
    request<void>(`/api/houses/${id}/`, {
      method: "DELETE",
      token: getAccessToken() || undefined,
    }),

  toggleStatus: (id: number) =>
    request<any>(`/api/custom/houses/${id}/toggle-status/`, {
      method: "POST",
      token: getAccessToken() || undefined,
    }),
};

// Rooms API
export const roomsApi = {
  list: (houseId?: number) => {
    const params = houseId ? `?house_id=${houseId}` : "";
    return request<any[]>(`/api/rooms/${params}`, { token: getAccessToken() || undefined });
  },

  get: (id: number) =>
    request<any>(`/api/rooms/${id}/`, { token: getAccessToken() || undefined }),

  getDetail: (id: number) =>
    request<any>(`/api/custom/rooms/${id}/detail/`, { token: getAccessToken() || undefined }),

  create: (data: any) =>
    request<any>("/api/rooms/", {
      method: "POST",
      body: JSON.stringify(data),
      token: getAccessToken() || undefined,
    }),

  update: (id: number, data: any) =>
    request<any>(`/api/rooms/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
      token: getAccessToken() || undefined,
    }),

  delete: (id: number) =>
    request<void>(`/api/rooms/${id}/`, {
      method: "DELETE",
      token: getAccessToken() || undefined,
    }),

  toggleStatus: (id: number) =>
    request<any>(`/api/custom/rooms/${id}/toggle-status/`, {
      method: "POST",
      token: getAccessToken() || undefined,
    }),
};

// Tenants API
export const tenantsApi = {
  list: (roomId?: number) => {
    const params = roomId ? `?room_id=${roomId}` : "";
    return request<any[]>(`/api/tenants/${params}`, { token: getAccessToken() || undefined });
  },

  get: (id: number) =>
    request<any>(`/api/tenants/${id}/`, { token: getAccessToken() || undefined }),

  create: (data: any) =>
    request<any>("/api/tenants/", {
      method: "POST",
      body: JSON.stringify(data),
      token: getAccessToken() || undefined,
    }),

  update: (id: number, data: any) =>
    request<any>(`/api/tenants/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
      token: getAccessToken() || undefined,
    }),
};

// Tenant Documents API
export const tenantDocumentsApi = {
  upload: (formData: FormData) =>
    fetch(`${API_BASE}/api/tenant-documents/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: formData,
    }).then(async (r) => {
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || err.error || "Failed to upload document");
      }
      return r.json();
    }),

  delete: (id: number) =>
    request<void>(`/api/tenant-documents/${id}/`, {
      method: "DELETE",
      token: getAccessToken() || undefined,
    }),
};

// Payments API
export const paymentsApi = {
  list: (roomId?: number) => {
    const params = roomId ? `?room_id=${roomId}` : "";
    return request<any[]>(`/api/payment-histories/${params}`, { token: getAccessToken() || undefined });
  },

  get: (id: number) =>
    request<any>(`/api/payment-histories/${id}/`, { token: getAccessToken() || undefined }),

  create: (data: any) =>
    request<any>("/api/payment-histories/", {
      method: "POST",
      body: JSON.stringify(data),
      token: getAccessToken() || undefined,
    }),

  recordPayment: (roomId: number, data: any) =>
    request<any>(`/api/custom/rooms/${roomId}/record-payment/`, {
      method: "POST",
      body: JSON.stringify(data),
      token: getAccessToken() || undefined,
    }),

  reverseReceipt: (receiptId: number) =>
    request<any>(`/api/custom/receipts/${receiptId}/reverse/`, {
      method: "POST",
      token: getAccessToken() || undefined,
    }),

  sendEmail: (paymentId: number) =>
    request<any>(`/api/custom/payments/${paymentId}/send-email/`, {
      method: "POST",
      token: getAccessToken() || undefined,
    }),

  update: (id: number, data: any) =>
    request<any>(`/api/payment-histories/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
      token: getAccessToken() || undefined,
    }),

  delete: (id: number) =>
    request<void>(`/api/payment-histories/${id}/`, {
      method: "DELETE",
      token: getAccessToken() || undefined,
    }),
};

// Dashboard API
export const dashboardApi = {
  get: (params?: { month?: string; status?: string; search?: string; house?: string | number }) => {
    const searchParams = new URLSearchParams();
    if (params?.month) searchParams.set("month", params.month);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.house) searchParams.set("house", String(params.house));
    const query = searchParams.toString();
    return request<any>(`/api/custom/dashboard/${query ? `?${query}` : ""}`, {
      token: getAccessToken() || undefined,
    });
  },
};

// Email API
export const emailApi = {
  getHistory: (roomId?: number) => {
    const endpoint = roomId ? `/api/custom/rooms/${roomId}/emails/` : "/api/custom/email-history/";
    return request<any>(endpoint, { token: getAccessToken() || undefined });
  },

  getPendingBillPreview: (roomId: number) =>
    request<any>(`/api/custom/rooms/${roomId}/pending-email/`, {
      token: getAccessToken() || undefined,
    }),

  sendPendingBills: (roomId: number, data?: { subject?: string; custom_message?: string }) =>
    request<any>(`/api/custom/rooms/${roomId}/pending-email/`, {
      method: "POST",
      body: JSON.stringify(data || {}),
      token: getAccessToken() || undefined,
    }),

  deleteHistory: (id: number) =>
    request<void>(`/api/custom/email-history/${id}/`, {
      method: "DELETE",
      token: getAccessToken() || undefined,
    }),

  getSettings: () =>
    request<any>("/api/custom/email-settings/", { token: getAccessToken() || undefined }),

  updateSettings: (data: any) =>
    request<any>("/api/custom/email-settings/", {
      method: "PUT",
      body: JSON.stringify(data),
      token: getAccessToken() || undefined,
    }),

  skipSettings: () =>
    request<any>("/api/custom/email-settings/skip/", {
      method: "POST",
      token: getAccessToken() || undefined,
    }),

  sendPendingEmails: (roomId: number) =>
    request<any>(`/api/custom/rooms/${roomId}/pending-email/`, {
      method: "POST",
      token: getAccessToken() || undefined,
    }),
};

// Profile API
export const profileApi = {
  get: () =>
    request<any>("/api/custom/profile/", { token: getAccessToken() || undefined }),

  update: (data: any) =>
    request<any>("/api/custom/profile/", {
      method: "PUT",
      body: JSON.stringify(data),
      token: getAccessToken() || undefined,
    }),
};
