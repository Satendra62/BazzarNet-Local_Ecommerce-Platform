/**
 * @file api.js
 * @description Centralized API service for all backend interactions.
 */

// Base URL for your backend API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// --- Helper Functions ---
const getAuthToken = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = user?.token || null;
  // console.log('Frontend: getAuthToken returning:', token ? 'Token present' : 'No token'); // Removed excessive logging
  return token;
};

const buildQuery = (params = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined))
  ).toString();
  return query ? `?${query}` : '';
};

const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    // console.log(`Frontend: Sending token for ${endpoint}: Bearer ${token.substring(0, 10)}...`); // Log first 10 chars of token
  } else {
    // console.log(`Frontend: No token for ${endpoint}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    
    if (!response.ok) {
      // Explicitly handle 401 Unauthorized errors
      if (response.status === 401) {
        console.error(`Frontend: 401 Unauthorized for ${endpoint}. Token might be expired or invalid.`);
        // Trigger a logout to clear local storage and redirect.
        // This assumes a global logout function is available or can be imported.
        // For now, we'll re-throw and let the calling context handle the logout.
        // In a real app, you might have a global event or context method to force logout.
        // For this setup, useAuth's useEffect already handles auto-logout on /users/me 401.
        // For other 401s, we'll just show an error toast.
      }

      let errorData;
      try {
        errorData = await response.json();
      } catch {
        throw new Error(response.statusText || `API Error: ${response.status}`);
      }
      if (errorData.errors && Array.isArray(errorData.errors)) {
        throw new Error(errorData.errors.map(err => err.message).join(', ') || errorData.message);
      }
      throw new Error(errorData.message || `API Error: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`API Request Failed for ${endpoint}:`, error);
    // The useAuth hook's useEffect already handles auto-logout if /users/me fails.
    // For other API calls, we just re-throw the error to be caught by the specific hook/component.
    throw error;
  }
};

// --- Authentication ---
export const auth = {
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  registerUser: (userData) => apiRequest('/auth/register/customer', { method: 'POST', body: JSON.stringify(userData) }),
  registerVendor: (vendorData) => apiRequest('/auth/register/vendor', { method: 'POST', body: JSON.stringify(vendorData) }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
};

// --- User Profile ---
export const userProfile = {
  getMe: () => apiRequest('/users/me'),
  updateProfile: (profileData) => apiRequest('/users/me', { method: 'PUT', body: JSON.stringify(profileData) }),
  uploadProfileImage: (formData) => apiRequest('/users/me/profile-image', { method: 'PUT', body: formData, headers: {} }),
};

// --- Products ---
export const products = {
  getAll: (params = {}) => apiRequest(`/products${buildQuery(params)}`), // Added this method
  getById: (productId) => apiRequest(`/products/${productId}`),
  // NEW: Method to get products for a specific store
  getProductsByStore: (storeId, params = {}) => apiRequest(`/products${buildQuery({ ...params, store: storeId })}`),
  getRecommended: (params = {}) => apiRequest(`/products/recommended${buildQuery(params)}`),
};

// --- Stores ---
export const stores = {
  getAll: (params = {}) => apiRequest(`/stores${buildQuery(params)}`),
  getById: (storeId) => apiRequest(`/stores/${storeId}`),
  updateStore: (storeId, storeData) => apiRequest(`/stores/${storeId}`, { method: 'PUT', body: JSON.stringify(storeData) }),
};

// --- Vendor ---
export const vendor = {
  getDashboardStats: (vendorId) => apiRequest(`/vendors/${vendorId}/dashboard/stats`),
  getSalesTrend: (vendorId, params = {}) => apiRequest(`/vendors/${vendorId}/dashboard/sales-trend${buildQuery(params)}`),
  getFastSellingItems: (vendorId, params = {}) => apiRequest(`/vendors/${vendorId}/dashboard/fast-selling-items${buildQuery(params)}`),
  getProducts: (params = {}) => apiRequest(`/products${buildQuery(params)}`),
  addProduct: (productData) => apiRequest('/products', { method: 'POST', body: JSON.stringify(productData) }),
  updateProduct: (productId, productData) => apiRequest(`/products/${productId}`, { method: 'PUT', body: JSON.stringify(productData) }),
  deleteProduct: (productId) => apiRequest(`/products/${productId}`, { method: 'DELETE' }),
  getOrders: (storeId, params = {}) => apiRequest(`/orders/store/${storeId}${buildQuery(params)}`),
  updateOrderStatus: (orderId, status) => apiRequest(`/orders/${orderId}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  confirmDelivery: (orderId, otp) => apiRequest(`/orders/${orderId}/confirm-delivery`, { method: 'POST', body: JSON.stringify({ otp }) }),
  getPayments: (vendorId, params = {}) => apiRequest(`/payments/vendor/${vendorId}${buildQuery(params)}`),
  reportPaymentIssue: (paymentId) => apiRequest(`/payments/${paymentId}/report-issue`, { method: 'POST' }),
  getMySupportTickets: () => apiRequest('/users/me/support-tickets'), // NEW: Added for vendor
};

// --- Customer ---
export const customer = {
  getCart: () => apiRequest('/cart'),
  addToCart: (productId, quantity = 1, unit) => apiRequest('/cart', { method: 'POST', body: JSON.stringify({ productId, quantity, unit }) }),
  updateCartItem: (itemId, quantity) => apiRequest(`/cart/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeFromCart: (itemId) => apiRequest(`/cart/${itemId}`, { method: 'DELETE' }),
  getWishlist: () => apiRequest('/wishlist'),
  addToWishlist: (productId, unit) => apiRequest('/wishlist', { method: 'POST', body: JSON.stringify({ productId, unit }) }),
  removeFromWishlist: (productId) => apiRequest(`/wishlist/${productId}`, { method: 'DELETE' }),
  placeOrder: (orderData) => apiRequest('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  getOrders: (userId, params = {}) => apiRequest(`/orders/user/${userId}${buildQuery(params)}`),
  getOrderById: (orderId) => apiRequest(`/orders/${orderId}`),
  createProductReview: (productId, reviewData) => apiRequest(`/products/${productId}/reviews`, { method: 'POST', body: JSON.stringify(reviewData) }), // New
  getProductReviews: (productId) => apiRequest(`/products/${productId}/reviews`), // New
  getPendingReviews: () => apiRequest('/users/me/pending-reviews'), // New
  getMySupportTickets: () => apiRequest('/users/me/support-tickets'), // NEW: Added for customer
};

// --- Admin ---
// --- Admin ---
export const admin = {
  getDashboardStats: () => apiRequest('/admin/dashboard/stats'),
  getUsers: (params = {}) => apiRequest(`/admin/users${buildQuery(params)}`),
  updateUserStatus: (userId, isActive) => apiRequest(`/admin/users/${userId}/status`, { method: 'PUT', body: JSON.stringify({ isActive }) }),
  deleteUser: (userId) => apiRequest(`/admin/users/${userId}`, { method: 'DELETE' }),
  getProducts: (params = {}) => apiRequest(`/products${buildQuery(params)}`),
  updateProduct: (productId, productData) => apiRequest(`/admin/products/${productId}`, { method: 'PUT', body: JSON.stringify(productData) }),
  deleteProduct: (productId) => apiRequest(`/admin/products/${productId}`, { method: 'DELETE' }),
  getOrders: (params = {}) => apiRequest(`/admin/orders${buildQuery(params)}`),
  updateOrderStatus: (orderId, statusData) => apiRequest(`/orders/${orderId}/status`, { method: 'PUT', body: JSON.stringify(statusData) }),
  initiateRefund: (orderId) => apiRequest(`/admin/orders/${orderId}/refund`, { method: 'POST' }),
  updateStore: (storeId, storeData) => apiRequest(`/admin/stores/${storeId}`, { method: 'PUT', body: JSON.stringify(storeData) }),
  deleteStore: (storeId) => apiRequest(`/admin/stores/${storeId}`, { method: 'DELETE' }),

  // ✅ Fixed: fetch support tickets
  getSupportTickets: ({ search = '', status = '' } = {}) => {
    const query = buildQuery({ search, status });
    return apiRequest(`/support/admin${query}`);
  },

  // ✅ Fixed: update ticket status
  updateSupportTicketStatus: (ticketId, statusData) =>
    apiRequest(`/support/admin/${ticketId}/status`, { method: 'PUT', body: JSON.stringify(statusData) }),
};


// --- Upload ---
export const upload = {
  uploadImage: (formData) => apiRequest('/upload', { method: 'POST', body: formData }),
};

// --- General ---
export const general = {
  getStores: (params = {}) => apiRequest(`/stores${buildQuery(params)}`),
  getStoreById: (storeId) => apiRequest(`/stores/${storeId}`),
  getCategories: () => apiRequest('/categories'),
  getFAQ: () => apiRequest('/faq'),
  getAboutContent: () => apiRequest('/about'),
  submitSupportRequest: (supportData) => apiRequest('/support/submit', { method: 'POST', body: JSON.stringify(supportData) }),
};

// --- Password Reset ---
export const passwordReset = {
  forgotPassword: (email) => apiRequest('/password-reset/forgot', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token, password) => apiRequest(`/password-reset/reset/${token}`, { method: 'POST', body: JSON.stringify({ password }) }),
};

// --- Coupon ---
export const coupon = {
  getAll: () => apiRequest('/coupons'),
  validate: (code, totalPrice) => apiRequest('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, totalPrice }) }),
};

// NEW: Razorpay API endpoints
export const razorpay = {
  createOrder: (amount, currency = 'INR') => apiRequest('/razorpay/create-order', { method: 'POST', body: JSON.stringify({ amount, currency }) }),
};