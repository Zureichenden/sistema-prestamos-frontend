import { useState } from 'react';
import usuarioService from '../services/usuarioService';
import { getRoles } from '../utils/auth';
import styles from './MiPerfil.module.css';

export default function MiPerfil() {
  const username = localStorage.getItem('username');
  const roles = getRoles();

  const [form, setForm] = useState({
    passwordActual: '',
    passwordNueva: '',
    confirmarPassword: ''
  });
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleCambiarPassword = async () => {
    setError(''); setMensaje('');
    if (form.passwordNueva !== form.confirmarPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }
    try {
      await usuarioService.cambiarPassword(form);
      setMensaje('Contraseña actualizada correctamente');
      setForm({ passwordActual: '', passwordNueva: '', confirmarPassword: '' });
    } catch (e) {
      setError(e.response?.data?.error || 'Error al cambiar contraseña');
    }
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
        <h1 className={styles.pageTitle}>👤 Mi Perfil</h1>
        <p className={styles.pageSubtitle}>Información de tu cuenta y seguridad</p>
      </div>

      <div className={styles.grid}>

        {/* Información del usuario */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>ℹ️ Información de la cuenta</span>
          </div>
          <div className={styles.avatar}>👤</div>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Usuario</span>
              <span className={styles.infoValue}>@{username}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Estatus</span>
              <span className={`${styles.badge} ${styles.badgeActivo}`}>ACTIVO</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Roles asignados</span>
              <div className={styles.rolesLista}>
                {roles.map(r => rolBadge(r))}
              </div>
            </div>
          </div>
        </div>

        {/* Cambiar contraseña */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>🔒 Cambiar Contraseña</span>
          </div>
          <div className={styles.formGroup}>
            <label>Contraseña Actual</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.passwordActual}
              onChange={e => setForm({ ...form, passwordActual: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Nueva Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.passwordNueva}
              onChange={e => setForm({ ...form, passwordNueva: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Confirmar Nueva Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.confirmarPassword}
              onChange={e => setForm({ ...form, confirmarPassword: e.target.value })}
            />
          </div>
          {error && <div className={styles.error}>⚠️ {error}</div>}
          {mensaje && <div className={styles.success}>✅ {mensaje}</div>}
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleCambiarPassword}>
            🔒 Actualizar Contraseña
          </button>
          <p className={styles.hint}>Mínimo 6 caracteres</p>
        </div>

      </div>
    </div>
  );
}