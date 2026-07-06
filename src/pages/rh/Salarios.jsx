import { useState, useEffect } from 'react';
import rhService from '../../services/rh/rhService';
import styles from './Salarios.module.css';

export default function Salarios() {
  const [salarios, setSalarios] = useState([]);
  const [form, setForm] = useState({ monto: '', descripcion: '', fechaVigencia: '' });
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    const res = await rhService.listarSalarios();
    setSalarios(res.data);
  };

  const handleSubmit = async () => {
    setError(''); setMensaje('');
    try {
      const data = { ...form, monto: parseFloat(form.monto) };
      if (editando) {
        await rhService.actualizarSalario(editando, data);
        setMensaje('Salario actualizado correctamente');
      } else {
        await rhService.crearSalario(data);
        setMensaje('Salario creado correctamente');
      }
      reset();
      cargar();
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar');
    }
  };

  const handleEditar = (s) => {
    setEditando(s.id);
    setForm({ monto: s.monto, descripcion: s.descripcion || '', fechaVigencia: s.fechaVigencia });
    setError(''); setMensaje('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este salario?')) return;
    try {
      await rhService.eliminarSalario(id);
      cargar();
    } catch (e) {
      setError(e.response?.data?.error || 'No se puede eliminar');
    }
  };

  const reset = () => {
    setForm({ monto: '', descripcion: '', fechaVigencia: '' });
    setEditando(null);
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>💰 Salarios</h1>
        <p className={styles.pageSubtitle}>Catálogo de salarios</p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>{editando ? '✏️ Editar Salario' : '➕ Nuevo Salario'}</span>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Monto ($)</label>
            <input type="number" placeholder="15000" value={form.monto}
              onChange={e => setForm({ ...form, monto: e.target.value })} />
          </div>
          <div className={styles.formGroup}>
            <label>Descripción</label>
            <input placeholder="Salario inicial" value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div className={styles.formGroup}>
            <label>Fecha Vigencia</label>
            <input type="date" value={form.fechaVigencia}
              onChange={e => setForm({ ...form, fechaVigencia: e.target.value })} />
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
          <span className={styles.cardTitle}>💰 Lista de Salarios</span>
          <span className={styles.cardCount}>{salarios.length} salarios</span>
        </div>
        {salarios.length === 0 ? (
          <div className={styles.emptyState}>
            <div style={{ fontSize: '2.5rem' }}>💰</div>
            <p>No hay salarios registrados</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr><th>ID</th><th>Monto</th><th>Descripción</th><th>Vigencia</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {salarios.map(s => (
                  <tr key={s.id}>
                    <td className={styles.idCell}>#{s.id}</td>
                    <td><span className={styles.montoBadge}>${Number(s.monto).toLocaleString('es-MX')}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s.descripcion || '—'}</td>
                    <td>{s.fechaVigencia}</td>
                    <td>
                      <div className={styles.actions}>
                        <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                          onClick={() => handleEditar(s)}>Editar</button>
                        <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                          onClick={() => handleEliminar(s.id)}>Eliminar</button>
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