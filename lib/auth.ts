import { ENDPOINTS } from "./endpoints";

// --- LOGIN ---
export async function login(username: string, password: string) {
  const res = await fetch(ENDPOINTS.auth.login, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error("Login failed");

  const data = await res.json();
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);

  return data;
}

// --- SIGNUP ---
export async function signup(payload: { email: string; password: string; name: string }) {
  const res = await fetch(ENDPOINTS.auth.signup, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Signup failed");

  return res.json();
}

// --- LOGOUT ---
export function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}

// --- REFRESH TOKEN ---
export async function refreshToken() {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;

  const res = await fetch(ENDPOINTS.auth.refresh, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    logout();
    return null;
  }

  const data = await res.json();
  localStorage.setItem("access", data.access);
  return data.access;
}

// --- GET CURRENT USER ---
export async function getCurrentUser() {
  const token = localStorage.getItem("access");
  if (!token) return null;

  const res = await fetch(ENDPOINTS.auth.me, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;

  return res.json();
}
