import http from './http';

const rolService = {
  listar: () => http.get('/roles'),
  crear: (data) => http.post('/roles', data)
};

export default rolService;