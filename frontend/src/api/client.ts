import axios from 'axios';

// Use relative URL - all API calls go through the Nginx proxy on port 3000
// This works in both local Docker and GitHub Codespaces without any URL tricks
export const API_BASE_URL = '';

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
