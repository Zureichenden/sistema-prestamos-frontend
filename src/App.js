import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import Clientes from './pages/Clientes';
import Prestamos from './pages/Prestamos';
import Pagos from './pages/Pagos';
import Bitacora from './pages/Bitacora';
import Reportes from './pages/Reportes';
import Configuracion from './pages/Configuracion';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { isAdmin, isGestor, isAuditor } from './utils/auth';
import './styles/App.css';

function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles()) return <Navigate to="/sin-permiso" />;
  return children;
}

function SinPermiso() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <div style={{ fontSize: '4rem' }}>🚫</div>
      <h2 style={{ color: '#1e293b', marginTop: '1rem' }}>Sin permiso</h2>
      <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
        No tienes acceso a esta sección.
      </p>
    </div>
  );
}

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('roles');
    navigate('/login');
  };

  const username = localStorage.getItem('username');

  return (
    <nav className="navbar">
      <div className="nav-brand">🏦 Sistema de Préstamos</div>
      <div className="nav-links">
        {isGestor() && <NavLink to="/" end>Clientes</NavLink>}
        {isGestor() && <NavLink to="/prestamos">Préstamos</NavLink>}
        {isGestor() && <NavLink to="/pagos">Pagos</NavLink>}
        {isAuditor() && <NavLink to="/reportes">Reportes</NavLink>}
        {isAuditor() && <NavLink to="/bitacora">Bitácora</NavLink>}
        {isAdmin() && <NavLink to="/configuracion">⚙️ Config</NavLink>}
        <NavLink to="/dashboard">📊 Dashboard</NavLink>

      </div>
      <div className="nav-user">
        <span className="nav-username">👤 {username}</span>
        <button className="nav-logout" onClick={handleLogout}>Cerrar sesión</button>
      </div>
    </nav>
  );
}

function Layout({ children }) {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/sin-permiso" element={<Layout><SinPermiso /></Layout>} />

        <Route path="/" element={
          <PrivateRoute allowedRoles={isGestor}>
            <Layout><Clientes /></Layout>
          </PrivateRoute>
        } />
        <Route path="/prestamos" element={
          <PrivateRoute allowedRoles={isGestor}>
            <Layout><Prestamos /></Layout>
          </PrivateRoute>
        } />
        <Route path="/pagos" element={
          <PrivateRoute allowedRoles={isGestor}>
            <Layout><Pagos /></Layout>
          </PrivateRoute>
        } />
        <Route path="/reportes" element={
          <PrivateRoute allowedRoles={isAuditor}>
            <Layout><Reportes /></Layout>
          </PrivateRoute>
        } />
        <Route path="/bitacora" element={
          <PrivateRoute allowedRoles={isAuditor}>
            <Layout><Bitacora /></Layout>
          </PrivateRoute>
        } />
        <Route path="/configuracion" element={
          <PrivateRoute allowedRoles={isAdmin}>
            <Layout><Configuracion /></Layout>
          </PrivateRoute>
        } />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Layout><Dashboard /></Layout>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;