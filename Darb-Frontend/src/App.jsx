// src/App.jsx - Updated with Investment routes

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Import pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import MyCampaigns from './pages/MyCampaigns';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';

// Campaign related pages
import CreateCampaign from './pages/CreateCampaign';
import EditCampaign from './pages/EditCampaign';
import CampaignDisplay from './pages/CampaignDisplay';

// Investment related pages (NEW)
import PaymentVerification from './pages/PaymentVerification';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          {/* Dashboard - Public but shows different content based on auth */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Campaign Display - Public route */}
          <Route path="/campaign/:id" element={<CampaignDisplay />} />

          {/* Protected Routes - Require Authentication */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/my-campaigns" element={
            <ProtectedRoute>
              <MyCampaigns />
            </ProtectedRoute>
          } />

          {/* Campaign Management Routes - Protected */}
          <Route path="/pages/CreateCampaign" element={
            <ProtectedRoute>
              <CreateCampaign />
            </ProtectedRoute>
          } />

          <Route path="/create-campaign" element={
            <ProtectedRoute>
              <CreateCampaign />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/edit-campaign/:id" element={
            <ProtectedRoute>
              <EditCampaign />
            </ProtectedRoute>
          } />

          {/* Investment Routes - NEW */}
          
          {/* Payment Verification - Protected Route */}
          <Route path="/investment/verify/:paymentReference" element={
            <ProtectedRoute>
              <PaymentVerification />
            </ProtectedRoute>
          } />

          {/* Investment Success Page - Alternative route */}
          <Route path="/payment/success/:paymentReference" element={
            <ProtectedRoute>
              <PaymentVerification />
            </ProtectedRoute>
          } />

          {/* Investment Failed Page - Alternative route */}
          <Route path="/payment/failed/:paymentReference" element={
            <ProtectedRoute>
              <PaymentVerification />
            </ProtectedRoute>
          } />

          {/* Alternative routes for better UX */}
          <Route path="/create-campaign" element={
            <ProtectedRoute>
              <CreateCampaign />
            </ProtectedRoute>
          } />

          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;