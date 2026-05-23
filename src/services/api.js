import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor: agrega el token a cada petición
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor: si el token expiró redirige al login
API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403 || error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const clienteService = {
  listar: (pagina = 0, tamanio = 10) => API.get(`/clientes?pagina=${pagina}&tamanio=${tamanio}`),
  obtener: (id) => API.get(`/clientes/${id}`),
  crear: (data) => API.post('/clientes', data),
  actualizar: (id, data) => API.put(`/clientes/${id}`, data),
  eliminar: (id) => API.delete(`/clientes/${id}`)
};

export const prestamoService = {
  listarPorCliente: (clienteId, pagina = 0, tamanio = 10) => API.get(`/prestamos/cliente/${clienteId}?pagina=${pagina}&tamanio=${tamanio}`),
  crear: (data) => API.post('/prestamos', data),
  amortizaciones: (prestamoId) => API.get(`/prestamos/${prestamoId}/amortizaciones`),
  exportarPdf: (prestamoId) => API.get(`/prestamos/${prestamoId}/pdf`, { responseType: 'blob' }),
  exportarExcel: (prestamoId) => API.get(`/prestamos/${prestamoId}/excel`, { responseType: 'blob' }),
  previewSolicitud: (data) => API.post('/prestamos/solicitud/preview', data, { responseType: 'blob' }),
  subirContrato: (formData) => API.post('/prestamos/contrato/subir', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  descargarContrato: (nombreArchivo) => API.get(`/prestamos/contrato/${nombreArchivo}`, { responseType: 'blob' }),
};

export const pagoService = {
  registrar: (data) => API.post('/pagos', data),
  listarPorPrestamo: (prestamoId, pagina = 0, tamanio = 10) => API.get(`/pagos/prestamo/${prestamoId}?pagina=${pagina}&tamanio=${tamanio}`),
};

export const bitacoraService = {
  listar: (pagina = 0, tamanio = 10) => API.get(`/bitacora?pagina=${pagina}&tamanio=${tamanio}`),
  listarPorUsuario: (usuario, pagina = 0, tamanio = 10) => API.get(`/bitacora/usuario/${usuario}?pagina=${pagina}&tamanio=${tamanio}`),
  listarPorEntidad: (entidad, pagina = 0, tamanio = 10) => API.get(`/bitacora/entidad/${entidad}?pagina=${pagina}&tamanio=${tamanio}`)
};

export const reporteService = {
  clientes: (inicio, fin, pagina = 0, tamanio = 10) => API.get(`/reportes/clientes?inicio=${inicio}&fin=${fin}&pagina=${pagina}&tamanio=${tamanio}`),
  prestamos: (inicio, fin, pagina = 0, tamanio = 10) => API.get(`/reportes/prestamos?inicio=${inicio}&fin=${fin}&pagina=${pagina}&tamanio=${tamanio}`),
  pagos: (inicio, fin, pagina = 0, tamanio = 10) => API.get(`/reportes/pagos?inicio=${inicio}&fin=${fin}&pagina=${pagina}&tamanio=${tamanio}`)
};

export const usuarioService = {
  listar: (pagina = 0, tamanio = 10) => API.get(`/usuarios?pagina=${pagina}&tamanio=${tamanio}`),
  crear: (data) => API.post('/usuarios', data),
  obtener: (id) => API.get(`/usuarios/${id}`),
  actualizarRoles: (id, roles) => API.put(`/usuarios/${id}/roles`, roles),
  toggleActivo: (id) => API.put(`/usuarios/${id}/toggle`)
};

export const rolService = {
  listar: () => API.get('/roles'),
  crear: (data) => API.post('/roles', data)
};

export const dashboardService = {
  obtener: () => API.get('/dashboard')
};