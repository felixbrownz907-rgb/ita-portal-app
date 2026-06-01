import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './views/Login';
import { Portal } from './views/Portal';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, dataLoaded } = useAuth();
  const location = useLocation();

  if (!dataLoaded && !user) return (
    <div className="min-h-screen bg-white flex items-center justify-center font-mono">
       <div className="text-[12px] font-black uppercase tracking-[0.8em] text-blue-600 animate-pulse italic">
         LINK_ESTABLISHING...
       </div>
    </div>
  );

  if (!user || !user.role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'student' ? '/student' : '/staff'} replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'student' ? '/student' : '/staff'} /> : <Login />} />
      
      <Route path="/staff/*" element={
        <ProtectedRoute allowedRoles={['admin', 'staff', 'instructor']}>
          <Portal portalType="staff" />
        </ProtectedRoute>
      } />
      
      <Route path="/student/*" element={
        <ProtectedRoute allowedRoles={['student']}>
          <Portal portalType="student" />
        </ProtectedRoute>
      } />

      <Route path="/" element={<Navigate to={user ? (user.role === 'student' ? '/student' : '/staff') : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
