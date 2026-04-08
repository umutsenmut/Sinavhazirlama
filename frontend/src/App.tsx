import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import MainLayout from './components/Layout/MainLayout';
import AuthLayout from './components/Layout/AuthLayout';
import Loading from './components/Common/Loading';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Exams = lazy(() => import('./pages/Exams'));
const ExamDetail = lazy(() => import('./pages/ExamDetail'));
const Plans = lazy(() => import('./pages/Plans'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading fullPage />;
  if (!user) return <Navigate to="/giris" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading fullPage />;
  if (user) return <Navigate to="/panel" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Loading fullPage />}>
          <Routes>
            {/* Public auth routes */}
            <Route element={<AuthLayout />}>
              <Route
                path="/giris"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/kayit"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
            </Route>

            {/* Protected app routes */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/panel" element={<Dashboard />} />
              <Route path="/sinavlar" element={<Exams />} />
              <Route path="/sinavlar/:id" element={<ExamDetail />} />
              <Route path="/planlar" element={<Plans />} />
              <Route path="/ayarlar" element={<Settings />} />
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/panel" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
