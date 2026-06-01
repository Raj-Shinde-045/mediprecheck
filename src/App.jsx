import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { RoleSelector } from './pages/RoleSelector';
import { Kiosk } from './pages/patient/Kiosk';
import { DoctorQueue } from './pages/doctor/Queue';
import { TokenReview } from './pages/doctor/TokenReview';

function App() {
  const [userRole, setUserRole] = useState(null); // 'patient' | 'doctor' | null

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout userRole={userRole} onLogout={() => setUserRole(null)} />}>
          <Route index element={<RoleSelector onSelectRole={setUserRole} />} />

          {/* Patient Kiosk Flow */}
          <Route path="patient" element={userRole === 'patient' ? <Kiosk /> : <Navigate to="/" />} />

          {/* Doctor Flow */}
          <Route path="doctor" element={userRole === 'doctor' ? <DoctorQueue /> : <Navigate to="/" />} />
          <Route path="doctor/review/:token" element={userRole === 'doctor' ? <TokenReview /> : <Navigate to="/" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
