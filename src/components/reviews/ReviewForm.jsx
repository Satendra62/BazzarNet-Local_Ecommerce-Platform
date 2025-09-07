import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import { faStar as regularStar } from '@fortawesome/free-regular-svg-icons';
import toast from 'react-hot-toast';
import * as api from '../../services/api';
import { Loader2 } from 'lucide-react'; // Added Loader2

const inputClasses = "w-full p-2 rounded-lg bg-white/10 border border-black/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--text)]";

const ReviewForm = ({ productId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    if (rating === 0) {
      newErrors.rating = 'Please select a rating.';
    }
    if (comment.length > 500) {
      newErrors.comment = 'Comment cannot exceed 500 characters.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the errors in the form.');
      return;
    }

    setIsLoading(true);
    try {
      await api.customer.createProductReview(productId, { rating, comment });
      toast.success('Review submitted successfully!');
      setRating(0);
      setComment('');
      setErrors({});
      onReviewSubmitted();
    } catch (error) {
      toast.error(error.message || 'Failed to submit review.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-black/10 rounded-xl" aria-label="Submit a product review">
      <h3 className="text-xl font-semibold mb-4">Leave a Review</h3>
      
      <div>
        <label className="block text-sm font-medium mb-2">Your Rating:</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((starValue) => (
            <FontAwesomeIcon
              key={starValue}
              icon={starValue <= (hoverRating || rating) ? solidStar : regularStar}
              className={`cursor-pointer text-2xl transition-colors duration-200 ${
                starValue <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-400'
              }`}
              onClick={() => setRating(starValue)}
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${starValue} stars`}
              role="radio"
              aria-checked={rating === starValue}
            />
          ))}
        </div>
        {errors.rating && <p className="text-red-400 text-xs mt-1">{errors.rating}</p>}
      </div>

      <div>
        <label htmlFor="reviewComment" className="block text-sm font-medium mb-2">Comment (Optional):</label>
        <textarea
          id="reviewComment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="4"
          className={inputClasses}
          placeholder="Share your thoughts on this product..."
          aria-invalid={!!errors.comment}
          aria-describedby={errors.comment ? "reviewComment-error" : undefined}
          disabled={isLoading}
        ></textarea>
        {errors.comment && <p id="reviewComment-error" className="text-red-400 text-xs mt-1">{errors.comment}</p>}
      </div>

      <button
        type="submit"
        className="bg-[var(--accent)] text-white py-2 px-6 rounded-lg font-medium hover:bg-[var(--accent-dark)] transition-colors flex items-center justify-center gap-2"
        disabled={isLoading}
      >
        {isLoading ? <Loader2 size={20} className="animate-spin mr-2" /> : null}
        {isLoading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm;