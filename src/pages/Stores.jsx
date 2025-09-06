import React, { useState, useContext, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import SkeletonStoreCard from '../components/SkeletonStoreCard';
import Pagination from '../components/Pagination';

const Stores = () => {
  const navigate = useNavigate();
  const { appStores, appStoresMeta, fetchAppStores, userPincode, user } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Number of stores per page - INCREASED FROM 4 TO 8

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        pincode: userPincode, // Use active userPincode from context
      };
      await fetchAppStores(params);
      setLoading(false);
    };
    if (userPincode) { // Only load data if a pincode is set
      loadData();
    } else {
      setLoading(false); // If no pincode, stop loading and show message
      // setAppStores([]); // Clear stores if no pincode - Removed as fetchAppStores already handles this
      // setAppStoresMeta({ page: 1, pages: 1, count: 0 }); // Removed as fetchAppStores already handles this
    }
  }, [searchTerm, currentPage, fetchAppStores, userPincode]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <section className="w-full max-w-[1200px] my-10">
      <div className="bg-[var(--card-bg)] backdrop-blur-[5px] border border-white/30 rounded-2xl p-8 mx-4">
        <h2 className="text-3xl font-bold mb-5 md:text-4xl">Local Stores</h2>
        
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search for a store..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/10 border border-black/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--text)]"
          />
        </div>

        {!userPincode ? (
          <p className="text-center text-lg opacity-80 py-10">
            Please enter your pincode to see available stores.
          </p>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(itemsPerPage)].map((_, index) => (
              <SkeletonStoreCard key={index} />
            ))}
          </div>
        ) : appStores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {appStores.map((store) => (
              <div key={store._id} className="bg-black/10 border border-white/10 rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300 flex flex-col shadow-lg">
                <div className="flex-grow">
                  <FontAwesomeIcon icon={faStore} className="text-4xl text-[var(--accent)] mb-4" />
                  <h3 className="text-2xl font-semibold mb-3">{store.name}</h3>
                  <p className="text-base opacity-80">{store.description}</p>
                </div>
                <button
                  className="bg-[var(--accent)] text-white border-none py-2 px-6 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-[var(--accent-dark)] transition-all duration-300 mt-4 self-start"
                  onClick={() => navigate(`/stores/${store._id}`)}
                >
                  Visit Store
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-lg opacity-80 py-10">No stores found for pincode {userPincode}.</p>
        )}

        {!loading && appStores.length > 0 && (
          <Pagination
            currentPage={appStoresMeta.page}
            totalPages={appStoresMeta.pages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </section>
  );
};

export default Stores;