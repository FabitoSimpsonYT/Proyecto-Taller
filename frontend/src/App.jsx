import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LandingForm from './pages/LandingForm';
import ConfirmAttendance from './pages/ConfirmAttendance';
import Reception from './pages/Reception';
import Taller from './pages/Taller';
import LandingPage from './pages/LandingPage';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthContext } from './context/AuthContext';

function AuthGate({ children, requireAuth = true }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ color: '#fff', padding: '24px' }}>Validando sesión...</div>;
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!requireAuth && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  const { logout } = useContext(AuthContext);

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
            <Route path="/confirm-attendance/:id" element={<AuthGate><ConfirmAttendance /></AuthGate>} />
            <Route path="/dashboard" element={
              <AuthGate>
                <Dashboard handleLogout={logout} />
              </AuthGate>
            } />
            <Route path="/taller" element={
              <AuthGate>
                <Taller handleLogout={logout} />
              </AuthGate>
            } />
          </Routes>
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default App;
