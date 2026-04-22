import axios from 'axios';

export const API_BASE_URL = (() => {
  let url = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  if (typeof window !== 'undefined' && window.location.hostname.includes('.github.dev')) {
    url = window.location.origin.replace('-3000', '-8000');
  }
  return url;
})();

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
