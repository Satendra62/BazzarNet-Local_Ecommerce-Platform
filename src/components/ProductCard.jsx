import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faHeart, faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import { AppContext } from '../context/AppContext';
import placeholderImage from '../assets/placeholder.png';
import { getFullImageUrl } from '../utils/imageUtils';

const ProductCard = ({ product }) => {
  const { addToCart, addToWishlist, appStores, wishlist } = useContext(AppContext); // NEW: Get wishlist from context

  const isOutOfStock = product.stock === 0;
  const discount = product.originalPrice && product.originalPrice > product.price
    ? ((product.originalPrice - product.price) / product.originalPrice) * 100
    : 0;
  const storeName = appStores.find(store => store._id === product.store?._id)?.name || 'N/A';

  // NEW: Check if product is already in wishlist
  const isInWishlist = wishlist.some(item => item.product._id === product._id);

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
    return stars;
  };

  return (
    <div className={`bg-black/10 border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:border-[var(--accent)] transition-all duration-300 flex flex-col w-full transform-gpu ${isOutOfStock ? 'grayscale' : ''}`} role="listitem" aria-label={`Product: ${product.name}`}>
      <Link to={`/products/${product._id}`} className="flex-grow flex flex-col" aria-label={`View details for ${product.name}`}>
        <div className="relative">
          <img
            src={getFullImageUrl(product.image)}
            alt={product.name}
            className="w-full h-32 sm:h-40 object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src = placeholderImage; }}
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded" aria-label={`${Math.round(discount)} percent off`}>{Math.round(discount)}% OFF</span>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-sm font-bold">OUT OF STOCK</span>
            </div>
          )}
        </div>
        <div className="p-3 flex-grow flex-col">
          <h3 className="text-base sm:text-lg font-semibold mb-1 truncate">{product.name}</h3>
          <p className="text-xs opacity-80 mb-1 truncate">Category: {product.category}</p>
          <p className="text-xs opacity-80 mb-1 truncate">From: {storeName}</p>
          <div className="flex items-baseline gap-1 mb-1">
            <p className="text-sm sm:text-base font-bold text-[var(--accent)]">₹{product.price.toFixed(2)} / {product.unit}</p>
            {product.originalPrice && discount > 0 && (
              <p className="text-xs text-gray-400 line-through">₹{product.originalPrice.toFixed(2)}</p>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs mb-1">
            <div className="flex">{renderStars(product.rating)}</div>
            <span className="opacity-80">({product.numReviews})</span>
          </div>
          {product.stock > 0 ? (
            <p className="text-xs opacity-80 text-green-400">In Stock: {product.stock}</p>
          ) : (
            <p className="text-xs opacity-80 text-red-400">Out of Stock</p>
          )}
        </div>
      </Link>
      <div className="flex gap-2 mt-auto p-3 pt-0">
        <button
          className="flex-1 bg-[var(--accent)] text-white border-none py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 text-sm font-medium hover:bg-[var(--accent-dark)] transition-all duration-300"
          onClick={() => addToCart(product)}
          aria-label={`Add ${product.name} to cart`}
          disabled={isOutOfStock}
        >
          <FontAwesomeIcon icon={faCartPlus} aria-hidden="true" /> Cart
        </button>
        <button
          className="bg-white/10 text-[var(--text)] border-none py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 text-sm font-medium hover:bg-white/20 transition-all duration-300"
          onClick={() => addToWishlist(product)}
          aria-label={`Add ${product.name} to wishlist`}
          disabled={isInWishlist} /* NEW: Disable if already in wishlist */
        >
          <FontAwesomeIcon icon={faHeart} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;