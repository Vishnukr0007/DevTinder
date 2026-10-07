import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/**
 * Axios instance configured for frontend-backend communication
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Sends HTTP-Only cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach Authorization Bearer token for cross-domain requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Axios API Wrapper handling JSON payloads and HTTP credentials
 */
export const fetchApi = async (endpoint, options = {}) => {
  const method = (options.method || "GET").toLowerCase();

  try {
    const config = {
      url: endpoint,
      method: method,
      headers: options.headers || {},
      params: options.params,
    };

    if (options.body) {
      config.data = options.body;
    }

    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    const customError = new Error(
      error.response?.data?.message || error.message || "API request failed"
    );
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    throw customError;
  }
};

export default apiClient;
