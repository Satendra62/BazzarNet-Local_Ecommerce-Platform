import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';

// Lazy-loaded vendor page components
const Dashboard = lazy(() => import('../pages/Dashboard'));
const ManageProducts = lazy(() => import('../pages/ManageProducts'));
const Orders = lazy(() => import('../pages/Orders'));
const OrderDetails = lazy(() => import('../pages/OrderDetails'));
const Payments = lazy(() => import('../pages/Payments'));
const Profile = lazy(() => import('../pages/Profile'));
// const Help = lazy(() => import('../pages/Help')); // REMOVED

const VendorRoutes = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen text-2xl font-semibold text-[var(--accent)]">
        Loading...
      </div>
    }>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/manage-products" element={<ManageProducts />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:orderId" element={<OrderDetails />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/profile" element={<Profile />} />
          {/* <Route path="/help" element={<Help />} /> */} {/* REMOVED */}
          {/* Redirect any other logged-in vendor routes to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default VendorRoutes;