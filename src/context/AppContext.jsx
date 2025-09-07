import React, { createContext, useEffect, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';
import useUtils from '../hooks/useUtils';
import useProducts from '../hooks/useProducts';
import useStores from '../hooks/useStores';
import useCart from '../hooks/useCart.jsx';
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

  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);

  const [userPincode, setUserPincode] = React.useState(null);
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
  } = useProducts(isLoggedIn, userPincode); // NEW: Pass isLoggedIn, userPincode

  const {
    appStores,
    appStoresMeta,
    fetchAppStores,
    setAppStores,
    setAppStoresMeta,
  } = useStores(isLoggedIn, userPincode); // NEW: Pass isLoggedIn, userPincode

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

  const updateUserInContext = useCallback((updatedUserData) => {
    setAuthUser(prevUser => ({ ...prevUser, ...updatedUserData }));
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...updatedUserData }));
    }
  }, [setAuthUser]);

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
        fullName: vendorData.fullName,
        email: vendorData.email,
        password: vendorData.password,
        businessName: vendorData.businessName,
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

  useEffect(() => {
    const loadInitialData = async () => {
      if (isLoggedIn) {
        if (user?.address?.pinCode) {
          setUserPincode(user.address.pinCode);
          setShowPincodeModal(false);
        } else if (!isVendor && !isAdmin) {
          setShowPincodeModal(true);
        }

        const commonParams = { pincode: userPincode || user?.address?.pinCode };

        const promises = [
          // Only fetch these if a pincode is set or if it's a general fetch for logged-in users
          // The hooks themselves now handle the conditional fetching based on isLoggedIn/userPincode
          fetchCart(),
          fetchWishlist(),
          fetchOrders(),
          refetch(), // Coupons
        ];

        if (isAdmin) {
          promises.push(fetchAllUsers());
          promises.push(fetchAllProducts(commonParams)); // Admin fetches all products, potentially filtered by pincode
          promises.push(fetchAppStores(commonParams)); // Admin fetches all stores, potentially filtered by pincode
        }
        if (isVendor) {
          promises.push(fetchVendorProducts());
          promises.push(fetchAllProducts(commonParams)); // Vendor also needs all products for context, potentially filtered
          promises.push(fetchAppStores(commonParams)); // Vendor also needs all stores for context, potentially filtered
        }
        // For customers, fetchAllProducts and fetchAppStores are handled by the individual pages (Products, Stores)
        // or by the hooks' internal useEffects if userPincode is set.
        // Recommended products are handled by useProducts' internal useEffect.

        try {
          await Promise.all(promises);
        } catch (error) {
          console.error("Error loading initial data:", error);
        }
      } else {
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
        setUserPincode(null);
        setShowPincodeModal(false);
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
    recommendedProducts,
    recommendedLoading,
    fetchRecommendedProducts,
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
    userPincode,
    updateUserPincode,
    showPincodeModal,
    setShowPincodeModal,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};