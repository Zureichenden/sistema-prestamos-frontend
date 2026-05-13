import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import Clientes from './pages/Clientes';
import Prestamos from './pages/Prestamos';
import Pagos from './pages/Pagos';
import Login from './pages/Login';
import Bitacora from './pages/Bitacora';
import Reportes from './pages/Reportes';

import './styles/App.css';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const username = localStorage.getItem('username');

  return (
    <nav className="navbar">
      <div className="nav-brand">🏦 Sistema de Préstamos</div>
      <div className="nav-links">
        <NavLink to="/" end>Clientes</NavLink>
        <NavLink to="/prestamos">Préstamos</NavLink>
        <NavLink to="/pagos">Pagos</NavLink>
        <NavLink to="/bitacora">Bitácora</NavLink>
        <NavLink to="/reportes">Reportes</NavLink>

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

        <Route path="/" element={
          <PrivateRoute>
            <Layout><Clientes /></Layout>
          </PrivateRoute>
        } />

        <Route path="/prestamos" element={
          <PrivateRoute>
            <Layout><Prestamos /></Layout>
          </PrivateRoute>
        } />

        <Route path="/pagos" element={
          <PrivateRoute>
            <Layout><Pagos /></Layout>
          </PrivateRoute>
        } />


        <Route path="/bitacora" element={
          <PrivateRoute>
            <Layout><Bitacora /></Layout>
          </PrivateRoute>
        } />

        <Route path="/reportes" element={
          <PrivateRoute>
            <Layout><Reportes /></Layout>
          </PrivateRoute>
        } />



      </Routes>
    </BrowserRouter>
  );
}

export default App;