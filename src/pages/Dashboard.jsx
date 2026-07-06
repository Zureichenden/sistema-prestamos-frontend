import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, LineChart, Line, ResponsiveContainer
} from 'recharts';
import dashboardService from '../services/dashboardService';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.obtener().then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.loading}>⏳ Cargando dashboard...</div>;
  if (!data) return <div className={styles.loading}>No se pudo cargar el dashboard</div>;

  const tarjetas = [
    {
      icono: '👤',
      label: 'Total Clientes',
      valor: data.totalClientes,
      color: '#eff6ff',
      subtexto: 'registrados en el sistema'
    },
    {
      icono: '📋',
      label: 'Préstamos Activos',
      valor: data.prestamosActivos,
      color: '#dcfce7',
      subtexto: `de ${data.totalPrestamos} préstamos totales`
    },
    {
      icono: '✅',
      label: 'Préstamos Liquidados',
      valor: data.prestamosLiquidados,
      color: '#dbeafe',
      subtexto: 'completados exitosamente'
    },
    {
      icono: '💰',
      label: 'Total Prestado',
      valor: `$${Number(data.montoTotalPrestado).toLocaleString('es-MX')}`,
      color: '#fef9c3',
      subtexto: 'monto acumulado'
    },
    {
      icono: '💳',
      label: 'Total Recaudado',
      valor: `$${Number(data.totalRecaudado).toLocaleString('es-MX')}`,
      color: '#f0fdf4',
      subtexto: 'pagos recibidos'
    },
    {
      icono: '📅',
      label: 'Pagos Este Mes',
      valor: data.pagosMes,
      color: '#fef2f2',
      subtexto: `$${Number(data.montoRecaudadoMes).toLocaleString('es-MX')} recaudado`
    }
  ];

  const datosGrafica = data.meses?.map((mes, i) => ({
    mes,
    Préstamos: data.prestamosPorMes?.[i] || 0,
    Pagos: data.pagosPorMes?.[i] || 0,
    Monto: Number(data.montoPorMes?.[i] || 0)
  }));

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>📊 Dashboard</h1>
        <p className={styles.pageSubtitle}>Resumen general del sistema de préstamos</p>
      </div>

      {/* TARJETAS */}
      <div className={styles.tarjetas}>
        {tarjetas.map((t, i) => (
          <div className={styles.tarjeta} key={i}>
            <div className={styles.tarjetaIcono} style={{ background: t.color }}>
              {t.icono}
            </div>
            <div className={styles.tarjetaInfo}>
              <div className={styles.tarjetaLabel}>{t.label}</div>
              <div className={styles.tarjetaValor}>{t.valor}</div>
              <div className={styles.tarjetaSubtexto}>{t.subtexto}</div>
            </div>
          </div>
        ))}
      </div>

      {/* GRÁFICAS */}
      <div className={styles.graficas}>

        {/* Préstamos y Pagos por mes */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>📈 Préstamos y Pagos — Últimos 6 meses</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={datosGrafica} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Préstamos" fill="#1e40af" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Pagos" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monto prestado por mes */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>💰 Monto Prestado — Últimos 6 meses</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={datosGrafica} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                formatter={v => [`$${Number(v).toLocaleString('es-MX')}`, 'Monto']}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="Monto" stroke="#1e40af"
                strokeWidth={2.5} dot={{ fill: '#1e40af', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RESUMEN FINANCIERO */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>💼 Resumen Financiero</span>
        </div>
        <div className={styles.resumenGrid}>
          <div className={styles.resumenItem}>
            <div className={styles.resumenLabel}>Total Prestado</div>
            <div className={styles.resumenValor}>
              ${Number(data.montoTotalPrestado).toLocaleString('es-MX')}
            </div>
          </div>
          <div className={styles.resumenItem}>
            <div className={styles.resumenLabel}>Total Recaudado</div>
            <div className={styles.resumenValor} style={{ color: 'var(--success)' }}>
              ${Number(data.totalRecaudado).toLocaleString('es-MX')}
            </div>
          </div>
          <div className={styles.resumenItem}>
            <div className={styles.resumenLabel}>Por Recaudar</div>
            <div className={styles.resumenValor} style={{ color: '#d97706' }}>
              ${(Number(data.montoTotalPrestado) - Number(data.totalRecaudado)).toLocaleString('es-MX')}
            </div>
          </div>
          <div className={styles.resumenItem}>
            <div className={styles.resumenLabel}>Recaudado Este Mes</div>
            <div className={styles.resumenValor} style={{ color: 'var(--success)' }}>
              ${Number(data.montoRecaudadoMes).toLocaleString('es-MX')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}