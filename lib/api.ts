import { ENDPOINTS } from "./endpoints";
import { PaymentHistory } from "./types";

import { refreshToken } from "./auth";


export async function apiFetch(url: string, options: RequestInit = {}) {
  let token = localStorage.getItem("access");

  console.log("apiFetch: Sending request to", url, "with options:", options);

  const baseHeaders: Record<string, string> = {};
  if (token) {
    baseHeaders.Authorization = `Bearer ${token}`;
  }

  let mergedHeaders: Record<string, string> = { ...baseHeaders };

  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        mergedHeaders[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        mergedHeaders[key] = value;
      });
    } else { // Must be Record<string, string>
      mergedHeaders = { ...mergedHeaders, ...options.headers };
    }
  }

  if (!(options.body instanceof FormData)) {
    mergedHeaders["Content-Type"] = "application/json";
  }

  let response = await fetch(url, {
    ...options,
    headers: mergedHeaders,
  });

  console.log("apiFetch: Received response with status", response.status, response.statusText);

  if (response.status === 401) {
    console.log("apiFetch: Token expired, attempting refresh...");
    const newAccessToken = await refreshToken();
    if (newAccessToken) {
      token = newAccessToken;
      console.log("apiFetch: Token refreshed, retrying request...");

      const newBaseHeaders: Record<string, string> = {};
      if (token) {
        newBaseHeaders.Authorization = `Bearer ${token}`;
      }
      let newMergedHeaders: Record<string, string> = { ...newBaseHeaders };

      if (options.headers) {
        if (options.headers instanceof Headers) {
          options.headers.forEach((value, key) => {
            newMergedHeaders[key] = value;
          });
        } else if (Array.isArray(options.headers)) {
          options.headers.forEach(([key, value]) => {
            newMergedHeaders[key] = value;
          });
        } else { // Must be Record<string, string>
          newMergedHeaders = { ...newMergedHeaders, ...options.headers };
        }
      }

      if (!(options.body instanceof FormData)) {
        newMergedHeaders["Content-Type"] = "application/json";
      }

      response = await fetch(url, {
        ...options,
        headers: newMergedHeaders,
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

