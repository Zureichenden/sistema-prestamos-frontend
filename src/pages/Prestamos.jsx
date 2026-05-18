import { useState, useEffect } from 'react';
import { clienteService, prestamoService } from '../services/api';
import styles from './Prestamos.module.css';

const PASOS = ['📋 Datos', '📄 Solicitud', '📤 Contrato', '✅ Confirmar'];

export default function Prestamos() {
  const [clientes, setClientes] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [amortizaciones, setAmortizaciones] = useState([]);
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [paginaPrestamos, setPaginaPrestamos] = useState(0);
  const [totalPaginasPrestamos, setTotalPaginasPrestamos] = useState(0);
  const [totalPrestamos, setTotalPrestamos] = useState(0);
  const [form, setForm] = useState({ monto: '', tasaInteres: '', numPagos: '', fechaInicio: '' });
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [paso, setPaso] = useState(0);
  const [contratoNombre, setContratoNombre] = useState('');
  const [archivoContrato, setArchivoContrato] = useState(null);
  const [subiendoPdf, setSubiendoPdf] = useState(false);
  const [generandoPdf, setGenerandoPdf] = useState(false);
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
    resetFormulario();
    if (id) await cargarPrestamos(id, 0);
  };

  const resetFormulario = () => {
    setPaso(0);
    setForm({ monto: '', tasaInteres: '', numPagos: '', fechaInicio: '' });
    setContratoNombre('');
    setArchivoContrato(null);
    setError('');
    setMensaje('');
  };

  // Paso 1 → Paso 2: Generar PDF de solicitud
  const handleGenerarSolicitud = async () => {
    setError('');
    if (!clienteSeleccionado || !form.monto || !form.tasaInteres || !form.numPagos || !form.fechaInicio) {
      setError('Completa todos los campos antes de generar la solicitud');
      return;
    }
    setGenerandoPdf(true);
    try {
      const res = await prestamoService.previewSolicitud({
        clienteId: parseInt(clienteSeleccionado),
        monto: parseFloat(form.monto),
        tasaInteres: parseFloat(form.tasaInteres),
        numPagos: parseInt(form.numPagos),
        fechaInicio: form.fechaInicio
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'solicitud-prestamo.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setPaso(1);
    } catch (e) {
      setError('Error al generar la solicitud');
    } finally {
      setGenerandoPdf(false);
    }
  };

  // Paso 2 → Paso 3: Subir PDF firmado
  const handleSubirContrato = async () => {
    setError('');
    if (!archivoContrato) {
      setError('Selecciona el PDF firmado');
      return;
    }
    setSubiendoPdf(true);
    try {
      const formData = new FormData();
      formData.append('archivo', archivoContrato);
      const res = await prestamoService.subirContrato(formData);
      setContratoNombre(res.data.nombreArchivo);
      setPaso(2);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al subir el contrato');
    } finally {
      setSubiendoPdf(false);
    }
  };

  // Paso 3: Guardar préstamo
  const handleGuardarPrestamo = async () => {
    setError('');
    try {
      await prestamoService.crear({
        clienteId: parseInt(clienteSeleccionado),
        monto: parseFloat(form.monto),
        tasaInteres: parseFloat(form.tasaInteres),
        numPagos: parseInt(form.numPagos),
        fechaInicio: form.fechaInicio,
        contratoPdf: contratoNombre
      });
      setMensaje('✅ Préstamo registrado correctamente');
      setPaso(3);
      await cargarPrestamos(clienteSeleccionado, 0);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar préstamo');
    }
  };

  const verAmortizaciones = async (prestamo) => {
    setPrestamoSeleccionado(prestamo);
    const res = await prestamoService.amortizaciones(prestamo.id);
    setAmortizaciones(res.data);
    setTimeout(() => document.getElementById('tabla-amort')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const descargarContrato = async (nombreArchivo) => {
    const res = await prestamoService.descargarContrato(nombreArchivo);
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    window.open(url, '_blank');
  };

  const estatusBadge = (estatus) => {
    const map = { ACTIVO: styles.badgeActive, LIQUIDADO: styles.badgePaid, VENCIDO: styles.badgeOverdue };
    return <span className={`${styles.badge} ${map[estatus]}`}>{estatus}</span>;
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>📋 Préstamos</h1>
        <p className={styles.pageSubtitle}>Gestión de préstamos y tablas de amortización</p>
      </div>

      {/* FORMULARIO NUEVO PRÉSTAMO */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>➕ Nuevo Préstamo</span>
          {paso > 0 && paso < 3 && (
            <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} onClick={resetFormulario}>
              Reiniciar
            </button>
          )}
        </div>

        {/* STEPPER */}
        <div className={styles.stepper}>
          {PASOS.map((p, i) => (
            <div key={i} className={`${styles.stepItem} ${i <= paso ? styles.stepActivo : ''}`}>
              <div className={styles.stepCircle}>{i < paso ? '✓' : i + 1}</div>
              <span className={styles.stepLabel}>{p}</span>
              {i < PASOS.length - 1 && <div className={`${styles.stepLinea} ${i < paso ? styles.stepLineaActiva : ''}`} />}
            </div>
          ))}
        </div>

        {/* PASO 0 — Datos */}
        {paso === 0 && (
          <>
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
            <div className={styles.formActions}>
              <button className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleGenerarSolicitud} disabled={generandoPdf}>
                {generandoPdf ? '⏳ Generando...' : '📄 Generar Solicitud PDF'}
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              ℹ️ Se descargará un PDF de solicitud que deberá ser firmado por el cliente antes de continuar.
            </p>
          </>
        )}

        {/* PASO 1 — Subir contrato firmado */}
        {paso === 1 && (
          <>
            <div className={styles.pasoInfo}>
              <div className={styles.pasoIcono}>📋</div>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>PDF generado correctamente</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Entrega el PDF al cliente para que lo firme y regrese el documento firmado.
                  Una vez firmado, súbelo aquí para continuar.
                </p>
              </div>
            </div>

            <div className={styles.uploadArea}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file?.type === 'application/pdf') setArchivoContrato(file);
                else setError('Solo se permiten archivos PDF');
              }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📤</div>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {archivoContrato ? `✅ ${archivoContrato.name}` : 'Arrastra el PDF firmado aquí'}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.5rem 0' }}>o</p>
              <label className={`${styles.btn} ${styles.btnGhost}`} style={{ cursor: 'pointer' }}>
                Seleccionar archivo
                <input type="file" accept=".pdf" style={{ display: 'none' }}
                  onChange={e => setArchivoContrato(e.target.files[0])} />
              </label>
              {archivoContrato && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  {(archivoContrato.size / 1024).toFixed(1)} KB
                </p>
              )}
            </div>

            {error && <div className={styles.error}>⚠️ {error}</div>}
            <div className={styles.formActions}>
              <button className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleSubirContrato} disabled={subiendoPdf || !archivoContrato}>
                {subiendoPdf ? '⏳ Subiendo...' : '📤 Subir Contrato Firmado'}
              </button>
              <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setPaso(0)}>
                ← Regresar
              </button>
            </div>
          </>
        )}

        {/* PASO 2 — Confirmar */}
        {paso === 2 && (
          <>
            <div className={styles.pasoInfo}>
              <div className={styles.pasoIcono}>✅</div>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Contrato subido correctamente</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Revisa los datos y confirma el préstamo para guardarlo en el sistema.
                </p>
              </div>
            </div>

            <div className={styles.resumenPrestamo}>
              <div className={styles.resumenItem}>
                <span className={styles.resumenLabel}>Cliente</span>
                <span className={styles.resumenValue}>
                  {clientes.find(c => c.id === parseInt(clienteSeleccionado))?.nombre}{' '}
                  {clientes.find(c => c.id === parseInt(clienteSeleccionado))?.apellido}
                </span>
              </div>
              <div className={styles.resumenItem}>
                <span className={styles.resumenLabel}>Monto</span>
                <span className={styles.resumenValue}>${parseFloat(form.monto).toLocaleString('es-MX')}</span>
              </div>
              <div className={styles.resumenItem}>
                <span className={styles.resumenLabel}>Tasa Anual</span>
                <span className={styles.resumenValue}>{form.tasaInteres}%</span>
              </div>
              <div className={styles.resumenItem}>
                <span className={styles.resumenLabel}>Pagos</span>
                <span className={styles.resumenValue}>{form.numPagos} meses</span>
              </div>
              <div className={styles.resumenItem}>
                <span className={styles.resumenLabel}>Fecha Inicio</span>
                <span className={styles.resumenValue}>{form.fechaInicio}</span>
              </div>
              <div className={styles.resumenItem}>
                <span className={styles.resumenLabel}>Contrato</span>
                <span className={styles.resumenValue} style={{ color: 'var(--success)' }}>✅ Firmado y subido</span>
              </div>
            </div>

            {error && <div className={styles.error}>⚠️ {error}</div>}
            <div className={styles.formActions}>
              <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={handleGuardarPrestamo}>
                ✅ Confirmar y Guardar Préstamo
              </button>
              <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setPaso(1)}>
                ← Regresar
              </button>
            </div>
          </>
        )}

        {/* PASO 3 — Éxito */}
        {paso === 3 && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '4rem' }}>🎉</div>
            <h3 style={{ color: 'var(--success)', marginTop: '1rem' }}>Préstamo registrado</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{mensaje}</p>
            <button className={`${styles.btn} ${styles.btnPrimary}`}
              style={{ marginTop: '1.5rem' }} onClick={resetFormulario}>
              ➕ Nuevo Préstamo
            </button>
          </div>
        )}
      </div>

      {/* TABLA DE PRÉSTAMOS */}
      {prestamos.length > 0 && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>💼 Préstamos del Cliente</span>
            <span className={styles.cardCount}>{totalPrestamos} préstamo(s)</span>
          </div>
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr><th>ID</th><th>Monto</th><th>Tasa</th><th>Pagos</th><th>Inicio</th><th>Estatus</th><th>Contrato</th><th>Acciones</th></tr>
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
                      {p.contratoSubido ? (
                        <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
                          onClick={() => descargarContrato(p.contratoPdf)}>
                          📄 Ver
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                          onClick={() => verAmortizaciones(p)}>Ver Tabla</button>
                        <button className={`${styles.btn} ${styles.btnSuccess} ${styles.btnSm}`}
                          onClick={() => prestamoService.exportarPdf(p.id).then(res => {
                            const url = window.URL.createObjectURL(new Blob([res.data]));
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', `amortizacion-${p.id}.pdf`);
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                          })}>📄 PDF</button>
                        <button className={`${styles.btn} ${styles.btnWarning} ${styles.btnSm}`}
                          onClick={() => prestamoService.exportarExcel(p.id).then(res => {
                            const url = window.URL.createObjectURL(new Blob([res.data]));
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', `amortizacion-${p.id}.xlsx`);
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                          })}>📊 Excel</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPaginasPrestamos > 1 && (
              <div className={styles.paginacion}>
                <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
                  onClick={() => cargarPrestamos(clienteSeleccionado, paginaPrestamos - 1)}
                  disabled={paginaPrestamos === 0}>← Anterior</button>
                <span className={styles.paginacionInfo}>
                  Página {paginaPrestamos + 1} de {totalPaginasPrestamos} — {totalPrestamos} préstamos
                </span>
                <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
                  onClick={() => cargarPrestamos(clienteSeleccionado, paginaPrestamos + 1)}
                  disabled={paginaPrestamos >= totalPaginasPrestamos - 1}>Siguiente →</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TABLA AMORTIZACIÓN */}
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