import axios from 'axios';
import { supabase } from '../config/supabase.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
});

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.error || error.message || 'Request failed';

    // Build an enriched error that preserves the response object so callers
    // can still inspect error.response?.status (e.g. 503 = table not ready).
    const enriched     = new Error(message);
    enriched.response  = error.response;   // ← keep full Axios response
    enriched.status    = status;

    // Suppress console noise for expected auth errors (401/403 are handled upstream)
    return Promise.reject(enriched);
  }
);

export default api;
