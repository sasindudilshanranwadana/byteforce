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
const BackerDonationHistoryPage = lazy(() => import('./pages/BackerDonationHistoryPage'));
const CampaignerDashboardPage = lazy(() => import('./pages/CampaignerDashboardPage'));
const CampaignerAnalyticsPage = lazy(() => import('./pages/CampaignerAnalyticsPage'));
const AdminDashboardPage    = lazy(() => import('./pages/AdminDashboardPage'));
const EditCampaignPage      = lazy(() => import('./pages/EditCampaignPage'));
const ForgotPasswordPage    = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage     = lazy(() => import('./pages/ResetPasswordPage'));
const DonationSuccessPage   = lazy(() => import('./pages/DonationSuccessPage'));
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
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
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
            <Route
              path="/campaigns/:id/success"
              element={
                <ProtectedRoute>
                  <DonationSuccessPage />
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
            <Route
              path="/dashboard/backer/donations"
              element={
                <ProtectedRoute roles={['backer', 'campaigner', 'admin']}>
                  <BackerDonationHistoryPage />
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
            <Route
              path="/dashboard/campaigner/analytics"
              element={
                <ProtectedRoute roles={['campaigner', 'admin']}>
                  <CampaignerAnalyticsPage />
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

            {/* Edit campaign — campaigners and admins */}
            <Route
              path="/campaigns/:id/edit"
              element={
                <ProtectedRoute roles={['campaigner', 'admin']}>
                  <EditCampaignPage />
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
