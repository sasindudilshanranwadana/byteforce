import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/Toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { FullPageSpinner } from './components/ui/Spinner';

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
const HomePage              = lazy(() => import('./pages/HomePage'));
const LoginPage             = lazy(() => import('./pages/LoginPage'));
const RegisterPage          = lazy(() => import('./pages/RegisterPage'));
const CampaignDetailPage    = lazy(() => import('./pages/CampaignDetailPage'));
const CreateCampaignPage    = lazy(() => import('./pages/CreateCampaignPage'));
const DonatePage            = lazy(() => import('./pages/DonatePage'));
const BackerDashboardPage   = lazy(() => import('./pages/BackerDashboardPage'));
const CampaignerDashboardPage = lazy(() => import('./pages/CampaignerDashboardPage'));
const AdminDashboardPage    = lazy(() => import('./pages/AdminDashboardPage'));
const NotFoundPage          = lazy(() => import('./pages/NotFoundPage'));

export default function App() {
  return (
    <>
      {/* Global toast notifications */}
      <Toaster position="top-right" richColors closeButton />

      <div className="flex flex-col min-h-screen">
        <Navbar />

        <Suspense fallback={<FullPageSpinner />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/campaigns/:id" element={<CampaignDetailPage />} />

            {/* Authenticated: any role */}
            <Route
              path="/campaigns/:id/donate"
              element={
                <ProtectedRoute>
                  <DonatePage />
                </ProtectedRoute>
              }
            />

            {/* Backer dashboard */}
            <Route
              path="/dashboard/backer"
              element={
                <ProtectedRoute roles={['backer']}>
                  <BackerDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Campaigner dashboard */}
            <Route
              path="/dashboard/campaigner"
              element={
                <ProtectedRoute roles={['campaigner']}>
                  <CampaignerDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Create campaign — campaigners and admins */}
            <Route
              path="/campaigns/create"
              element={
                <ProtectedRoute roles={['campaigner', 'admin']}>
                  <CreateCampaignPage />
                </ProtectedRoute>
              }
            />

            {/* Admin dashboard */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>

        <Footer />
      </div>
    </>
  );
}
