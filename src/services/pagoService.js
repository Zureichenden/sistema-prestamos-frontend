import http from './http';

const pagoService = {
  registrar: (data) => http.post('/pagos', data),
  listarPorPrestamo: (prestamoId, pagina = 0, tamanio = 10) =>
    http.get(`/pagos/prestamo/${prestamoId}?pagina=${pagina}&tamanio=${tamanio}`)
};

export default pagoService;