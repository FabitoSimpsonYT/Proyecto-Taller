import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LandingForm from './pages/LandingForm';
import ConfirmAttendance from './pages/ConfirmAttendance';
import Reception from './pages/Reception';
import Taller from './pages/Taller';
import LandingPage from './pages/LandingPage';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <div className="App">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/agendar" element={<LandingForm />} />
            <Route path="/reserva-atencion" element={<Navigate to="/agendar" />} />
            <Route path="/recepcion" element={<Reception />} />
            <Route path="/confirm-attendance/:id" element={<ConfirmAttendance />} />
            <Route path="/dashboard" element={
              token ? <Dashboard handleLogout={() => { localStorage.removeItem('token'); window.location.href = '/login'; }} /> : <Navigate to="/login" />
            } />
            <Route path="/taller" element={
              token ? <Taller handleLogout={() => { localStorage.removeItem('token'); window.location.href = '/login'; }} /> : <Navigate to="/login" />
            } />
          </Routes>
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default App;
