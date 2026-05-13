import { useState } from 'react';
import { reporteService } from '../services/api';
import styles from './Reportes.module.css';

const hoy = new Date().toISOString().split('T')[0];
const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  .toISOString().split('T')[0];

export default function Reportes() {
  const [tabActiva, setTabActiva] = useState('clientes');
  const [inicio, setInicio] = useState(primerDiaMes);
  const [fin, setFin] = useState(hoy);
  const [datos, setDatos] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const [error, setError] = useState('');
  const [buscado, setBuscado] = useState(false);
  const TAMANIO = 10;

  const buscar = async (pag = 0) => {
    setError('');
    try {
      let res;
      if (tabActiva === 'clientes') res = await reporteService.clientes(inicio, fin, pag, TAMANIO);
      else if (tabActiva === 'prestamos') res = await reporteService.prestamos(inicio, fin, pag, TAMANIO);
      else res = await reporteService.pagos(inicio, fin, pag, TAMANIO);

      setDatos(res.data.content);
      setTotalPaginas(res.data.totalPages);
      setTotalElementos(res.data.totalElements);
      setPagina(pag);
      setBuscado(true);
    } catch (e) {
      setError('Error al generar el reporte');
    }
  };

  const handleTabChange = (tab) => {
    setTabActiva(tab);
    setDatos([]);
    setBuscado(false);
    setPagina(0);
  };

  const totalMonto = () => {
    if (tabActiva === 'prestamos') return datos.reduce((sum, p) => sum + (p.monto || 0), 0);
    if (tabActiva === 'pagos') return datos.reduce((sum, p) => sum + (p.montoPagado || 0), 0);
    return null;
  };

  const estatusBadge = (estatus) => {
    const map = { ACTIVO: styles.badgeActivo, LIQUIDADO: styles.badgeLiquidado, VENCIDO: styles.badgeVencido };
    return <span className={`${styles.badge} ${map[estatus] || ''}`}>{estatus}</span>;
  };

  const tipoBadge = (tipo) => {
    const map = { NORMAL: styles.badgeNormal, ADELANTADO: styles.badgeAdelantado, PARCIAL: styles.badgeParcial };
    return <span className={`${styles.badge} ${map[tipo] || styles.badgeNormal}`}>{tipo}</span>;
  };

  const formatFecha = (fecha) => fecha ? new Date(fecha).toLocaleDateString('es-MX') : '—';

  const renderTabla = () => {
    if (tabActiva === 'clientes') return (
      <table>
        <thead>
          <tr><th>ID</th><th>Nombre</th><th>Email</th><th>RFC</th><th>Teléfono</th><th>Registro</th></tr>
        </thead>
        <tbody>
          {datos.map(c => (
            <tr key={c.id}>
              <td className={styles.idCell}>#{c.id}</td>
              <td style={{ fontWeight: 500 }}>{c.nombre} {c.apellido}</td>
              <td>{c.email}</td>
              <td><code className={styles.rfcCell}>{c.rfc}</code></td>
              <td>{c.telefono}</td>
              <td className={styles.fechaCell}>{formatFecha(c.fechaRegistro)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );

    if (tabActiva === 'prestamos') return (
      <table>
        <thead>
          <tr><th>ID</th><th>Cliente</th><th>Monto</th><th>Tasa</th><th>Pagos</th><th>Inicio</th><th>Estatus</th></tr>
        </thead>
        <tbody>
          {datos.map(p => (
            <tr key={p.id}>
              <td className={styles.idCell}>#{p.id}</td>
              <td style={{ fontWeight: 500 }}>{p.clienteNombre}</td>
              <td className={styles.montoCell}>${p.monto?.toLocaleString('es-MX')}</td>
              <td>{p.tasaInteres}%</td>
              <td>{p.numPagos} meses</td>
              <td className={styles.fechaCell}>{p.fechaInicio}</td>
              <td>{estatusBadge(p.estatus)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );

    return (
      <table>
        <thead>
          <tr><th>ID</th><th>Cliente</th><th>Préstamo</th><th>Monto</th><th>Fecha</th><th>Tipo</th><th>Observaciones</th></tr>
        </thead>
        <tbody>
          {datos.map(p => (
            <tr key={p.id}>
              <td className={styles.idCell}>#{p.id}</td>
              <td style={{ fontWeight: 500 }}>{p.clienteNombre}</td>
              <td className={styles.idCell}>#{p.prestamoId}</td>
              <td className={styles.montoCell}>${p.montoPagado?.toLocaleString('es-MX')}</td>
              <td className={styles.fechaCell}>{p.fechaPago}</td>
              <td>{tipoBadge(p.tipoPago)}</td>
              <td style={{ color: 'var(--text-muted)' }}>{p.observaciones || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>📊 Reportes</h1>
        <p className={styles.pageSubtitle}>Consulta registros por rango de fechas</p>
      </div>

      <div className={styles.tabs}>
        {[
          { key: 'clientes', label: '👤 Clientes' },
          { key: 'prestamos', label: '📋 Préstamos' },
          { key: 'pagos', label: '💳 Pagos' }
        ].map(t => (
          <button key={t.key}
            className={`${styles.tab} ${tabActiva === t.key ? styles.tabActive : ''}`}
            onClick={() => handleTabChange(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>🗓️ Rango de Fechas</span>
        </div>
        <div className={styles.filtros}>
          <div className={styles.formGroup}>
            <label>Fecha Inicial</label>
            <input type="date" value={inicio} onChange={e => setInicio(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label>Fecha Final</label>
            <input type="date" value={fin} onChange={e => setFin(e.target.value)} />
          </div>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => buscar(0)}>
            🔍 Generar Reporte
          </button>
        </div>
        {error && <div className={styles.error}>⚠️ {error}</div>}
      </div>

      {buscado && (
        <>
          <div className={styles.resumen}>
            <div className={styles.resumenCard}>
              <div className={styles.resumenLabel}>Total Registros</div>
              <div className={styles.resumenValue}>{totalElementos}</div>
            </div>
            {totalMonto() !== null && (
              <div className={styles.resumenCard}>
                <div className={styles.resumenLabel}>
                  {tabActiva === 'prestamos' ? 'Total Prestado' : 'Total Cobrado'}
                </div>
                <div className={styles.resumenValue}>
                  ${totalMonto().toLocaleString('es-MX')}
                </div>
              </div>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>
                {tabActiva === 'clientes' ? '👤 Clientes Registrados' :
                 tabActiva === 'prestamos' ? '📋 Préstamos Generados' : '💳 Pagos Realizados'}
              </span>
              <span className={styles.cardCount}>{totalElementos} resultado(s)</span>
            </div>

            {datos.length === 0 ? (
              <div className={styles.emptyState}>
                <div style={{ fontSize: '2.5rem' }}>🔍</div>
                <p>No hay registros en el rango de fechas seleccionado</p>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                {renderTabla()}
                {totalPaginas > 1 && (
                  <div className={styles.paginacion}>
                    <button
                      className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
                      onClick={() => buscar(pagina - 1)}
                      disabled={pagina === 0}>
                      ← Anterior
                    </button>
                    <span className={styles.paginacionInfo}>
                      Página {pagina + 1} de {totalPaginas} — {totalElementos} registros
                    </span>
                    <button
                      className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
                      onClick={() => buscar(pagina + 1)}
                      disabled={pagina >= totalPaginas - 1}>
                      Siguiente →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}