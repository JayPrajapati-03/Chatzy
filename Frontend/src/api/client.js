import axios from 'axios';
import { API_URL } from '../utils/constants';

/**
 * Axios instance pre-configured with base URL and default headers.
 * All API modules import this client instead of raw axios.
 */
const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ─── Request interceptor ─────────────────────────────────────────────────────
client.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ─── Response interceptor ────────────────────────────────────────────────────
// Normalize server errors so callers only deal with a plain Error object.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const serverMessage =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    const normalizedError = new Error(serverMessage);
    normalizedError.status = error.response?.status;
    normalizedError.data = error.response?.data;
    return Promise.reject(normalizedError);
  }
);

export default client;
