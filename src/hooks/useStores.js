import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import * as api from '../services/api';

const useStores = (isLoggedIn, userPincode) => { // NEW: Accept isLoggedIn and userPincode
  const [appStores, setAppStores] = useState([]);
  const [appStoresMeta, setAppStoresMeta] = useState({ page: 1, pages: 1, count: 0 });

  const fetchAppStores = useCallback(async (params = {}) => {
    // Only fetch if logged in OR if a pincode is explicitly provided (e.g., from PincodeModal or Stores page)
    // For the public landing page, we don't want to fetch if no pincode is set.
    if (!isLoggedIn && !params.pincode) {
      setAppStores([]);
      setAppStoresMeta({ page: 1, pages: 1, count: 0 });
      return;
    }
    try {
      const { stores, page, pages, count } = await api.stores.getAll(params);
      setAppStores(stores);
      setAppStoresMeta({ page, pages, count });
    } catch (error) {
      console.error('Failed to load stores:', error);
      // Only show toast if logged in, or if a pincode was provided (meaning user actively tried to filter)
      if (isLoggedIn || params.pincode) {
        toast.error(`Failed to load stores: ${error.message}`);
      }
      setAppStores([]);
      setAppStoresMeta({ page: 1, pages: 1, count: 0 });
    }
  }, [isLoggedIn]); // Dependency on isLoggedIn

  useEffect(() => {
    // This useEffect should only trigger if isLoggedIn changes, or if userPincode changes
    if (isLoggedIn || userPincode) { // Only fetch if logged in or a pincode is set
      fetchAppStores({ pincode: userPincode }); // Pass userPincode to the fetcher
    } else {
      setAppStores([]); // Clear if not logged in and no pincode
      setAppStoresMeta({ page: 1, pages: 1, count: 0 });
    }
  }, [isLoggedIn, userPincode, fetchAppStores]); // Dependencies

  return {
    appStores,
    appStoresMeta,
    fetchAppStores,
    setAppStores,
    setAppStoresMeta,
  };
};

export default useStores;