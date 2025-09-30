import { refreshToken } from "./auth";

export function apiFetchWithProgress(url: string, options: RequestInit & { onProgress?: (progress: number) => void } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(options.method || 'GET', url);

    const token = localStorage.getItem("access");

    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    for (const key in headers) {
      xhr.setRequestHeader(key, headers[key]);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        if (options.onProgress) {
          options.onProgress(progress);
        }
      }
    };

    xhr.onload = async () => {
      if (xhr.status === 401) {
        try {
          const newAccessToken = await refreshToken();
          if (newAccessToken) {
            const newXhr = new XMLHttpRequest();
            newXhr.open(options.method || 'GET', url);
            const newHeaders: Record<string, string> = {
                ...(newAccessToken ? { Authorization: `Bearer ${newAccessToken}` } : {}),
                ...options.headers,
            };
            for (const key in newHeaders) {
                newXhr.setRequestHeader(key, newHeaders[key]);
            }
            newXhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = (event.loaded / event.total) * 100;
                    if (options.onProgress) {
                        options.onProgress(progress);
                    }
                }
            };
            newXhr.onload = () => {
                if (newXhr.status >= 200 && newXhr.status < 300) {
                    resolve(JSON.parse(newXhr.response));
                } else {
                    reject(JSON.parse(newXhr.response));
                }
            };
            newXhr.onerror = () => reject(newXhr.statusText);
            newXhr.send(options.body as XMLHttpRequestBodyInit);
          } else {
            reject('Failed to refresh token');
          }
        } catch (error) {
          reject(error);
        }
      } else if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.response));
      } else {
        reject(JSON.parse(xhr.response));
      }
    };

    xhr.onerror = () => reject(xhr.statusText);

    xhr.send(options.body as XMLHttpRequestBodyInit);
  });
}
