import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { RoleSelector } from './pages/RoleSelector';
import { AuthPage } from './pages/auth/AuthPage';
import { Kiosk } from './pages/patient/Kiosk';
import { DoctorQueue } from './pages/doctor/Queue';
import { TokenReview } from './pages/doctor/TokenReview';
import { Settings } from './pages/clinic/Settings';

function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!currentUser) return <Navigate to={`/auth`} />;
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={
              <PrivateRoute>
                <RoleSelector />
              </PrivateRoute>
            } />
            <Route path="auth" element={<AuthPage />} />

            {/* Patient Kiosk Flow */}
            <Route path="patient" element={
              <PrivateRoute>
                <Kiosk />
              </PrivateRoute>
            } />

            {/* Doctor Flow */}
            <Route path="doctor" element={
              <PrivateRoute>
                <DoctorQueue />
              </PrivateRoute>
            } />
            <Route path="doctor/review/:token" element={
              <PrivateRoute>
                <TokenReview />
              </PrivateRoute>
            } />
            
            {/* Clinic Settings */}
            <Route path="settings" element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
