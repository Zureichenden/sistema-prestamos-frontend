import { useState, useEffect } from 'react';
import empleadoService from '../services/rh/empleadoService';
import rhService from '../services/rh/rhService';
import styles from './Empleados.module.css';

export default function Empleados() {
  const [tabActiva, setTabActiva] = useState('lista');
  const [empleados, setEmpleados] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [salarios, setSalarios] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [subtabDetalle, setSubtabDetalle] = useState('info');
  const [direcciones, setDirecciones] = useState([]);
  const [telefonos, setTelefonos] = useState([]);
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [bitacora, setBitacora] = useState([]);
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', fechaNacimiento: '',
    rfc: '', curp: '', nss: '', fechaIngreso: '',
    puestoId: '', departamentoId: '', salarioId: ''
  });
  const [formDireccion, setFormDireccion] = useState({ calle: '', colonia: '', ciudad: '', estado: '', codigoPostal: '', tipo: 'CASA', principal: false });
  const [formTelefono, setFormTelefono] = useState({ numero: '', tipo: 'CELULAR', principal: false });
  const [formBeneficiario, setFormBeneficiario] = useState({ nombre: '', apellido: '', parentesco: '', porcentaje: '', telefono: '', fechaNacimiento: '' });
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const TAMANIO = 10;

  useEffect(() => {
    cargarEmpleados(0);
    rhService.listarPuestos().then(r => setPuestos(r.data));
    rhService.listarDepartamentos().then(r => setDepartamentos(r.data));
    rhService.listarSalarios().then(r => setSalarios(r.data));
  }, []);

  const cargarEmpleados = async (pag) => {
    const res = await empleadoService.listar(pag, TAMANIO);
    setEmpleados(res.data.content);
    setTotalPaginas(res.data.totalPages);
    setTotalElementos(res.data.totalElements);
    setPagina(pag);
  };

  const handleSubmit = async () => {
    setError(''); setMensaje('');
    try {
      await empleadoService.crear({
        ...form,
        puestoId: form.puestoId ? parseInt(form.puestoId) : null,
        departamentoId: form.departamentoId ? parseInt(form.departamentoId) : null,
        salarioId: form.salarioId ? parseInt(form.salarioId) : null
      });
      setMensaje('Empleado creado correctamente');
      setForm({ nombre: '', apellido: '', email: '', fechaNacimiento: '', rfc: '', curp: '', nss: '', fechaIngreso: '', puestoId: '', departamentoId: '', salarioId: '' });
      cargarEmpleados(0);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al crear empleado');
    }
  };

  const abrirDetalle = async (empleado) => {
    setEmpleadoSeleccionado(empleado);
    setSubtabDetalle('info');
    setModalDetalle(true);
    const [dir, tel, ben, bit] = await Promise.all([
      empleadoService.listarDirecciones(empleado.id),
      empleadoService.listarTelefonos(empleado.id),
      empleadoService.listarBeneficiarios(empleado.id),
      empleadoService.listarBitacora(empleado.id)
    ]);
    setDirecciones(dir.data);
    setTelefonos(tel.data);
    setBeneficiarios(ben.data);
    setBitacora(bit.data);
  };

  const handleAgregarDireccion = async () => {
    try {
      await empleadoService.agregarDireccion(empleadoSeleccionado.id, formDireccion);
      const res = await empleadoService.listarDirecciones(empleadoSeleccionado.id);
      setDirecciones(res.data);
      setFormDireccion({ calle: '', colonia: '', ciudad: '', estado: '', codigoPostal: '', tipo: 'CASA', principal: false });
    } catch (e) { setError(e.response?.data?.error || 'Error'); }
  };

  const handleAgregarTelefono = async () => {
    try {
      await empleadoService.agregarTelefono(empleadoSeleccionado.id, formTelefono);
      const res = await empleadoService.listarTelefonos(empleadoSeleccionado.id);
      setTelefonos(res.data);
      setFormTelefono({ numero: '', tipo: 'CELULAR', principal: false });
    } catch (e) { setError(e.response?.data?.error || 'Error'); }
  };

  const handleAgregarBeneficiario = async () => {
    try {
      await empleadoService.agregarBeneficiario(empleadoSeleccionado.id, {
        ...formBeneficiario,
        porcentaje: parseFloat(formBeneficiario.porcentaje)
      });
      const res = await empleadoService.listarBeneficiarios(empleadoSeleccionado.id);
      setBeneficiarios(res.data);
      setFormBeneficiario({ nombre: '', apellido: '', parentesco: '', porcentaje: '', telefono: '', fechaNacimiento: '' });
    } catch (e) { setError(e.response?.data?.error || 'Error'); }
  };

  const handleBaja = async (id) => {
    if (!window.confirm('¿Dar de baja a este empleado?')) return;
    await empleadoService.darBaja(id);
    cargarEmpleados(pagina);
    if (empleadoSeleccionado?.id === id) {
      const res = await empleadoService.obtener(id);
      setEmpleadoSeleccionado(res.data);
    }
  };

  const handleReactivar = async (id) => {
    await empleadoService.reactivar(id);
    cargarEmpleados(pagina);
    if (empleadoSeleccionado?.id === id) {
      const res = await empleadoService.obtener(id);
      setEmpleadoSeleccionado(res.data);
    }
  };

  const bitacoraBadge = (tipo) => {
    const map = {
      ALTA: styles.badgeAlta,
      BAJA: styles.badgeBaja,
      REACTIVACION: styles.badgeReactivacion,
      CAMBIO_PUESTO: styles.badgeCambio,
      CAMBIO_DEPARTAMENTO: styles.badgeCambio,
      CAMBIO_SALARIO: styles.badgeCambio,
      CAMBIO_DATOS_PERSONALES: styles.badgeCambio
    };
    return <span className={`${styles.badge} ${map[tipo] || styles.badgeCambio}`}>{tipo.replace('_', ' ')}</span>;
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>👥 Empleados</h1>
        <p className={styles.pageSubtitle}>Gestión del personal de la empresa</p>
      </div>

      <div className={styles.tabs}>
        {[
          { key: 'lista', label: '📋 Lista' },
          { key: 'nuevo', label: '➕ Nuevo Empleado' }
        ].map(t => (
          <button key={t.key}
            className={`${styles.tab} ${tabActiva === t.key ? styles.tabActive : ''}`}
            onClick={() => { setTabActiva(t.key); setError(''); setMensaje(''); }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* LISTA */}
      {tabActiva === 'lista' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>👥 Lista de Empleados</span>
            <span className={styles.cardCount}>{totalElementos} empleados</span>
          </div>
          {empleados.length === 0 ? (
            <div className={styles.emptyState}>
              <div style={{ fontSize: '2.5rem' }}>👥</div>
              <p>No hay empleados registrados</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th><th>Nombre</th><th>Email</th><th>Puesto</th>
                    <th>Departamento</th><th>Salario</th><th>Estatus</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {empleados.map(e => (
                    <tr key={e.id}>
                      <td className={styles.idCell}>#{e.id}</td>
                      <td className={styles.nameCell}>{e.nombre} {e.apellido}</td>
                      <td>{e.email}</td>
                      <td>{e.puestoNombre || '—'}</td>
                      <td>{e.departamentoNombre || '—'}</td>
                      <td>{e.salarioMonto ? `$${Number(e.salarioMonto).toLocaleString('es-MX')}` : '—'}</td>
                      <td>
                        <span className={`${styles.badge} ${e.activo ? styles.badgeActivo : styles.badgeInactivo}`}>
                          {e.activo ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                            onClick={() => abrirDetalle(e)}>
                            Ver
                          </button>
                          {e.activo ? (
                            <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                              onClick={() => handleBaja(e.id)}>
                              Baja
                            </button>
                          ) : (
                            <button className={`${styles.btn} ${styles.btnSuccess} ${styles.btnSm}`}
                              onClick={() => handleReactivar(e.id)}>
                              Activar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPaginas > 1 && (
                <div className={styles.paginacion}>
                  <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
                    onClick={() => cargarEmpleados(pagina - 1)} disabled={pagina === 0}>
                    ← Anterior
                  </button>
                  <span className={styles.paginacionInfo}>
                    Página {pagina + 1} de {totalPaginas} — {totalElementos} empleados
                  </span>
                  <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
                    onClick={() => cargarEmpleados(pagina + 1)} disabled={pagina >= totalPaginas - 1}>
                    Siguiente →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* NUEVO EMPLEADO */}
      {tabActiva === 'nuevo' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>➕ Nuevo Empleado</span>
          </div>
          <div className={styles.formGrid}>
            {[
              { name: 'nombre', label: 'Nombre', placeholder: 'Juan' },
              { name: 'apellido', label: 'Apellido', placeholder: 'Pérez' },
              { name: 'email', label: 'Email', placeholder: 'juan@empresa.com' },
              { name: 'rfc', label: 'RFC', placeholder: 'PEJJ900101ABC' },
              { name: 'curp', label: 'CURP', placeholder: 'PEJJ900101HSLRLN09' },
              { name: 'nss', label: 'NSS', placeholder: '12345678901' },
            ].map(f => (
              <div className={styles.formGroup} key={f.name}>
                <label>{f.label}</label>
                <input placeholder={f.placeholder} value={form[f.name]}
                  onChange={e => setForm({ ...form, [f.name]: e.target.value })} />
              </div>
            ))}
            <div className={styles.formGroup}>
              <label>Fecha de Nacimiento</label>
              <input type="date" value={form.fechaNacimiento}
                onChange={e => setForm({ ...form, fechaNacimiento: e.target.value })} />
            </div>
            <div className={styles.formGroup}>
              <label>Fecha de Ingreso</label>
              <input type="date" value={form.fechaIngreso}
                onChange={e => setForm({ ...form, fechaIngreso: e.target.value })} />
            </div>
            <div className={styles.formGroup}>
              <label>Puesto</label>
              <select value={form.puestoId} onChange={e => setForm({ ...form, puestoId: e.target.value })}>
                <option value="">Seleccionar...</option>
                {puestos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Departamento</label>
              <select value={form.departamentoId} onChange={e => setForm({ ...form, departamentoId: e.target.value })}>
                <option value="">Seleccionar...</option>
                {departamentos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Salario</label>
              <select value={form.salarioId} onChange={e => setForm({ ...form, salarioId: e.target.value })}>
                <option value="">Seleccionar...</option>
                {salarios.map(s => <option key={s.id} value={s.id}>${Number(s.monto).toLocaleString('es-MX')} — {s.descripcion}</option>)}
              </select>
            </div>
          </div>
          {error && <div className={styles.error}>⚠️ {error}</div>}
          {mensaje && <div className={styles.success}>✅ {mensaje}</div>}
          <div className={styles.formActions}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSubmit}>
              💾 Guardar Empleado
            </button>
          </div>
        </div>
      )}

      {/* MODAL DETALLE */}
      {modalDetalle && empleadoSeleccionado && (
        <div className={styles.modal} onClick={() => setModalDetalle(false)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className={styles.modalTitle}>
                👤 {empleadoSeleccionado.nombre} {empleadoSeleccionado.apellido}
                <span className={`${styles.badge} ${empleadoSeleccionado.activo ? styles.badgeActivo : styles.badgeInactivo}`}
                  style={{ marginLeft: '0.5rem' }}>
                  {empleadoSeleccionado.activo ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </h3>
              <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
                onClick={() => setModalDetalle(false)}>✕</button>
            </div>

            <div className={styles.subtabs}>
              {[
                { key: 'info', label: 'ℹ️ Info' },
                { key: 'direcciones', label: '📍 Direcciones' },
                { key: 'telefonos', label: '📱 Teléfonos' },
                { key: 'beneficiarios', label: '👨‍👩‍👧 Beneficiarios' },
                { key: 'bitacora', label: '📋 Bitácora' }
              ].map(t => (
                <button key={t.key}
                  className={`${styles.subtab} ${subtabDetalle === t.key ? styles.subtabActive : ''}`}
                  onClick={() => setSubtabDetalle(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* INFO */}
            {subtabDetalle === 'info' && (
              <div className={styles.detalleGrid}>
                {[
                  { label: 'RFC', valor: empleadoSeleccionado.rfc },
                  { label: 'CURP', valor: empleadoSeleccionado.curp || '—' },
                  { label: 'NSS', valor: empleadoSeleccionado.nss || '—' },
                  { label: 'Email', valor: empleadoSeleccionado.email },
                  { label: 'Fecha Nacimiento', valor: empleadoSeleccionado.fechaNacimiento || '—' },
                  { label: 'Fecha Ingreso', valor: empleadoSeleccionado.fechaIngreso },
                  { label: 'Puesto', valor: empleadoSeleccionado.puestoNombre || '—' },
                  { label: 'Departamento', valor: empleadoSeleccionado.departamentoNombre || '—' },
                  { label: 'Salario', valor: empleadoSeleccionado.salarioMonto ? `$${Number(empleadoSeleccionado.salarioMonto).toLocaleString('es-MX')}` : '—' },
                ].map(item => (
                  <div key={item.label} className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>{item.label}</span>
                    <span className={styles.detalleValor}>{item.valor}</span>
                  </div>
                ))}
              </div>
            )}

            {/* DIRECCIONES */}
            {subtabDetalle === 'direcciones' && (
              <div>
                <div className={styles.formGrid} style={{ marginBottom: '1rem' }}>
                  <div className={styles.formGroup}>
                    <label>Calle</label>
                    <input value={formDireccion.calle} placeholder="Av. Principal 123"
                      onChange={e => setFormDireccion({ ...formDireccion, calle: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Colonia</label>
                    <input value={formDireccion.colonia} placeholder="Centro"
                      onChange={e => setFormDireccion({ ...formDireccion, colonia: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Ciudad</label>
                    <input value={formDireccion.ciudad} placeholder="Culiacán"
                      onChange={e => setFormDireccion({ ...formDireccion, ciudad: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Estado</label>
                    <input value={formDireccion.estado} placeholder="Sinaloa"
                      onChange={e => setFormDireccion({ ...formDireccion, estado: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>C.P.</label>
                    <input value={formDireccion.codigoPostal} placeholder="80000"
                      onChange={e => setFormDireccion({ ...formDireccion, codigoPostal: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Tipo</label>
                    <select value={formDireccion.tipo}
                      onChange={e => setFormDireccion({ ...formDireccion, tipo: e.target.value })}>
                      <option value="CASA">Casa</option>
                      <option value="TRABAJO">Trabajo</option>
                    </select>
                  </div>
                </div>
                <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                  onClick={handleAgregarDireccion}>➕ Agregar</button>

                {direcciones.length > 0 && (
                  <div className={styles.tableWrapper} style={{ marginTop: '1rem' }}>
                    <table>
                      <thead><tr><th>Calle</th><th>Colonia</th><th>Ciudad</th><th>Tipo</th><th></th></tr></thead>
                      <tbody>
                        {direcciones.map(d => (
                          <tr key={d.id}>
                            <td>{d.calle}</td>
                            <td>{d.colonia}</td>
                            <td>{d.ciudad}</td>
                            <td>{d.tipo}</td>
                            <td>
                              <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                                onClick={async () => {
                                  await empleadoService.eliminarDireccion(d.id);
                                  const res = await empleadoService.listarDirecciones(empleadoSeleccionado.id);
                                  setDirecciones(res.data);
                                }}>Eliminar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TELÉFONOS */}
            {subtabDetalle === 'telefonos' && (
              <div>
                <div className={styles.formGrid} style={{ marginBottom: '1rem' }}>
                  <div className={styles.formGroup}>
                    <label>Número</label>
                    <input value={formTelefono.numero} placeholder="6671234567"
                      onChange={e => setFormTelefono({ ...formTelefono, numero: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Tipo</label>
                    <select value={formTelefono.tipo}
                      onChange={e => setFormTelefono({ ...formTelefono, tipo: e.target.value })}>
                      <option value="CELULAR">Celular</option>
                      <option value="CASA">Casa</option>
                      <option value="TRABAJO">Trabajo</option>
                    </select>
                  </div>
                </div>
                <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                  onClick={handleAgregarTelefono}>➕ Agregar</button>

                {telefonos.length > 0 && (
                  <div className={styles.tableWrapper} style={{ marginTop: '1rem' }}>
                    <table>
                      <thead><tr><th>Número</th><th>Tipo</th><th></th></tr></thead>
                      <tbody>
                        {telefonos.map(t => (
                          <tr key={t.id}>
                            <td>{t.numero}</td>
                            <td>{t.tipo}</td>
                            <td>
                              <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                                onClick={async () => {
                                  await empleadoService.eliminarTelefono(t.id);
                                  const res = await empleadoService.listarTelefonos(empleadoSeleccionado.id);
                                  setTelefonos(res.data);
                                }}>Eliminar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* BENEFICIARIOS */}
            {subtabDetalle === 'beneficiarios' && (
              <div>
                <div className={styles.formGrid} style={{ marginBottom: '1rem' }}>
                  <div className={styles.formGroup}>
                    <label>Nombre</label>
                    <input value={formBeneficiario.nombre} placeholder="María"
                      onChange={e => setFormBeneficiario({ ...formBeneficiario, nombre: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Apellido</label>
                    <input value={formBeneficiario.apellido} placeholder="Pérez"
                      onChange={e => setFormBeneficiario({ ...formBeneficiario, apellido: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Parentesco</label>
                    <input value={formBeneficiario.parentesco} placeholder="Esposa"
                      onChange={e => setFormBeneficiario({ ...formBeneficiario, parentesco: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Porcentaje (%)</label>
                    <input type="number" value={formBeneficiario.porcentaje} placeholder="100"
                      onChange={e => setFormBeneficiario({ ...formBeneficiario, porcentaje: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Teléfono</label>
                    <input value={formBeneficiario.telefono} placeholder="6671234567"
                      onChange={e => setFormBeneficiario({ ...formBeneficiario, telefono: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Fecha Nacimiento</label>
                    <input type="date" value={formBeneficiario.fechaNacimiento}
                      onChange={e => setFormBeneficiario({ ...formBeneficiario, fechaNacimiento: e.target.value })} />
                  </div>
                </div>
                <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                  onClick={handleAgregarBeneficiario}>➕ Agregar</button>

                {beneficiarios.length > 0 && (
                  <div className={styles.tableWrapper} style={{ marginTop: '1rem' }}>
                    <table>
                      <thead><tr><th>Nombre</th><th>Parentesco</th><th>%</th><th></th></tr></thead>
                      <tbody>
                        {beneficiarios.map(b => (
                          <tr key={b.id}>
                            <td>{b.nombre} {b.apellido}</td>
                            <td>{b.parentesco}</td>
                            <td>{b.porcentaje}%</td>
                            <td>
                              <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                                onClick={async () => {
                                  await empleadoService.eliminarBeneficiario(b.id);
                                  const res = await empleadoService.listarBeneficiarios(empleadoSeleccionado.id);
                                  setBeneficiarios(res.data);
                                }}>Eliminar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* BITÁCORA */}
            {subtabDetalle === 'bitacora' && (
              <div className={styles.tableWrapper}>
                <table>
                  <thead>
                    <tr><th>Movimiento</th><th>Descripción</th><th>Anterior</th><th>Nuevo</th><th>Fecha</th></tr>
                  </thead>
                  <tbody>
                    {bitacora.map(b => (
                      <tr key={b.id}>
                        <td>{bitacoraBadge(b.tipoMovimiento)}</td>
                        <td>{b.descripcion}</td>
                        <td style={{ color: 'var(--danger)' }}>{b.valorAnterior || '—'}</td>
                        <td style={{ color: 'var(--success)' }}>{b.valorNuevo || '—'}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(b.fechaHora).toLocaleString('es-MX')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}