import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons'; // Added faSpinner
import * as api from '../services/api';
import { Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // NEW: Loading state

  const validateForm = () => {
    let newErrors = {};
    if (!password) {
      newErrors.password = 'New password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true); // Start loading
      try {
        const response = await api.passwordReset.resetPassword(token, password);
        toast.success(response.message);
        setResetSuccess(true);
      } catch (error) {
        toast.error(error.message || 'Failed to reset password.');
      } finally {
        setIsLoading(false); // End loading
      }
    } else {
      toast.error('Please correct the errors in the form.');
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  const inputClasses = "w-full p-3 my-2 text-[var(--text)] border border-white/30 rounded-lg bg-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";

  if (resetSuccess) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--bg-body)] p-4">
        <motion.div
          variants={formVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-[var(--card-bg)] backdrop-blur-[5px] border border-white/30 rounded-2xl flex flex-col p-8 shadow-[0_8px_40px_var(--shadow)] w-full max-w-[400px] mx-4 text-center text-[var(--auth-text)]"
        >
          <FontAwesomeIcon icon={faCheckCircle} className="text-6xl text-green-500 mb-4" aria-hidden="true" />
          <h2 className="text-3xl font-bold mb-4 text-[var(--accent)]">Password Reset Successful!</h2>
          <p className="mb-6 text-sm opacity-80">
            Your password has been successfully updated. You can now log in with your new password.
          </p>
          <Link
            to="/login"
            className="bg-[var(--accent)] text-white border-none py-3 px-6 rounded-lg flex items-center justify-center w-full gap-2 font-medium hover:bg-[var(--accent-dark)] transition-all duration-300 mt-4"
            aria-label="Go to Login page"
          >
            Go to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--bg-body)] p-4">
      <motion.div
        variants={formVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-[var(--card-bg)] backdrop-blur-[5px] border border-white/30 rounded-2xl flex flex-col p-8 shadow-[0_8px_40px_var(--shadow)] w-full max-w-[400px] mx-4 text-center text-[var(--auth-text)]"
        role="form"
        aria-labelledby="reset-password-heading"
      >
        <h2 id="reset-password-heading" className="text-3xl font-bold mb-6 text-[var(--accent)]">Set New Password</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col">
          <label htmlFor="newPassword" className="sr-only">New Password</label>
          <div className="relative w-full">
            <input
              type={showNewPassword ? 'text' : 'password'}
              id="newPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New Password"
              className={`${inputClasses} pr-10`}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "newPassword-error" : undefined}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text)] opacity-70 hover:opacity-100"
              aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
              aria-pressed={showNewPassword}
              disabled={isLoading}
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <p id="newPassword-error" className="text-red-400 text-xs text-left -mt-1 mb-2">{errors.password}</p>}

          <label htmlFor="confirmNewPassword" className="sr-only">Confirm New Password</label>
          <div className="relative w-full">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmNewPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              className={`${inputClasses} pr-10`}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? "confirmNewPassword-error" : undefined}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text)] opacity-70 hover:opacity-100"
              aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
              aria-pressed={showConfirmPassword}
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && <p id="confirmNewPassword-error" className="text-red-400 text-xs text-left -mt-1 mb-2">{errors.confirmPassword}</p>}

          <button
            type="submit"
            className="bg-[var(--accent)] text-white border-none py-3 px-6 rounded-lg flex items-center justify-center w-full gap-2 font-medium hover:bg-[var(--accent-dark)] transition-all duration-300 mt-4"
            aria-label="Reset password"
            disabled={isLoading}
          >
            {isLoading ? <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> : <FontAwesomeIcon icon={faLock} aria-hidden="true" />}
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;