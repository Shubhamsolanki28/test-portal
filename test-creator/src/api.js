// Centralized API client for Test Creator with Dexmy JWT authentication bridge
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Returns Authorization header with Dexmy JWT token
 * Checks standard localStorage keys used across Dexmy and test-portal
 */
export const getAuthToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("dexmy_token") ||
    localStorage.getItem("teacherToken") ||
    "test_creator" // fallback test_creator demo token for offline testing
  );
};

export const getAuthHeaders = (extraHeaders = {}) => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
};

export const fetchWithAuth = async (endpoint, options = {}) => {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
  const headers = getAuthHeaders(options.headers);
  const response = await fetch(url, { ...options, headers });
  return response;
};
