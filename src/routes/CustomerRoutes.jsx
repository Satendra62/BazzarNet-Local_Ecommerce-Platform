import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';

// Lazy-loaded customer page components
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Products = lazy(() => import('../pages/Products'));
const ProductDetail = lazy(() => import('../pages/ProductDetail'));
const Stores = lazy(() => import('../pages/Stores'));
const StorePage = lazy(() => import('../pages/StorePage'));
const Cart = lazy(() => import('../pages/Cart'));
const Checkout = lazy(() => import('../pages/Checkout'));
const OrderConfirmation = lazy(() => import('../pages/OrderConfirmation'));
const Wishlist = lazy(() => import('../pages/Wishlist'));
const Orders = lazy(() => import('../pages/Orders'));
const CustomerOrderDetails = lazy(() => import('../pages/CustomerOrderDetails'));
const Profile = lazy(() => import('../pages/Profile'));
const FAQ = lazy(() => import('../pages/FAQ'));
const About = lazy(() => import('../pages/About'));
// const Help = lazy(() => import('../pages/Help')); // REMOVED

const CustomerRoutes = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen text-2xl font-semibold text-[var(--accent)]">
        Loading...
      </div>
    }>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/stores" element={<Stores />} />
          <Route path="/stores/:storeId" element={<StorePage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmation" element={<OrderConfirmation />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/my-orders/:orderId" element={<CustomerOrderDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/about" element={<About />} />
          {/* <Route path="/help" element={<Help />} /> */} {/* REMOVED */}
          {/* Redirect any other logged-in customer routes to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default CustomerRoutes;