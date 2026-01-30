/**
 * API Client with automatic token refresh
 * This utility wraps fetch and automatically refreshes access tokens when they expire
 */

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    console.error("❌ No refresh token available");
    return null;
  }

  try {
    console.log("🔄 Refreshing access token...");
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/token/refresh/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
         
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      },
    );

    if (response.ok) {
      const data = await response.json();
      const newAccessToken = data.access || data.accessToken;

      if (newAccessToken) {
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("auth_token", newAccessToken);
        console.log("✅ Access token refreshed successfully");
        return newAccessToken;
      } else {
        console.error("❌ No access token in refresh response");
        return null;
      }
    } else {
      console.error("❌ Token refresh failed:", response.status);
      // If refresh fails, clear all auth data
      const authKeys = [
        "auth_token",
        "accessToken",
        "refreshToken",
        "user",
        "user_id",
        "user_email",
        "user_name",
        "user_role",
        "session_active",
      ];
      authKeys.forEach((key) => localStorage.removeItem(key));

      // Redirect to login
      window.location.href = "/admin";
      return null;
    }
  } catch (error) {
    console.error("❌ Error refreshing token:", error);
    return null;
  }
};

/**
 * Enhanced fetch with automatic token refresh on 401 errors
 * Use this instead of regular fetch for authenticated API calls
 */
export const apiFetch = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  const token = localStorage.getItem("accessToken");

  // Add authorization header if token exists
  const headers: HeadersInit = {
    ...options.headers,
   
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    let response = await fetch(url, config);

    // If we get 401 (Unauthorized), try to refresh the token
    if (response.status === 401) {
      console.log("⚠️ Received 401, attempting token refresh...");

      if (!isRefreshing) {
        isRefreshing = true;

        const newToken = await refreshAccessToken();
        isRefreshing = false;

        if (newToken) {
          processQueue(null, newToken);

          // Retry the original request with new token
          const newHeaders: HeadersInit = {
            ...options.headers,
          
            Authorization: `Bearer ${newToken}`,
          };

          response = await fetch(url, {
            ...options,
            headers: newHeaders,
          });

          return response;
        } else {
          processQueue(new Error("Token refresh failed"), null);
          return response;
        }
      } else {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            const newHeaders: HeadersInit = {
              ...options.headers,
            
              Authorization: `Bearer ${token}`,
            };

            return fetch(url, {
              ...options,
              headers: newHeaders,
            });
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }
    }

    return response;
  } catch (error) {
    console.error("❌ API fetch error:", error);
    throw error;
  }
};

/**
 * Convenience wrapper for GET requests
 */
export const apiGet = (url: string, options: RequestInit = {}) => {
  return apiFetch(url, { ...options, method: "GET" });
};

/**
 * Convenience wrapper for POST requests
 */
export const apiPost = (url: string, body?: any, options: RequestInit = {}) => {
  return apiFetch(url, {
    ...options,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
};

/**
 * Convenience wrapper for PATCH requests
 */
export const apiPatch = (
  url: string,
  body?: any,
  options: RequestInit = {},
) => {
  return apiFetch(url, {
    ...options,
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
};

/**
 * Convenience wrapper for PUT requests
 */
export const apiPut = (url: string, body?: any, options: RequestInit = {}) => {
  return apiFetch(url, {
    ...options,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
};

/**
 * Convenience wrapper for DELETE requests
 */
export const apiDelete = (url: string, options: RequestInit = {}) => {
  return apiFetch(url, { ...options, method: "DELETE" });
};
