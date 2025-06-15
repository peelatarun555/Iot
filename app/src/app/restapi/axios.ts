import axios from 'axios';
import { environment } from 'src/environments/environment';

export const api = axios.create({
  baseURL: `${environment.API_URL}${environment.API_ENDPOINT}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to headers if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('x-access-token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});
