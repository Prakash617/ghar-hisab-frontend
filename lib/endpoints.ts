export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const ENDPOINTS = {
  auth: {
    login: `${API_BASE}/api/accounts/token/`,
    refresh: `${API_BASE}/api/accounts/token/refresh/`,
    signup: `${API_BASE}/api/signup/`,
    me: `${API_BASE}/api/accounts/me/`,
  },
  bills: {
    list: `${API_BASE}/api/bills/`,
    detail: (id: number | string) => `${API_BASE}/api/bills/${id}/`,
  },
  paymentHistories: {
    list: `${API_BASE}/api/payment-histories/`,
    create: `${API_BASE}/api/payment-histories/`,
    detail: (id: number | string) => `${API_BASE}/api/payment-histories/${id}/`,
  },
  reports: {
    list: `${API_BASE}/api/reports/`,
    detail: (slug: string) => `${API_BASE}/api/reports/${slug}/`,
  },
  rooms: {
    list: `${API_BASE}/api/rooms/`,
    detail: (id: number | string) => `${API_BASE}/api/rooms/${id}/`,
  },
  houses: {
    list: `${API_BASE}/api/houses/`,
  },
  tenants: {
    list: `${API_BASE}/api/tenants/`,
    detail: (id: number | string) => `${API_BASE}/api/tenants/${id}/`,
  },
  tenantDocuments: {
    create: `${API_BASE}/api/tenant-documents/`,
    delete: (id: number | string) => `${API_BASE}/api/tenant-documents/${id}/`,
  },
};
