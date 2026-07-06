import axios from 'axios';

const http = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' }
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    const tieneError = error.response?.data?.error;
    if (status === 401 && tieneError === 'Token inválido o expirado') {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('roles');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default http;