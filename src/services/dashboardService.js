import http from './http';

const dashboardService = {
  obtener: () => http.get('/dashboard')
};

export default dashboardService;