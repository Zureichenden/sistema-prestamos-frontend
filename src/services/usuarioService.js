import http from './http';

const usuarioService = {
  listar: (pagina = 0, tamanio = 10) =>
    http.get(`/usuarios?pagina=${pagina}&tamanio=${tamanio}`),
  crear: (data) => http.post('/usuarios', data),
  obtener: (id) => http.get(`/usuarios/${id}`),
  actualizarRoles: (id, roles) => http.put(`/usuarios/${id}/roles`, roles),
  toggleActivo: (id) => http.put(`/usuarios/${id}/toggle`),
  cambiarPassword: (data) => http.put('/usuarios/cambiar-password', data),
  crearParaEmpleado: (empleadoId, data) => http.post(`/usuarios/empleado/${empleadoId}`, data),
  btenerPorEmpleado: (empleadoId) => http.get(`/usuarios/empleado/${empleadoId}`),
};

export default usuarioService;