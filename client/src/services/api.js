import axios from "axios";

export const API_BASE_URL = "http://localhost:8000/api";

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
