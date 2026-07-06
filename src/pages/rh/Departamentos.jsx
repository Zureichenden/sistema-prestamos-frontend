import { useState, useEffect } from 'react';
import rhService from '../../services/rh/rhService';

import styles from './Departamentos.module.css';

export default function Departamentos() {
  const [departamentos, setDepartamentos] = useState([]);
  const [form, setForm] = useState({ nombre: '', descripcion: '' });
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    const res = await rhService.listarDepartamentos();
    setDepartamentos(res.data);
  };

  const handleSubmit = async () => {
    setError(''); setMensaje('');
    try {
      if (editando) {
        await rhService.actualizarDepartamento(editando, form);
        setMensaje('Departamento actualizado correctamente');
      } else {
        await rhService.crearDepartamento(form);
        setMensaje('Departamento creado correctamente');
      }
      reset();
      cargar();
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar');
    }
  };

  const handleEditar = (d) => {
    setEditando(d.id);
    setForm({ nombre: d.nombre, descripcion: d.descripcion || '' });
    setError(''); setMensaje('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este departamento?')) return;
    try {
      await rhService.eliminarDepartamento(id);
      cargar();
    } catch (e) {
      setError(e.response?.data?.error || 'No se puede eliminar');
    }
  };

  const reset = () => {
    setForm({ nombre: '', descripcion: '' });
    setEditando(null);
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>🏢 Departamentos</h1>
        <p className={styles.pageSubtitle}>Catálogo de departamentos de la empresa</p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>{editando ? '✏️ Editar Departamento' : '➕ Nuevo Departamento'}</span>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Nombre</label>
            <input placeholder="Tecnología" value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div className={styles.formGroup}>
            <label>Descripción</label>
            <input placeholder="Departamento de TI" value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })} />
          </div>
        </div>
        {error && <div className={styles.error}>⚠️ {error}</div>}
        {mensaje && <div className={styles.success}>✅ {mensaje}</div>}
        <div className={styles.formActions}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSubmit}>
            {editando ? '💾 Actualizar' : '➕ Guardar'}
          </button>
          {editando && (
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={reset}>Cancelar</button>
          )}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>🏢 Lista de Departamentos</span>
          <span className={styles.cardCount}>{departamentos.length} departamentos</span>
        </div>
        {departamentos.length === 0 ? (
          <div className={styles.emptyState}>
            <div style={{ fontSize: '2.5rem' }}>🏢</div>
            <p>No hay departamentos registrados</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr><th>ID</th><th>Nombre</th><th>Descripción</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {departamentos.map(d => (
                  <tr key={d.id}>
                    <td className={styles.idCell}>#{d.id}</td>
                    <td style={{ fontWeight: 600 }}>{d.nombre}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{d.descripcion || '—'}</td>
                    <td>
                      <div className={styles.actions}>
                        <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                          onClick={() => handleEditar(d)}>Editar</button>
                        <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                          onClick={() => handleEliminar(d.id)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}