import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import * as api from '../services/api';

const useProducts = (isLoggedIn, userPincode) => { // NEW: Accept isLoggedIn and userPincode
  const [allAppProducts, setAllAppProducts] = useState([]);
  const [allAppProductsMeta, setAllAppProductsMeta] = useState({ page: 1, pages: 1, count: 0 });
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [recommendedLoading, setRecommendedLoading] = useState(true);

  const fetchAllProducts = useCallback(async (params = {}) => {
    try {
      const { products, page, pages, count } = await api.products.getAll(params);
      setAllAppProducts(products);
      setAllAppProductsMeta({ page, pages, count });
    } catch (error) {
      toast.error(`Failed to load products: ${error.message}`);
      setAllAppProducts([]);
      setAllAppProductsMeta({ page: 1, pages: 1, count: 0 });
    }
  }, []);

  const fetchProductsForStore = useCallback(async (storeId, params = {}) => {
    try {
      const { products, page, pages, count } = await api.products.getProductsByStore(storeId, params);
      return { products, page, pages, count };
    } catch (error) {
      toast.error(`Failed to load products for store: ${error.message}`);
      return { products: [], page: 1, pages: 1, count: 0 };
    }
  }, []);

  const fetchRecommendedProducts = useCallback(async () => { // Removed pincode param, will use userPincode from hook scope
    // Only fetch if logged in OR if a pincode is explicitly set (e.g., from PincodeModal)
    // For the public landing page, we don't want to fetch if no pincode is set.
    if (!isLoggedIn && !userPincode) {
      setRecommendedProducts([]);
      setRecommendedLoading(false);
      return;
    }
    setRecommendedLoading(true);
    try {
      const products = await api.products.getRecommended({ pincode: userPincode }); // Pass userPincode
      setRecommendedProducts(products);
    } catch (error) {
      console.error('Failed to fetch recommended products:', error);
      // Only show toast if logged in, or if a pincode was provided (meaning user actively tried to filter)
      if (isLoggedIn || userPincode) { // Check userPincode here
        toast.error(`Failed to load recommended products: ${error.message}`);
      }
      setRecommendedProducts([]);
    } finally {
      setRecommendedLoading(false);
    }
  }, [isLoggedIn, userPincode]); // Dependencies on isLoggedIn and userPincode

  useEffect(() => {
    // This useEffect should only trigger if isLoggedIn changes, or if userPincode changes
    // It will call fetchRecommendedProducts which has its own internal logic for skipping.
    fetchRecommendedProducts();
  }, [isLoggedIn, userPincode, fetchRecommendedProducts]); // Dependencies

  return {
    allAppProducts,
    allAppProductsMeta,
    fetchAllProducts,
    fetchProductsForStore,
    recommendedProducts,
    recommendedLoading,
    fetchRecommendedProducts,
    setAllAppProducts,
    setAllAppProductsMeta
  };
};

export default useProducts;