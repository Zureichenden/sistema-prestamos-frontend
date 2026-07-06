import { useState, useEffect } from 'react';
import rhService from '../../services/rh/rhService';
import styles from './Puestos.module.css';

export default function Puestos() {
  const [puestos, setPuestos] = useState([]);
  const [form, setForm] = useState({ nombre: '', descripcion: '', nivel: '' });
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    const res = await rhService.listarPuestos();
    setPuestos(res.data);
  };

  const handleSubmit = async () => {
    setError(''); setMensaje('');
    try {
      const data = { ...form, nivel: form.nivel ? parseInt(form.nivel) : null };
      if (editando) {
        await rhService.actualizarPuesto(editando, data);
        setMensaje('Puesto actualizado correctamente');
      } else {
        await rhService.crearPuesto(data);
        setMensaje('Puesto creado correctamente');
      }
      reset();
      cargar();
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar');
    }
  };

  const handleEditar = (p) => {
    setEditando(p.id);
    setForm({ nombre: p.nombre, descripcion: p.descripcion || '', nivel: p.nivel || '' });
    setError(''); setMensaje('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este puesto?')) return;
    try {
      await rhService.eliminarPuesto(id);
      cargar();
    } catch (e) {
      setError(e.response?.data?.error || 'No se puede eliminar');
    }
  };

  const reset = () => {
    setForm({ nombre: '', descripcion: '', nivel: '' });
    setEditando(null);
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>💼 Puestos</h1>
        <p className={styles.pageSubtitle}>Catálogo de puestos de trabajo</p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>{editando ? '✏️ Editar Puesto' : '➕ Nuevo Puesto'}</span>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Nombre</label>
            <input placeholder="Desarrollador" value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div className={styles.formGroup}>
            <label>Descripción</label>
            <input placeholder="Descripción del puesto" value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div className={styles.formGroup}>
            <label>Nivel</label>
            <input type="number" placeholder="1" value={form.nivel}
              onChange={e => setForm({ ...form, nivel: e.target.value })} />
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
          <span className={styles.cardTitle}>💼 Lista de Puestos</span>
          <span className={styles.cardCount}>{puestos.length} puestos</span>
        </div>
        {puestos.length === 0 ? (
          <div className={styles.emptyState}>
            <div style={{ fontSize: '2.5rem' }}>💼</div>
            <p>No hay puestos registrados</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr><th>ID</th><th>Nombre</th><th>Descripción</th><th>Nivel</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {puestos.map(p => (
                  <tr key={p.id}>
                    <td className={styles.idCell}>#{p.id}</td>
                    <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{p.descripcion || '—'}</td>
                    <td>{p.nivel && <span className={styles.nivelBadge}>Nivel {p.nivel}</span>}</td>
                    <td>
                      <div className={styles.actions}>
                        <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                          onClick={() => handleEditar(p)}>Editar</button>
                        <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                          onClick={() => handleEliminar(p.id)}>Eliminar</button>
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