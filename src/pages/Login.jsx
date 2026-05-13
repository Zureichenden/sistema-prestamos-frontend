import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Login.module.css';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError('');
    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      navigate('/');
    } catch (e) {
      setError('Usuario o contraseña incorrectos');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.icon}>🏦</div>
          <h1 className={styles.title}>Sistema de Préstamos</h1>
          <p className={styles.subtitle}>Inicia sesión para continuar</p>
        </div>

        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label>Usuario</label>
            <input
              type="text"
              placeholder="admin"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={handleKeyDown}
            />
          </div>
          {error && <div className={styles.error}>⚠️ {error}</div>}
          <button className={styles.btn} onClick={handleSubmit}>
            Iniciar Sesión
          </button>
        </div>

        <p className={styles.hint}>admin / admin123</p>
      </div>
    </div>
  );
}