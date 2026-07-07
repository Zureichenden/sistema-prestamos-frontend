import http from '../http';

const empleadoService = {
  listar: (pagina = 0, tamanio = 10) =>
    http.get(`/empleados?pagina=${pagina}&tamanio=${tamanio}`),
  listarActivos: (pagina = 0, tamanio = 10) =>
    http.get(`/empleados/activos?pagina=${pagina}&tamanio=${tamanio}`),
  obtener: (id) => http.get(`/empleados/${id}`),
  crear: (data) => http.post('/empleados', data),
  actualizar: (id, data) => http.put(`/empleados/${id}`, data),
  cambiarPuesto: (id, puestoId) => http.put(`/empleados/${id}/puesto/${puestoId}`),
  cambiarDepartamento: (id, deptoId) => http.put(`/empleados/${id}/departamento/${deptoId}`),
  cambiarSalario: (id, salarioId) => http.put(`/empleados/${id}/salario/${salarioId}`),
  darBaja: (id) => http.put(`/empleados/${id}/baja`),
  reactivar: (id) => http.put(`/empleados/${id}/reactivar`),

  listarDirecciones: (id) => http.get(`/empleados/${id}/direcciones`),
  agregarDireccion: (id, data) => http.post(`/empleados/${id}/direcciones`, data),
  eliminarDireccion: (id) => http.delete(`/empleados/direcciones/${id}`),

  listarTelefonos: (id) => http.get(`/empleados/${id}/telefonos`),
  agregarTelefono: (id, data) => http.post(`/empleados/${id}/telefonos`, data),
  eliminarTelefono: (id) => http.delete(`/empleados/telefonos/${id}`),

  listarBeneficiarios: (id) => http.get(`/empleados/${id}/beneficiarios`),
  agregarBeneficiario: (id, data) => http.post(`/empleados/${id}/beneficiarios`, data),
  eliminarBeneficiario: (id) => http.delete(`/empleados/beneficiarios/${id}`),

  listarBitacora: (id) => http.get(`/empleados/${id}/bitacora`),
  listarTodaBitacora: (pagina = 0, tamanio = 10) =>
    http.get(`/empleados/bitacora/todos?pagina=${pagina}&tamanio=${tamanio}`),

  crearUsuario: (empleadoId, data) => http.post(`/usuarios/empleado/${empleadoId}`, data),
  obtenerUsuario: (empleadoId) => http.get(`/usuarios/empleado/${empleadoId}`),
};

export default empleadoService;