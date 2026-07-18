import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LandingForm from './pages/LandingForm';
import ConfirmarAsistencia from './pages/ConfirmAttendance';
import Reception from './pages/Reception';
import Taller from './pages/Taller';
import LandingPage from './pages/LandingPage';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthContext } from './context/AuthContext';

function AuthGate({ children, requireAuth = true }) {
  const { usuario, cargando } = useContext(AuthContext);

  if (cargando) {
    return <div style={{ color: '#fff', padding: '24px' }}>Validando sesión...</div>;
  }

  if (requireAuth && !usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!requireAuth && usuario) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  const { cerrarSesion } = useContext(AuthContext);

  return (
    <Router>
      <div className="App">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthGate requireAuth={false}><Login /></AuthGate>} />
            <Route path="/agendar" element={<LandingForm />} />
            <Route path="/reserva-atencion" element={<Navigate to="/agendar" />} />
            <Route path="/recepcion" element={<AuthGate><Reception /></AuthGate>} />
            <Route path="/confirmar-asistencia/:id" element={<AuthGate><ConfirmarAsistencia /></AuthGate>} />
            <Route path="/dashboard" element={
              <AuthGate>
                <Dashboard manejarCierreSesion={cerrarSesion} />
              </AuthGate>
            } />
            <Route path="/taller" element={
              <AuthGate>
                <Taller manejarCierreSesion={cerrarSesion} />
              </AuthGate>
            } />
          </Routes>
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default App;
