import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';

// Lazy-loaded public page components
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Dashboard = lazy(() => import('../pages/Dashboard')); // LandingPage is rendered via Dashboard when not logged in
const FAQ = lazy(() => import('../pages/FAQ'));
const About = lazy(() => import('../pages/About'));
// const Help = lazy(() => import('../pages/Help')); // REMOVED
const ForgotPassword = lazy(() => import('../pages/ForgotPassword')); // Import new page
const ResetPassword = lazy(() => import('../pages/ResetPassword')); // Import new page
const Careers = lazy(() => import('../pages/Careers')); // NEW: Import Careers page
const ContactUs = lazy(() => import('../pages/ContactUs')); // NEW: Import ContactUs page
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy')); // NEW: Import PrivacyPolicy page
const TermsOfService = lazy(() => import('../pages/TermsOfService')); // NEW: Import TermsOfService page

const PublicRoutes = () => {
  return (
    <Suspense fallback={null}> {/* Changed fallback to null */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /> {/* New route */}
        <Route path="/reset-password/:token" element={<ResetPassword />} /> {/* New route */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Dashboard />} /> {/* Landing page */}
          <Route path="/faq" element={<FAQ />} />
          <Route path="/about" element={<About />} />
          {/* <Route path="/help" element={<Help />} /> */} {/* REMOVED */}
          <Route path="/careers" element={<Careers />} /> {/* NEW: Careers route */}
          <Route path="/contact-us" element={<ContactUs />} /> {/* NEW: Contact Us route */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} /> {/* NEW: Privacy Policy route */}
          <Route path="/terms-of-service" element={<TermsOfService />} /> {/* NEW: Terms of Service route */}
        </Route>
        {/* Catch-all for any other public routes, redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
};

export default PublicRoutes;