import React, { useState, useMemo, useContext, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import { AppContext } from '../context/AppContext';
import { ChevronDown } from 'lucide-react';
import SkeletonCard from '../components/SkeletonCard';
import Pagination from '../components/Pagination';
import ProductCard from '../components/ProductCard'; // Import the new ProductCard component

const Products = () => {
  const { allAppProducts, allAppProductsMeta, fetchAllProducts, appStores, userPincode, setAllAppProducts, setAllAppProductsMeta } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        category: 'all', // Keep category filter as 'all' for now, or add a category filter state
        store: selectedStore === 'all' ? undefined : selectedStore,
        pincode: userPincode, // NEW: Pass active userPincode to fetchAllProducts
      };
      await fetchAllProducts(params);
      setLoading(false);
    };
    if (userPincode) { // Only load data if a pincode is set
      loadData();
    } else {
      setLoading(false); // If no pincode, stop loading and show message
      setAllAppProducts([]); // Clear products if no pincode
      setAllAppProductsMeta({ page: 1, pages: 1, count: 0 });
    }
  }, [searchTerm, selectedStore, currentPage, fetchAllProducts, userPincode, setAllAppProducts, setAllAppProductsMeta]);

  const calculateDiscount = (price, originalPrice) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return ((originalPrice - price) / originalPrice) * 100;
  };

  const sortedProducts = useMemo(() => {
    let products = [...allAppProducts];

    products.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'discount-desc':
          const discountA = calculateDiscount(a.price, a.originalPrice);
          const discountB = calculateDiscount(b.price, b.originalPrice);
          return discountB - discountA;
        default:
          return 0;
      }
    });
    return products;
  }, [allAppProducts, sortBy]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStore]);

  return (
    <section className="w-full max-w-[1200px] my-10">
      <div className="bg-[var(--card-bg)] backdrop-blur-[5px] border border-white/30 rounded-2xl p-8 mx-4">
        <h2 className="text-3xl font-bold mb-5 md:text-4xl">All Products</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <label htmlFor="productSearch" className="sr-only">Search products</label>
          <input
            type="text"
            id="productSearch"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/10 border border-black/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] pl-10 text-[var(--text)]"
            aria-label="Search products by name"
          />
          <div className="relative">
            <label htmlFor="storeFilter" className="sr-only">Filter by store</label>
            <select
              id="storeFilter"
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full appearance-none p-3 rounded-lg bg-white/10 border border-black/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--text)] pr-8"
              aria-label="Filter products by store"
            >
              <option value="all">All Stores</option>
              {appStores.map(store => (
                <option key={store._id} value={store._id}>{store.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--text)]" aria-hidden="true"><ChevronDown size={20} /></div>
          </div>
          <div className="relative">
            <label htmlFor="productSort" className="sr-only">Sort products by</label>
            <select
              id="productSort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full appearance-none p-3 rounded-lg bg-white/10 border border-black/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--text)] pr-8"
              aria-label="Sort products by criteria"
            >
              <option value="name-asc">Sort by Name (A-Z)</option>
              <option value="name-desc">Sort by Name (Z-A)</option>
              <option value="price-asc">Sort by Price (Low to High)</option>
              <option value="price-desc">Sort by Price (High to Low)</option>
              <option value="discount-desc">Sort by Discount (High to Low)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--text)]" aria-hidden="true"><ChevronDown size={20} /></div>
          </div>
        </div>

        {!userPincode ? (
          <p className="text-center text-lg opacity-80 py-10">
            Please enter your pincode to see available products.
          </p>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {[...Array(itemsPerPage)].map((_, index) => (
              <SkeletonCard key={index} className="w-full" />
            ))}
          </div>
        ) : sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center" role="list">
            {sortedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-lg opacity-80 py-10">No products found for pincode {userPincode} matching your criteria.</p>
        )}

        {!loading && sortedProducts.length > 0 && (
          <Pagination
            currentPage={allAppProductsMeta.page}
            totalPages={allAppProductsMeta.pages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </section>
  );
};

export default Products;