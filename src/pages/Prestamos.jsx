import { useState, useEffect } from 'react';
import { clienteService, prestamoService } from '../services/api';
import styles from './Prestamos.module.css';

export default function Prestamos() {
  const [clientes, setClientes] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [amortizaciones, setAmortizaciones] = useState([]);
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [form, setForm] = useState({ monto: '', tasaInteres: '', numPagos: '', fechaInicio: '' });
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [paginaPrestamos, setPaginaPrestamos] = useState(0);
  const [totalPaginasPrestamos, setTotalPaginasPrestamos] = useState(0);
  const [totalPrestamos, setTotalPrestamos] = useState(0);
  const TAMANIO = 10;

  useEffect(() => {
    clienteService.listar(0, 100).then(r => {
      setClientes(r.data.content);
      if (r.data.content.length > 0) {
        const id = r.data.content[0].id;
        setClienteSeleccionado(id);
        cargarPrestamos(id, 0);
      }
    });
  }, []);

  // const handleClienteChange = async (e) => {
  //   const id = e.target.value;
  //   setClienteSeleccionado(id);
  //   setAmortizaciones([]);
  //   setPrestamoSeleccionado(null);
  //   if (id) {
  //     const res = await prestamoService.listarPorCliente(id);
  //     setPrestamos(res.data);
  //   }
  // };

  const cargarPrestamos = async (clienteId, pag) => {
    const res = await prestamoService.listarPorCliente(clienteId, pag, TAMANIO);
    setPrestamos(res.data.content);
    setTotalPaginasPrestamos(res.data.totalPages);
    setTotalPrestamos(res.data.totalElements);
    setPaginaPrestamos(pag);
  };

  const handleClienteChange = async (e) => {
    const id = e.target.value;
    setClienteSeleccionado(id);
    setAmortizaciones([]);
    setPrestamoSeleccionado(null);
    setPaginaPrestamos(0);
    if (id) await cargarPrestamos(id, 0);
  };

  const handleSubmit = async () => {
    setError(''); setMensaje('');
    try {
      await prestamoService.crear({
        clienteId: parseInt(clienteSeleccionado),
        monto: parseFloat(form.monto),
        tasaInteres: parseFloat(form.tasaInteres),
        numPagos: parseInt(form.numPagos),
        fechaInicio: form.fechaInicio
      });
      setMensaje('Préstamo creado y tabla de amortización generada');
      setForm({ monto: '', tasaInteres: '', numPagos: '', fechaInicio: '' });
      const res = await prestamoService.listarPorCliente(clienteSeleccionado);
      setPrestamos(res.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al crear préstamo');
    }
  };

  const verAmortizaciones = async (prestamo) => {
    setPrestamoSeleccionado(prestamo);
    const res = await prestamoService.amortizaciones(prestamo.id);
    setAmortizaciones(res.data);
    setTimeout(() => document.getElementById('tabla-amort')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const estatusBadge = (estatus) => {
    const map = { ACTIVO: styles.badgeActive, LIQUIDADO: styles.badgePaid, VENCIDO: styles.badgeOverdue };
    return <span className={`${styles.badge} ${map[estatus]}`}>{estatus}</span>;
  };

  const descargarPdf = async (prestamoId) => {
    const res = await prestamoService.exportarPdf(prestamoId);
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `amortizacion-prestamo-${prestamoId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const descargarExcel = async (prestamoId) => {
    const res = await prestamoService.exportarExcel(prestamoId);
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `amortizacion-prestamo-${prestamoId}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>📋 Préstamos</h1>
        <p className={styles.pageSubtitle}>Gestión de préstamos y tablas de amortización</p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>➕ Nuevo Préstamo</span>
        </div>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Cliente</label>
            <select value={clienteSeleccionado} onChange={handleClienteChange}>
              <option value="">Seleccionar...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Monto ($)</label>
            <input value={form.monto} onChange={e => setForm({ ...form, monto: e.target.value })} placeholder="50,000" type="number" />
          </div>
          <div className={styles.formGroup}>
            <label>Tasa Interés Anual (%)</label>
            <input value={form.tasaInteres} onChange={e => setForm({ ...form, tasaInteres: e.target.value })} placeholder="12" type="number" />
          </div>
          <div className={styles.formGroup}>
            <label>Número de Pagos</label>
            <input value={form.numPagos} onChange={e => setForm({ ...form, numPagos: e.target.value })} placeholder="12" type="number" />
          </div>
          <div className={styles.formGroup}>
            <label>Fecha de Inicio</label>
            <input value={form.fechaInicio} onChange={e => setForm({ ...form, fechaInicio: e.target.value })} type="date" />
          </div>
        </div>
        {error && <div className={styles.error}>⚠️ {error}</div>}
        {mensaje && <div className={styles.success}>✅ {mensaje}</div>}
        <div className={styles.formActions}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSubmit}>Crear Préstamo</button>
        </div>
      </div>

      {prestamos.length > 0 && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>💼 Préstamos del Cliente</span>
            <span className={styles.cardCount}>{prestamos.length} préstamo(s)</span>
          </div>
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr><th>ID</th><th>Monto</th><th>Tasa</th><th>Pagos</th><th>Inicio</th><th>Estatus</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {prestamos.map(p => (
                  <tr key={p.id}>
                    <td className={styles.idCell}>#{p.id}</td>
                    <td className={styles.montoCell}>${p.monto?.toLocaleString('es-MX')}</td>
                    <td>{p.tasaInteres}%</td>
                    <td>{p.numPagos} meses</td>
                    <td>{p.fechaInicio}</td>
                    <td>{estatusBadge(p.estatus)}</td>
                 
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                          onClick={() => verAmortizaciones(p)}>
                          Ver Tabla
                        </button>
                        <button className={`${styles.btn} ${styles.btnSuccess} ${styles.btnSm}`}
                          onClick={() => descargarPdf(p.id)}>
                          📄 PDF
                        </button>
                        <button className={`${styles.btn} ${styles.btnWarning} ${styles.btnSm}`}
                          onClick={() => descargarExcel(p.id)}>
                          📊 Excel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPaginasPrestamos > 1 && (
              <div className={styles.paginacion}>
                <button
                  className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
                  onClick={() => cargarPrestamos(clienteSeleccionado, paginaPrestamos - 1)}
                  disabled={paginaPrestamos === 0}>
                  ← Anterior
                </button>
                <span className={styles.paginacionInfo}>
                  Página {paginaPrestamos + 1} de {totalPaginasPrestamos} — {totalPrestamos} préstamos
                </span>
                <button
                  className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
                  onClick={() => cargarPrestamos(clienteSeleccionado, paginaPrestamos + 1)}
                  disabled={paginaPrestamos >= totalPaginasPrestamos - 1}>
                  Siguiente →
                </button>
              </div>
            )}


          </div>
        </div>
      )}

      {amortizaciones.length > 0 && (
        <div className={styles.card} id="tabla-amort">
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>📊 Tabla de Amortización — Préstamo #{prestamoSeleccionado?.id}</span>
            <span className={styles.cardCount}>{amortizaciones.length} cuotas</span>
          </div>
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr><th>#</th><th>Vencimiento</th><th>Capital</th><th>Interés</th><th>Cuota</th><th>Saldo</th><th>Estatus</th></tr>
              </thead>
              <tbody>
                {amortizaciones.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.numPago}</td>
                    <td>{a.fechaVencimiento}</td>
                    <td>${a.capital?.toLocaleString('es-MX')}</td>
                    <td className={styles.interesCell}>${a.interes?.toLocaleString('es-MX')}</td>
                    <td style={{ fontWeight: 600 }}>${a.cuota?.toLocaleString('es-MX')}</td>
                    <td>${a.saldoRestante?.toLocaleString('es-MX')}</td>
                    <td>
                      <span className={`${styles.badge} ${a.estatus === 'PAGADO' ? styles.badgePaid : a.estatus === 'VENCIDO' ? styles.badgeOverdue : styles.badgePending}`}>
                        {a.estatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}