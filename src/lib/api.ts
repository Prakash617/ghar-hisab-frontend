const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://gharhisab.pythonanywhere.com";


interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  const isFormData = typeof FormData !== "undefined" && fetchOptions.body instanceof FormData;

  const headers: Record<string, string> = isFormData
    ? {}
    : {
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
    let message = error.detail || error.message || error.error;
    if (!message && error && typeof error === "object") {
      const firstKey = Object.keys(error)[0];
      const firstVal = firstKey ? error[firstKey] : null;
      if (Array.isArray(firstVal) && firstVal.length > 0) {
        message = `${firstKey}: ${String(firstVal[0])}`;
      } else if (typeof firstVal === "string" && firstVal) {
        message = `${firstKey}: ${firstVal}`;
      }
    }
    throw new Error(message || `Request failed (${response.status})`);
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
      body: typeof FormData !== "undefined" && data instanceof FormData ? data : JSON.stringify(data),
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
      body: typeof FormData !== "undefined" && data instanceof FormData ? data : JSON.stringify(data),
      token: getAccessToken() || undefined,
    }),

  delete: (id: number) =>
    request<void>(`/api/payment-histories/${id}/`, {
      method: "DELETE",
      token: getAccessToken() || undefined,
    }),
};

// Receipts / Payment Receive History API
export const receiptsApi = {
  list: (params?: {
    room_id?: number;
    house_id?: number;
    search?: string;
    status?: string;
    page?: number;
    page_size?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.room_id) searchParams.set("room_id", String(params.room_id));
    if (params?.house_id) searchParams.set("house_id", String(params.house_id));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.page_size) searchParams.set("page_size", String(params.page_size));
    const q = searchParams.toString();
    return request<any>(`/api/custom/receipts/${q ? `?${q}` : ""}`, {
      token: getAccessToken() || undefined,
    });
  },

  update: (receiptId: number, data: { received_date?: string; remarks?: string }) =>
    request<any>(`/api/custom/receipts/${receiptId}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
      token: getAccessToken() || undefined,
    }),

  reverse: (receiptId: number) =>
    request<any>(`/api/custom/receipts/${receiptId}/reverse/`, {
      method: "POST",
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

// SMS API (Aakash SMS)
export const smsApi = {
  getSettings: () =>
    request<any>("/api/custom/sms-settings/", {
      token: getAccessToken() || undefined,
    }),

  updateSettings: (data: any) =>
    request<any>("/api/custom/sms-settings/", {
      method: "PUT",
      body: JSON.stringify(data),
      token: getAccessToken() || undefined,
    }),

  sendBill: (paymentId: number, data?: { custom_message?: string }) =>
    request<any>(`/api/custom/payments/${paymentId}/send-sms/`, {
      method: "POST",
      body: JSON.stringify(data || {}),
      token: getAccessToken() || undefined,
    }),

  sendPendingBills: (roomId: number, data?: { message?: string }) =>
    request<any>(`/api/custom/rooms/${roomId}/pending-sms/`, {
      method: "POST",
      body: JSON.stringify(data || {}),
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
      body: data instanceof FormData ? data : JSON.stringify(data),
      token: getAccessToken() || undefined,
    }),
};

// Bulk Monthly Billing API
export const bulkBillingApi = {
  preview: (houseId: number, includeVacant = false) =>
    request<any>(
      `/api/custom/houses/${houseId}/bulk-billing/${includeVacant ? "?include_vacant=true" : ""}`,
      { token: getAccessToken() || undefined }
    ),

  create: (
    houseId: number,
    data:
      | FormData
      | {
          billing_month: string;
          entries: Array<{
            room_id: number;
            current_units: number;
            remarks?: string;
            extra_charge?: string | number;
            extra_charge_label?: string;
          }>;
        }
  ) =>
    request<any>(`/api/custom/houses/${houseId}/bulk-billing/`, {
      method: "POST",
      body: typeof FormData !== "undefined" && data instanceof FormData ? data : JSON.stringify(data),
      token: getAccessToken() || undefined,
    }),
};

// Batch Pending Reminders API
export const batchRemindersApi = {
  preview: (houseId?: number | string) => {
    const query = houseId ? `?house_id=${houseId}` : "";
    return request<any>(`/api/custom/batch-reminders/preview/${query}`, {
      token: getAccessToken() || undefined,
    });
  },

  send: (data: {
    channel: "email" | "sms";
    language?: "en" | "ne";
    house_id?: number | string;
    room_ids?: number[];
  }) =>
    request<any>("/api/custom/batch-reminders/send/", {
      method: "POST",
      body: JSON.stringify(data),
      token: getAccessToken() || undefined,
    }),
};

// House Expenses API
export const expensesApi = {
  list: (params?: { house_id?: string | number; month?: string; category?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.house_id && params.house_id !== "all") qs.set("house_id", String(params.house_id));
    if (params?.month && params.month !== "all") qs.set("month", params.month);
    if (params?.category && params.category !== "all") qs.set("category", params.category);
    if (params?.search) qs.set("search", params.search);
    const query = qs.toString();
    return request<any[]>(`/api/expenses/${query ? `?${query}` : ""}`, {
      token: getAccessToken() || undefined,
    });
  },

  summary: (params?: { house_id?: string | number; month?: string; category?: string }) => {
    const qs = new URLSearchParams();
    if (params?.house_id && params.house_id !== "all") qs.set("house_id", String(params.house_id));
    if (params?.month && params.month !== "all") qs.set("month", params.month);
    if (params?.category && params.category !== "all") qs.set("category", params.category);
    const query = qs.toString();
    return request<any>(`/api/expenses/summary/${query ? `?${query}` : ""}`, {
      token: getAccessToken() || undefined,
    });
  },

  create: (data: {
    house: number;
    category: string;
    title: string;
    amount: string | number;
    expense_date: string;
    notes?: string;
  }) =>
    request<any>("/api/expenses/", {
      method: "POST",
      body: JSON.stringify(data),
      token: getAccessToken() || undefined,
    }),

  update: (id: number, data: Partial<{
    house: number;
    category: string;
    title: string;
    amount: string | number;
    expense_date: string;
    notes: string;
  }>) =>
    request<any>(`/api/expenses/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
      token: getAccessToken() || undefined,
    }),

  delete: (id: number) =>
    request<void>(`/api/expenses/${id}/`, {
      method: "DELETE",
      token: getAccessToken() || undefined,
    }),
};

// Move-Out Settlement API
export const moveOutApi = {
  preview: (
    roomId: number,
    params?: {
      final_units?: string | number;
      include_final_bill?: boolean;
      final_rent?: string | number;
      extra_deduction?: string | number;
    }
  ) => {
    const qs = new URLSearchParams();
    if (params?.final_units !== undefined && params.final_units !== "") {
      qs.set("final_units", String(params.final_units));
    }
    if (params?.include_final_bill) qs.set("include_final_bill", "true");
    if (params?.final_rent !== undefined && params.final_rent !== "") {
      qs.set("final_rent", String(params.final_rent));
    }
    if (params?.extra_deduction !== undefined && params.extra_deduction !== "") {
      qs.set("extra_deduction", String(params.extra_deduction));
    }
    const query = qs.toString();
    return request<any>(`/api/custom/rooms/${roomId}/move-out/${query ? `?${query}` : ""}`, {
      token: getAccessToken() || undefined,
    });
  },

  execute: (
    roomId: number,
    data: {
      move_out_date: string;
      include_final_bill: boolean;
      final_units?: number;
      final_rent?: string | number;
      extra_deduction?: string | number;
      deduction_label?: string;
      settled_amount?: string | number;
      notes?: string;
    }
  ) =>
    request<any>(`/api/custom/rooms/${roomId}/move-out/`, {
      method: "POST",
      body: JSON.stringify(data),
      token: getAccessToken() || undefined,
    }),
};

// Tenant Read-Only Portal API
export const tenantPortalApi = {
  regenerateToken: (tenantId: number) =>
    request<{ portal_token: string }>(`/api/custom/tenants/${tenantId}/portal-token/`, {
      method: "POST",
      token: getAccessToken() || undefined,
    }),

  getPublicPortal: async (token: string) => {
    const res = await fetch(`${API_BASE}/api/custom/portal/${encodeURIComponent(token)}/`, {
      cache: "no-store",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.detail || "Portal link not found or expired.");
    }
    return res.json();
  },
};
