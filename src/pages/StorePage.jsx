import React, { useContext, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import useProducts from '../hooks/useProducts'; // NEW: Import useProducts hook

const StorePage = () => {
  const { appStores, userPincode } = useContext(AppContext);
  const { storeId } = useParams();
  const { fetchProductsForStore } = useProducts(); // NEW: Use the new hook function
  const [storeProducts, setStoreProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const store = appStores.find(s => s._id === storeId);

  useEffect(() => {
    const loadStoreProducts = async () => {
      if (!storeId) return;
      setLoadingProducts(true);
      const params = {
        pincode: userPincode, // Pass user's active pincode for filtering
      };
      const { products } = await fetchProductsForStore(storeId, params);
      setStoreProducts(products);
      setLoadingProducts(false);
    };

    loadStoreProducts();
  }, [storeId, userPincode, fetchProductsForStore]); // Re-fetch when storeId or pincode changes

  if (!store) {
    return (
      <section className="w-full max-w-[1200px] my-10">
        <div className="bg-[var(--card-bg)] backdrop-blur-[5px] border border-white/30 rounded-2xl p-8 mx-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Store Not Found</h2>
          <Link to="/stores" className="text-[var(--accent)] hover:underline">Back to All Stores</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-[1200px] my-10">
      <div className="bg-[var(--card-bg)] backdrop-blur-[5px] border border-white/30 rounded-2xl p-8 mx-4">
        <div className="mb-8 pb-6 border-b border-white/20">
          <h2 className="text-3xl md:text-4xl font-bold">{store.name}</h2>
          <p className="text-base md:text-lg mt-2 opacity-80">{store.description}</p>
        </div>
        
        <h3 className="text-2xl font-bold mb-6">Products</h3>
        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {[...Array(3)].map((_, index) => ( // Show a few skeleton cards
              <SkeletonCard key={index} className="w-full" />
            ))}
          </div>
        ) : storeProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center" role="list">
            {storeProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-lg opacity-80 py-10">No products available for this store.</p>
        )}
      </div>
    </section>
  );
};

export default StorePage;