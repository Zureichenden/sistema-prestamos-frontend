import { useState, useEffect } from 'react';
import { clienteService, prestamoService, pagoService } from '../services/api';
import styles from './Pagos.module.css';

export default function Pagos() {
  const [clientes, setClientes] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [amortizaciones, setAmortizaciones] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [form, setForm] = useState({ prestamoId: '', amortizacionId: '', montoPagado: '', fechaPago: '', observaciones: '' });
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [paginaPagos, setPaginaPagos] = useState(0);
  const [totalPaginasPagos, setTotalPaginasPagos] = useState(0);
  const [totalPagos, setTotalPagos] = useState(0);
  const TAMANIO = 10;

  useEffect(() => {
    clienteService.listar(0, 100).then(r => setClientes(r.data.content));
  }, []);

  const cargarPagos = async (prestamoId, pag) => {
    const res = await pagoService.listarPorPrestamo(prestamoId, pag, TAMANIO);
    setPagos(res.data.content);
    setTotalPaginasPagos(res.data.totalPages);
    setTotalPagos(res.data.totalElements);
    setPaginaPagos(pag);
  };

  const handleClienteChange = async (e) => {
    const id = e.target.value;
    if (id) {
      const res = await prestamoService.listarPorCliente(id, 0, 100);
      setPrestamos(res.data.content.filter(p => p.estatus === 'ACTIVO'));
      setAmortizaciones([]); setPagos([]);
      setForm({ prestamoId: '', amortizacionId: '', montoPagado: '', fechaPago: '', observaciones: '' });
    }
  };

  const handlePrestamoChange = async (e) => {
    const id = e.target.value;
    setForm({ ...form, prestamoId: id, amortizacionId: '', montoPagado: '' });
    if (id) {
      const amort = await prestamoService.amortizaciones(id);
      setAmortizaciones(amort.data.filter(a => a.estatus === 'PENDIENTE'));
      await cargarPagos(id, 0);
    }
  };

  const handleAmortizacionChange = (e) => {
    const id = e.target.value;
    const amort = amortizaciones.find(a => a.id === parseInt(id));
    setForm({ ...form, amortizacionId: id, montoPagado: amort?.cuota || '' });
  };

  const handleSubmit = async () => {
    setError(''); setMensaje('');
    try {
      await pagoService.registrar({
        ...form,
        prestamoId: parseInt(form.prestamoId),
        amortizacionId: parseInt(form.amortizacionId),
        montoPagado: parseFloat(form.montoPagado)
      });
      setMensaje('Pago registrado correctamente');
      handlePrestamoChange({ target: { value: form.prestamoId } });
      await cargarPagos(form.prestamoId, 0);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al registrar pago');
    }
  };

  const tipoBadge = (tipo) => {
    const map = { NORMAL: styles.badgeNormal, ADELANTADO: styles.badgeActive, PARCIAL: styles.badgePending };
    return <span className={`${styles.badge} ${map[tipo] || styles.badgeNormal}`}>{tipo}</span>;
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>💳 Pagos</h1>
        <p className={styles.pageSubtitle}>Registra y consulta los pagos de préstamos</p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>➕ Registrar Pago</span>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Cliente</label>
            <select onChange={handleClienteChange}>
              <option value="">Seleccionar...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Préstamo</label>
            <select value={form.prestamoId} onChange={handlePrestamoChange}>
              <option value="">Seleccionar...</option>
              {prestamos.map(p => <option key={p.id} value={p.id}>#{p.id} — ${p.monto?.toLocaleString('es-MX')}</option>)}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Cuota a Pagar</label>
            <select value={form.amortizacionId} onChange={handleAmortizacionChange}>
              <option value="">Seleccionar...</option>
              {amortizaciones.map(a => <option key={a.id} value={a.id}>Pago #{a.numPago} — {a.fechaVencimiento}</option>)}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Monto ($)</label>
            <input type="number" value={form.montoPagado}
              onChange={e => setForm({ ...form, montoPagado: e.target.value })} placeholder="0.00" />
          </div>
          <div className={styles.formGroup}>
            <label>Fecha de Pago</label>
            <input type="date" value={form.fechaPago}
              onChange={e => setForm({ ...form, fechaPago: e.target.value })} />
          </div>
          <div className={styles.formGroup}>
            <label>Observaciones</label>
            <input value={form.observaciones}
              onChange={e => setForm({ ...form, observaciones: e.target.value })} placeholder="Opcional" />
          </div>
        </div>
        {error && <div className={styles.error}>⚠️ {error}</div>}
        {mensaje && <div className={styles.success}>✅ {mensaje}</div>}
        <div className={styles.formActions}>
          <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={handleSubmit}>
            💳 Registrar Pago
          </button>
        </div>
      </div>

      {pagos.length > 0 && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>📜 Historial de Pagos</span>
            <span className={styles.cardCount}>{pagos.length} pago(s)</span>
          </div>
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr><th>ID</th><th>Cuota #</th><th>Monto</th><th>Fecha</th><th>Tipo</th><th>Observaciones</th></tr>
              </thead>
              <tbody>
                {pagos.map(p => (
                  <tr key={p.id}>
                    <td className={styles.idCell}>#{p.id}</td>
                    <td style={{ fontWeight: 600 }}>Pago #{p.numPago}</td>
                    <td className={styles.montoCell}>${p.montoPagado?.toLocaleString('es-MX')}</td>
                    <td>{p.fechaPago}</td>
                    <td>{tipoBadge(p.tipoPago)}</td>
                    <td className={styles.mutedCell}>{p.observaciones || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPaginasPagos > 1 && (
              <div className={styles.paginacion}>
                <button
                  className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
                  onClick={() => cargarPagos(form.prestamoId, paginaPagos - 1)}
                  disabled={paginaPagos === 0}>
                  ← Anterior
                </button>
                <span className={styles.paginacionInfo}>
                  Página {paginaPagos + 1} de {totalPaginasPagos} — {totalPagos} pagos
                </span>
                <button
                  className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
                  onClick={() => cargarPagos(form.prestamoId, paginaPagos + 1)}
                  disabled={paginaPagos >= totalPaginasPagos - 1}>
                  Siguiente →
                </button>
              </div>
            )}


          </div>
        </div>
      )}
    </div>
  );
}