import http from './http';

const prestamoService = {
  listarPorCliente: (clienteId, pagina = 0, tamanio = 10) =>
    http.get(`/prestamos/cliente/${clienteId}?pagina=${pagina}&tamanio=${tamanio}`),
  crear: (data) => http.post('/prestamos', data),
  amortizaciones: (prestamoId) => http.get(`/prestamos/${prestamoId}/amortizaciones`),
  exportarPdf: (prestamoId) => http.get(`/prestamos/${prestamoId}/pdf`, { responseType: 'blob' }),
  exportarExcel: (prestamoId) => http.get(`/prestamos/${prestamoId}/excel`, { responseType: 'blob' }),
  previewSolicitud: (data) => http.post('/prestamos/solicitud/preview', data, { responseType: 'blob' }),
  subirContrato: (formData) => http.post('/prestamos/contrato/subir', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  descargarContrato: (nombreArchivo) =>
    http.get(`/prestamos/contrato/${nombreArchivo}`, { responseType: 'blob' })
};

export default prestamoService;