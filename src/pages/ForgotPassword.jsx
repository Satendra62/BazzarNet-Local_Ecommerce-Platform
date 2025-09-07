import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPaperPlane, faSpinner } from '@fortawesome/free-solid-svg-icons'; // Added faSpinner
import * as api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // NEW: Loading state

  const validateForm = () => {
    let newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email address is invalid.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true); // Start loading
      try {
        const response = await api.passwordReset.forgotPassword(email);
        setMessage(response.message);
        toast.success(response.message);
        setEmail('');
      } catch (error) {
        toast.error(error.message || 'Failed to send reset link.');
        setMessage('');
      } finally {
        setIsLoading(false); // End loading
      }
    } else {
      toast.error('Please enter a valid email address.');
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  const inputClasses = "w-full p-3 my-2 text-[var(--text)] border border-white/30 rounded-lg bg-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--bg-body)] p-4">
      <motion.div
        variants={formVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-[var(--card-bg)] backdrop-blur-[5px] border border-white/30 rounded-2xl flex flex-col p-8 shadow-[0_8px_40px_var(--shadow)] w-full max-w-[400px] mx-4 text-center text-[var(--auth-text)]"
        role="form"
        aria-labelledby="forgot-password-heading"
      >
        <h2 id="forgot-password-heading" className="text-3xl font-bold mb-6 text-[var(--accent)]">Forgot Password?</h2>
        <p className="mb-6 text-sm opacity-80">
          Enter your email address below and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <label htmlFor="email" className="sr-only">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className={inputClasses}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            disabled={isLoading}
          />
          {errors.email && <p id="email-error" className="text-red-400 text-xs text-left -mt-1 mb-2">{errors.email}</p>}

          <button
            type="submit"
            className="bg-[var(--accent)] text-white border-none py-3 px-6 rounded-lg flex items-center justify-center w-full gap-2 font-medium hover:bg-[var(--accent-dark)] transition-all duration-300 mt-4"
            aria-label="Send password reset link"
            disabled={isLoading}
          >
            {isLoading ? <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> : <FontAwesomeIcon icon={faPaperPlane} aria-hidden="true" />}
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {message && (
          <p className="text-green-500 text-sm mt-4" role="alert">{message}</p>
        )}

        <p className="text-center text-sm mt-6">
          Remember your password? <Link to="/login" className="text-[var(--accent)] font-semibold">Login here.</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;