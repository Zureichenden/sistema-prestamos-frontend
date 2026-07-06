import http from './http';

const clienteService = {
  listar: (pagina = 0, tamanio = 10) => http.get(`/clientes?pagina=${pagina}&tamanio=${tamanio}`),
  obtener: (id) => http.get(`/clientes/${id}`),
  crear: (data) => http.post('/clientes', data),
  actualizar: (id, data) => http.put(`/clientes/${id}`, data),
  eliminar: (id) => http.delete(`/clientes/${id}`)
};

export default clienteService;