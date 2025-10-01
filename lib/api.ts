import { ENDPOINTS } from "./endpoints";
import { PaymentHistory } from "./types";

import { refreshToken } from "./auth";


export async function apiFetch(url: string, options: RequestInit = {}) {
  let token = localStorage.getItem("access");

  console.log("apiFetch: Sending request to", url, "with options:", options);

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  console.log("apiFetch: Received response with status", response.status, response.statusText);

  if (response.status === 401) {
    console.log("apiFetch: Token expired, attempting refresh...");
    const newAccessToken = await refreshToken();
    if (newAccessToken) {
      token = newAccessToken;
      console.log("apiFetch: Token refreshed, retrying request...");
      response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });
      console.log("apiFetch: Retried request received response with status", response.status, response.statusText);
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
    console.error("apiFetch: Network response was not ok", response.status, response.statusText, errorData);
    throw new Error(errorData.message || "Network response was not ok");
  }

  return response.json();
}

