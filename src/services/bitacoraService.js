import http from './http';

const bitacoraService = {
  listar: (pagina = 0, tamanio = 10) =>
    http.get(`/bitacora?pagina=${pagina}&tamanio=${tamanio}`),
  listarPorUsuario: (usuario, pagina = 0, tamanio = 10) =>
    http.get(`/bitacora/usuario/${usuario}?pagina=${pagina}&tamanio=${tamanio}`),
  listarPorEntidad: (entidad, pagina = 0, tamanio = 10) =>
    http.get(`/bitacora/entidad/${entidad}?pagina=${pagina}&tamanio=${tamanio}`)
};

export default bitacoraService;