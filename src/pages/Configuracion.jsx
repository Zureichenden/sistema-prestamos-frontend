import { useState, useEffect } from 'react';
import { usuarioService, rolService } from '../services/api';
import styles from './Configuracion.module.css';

export default function Configuracion() {
  const [tabActiva, setTabActiva] = useState('usuarios');
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const [modalRoles, setModalRoles] = useState(null);
  const [rolesSeleccionados, setRolesSeleccionados] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', nombre: '', email: '', roles: [] });
  const [formRol, setFormRol] = useState({ nombre: '', descripcion: '' });
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const TAMANIO = 10;

  useEffect(() => {
    cargarRoles();
    cargarUsuarios(0);
  }, []);

  const cargarUsuarios = async (pag) => {
    const res = await usuarioService.listar(pag, TAMANIO);
    setUsuarios(res.data.content);
    setTotalPaginas(res.data.totalPages);
    setTotalElementos(res.data.totalElements);
    setPagina(pag);
  };

  const cargarRoles = async () => {
    const res = await rolService.listar();
    setRoles(res.data);
  };

  const handleCrearUsuario = async () => {
    setError(''); setMensaje('');
    try {
      await usuarioService.crear({ ...form, roles: form.roles });
      setMensaje('Usuario creado correctamente');
      setForm({ username: '', password: '', nombre: '', email: '', roles: [] });
      cargarUsuarios(0);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al crear usuario');
    }
  };

  const handleCrearRol = async () => {
    setError(''); setMensaje('');
    try {
      await rolService.crear(formRol);
      setMensaje('Rol creado correctamente');
      setFormRol({ nombre: '', descripcion: '' });
      cargarRoles();
    } catch (e) {
      setError(e.response?.data?.error || 'Error al crear rol');
    }
  };

  const handleToggleActivo = async (id) => {
    await usuarioService.toggleActivo(id);
    cargarUsuarios(pagina);
  };

  const abrirModalRoles = (usuario) => {
    setModalRoles(usuario);
    setRolesSeleccionados([...usuario.roles]);
  };

  const toggleRolSeleccionado = (nombre) => {
    setRolesSeleccionados(prev =>
      prev.includes(nombre) ? prev.filter(r => r !== nombre) : [...prev, nombre]
    );
  };

  const handleActualizarRoles = async () => {
    await usuarioService.actualizarRoles(modalRoles.id, rolesSeleccionados);
    setModalRoles(null);
    cargarUsuarios(pagina);
  };

  const toggleRolForm = (nombre) => {
    setForm(prev => ({
      ...prev,
      roles: prev.roles.includes(nombre)
        ? prev.roles.filter(r => r !== nombre)
        : [...prev.roles, nombre]
    }));
  };

  const rolBadge = (nombre) => {
    const map = {
      ADMIN: styles.badgeAdmin,
      GESTOR: styles.badgeGestor,
      AUDITOR: styles.badgeAuditor,
      VIEWER: styles.badgeViewer
    };
    return <span key={nombre} className={`${styles.badge} ${map[nombre] || styles.badgeViewer}`}>{nombre}</span>;
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>⚙️ Configuración</h1>
        <p className={styles.pageSubtitle}>Gestión de usuarios y roles del sistema</p>
      </div>

      <div className={styles.tabs}>
        {[
          { key: 'usuarios', label: '👤 Usuarios' },
          { key: 'roles', label: '🔑 Roles' }
        ].map(t => (
          <button key={t.key}
            className={`${styles.tab} ${tabActiva === t.key ? styles.tabActive : ''}`}
            onClick={() => { setTabActiva(t.key); setError(''); setMensaje(''); }}>
            {t.label}
          </button>
        ))}
      </div>

      {tabActiva === 'usuarios' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>➕ Nuevo Usuario</span>
            </div>
            <div className={styles.formGrid}>
              {[
                { name: 'username', label: 'Username', placeholder: 'jperez' },
                { name: 'password', label: 'Contraseña', placeholder: '••••••', type: 'password' },
                { name: 'nombre', label: 'Nombre completo', placeholder: 'Juan Pérez' },
                { name: 'email', label: 'Email', placeholder: 'juan@email.com' }
              ].map(f => (
                <div className={styles.formGroup} key={f.name}>
                  <label>{f.label}</label>
                  <input
                    type={f.type || 'text'}
                    placeholder={f.placeholder}
                    value={form[f.name]}
                    onChange={e => setForm({ ...form, [f.name]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
              <label>Roles</label>
              <div className={styles.rolesGrid}>
                {roles.map(r => (
                  <label key={r.nombre}
                    className={`${styles.rolCheckbox} ${form.roles.includes(r.nombre) ? styles.rolCheckboxActivo : ''}`}
                    onClick={() => toggleRolForm(r.nombre)}>
                    {r.nombre}
                  </label>
                ))}
              </div>
            </div>
            {error && <div className={styles.error}>⚠️ {error}</div>}
            {mensaje && <div className={styles.success}>✅ {mensaje}</div>}
            <div className={styles.formActions}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleCrearUsuario}>
                ➕ Crear Usuario
              </button>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>👥 Lista de Usuarios</span>
              <span className={styles.cardCount}>{totalElementos} usuarios</span>
            </div>
            {usuarios.length === 0 ? (
              <div className={styles.emptyState}>
                <div style={{ fontSize: '2.5rem' }}>👤</div>
                <p>No hay usuarios registrados</p>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th><th>Username</th><th>Nombre</th><th>Email</th>
                      <th>Roles</th><th>Estatus</th><th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map(u => (
                      <tr key={u.id}>
                        <td className={styles.idCell}>#{u.id}</td>
                        <td style={{ fontWeight: 600 }}>@{u.username}</td>
                        <td>{u.nombre}</td>
                        <td>{u.email}</td>
                        <td>
                          <div className={styles.rolesLista}>
                            {u.roles?.map(r => rolBadge(r))}
                          </div>
                        </td>
                        <td>
                          <span className={`${styles.badge} ${u.activo ? styles.badgeActivo : styles.badgeInactivo}`}>
                            {u.activo ? 'ACTIVO' : 'INACTIVO'}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <button className={`${styles.btn} ${styles.btnGestor} ${styles.btnSm} ${styles.btnPrimary}`}
                              onClick={() => abrirModalRoles(u)}>
                              🔑 Roles
                            </button>
                            <button
                              className={`${styles.btn} ${u.activo ? styles.btnDanger : styles.btnSuccess} ${styles.btnSm}`}
                              onClick={() => handleToggleActivo(u.id)}>
                              {u.activo ? 'Desactivar' : 'Activar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {totalPaginas > 1 && (
                  <div className={styles.paginacion}>
                    <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
                      onClick={() => cargarUsuarios(pagina - 1)} disabled={pagina === 0}>
                      ← Anterior
                    </button>
                    <span className={styles.paginacionInfo}>
                      Página {pagina + 1} de {totalPaginas} — {totalElementos} usuarios
                    </span>
                    <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
                      onClick={() => cargarUsuarios(pagina + 1)} disabled={pagina >= totalPaginas - 1}>
                      Siguiente →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {tabActiva === 'roles' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>➕ Nuevo Rol</span>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Nombre del Rol</label>
                <input placeholder="SUPERVISOR"
                  value={formRol.nombre}
                  onChange={e => setFormRol({ ...formRol, nombre: e.target.value.toUpperCase() })} />
              </div>
              <div className={styles.formGroup}>
                <label>Descripción</label>
                <input placeholder="Descripción del rol"
                  value={formRol.descripcion}
                  onChange={e => setFormRol({ ...formRol, descripcion: e.target.value })} />
              </div>
            </div>
            {error && <div className={styles.error}>⚠️ {error}</div>}
            {mensaje && <div className={styles.success}>✅ {mensaje}</div>}
            <div className={styles.formActions}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleCrearRol}>
                ➕ Crear Rol
              </button>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>🔑 Roles del Sistema</span>
              <span className={styles.cardCount}>{roles.length} roles</span>
            </div>
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr><th>ID</th><th>Nombre</th><th>Descripción</th></tr>
                </thead>
                <tbody>
                  {roles.map(r => (
                    <tr key={r.id}>
                      <td className={styles.idCell}>#{r.id}</td>
                      <td>{rolBadge(r.nombre)}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{r.descripcion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {modalRoles && (
        <div className={styles.modal} onClick={() => setModalRoles(null)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>🔑 Editar Roles — @{modalRoles.username}</h3>
            <div className={styles.rolesGrid} style={{ marginBottom: '1.5rem' }}>
              {roles.map(r => (
                <label key={r.nombre}
                  className={`${styles.rolCheckbox} ${rolesSeleccionados.includes(r.nombre) ? styles.rolCheckboxActivo : ''}`}
                  onClick={() => toggleRolSeleccionado(r.nombre)}>
                  {r.nombre}
                </label>
              ))}
            </div>
            <div className={styles.formActions}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleActualizarRoles}>
                💾 Guardar
              </button>
              <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setModalRoles(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}