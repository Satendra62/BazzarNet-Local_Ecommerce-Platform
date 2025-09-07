import React, { useContext, useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingBag, faHeart, faReceipt, faPenFancy } from '@fortawesome/free-solid-svg-icons';
import { AppContext } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import SkeletonText from '../components/SkeletonText';
import SkeletonCard from '../components/SkeletonCard';
import * as api from '../services/api';
import { getFullImageUrl } from '../utils/imageUtils';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard'; // Import the new ProductCard component

const CustomerDashboard = () => {
  const { user, cart, wishlist, orders, isLoggedIn, allAppProducts } = useContext(AppContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const [selectedBrowseCategory, setSelectedBrowseCategory] = useState('all');
  const [pendingReviews, setPendingReviews] = useState([]);
  const [pendingReviewsLoading, setPendingReviewsLoading] = useState(true);

  const categories = [
    'all', 'Groceries', 'Bakery', 'Butcher', 'Cafe', 'Electronics', 
    'Furniture', 'Decor', 'Clothing', 'Other'
  ];

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setLoading(false);
    };
    loadDashboardData();
  }, []);

  useEffect(() => {
    const fetchRecommended = async () => {
      setRecommendedLoading(true);
      try {
        const products = await api.products.getRecommended();
        setRecommendedProducts(products);
      } catch (error) {
        console.error('Failed to fetch recommended products:', error);
        setRecommendedProducts([]);
      } finally {
        setRecommendedLoading(false);
      }
    };
    fetchRecommended();
  }, []);

  useEffect(() => {
    const fetchPendingReviews = async () => {
      if (!isLoggedIn || user?.role !== 'customer') {
        setPendingReviews([]);
        setPendingReviewsLoading(false);
        return;
      }
      setPendingReviewsLoading(true);
      try {
        const fetchedPendingReviews = await api.customer.getPendingReviews();
        setPendingReviews(fetchedPendingReviews);
      } catch (error) {
        console.error('Failed to fetch pending reviews:', error);
        setPendingReviews([]);
      } finally {
        setPendingReviewsLoading(false);
      }
    };
    fetchPendingReviews();
  }, [isLoggedIn, user]);

  const latestOrder = useMemo(() => {
    if (!user || !user.email || orders.length === 0) return null;
    
    const userOrders = orders.filter(order => order.user === user._id);
    if (userOrders.length === 0) return null;

    return userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  }, [user, orders]);

  const stats = [
    { icon: faShoppingBag, label: 'Items in Cart', value: cart.length, path: '/cart' },
    { icon: faHeart, label: 'Wishlisted Items', value: wishlist.length, path: '/wishlist' },
    { icon: faReceipt, label: 'Total Orders', value: orders.filter(order => order.user === user?._id).length, path: '/orders' },
    { icon: faPenFancy, label: 'Products to Review', value: pendingReviews.length, action: () => document.getElementById('products-to-review-section')?.scrollIntoView({ behavior: 'smooth' }) }, // NEW: Added action for scrolling
  ];

  const sortedCategories = useMemo(() => {
    const allCategoriesExceptAll = categories.filter(cat => cat !== 'all');
    const categoriesWithProducts = allAppProducts.filter(p => p.stock > 0).map(p => p.category).filter((value, index, self) => self.indexOf(value) === index);
    const categoriesWithoutProducts = allCategoriesExceptAll.filter(cat => 
      !categoriesWithProducts.includes(cat)
    );
    return [...categoriesWithProducts, ...categoriesWithoutProducts];
  }, [categories, allAppProducts]);

  return (
    <div className="w-full max-w-[1200px] mx-auto my-10">
      <div className="bg-[var(--card-bg)] backdrop-blur-[5px] border border-white/30 rounded-2xl p-8 mx-4">
        {loading ? (
          <>
            <SkeletonText width="70%" height="2rem" className="mb-2" />
            <SkeletonText width="50%" height="1.2rem" className="mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-black/10 p-6 rounded-xl flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-gray-700"></div>
                  <div>
                    <SkeletonText width="80px" height="0.8rem" className="mb-2" />
                    <SkeletonText width="50px" height="1.2rem" />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-black/10 p-6 rounded-xl animate-pulse">
              <SkeletonText width="60%" height="1.5rem" className="mb-4" />
              <div className="flex gap-4 overflow-x-auto pb-2">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="flex-shrink-0 w-[220px] sm:w-[240px] md:w-[260px] lg:w-[280px]">
                    <SkeletonCard />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-lg text-[var(--text)] opacity-80 mb-8">Ready to shop from your favorite local stores?</p>

            {/* UPDATED GRID LAYOUT */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {stats.map(stat => (
                <div 
                  key={stat.label} 
                  onClick={stat.path ? () => navigate(stat.path) : stat.action} // Use action if provided, else navigate
                  className="bg-black/10 p-6 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-white/20 transition-colors duration-300" 
                  role="button" 
                  tabIndex="0" 
                  aria-label={`${stat.label}: ${stat.value}. Click to view.`}
                >
                  <FontAwesomeIcon icon={stat.icon} className="text-3xl text-[var(--accent)]" aria-hidden="true" />
                  <div>
                    <p className="text-sm opacity-70">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-black/10 p-6 rounded-xl mb-8">
              <h2 className="text-2xl font-bold mb-4">Recommended Products</h2>
              
              {recommendedLoading ? (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="flex-shrink-0 w-[220px] sm:w-[240px] md:w-[260px] lg:w-[280px]">
                      <SkeletonCard />
                    </div>
                  ))}
                </div>
              ) : recommendedProducts.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                  {recommendedProducts.map(product => (
                    <div key={product._id} className="flex-shrink-0 w-[220px] sm:w-[240px] md:w-[260px] lg:w-[280px]">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-lg opacity-80 py-10">No recommended products available.</p>
              )}
            </div>

            <div className="bg-black/10 p-6 rounded-xl">
              <h2 className="text-2xl font-bold mb-6">Browse All Products by Category</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Select a Category:</h3>
                <div className="flex gap-4 px-2 pb-2 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                  {categories.map(cat => (
                    <motion.button
                      key={cat}
                      onClick={() => setSelectedBrowseCategory(cat)}
                      className={`flex-shrink-0 px-5 py-2 rounded-full font-medium transition-colors duration-300 ${
                        selectedBrowseCategory === cat
                          ? 'bg-[var(--accent)] text-white shadow-md'
                          : 'bg-white/10 text-[var(--text)] hover:bg-white/20'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-pressed={selectedBrowseCategory === cat}
                      aria-label={`Browse ${cat === 'all' ? 'All Categories' : cat}`}
                    >
                      {cat === 'all' ? 'All Categories' : cat}
                    </motion.button>
                  ))}
                </div>
              </div>

              {selectedBrowseCategory === 'all' ? (
                sortedCategories.map(category => (
                  <div key={category} className="mb-8 last:mb-0">
                    <h3 className="text-xl font-semibold mb-4 border-b border-white/20 pb-2">{category}</h3>
                    {allAppProducts.filter(p => p.category === category).length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                        {allAppProducts.filter(p => p.category === category).map(product => (
                          <ProductCard key={product._id} product={product} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-base opacity-80 py-4">Stock coming soon.</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="mb-8 last:mb-0">
                  <h3 className="text-xl font-semibold mb-4 border-b border-white/20 pb-2">{selectedBrowseCategory}</h3>
                  {allAppProducts.filter(p => p.category === selectedBrowseCategory).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                      {allAppProducts.filter(p => p.category === selectedBrowseCategory).map(product => (
                        <ProductCard key={product._id} product={product} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-lg opacity-80 py-4">Stock coming soon.</p>
                  )}
                </div>
              )}
            </div>

            {isLoggedIn && user?.role === 'customer' && (
              <div id="products-to-review-section" className="bg-black/10 p-6 rounded-xl mt-8"> {/* NEW: Added ID here */}
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <FontAwesomeIcon icon={faPenFancy} className="text-[var(--accent)]" /> Products to Review
                </h2>
                {pendingReviewsLoading ? (
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="flex-shrink-0 w-[220px] sm:w-[240px] md:w-[260px] lg:w-[280px]">
                        <SkeletonCard />
                      </div>
                    ))}
                  </div>
                ) : pendingReviews.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                    {pendingReviews.map(product => (
                      <div key={product._id} className="bg-black/10 border border-white/10 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 w-[220px] sm:w-[240px] md:w-[260px] lg:w-[280px] flex flex-col">
                        <Link to={`/products/${product._id}`} className="flex-grow flex flex-col">
                          <img 
                            src={getFullImageUrl(product.image)} 
                            alt={product.name} 
                            className="w-full h-32 sm:h-40 object-cover" 
                            onError={(e) => { e.target.onerror = null; e.target.src = placeholderImage; }}
                          />
                          <div className="p-3 flex-grow">
                            <h3 className="text-base sm:text-lg font-semibold mb-1 truncate">{product.name}</h3>
                            <p className="text-xs opacity-80">Purchased: {product.unit}</p>
                          </div>
                        </Link>
                        <div className="p-3 pt-0">
                          <Link 
                            to={`/products/${product._id}`} 
                            className="bg-[var(--accent)] text-white border-none py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 text-sm font-medium hover:bg-[var(--accent-dark)] transition-all duration-300 w-full"
                          >
                            <FontAwesomeIcon icon={faPenFancy} /> Leave Review
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-lg opacity-80 py-4">No products awaiting your review. Happy shopping!</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;