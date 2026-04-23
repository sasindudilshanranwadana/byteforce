import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CampaignDetailPage from './pages/CampaignDetailPage';
import CreateCampaignPage from './pages/CreateCampaignPage';
import DonatePage from './pages/DonatePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import BackerDashboardPage from './pages/BackerDashboardPage';
import CampaignerDashboardPage from './pages/CampaignerDashboardPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
          <Route path="/create" element={
            <ProtectedRoute role="campaigner"><CreateCampaignPage /></ProtectedRoute>
          } />
          <Route path="/donate/:id" element={
            <ProtectedRoute role="backer"><DonatePage /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute role="admin"><AdminDashboardPage /></ProtectedRoute>
          } />
          <Route path="/dashboard/backer" element={
            <ProtectedRoute role="backer"><BackerDashboardPage /></ProtectedRoute>
          } />
          <Route path="/dashboard/campaigner" element={
            <ProtectedRoute role="campaigner"><CampaignerDashboardPage /></ProtectedRoute>
          } />
          <Route path="*" element={<div style={{ textAlign: 'center', padding: 80 }}><h2>404 — Page not found</h2></div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
