import React, { createContext, useEffect, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';
import useUtils from '../hooks/useUtils';
import useProducts from '../hooks/useProducts';
import useStores from '../hooks/useStores';
import useCart from '../hooks/useCart.jsx'; // Corrected import path
import useWishlist from '../hooks/useWishlist';
import useOrders from '../hooks/useOrders';
import useUsers from '../hooks/useUsers';
import useVendorProducts from '../hooks/useVendorProducts';
import useAdminProducts from '../hooks/useAdminProducts';
import useAdminStores from '../hooks/useAdminStores';
import useCoupons from '../hooks/useCoupons';
import * as api from '../services/api';
import toast from 'react-hot-toast';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const {
    isLoggedIn,
    user,
    isVendor,
    isAdmin,
    loginAsUser,
    loginAsVendor,
    loginAsAdmin,
    logout,
    setUser: setAuthUser,
    loginUserInState,
  } = useAuth();

  const { theme, toggleTheme } = useTheme();
  const { generateOtp } = useUtils();

  // Sidebar state is still local to AppContext as it's a global UI state
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);

  // NEW: Pincode state for filtering and modal visibility
  const [userPincode, setUserPincode] = React.useState(null); // The active pincode for filtering
  const [showPincodeModal, setShowPincodeModal] = React.useState(false);

  const updateUserPincode = useCallback((pincode) => {
    setUserPincode(pincode);
  }, []);

  // --- Data Hooks ---
  const {
    allAppProducts,
    allAppProductsMeta,
    fetchAllProducts,
    recommendedProducts,
    recommendedLoading,
    fetchRecommendedProducts,
    setAllAppProducts,
    setAllAppProductsMeta
  } = useProducts();

  const {
    appStores,
    appStoresMeta,
    fetchAppStores,
    setAppStores,
    setAppStoresMeta,
  } = useStores();

  const {
    cart,
    fetchCart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    checkout,
    setCart
  } = useCart(isLoggedIn, user, isVendor, isAdmin);

  const {
    wishlist,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    moveToWishlist,
    setWishlist
  } = useWishlist(isLoggedIn, user, isVendor, isAdmin, addToCart, fetchCart);

  const {
    orders,
    ordersMeta,
    fetchOrders,
    updateOrderStatus,
    confirmDeliveryWithOtp,
    setOrders,
    setOrdersMeta,
  } = useOrders(isLoggedIn, user, isVendor, isAdmin);

  const {
    allAppUsers,
    allAppUsersMeta,
    fetchAllUsers,
    deleteUser,
    updateUserStatus,
    setAllAppUsers,
    setAllAppUsersMeta,
  } = useUsers(isLoggedIn, isAdmin, fetchAllProducts, fetchAppStores);

  const {
    vendorProducts,
    vendorProductsMeta,
    fetchVendorProducts,
    addVendorProduct,
    editVendorProduct,
    deleteVendorProduct,
    setVendorProducts,
    setVendorProductsMeta,
  } = useVendorProducts(isLoggedIn, isVendor, user);

  const {
    adminEditProduct,
    adminDeleteProduct,
  } = useAdminProducts(isLoggedIn, isAdmin, fetchAllProducts, allAppProductsMeta);

  const {
    adminUpdateStore,
    adminDeleteStore,
  } = useAdminStores(isLoggedIn, isAdmin, fetchAppStores, appStoresMeta, fetchAllProducts);

  const {
    availableCoupons,
    appliedCoupon,
    discountAmount,
    refetch,
    applyCoupon,
    removeCoupon,
    setAppliedCoupon,
    setDiscountAmount,
  } = useCoupons({ user, isLoggedIn, orders });

  // --- User Profile Update in Context ---
  const updateUserInContext = useCallback((updatedUserData) => {
    setAuthUser(prevUser => ({ ...prevUser, ...updatedUserData }));
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...updatedUserData }));
    }
  }, [setAuthUser]);

  // --- Signup Functions (Backend Integrated) ---
  const registerUser = useCallback(async (userData) => {
    try {
      const response = await api.auth.registerUser(userData);
      if (response) {
        loginUserInState(response);
        toast.success(`Welcome to BazzarNet, ${response.name}!`);
        return true;
      }
      return false;
    } catch (error) {
      toast.error(error.message || 'Registration failed.');
      return false;
    }
  }, [loginUserInState]);

  const registerVendor = useCallback(async (vendorData) => {
    try {
      const response = await api.auth.registerVendor({
        fullName: vendorData.fullName, // CORRECTED: Use fullName as key
        email: vendorData.email,
        password: vendorData.password,
        businessName: vendorData.businessName, // CORRECTED: Use businessName as key
        businessDescription: vendorData.businessDescription,
        category: vendorData.category,
        phone: vendorData.phone,
        pan: vendorData.pan,
        gst: vendorData.gst,
        address: vendorData.address,
      });
      if (response) {
        loginUserInState(response);
        toast.success(`Welcome, ${response.name}! Your store is now live.`);
        return true;
      }
      return false;
    } catch (error) {
      toast.error(error.message || 'Vendor registration failed.');
      return false;
    }
  }, [loginUserInState]);

  // --- Initial Data Load on Login/Role Change ---
  useEffect(() => {
    const loadInitialData = async () => {
      if (isLoggedIn) {
        // Set initial userPincode from profile if available
        if (user?.address?.pinCode) {
          setUserPincode(user.address.pinCode);
          setShowPincodeModal(false); // Don't show modal if pincode is already in profile
        } else if (!isVendor && !isAdmin) {
          // Only show pincode modal for customers without a pincode in profile
          setShowPincodeModal(true);
        }

        const commonParams = { pincode: userPincode || user?.address?.pinCode }; // Use active pincode or profile pincode

        const promises = [
          fetchAllProducts(commonParams),
          fetchAppStores(commonParams),
          fetchCart(),
          fetchWishlist(),
          fetchOrders(),
          refetch(),
        ];

        if (isAdmin) {
          promises.push(fetchAllUsers());
        }
        if (isVendor) {
          promises.push(fetchVendorProducts());
        }

        try {
          await Promise.all(promises);
        } catch (error) {
          console.error("Error loading initial data:", error);
        }
      } else {
        // Clear all data if logged out
        setCart([]);
        setWishlist([]);
        setAllAppProducts([]);
        setAllAppProductsMeta({ page: 1, pages: 1, count: 0 });
        setVendorProducts([]);
        setVendorProductsMeta({ page: 1, pages: 1, count: 0 });
        setOrders([]);
        setOrdersMeta({ page: 1, pages: 1, count: 0 });
        setAppStores([]);
        setAppStoresMeta({ page: 1, pages: 1, count: 0 });
        setAllAppUsers([]); 
        setAllAppUsersMeta({ page: 1, pages: 1, count: 0 });
        setAppliedCoupon(null); 
        setDiscountAmount(0); 
        setUserPincode(null); // Clear active pincode
        setShowPincodeModal(false); // Hide modal
      }
    };

    loadInitialData();
  }, [isLoggedIn, user, isAdmin, isVendor, fetchAllProducts, fetchAppStores, fetchCart, fetchWishlist, fetchOrders, fetchAllUsers, fetchVendorProducts, refetch, setCart, setWishlist, setAllAppProducts, setAllAppProductsMeta, setAppStores, setAppStoresMeta, setOrders, setOrdersMeta, setAllAppUsers, setAllAppUsersMeta, setVendorProducts, setVendorProductsMeta, setAppliedCoupon, setDiscountAmount, userPincode]);


  const value = {
    theme,
    toggleTheme,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    isLoggedIn,
    user,
    isVendor,
    isAdmin,
    loginAsUser,
    loginAsVendor,
    loginAsAdmin,
    logout,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    checkout,
    wishlist,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    moveToWishlist,
    allAppProducts,
    allAppProductsMeta,
    fetchAllProducts,
    vendorProducts,
    vendorProductsMeta,
    fetchVendorProducts,
    addVendorProduct,
    editVendorProduct,
    deleteVendorProduct,
    orders,
    ordersMeta,
    fetchOrders,
    updateOrderStatus,
    confirmDeliveryWithOtp,
    generateOtp,
    appStores,
    appStoresMeta,
    fetchAppStores,
    allAppUsers,
    allAppUsersMeta,
    fetchAllUsers,
    deleteUser,
    updateUserStatus,
    adminEditProduct,
    adminDeleteProduct,
    adminUpdateStore,
    adminDeleteStore,
    registerUser,
    registerVendor,
    updateUserInContext,
    availableCoupons,
    appliedCoupon,
    discountAmount,
    fetchAvailableCoupons: refetch,
    applyCoupon,
    removeCoupon,
    userPincode, // NEW: Expose userPincode
    updateUserPincode, // NEW: Expose updater
    showPincodeModal, // NEW: Expose modal visibility
    setShowPincodeModal, // NEW: Expose modal setter
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};