import { useState, useEffect } from 'react';
import { bitacoraService } from '../services/api';
import styles from './Bitacora.module.css';

export default function Bitacora() {
  const [registros, setRegistros] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const [filtroEntidad, setFiltroEntidad] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const TAMANIO = 10;

  useEffect(() => { cargar(0); }, []);

  const cargar = async (pag, entidad = filtroEntidad, usuario = filtroUsuario) => {
    try {
      let res;
      if (entidad) {
        res = await bitacoraService.listarPorEntidad(entidad, pag, TAMANIO);
      } else if (usuario) {
        res = await bitacoraService.listarPorUsuario(usuario, pag, TAMANIO);
      } else {
        res = await bitacoraService.listar(pag, TAMANIO);
      }
      setRegistros(res.data.content);
      setTotalPaginas(res.data.totalPages);
      setTotalElementos(res.data.totalElements);
      setPagina(pag);
    } catch (e) {
      console.error('Error cargando bitácora', e);
    }
  };

  const handleFiltrar = () => cargar(0);

  const handleLimpiar = () => {
    setFiltroEntidad('');
    setFiltroUsuario('');
    cargar(0, '', '');
  };

  const accionBadge = (accion) => {
    const map = {
      CREAR: styles.badgeCrear,
      ACTUALIZAR: styles.badgeActualizar,
      ELIMINAR: styles.badgeEliminar
    };
    return <span className={`${styles.badge} ${map[accion] || ''}`}>{accion}</span>;
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleString('es-MX', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>📋 Bitácora</h1>
        <p className={styles.pageSubtitle}>Historial de todas las acciones realizadas en el sistema</p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>🔍 Filtros</span>
        </div>
        <div className={styles.filtros}>
          <select value={filtroEntidad} onChange={e => setFiltroEntidad(e.target.value)}>
            <option value="">Todas las entidades</option>
            <option value="CLIENTE">Cliente</option>
            <option value="PRESTAMO">Préstamo</option>
            <option value="PAGO">Pago</option>
          </select>
          <input
            placeholder="Filtrar por usuario..."
            value={filtroUsuario}
            onChange={e => setFiltroUsuario(e.target.value)}
          />
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleFiltrar}>
            Filtrar
          </button>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={handleLimpiar}>
            Limpiar
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>📋 Registros</span>
          <span className={styles.cardCount}>{totalElementos} registros</span>
        </div>

        {registros.length === 0 ? (
          <div className={styles.emptyState}>
            <div style={{ fontSize: '2.5rem' }}>📋</div>
            <p>No hay registros en la bitácora</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Entidad</th>
                  <th>ID Registro</th>
                  <th>Detalle</th>
                  <th>Fecha y Hora</th>
                </tr>
              </thead>
              <tbody>
                {registros.map(r => (
                  <tr key={r.id}>
                    <td className={styles.idCell}>#{r.id}</td>
                    <td style={{ fontWeight: 500 }}>👤 {r.usuario}</td>
                    <td>{accionBadge(r.accion)}</td>
                    <td><span className={styles.entidadBadge}>{r.entidad}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>#{r.entidadId}</td>
                    <td className={styles.detalleCell}>{r.detalle}</td>
                    <td className={styles.fechaCell}>{formatFecha(r.fechaHora)}</td>
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