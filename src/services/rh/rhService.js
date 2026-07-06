import http from '../http';

const rhService = {
  listarPuestos: () => http.get('/rh/puestos/todos'),
  crearPuesto: (data) => http.post('/rh/puestos', data),
  actualizarPuesto: (id, data) => http.put(`/rh/puestos/${id}`, data),
  eliminarPuesto: (id) => http.delete(`/rh/puestos/${id}`),

  listarDepartamentos: () => http.get('/rh/departamentos/todos'),
  crearDepartamento: (data) => http.post('/rh/departamentos', data),
  actualizarDepartamento: (id, data) => http.put(`/rh/departamentos/${id}`, data),
  eliminarDepartamento: (id) => http.delete(`/rh/departamentos/${id}`),

  listarSalarios: () => http.get('/rh/salarios/todos'),
  crearSalario: (data) => http.post('/rh/salarios', data),
  actualizarSalario: (id, data) => http.put(`/rh/salarios/${id}`, data),
  eliminarSalario: (id) => http.delete(`/rh/salarios/${id}`)
};

export default rhService;