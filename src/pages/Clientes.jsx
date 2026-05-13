import { useState, useEffect } from 'react';
import { clienteService } from '../services/api';
import styles from './Clientes.module.css';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', rfc: '', telefono: '' });
  const [editId, setEditId] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const TAMANIO = 10;

  useEffect(() => { cargar(0); }, []);

  const cargar = async (pag = 0) => {
    const res = await clienteService.listar(pag, TAMANIO);
    setClientes(res.data.content);
    setTotalPaginas(res.data.totalPages);
    setTotalElementos(res.data.totalElements);
    setPagina(pag);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setError(''); setMensaje('');
    try {
      if (editId) {
        await clienteService.actualizar(editId, form);
        setMensaje('Cliente actualizado correctamente');
        setEditId(null);
      } else {
        await clienteService.crear(form);
        setMensaje('Cliente creado correctamente');
      }
      setForm({ nombre: '', apellido: '', email: '', rfc: '', telefono: '' });
      cargar();
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar');
    }
  };

  const handleEditar = (c) => {
    setEditId(c.id);
    setForm({ nombre: c.nombre, apellido: c.apellido, email: c.email, rfc: c.rfc, telefono: c.telefono });
    setMensaje(''); setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este cliente?')) return;
    try {
      await clienteService.eliminar(id);
      cargar();
    } catch (e) {
      setError('No se pudo eliminar el cliente');
    }
  };

  const fields = [
    { name: 'nombre', label: 'Nombre', placeholder: 'Juan' },
    { name: 'apellido', label: 'Apellido', placeholder: 'Pérez' },
    { name: 'email', label: 'Email', placeholder: 'juan@email.com' },
    { name: 'rfc', label: 'RFC', placeholder: 'PEJJ900101ABC' },
    { name: 'telefono', label: 'Teléfono', placeholder: '6671234567' },
  ];

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>👤 Clientes</h1>
        <p className={styles.pageSubtitle}>Administra los clientes del sistema</p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>
            {editId ? '✏️ Editar Cliente' : '➕ Nuevo Cliente'}
          </span>
        </div>
        <div className={styles.formGrid}>
          {fields.map(f => (
            <div className={styles.formGroup} key={f.name}>
              <label>{f.label}</label>
              <input
                name={f.name}
                value={form[f.name]}
                onChange={handleChange}
                placeholder={f.placeholder}
              />
            </div>
          ))}
        </div>
        {error && <div className={styles.error}>⚠️ {error}</div>}
        {mensaje && <div className={styles.success}>✅ {mensaje}</div>}
        <div className={styles.formActions}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSubmit}>
            {editId ? '💾 Actualizar' : '➕ Guardar'}
          </button>
          {editId && (
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => {
              setEditId(null);
              setForm({ nombre: '', apellido: '', email: '', rfc: '', telefono: '' });
              setError(''); setMensaje('');
            }}>
              Cancelar
            </button>
          )}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>📋 Lista de Clientes</span>
          <span className={styles.cardCount}>{clientes.length} registros</span>
        </div>
        {clientes.length === 0 ? (
          <div className={styles.emptyState}>
            <div style={{ fontSize: '2.5rem' }}>👤</div>
            <p>No hay clientes registrados aún</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Nombre</th><th>Email</th><th>RFC</th><th>Teléfono</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map(c => (
                  <tr key={c.id}>
                    <td className={styles.idCell}>#{c.id}</td>
                    <td className={styles.nameCell}>{c.nombre} {c.apellido}</td>
                    <td>{c.email}</td>
                    <td><code className={styles.rfc}>{c.rfc}</code></td>
                    <td>{c.telefono}</td>
                    <td>
                      <div className={styles.actions}>
                        <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`} onClick={() => handleEditar(c)}>Editar</button>
                        <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`} onClick={() => handleEliminar(c.id)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPaginas > 1 && (
              <div className={styles.paginacion}>
                <button
                  className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
                  onClick={() => cargar(pagina - 1)}
                  disabled={pagina === 0}>
                  ← Anterior
                </button>
                <span className={styles.paginacionInfo}>
                  Página {pagina + 1} de {totalPaginas} — {totalElementos} registros
                </span>
                <button
                  className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
                  onClick={() => cargar(pagina + 1)}
                  disabled={pagina >= totalPaginas - 1}>
                  Siguiente →
                </button>
              </div>
)}


          </div>
        )}


      </div>
    </div>
  );
}