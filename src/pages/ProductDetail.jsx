import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faHeart, faStar, faStarHalfAlt, faSpinner } from '@fortawesome/free-solid-svg-icons'; // Added faSpinner
import { AppContext } from '../context/AppContext';
import placeholderImage from '../assets/placeholder.png'; // Import placeholder image
import { getFullImageUrl } from '../utils/imageUtils'; // Import utility
import ReviewForm from '../components/reviews/ReviewForm'; // Import ReviewForm
import ProductReviews from '../components/reviews/ProductReviews'; // Import ProductReviews
import * as api from '../services/api'; // Import API service
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { addToCart, addToWishlist, allAppProducts, user, isLoggedIn } = useContext(AppContext);
  const { id } = useParams();
  
  const [localProduct, setLocalProduct] = useState(null); // New state for the product
  const [loadingProduct, setLoadingProduct] = useState(true); // New loading state
  const [canReview, setCanReview] = useState(false);
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0); // To trigger review list refresh

  // Use localProduct for rendering, falling back to context if local is null
  const productToDisplay = localProduct || allAppProducts.find(p => p._id === id);

  // Function to fetch product details
  const fetchProductDetails = useCallback(async () => {
    setLoadingProduct(true);
    try {
      const fetchedProduct = await api.products.getById(id);
      setLocalProduct(fetchedProduct);
    } catch (error) {
      console.error('Failed to fetch product details:', error);
      toast.error(`Failed to load product: ${error.message}`);
      setLocalProduct(null);
    } finally {
      setLoadingProduct(false);
    }
  }, [id]);

  useEffect(() => {
    // First, try to find the product in the global context's allAppProducts
    const productFromContext = allAppProducts.find(p => p._id === id);
    if (productFromContext) {
      setLocalProduct(productFromContext);
      setLoadingProduct(false);
    } else {
      // If not found in context, fetch it directly from the API
      fetchProductDetails();
    }
  }, [id, allAppProducts, fetchProductDetails]); // Depend on id, allAppProducts, and fetchProductDetails

  // Function to check if user can review this product
  const checkCanReview = useCallback(async () => {
    if (!isLoggedIn || !user || user.role !== 'customer' || !productToDisplay) {
      setCanReview(false);
      return;
    }
    try {
      const pendingReviews = await api.customer.getPendingReviews();
      const isPending = pendingReviews.some(p => p._id === productToDisplay._id);
      setCanReview(isPending);
    } catch (error) {
      console.error('Failed to check pending reviews:', error);
      setCanReview(false);
    }
  }, [isLoggedIn, user, productToDisplay]); // Depend on productToDisplay

  useEffect(() => {
    checkCanReview();
  }, [checkCanReview, reviewRefreshTrigger, productToDisplay]); // Re-check if review status might have changed

  const handleReviewSubmitted = () => {
    setReviewRefreshTrigger(prev => prev + 1); // Increment to trigger refresh
    checkCanReview(); // Re-check if user can review (should become false)
  };

  if (loadingProduct) {
    return (
      <section className="w-full max-w-[1200px] my-10 text-center">
        <div className="bg-[var(--card-bg)] backdrop-blur-[5px] border border-white/30 rounded-2xl p-8 mx-4 flex flex-col items-center justify-center min-h-[300px]">
          <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-[var(--accent)] mb-4" aria-hidden="true" />
          <h2 className="text-2xl font-bold">Loading Product Details...</h2>
        </div>
      </section>
    );
  }

  if (!productToDisplay) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Link to="/stores" className="text-[var(--accent)] hover:underline">Back to Stores</Link>
      </div>
    );
  }

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FontAwesomeIcon key={`full-${i}`} icon={faStar} className="text-yellow-400" aria-hidden="true" />);
    }
    if (halfStar) {
      stars.push(<FontAwesomeIcon key="half" icon={faStarHalfAlt} className="text-yellow-400" aria-hidden="true" />);
    }
    // Fill remaining with regular stars
    for (let i = stars.length; i < 5; i++) {
      stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={faStar} className="text-gray-400" aria-hidden="true" />);
    }
    return stars;
  };

  const isOutOfStock = productToDisplay.stock === 0;

  return (
    <section className="w-full max-w-[1200px] my-10">
      <div className="bg-[var(--card-bg)] backdrop-blur-[5px] border border-white/30 rounded-2xl p-8 mx-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img 
              src={getFullImageUrl(productToDisplay.image)} 
              alt={productToDisplay.name} 
              className={`w-full h-auto object-cover rounded-lg shadow-lg ${isOutOfStock ? 'grayscale' : ''}`} 
              onError={(e) => { e.target.onerror = null; e.target.src = placeholderImage; }} // Fallback image
            />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">{productToDisplay.name}</h2>
            <div className="flex items-center gap-2 mb-4" aria-label={`Rating: ${productToDisplay.rating} out of 5 stars, based on ${productToDisplay.numReviews} reviews`}>
              <div className="flex">{renderStars(productToDisplay.rating)}</div>
              <span className="text-sm text-[var(--text)] opacity-80">({productToDisplay.numReviews} reviews)</span>
            </div>
            <p className="text-2xl font-semibold text-[var(--accent)] mb-4">₹{productToDisplay.price.toFixed(2)} / {productToDisplay.unit}</p> {/* Display unit */}
            
            {/* Stock Status */}
            <div className="mb-4">
              {isOutOfStock ? (
                <p className="text-lg font-bold text-red-500">Out of Stock</p>
              ) : (
                <p className="text-lg font-bold text-green-500">In Stock: {productToDisplay.stock}</p>
              )}
            </div>

            <p className="text-base md:text-lg mb-6">{productToDisplay.description}</p>
            <div className="flex gap-4">
              <button
                className="bg-[var(--accent)] text-white border-none py-3 px-6 rounded-lg flex items-center gap-2 font-medium hover:bg-[var(--accent-dark)] transition-all duration-300"
                onClick={() => addToCart(productToDisplay)}
                aria-label={`Add ${productToDisplay.name} to cart`}
                disabled={isOutOfStock} // Disable button if out of stock
              >
                <FontAwesomeIcon icon={faCartPlus} aria-hidden="true" /> Add to Cart
              </button>
              <button
                className="bg-gray-200 text-gray-800 border-none py-3 px-6 rounded-lg flex items-center gap-2 font-medium hover:bg-gray-300 transition-all duration-300"
                onClick={() => addToWishlist(productToDisplay)}
                aria-label={`Add ${productToDisplay.name} to wishlist`}
              >
                <FontAwesomeIcon icon={faHeart} aria-hidden="true" /> Add to Wishlist
              </button>
            </div>
          </div>
        </div>

        {/* Review Section */}
        <div className="mt-12 pt-8 border-t border-white/20">
          {isLoggedIn && user?.role === 'customer' && canReview && (
            <div className="mb-8">
              <ReviewForm productId={productToDisplay._id} onReviewSubmitted={handleReviewSubmitted} />
            </div>
          )}
          <ProductReviews productId={productToDisplay._id} refreshTrigger={reviewRefreshTrigger} />
        </div>
      </div>
    </section>
  );
};

export default ProductDetail;