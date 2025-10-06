import { refreshToken } from "./auth";

export function apiFetchWithProgress(url: string, options: RequestInit & { onProgress?: (progress: number) => void } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(options.method || 'GET', url);

    const token = localStorage.getItem("access");

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

    for (const key in mergedHeaders) {
      xhr.setRequestHeader(key, mergedHeaders[key]);
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
            const newBaseHeaders: Record<string, string> = {};
            if (newAccessToken) {
                newBaseHeaders.Authorization = `Bearer ${newAccessToken}`;
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
            for (const key in newMergedHeaders) {
                newXhr.setRequestHeader(key, newMergedHeaders[key]);
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
