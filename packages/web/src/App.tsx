// ===========================================
// PureSkin Store — App Router
// ===========================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StockPage from './pages/StockPage';
import TicketsPage from './pages/TicketsPage';
import RestockPage from './pages/RestockPage';
import LogsPage from './pages/LogsPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ children, ownerOnly = false }: { children: React.ReactNode; ownerOnly?: boolean }) {
  const { user, loading, isOwner } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-600/30 border-t-brand-600 animate-spin" />
          <p className="text-dark-400 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (ownerOnly && !isOwner) return <Navigate to="/" replace />;

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-brand-600/30 border-t-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/stock" element={<StockPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/restock" element={<ProtectedRoute ownerOnly><RestockPage /></ProtectedRoute>} />
        <Route path="/logs" element={<ProtectedRoute ownerOnly><LogsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute ownerOnly><SettingsPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
