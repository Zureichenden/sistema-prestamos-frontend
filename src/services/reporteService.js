import http from './http';

const reporteService = {
  clientes: (inicio, fin, pagina = 0, tamanio = 10) =>
    http.get(`/reportes/clientes?inicio=${inicio}&fin=${fin}&pagina=${pagina}&tamanio=${tamanio}`),
  prestamos: (inicio, fin, pagina = 0, tamanio = 10) =>
    http.get(`/reportes/prestamos?inicio=${inicio}&fin=${fin}&pagina=${pagina}&tamanio=${tamanio}`),
  pagos: (inicio, fin, pagina = 0, tamanio = 10) =>
    http.get(`/reportes/pagos?inicio=${inicio}&fin=${fin}&pagina=${pagina}&tamanio=${tamanio}`)
};

export default reporteService;