import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Edit, X, Loader2 } from 'lucide-react'; // Added Loader2
import toast from 'react-hot-toast';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';

const inputClasses = "w-full p-3 rounded-lg bg-white/10 border border-black/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--text)] text-base md:text-lg";

const PincodeModal = ({ isOpen, onClose }) => {
  const { user, updateUserInContext, fetchAppStores, fetchAllProducts, updateUserPincode } = useContext(AppContext);
  const navigate = useNavigate();
  const [pincodeInput, setPincodeInput] = useState(user?.address?.pinCode || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePincodeSubmit = async () => {
    setError('');
    if (!pincodeInput.trim()) {
      setError('Pincode is required.');
      return;
    }
    if (!/^\d{6}$/.test(pincodeInput.trim())) {
      setError('Pincode must be 6 digits.');
      return;
    }

    setLoading(true);
    try {
      const { stores } = await api.stores.getAll({ pincode: pincodeInput.trim(), limit: 1 });
      
      if (stores.length === 0) {
        setError(`No stores found for pincode ${pincodeInput}. Please try another or update your profile address.`);
        toast.error(`No stores found for pincode ${pincodeInput}.`);
        return;
      }

      updateUserPincode(pincodeInput.trim());
      
      if (user?.address?.pinCode !== pincodeInput.trim()) {
        await api.userProfile.updateProfile({ address: { ...user.address, pinCode: pincodeInput.trim() } });
        updateUserInContext({ ...user, address: { ...user.address, pinCode: pincodeInput.trim() } });
        toast.success('Pincode updated in your profile!');
      } else {
        toast.success('Pincode confirmed!');
      }

      fetchAppStores({ pincode: pincodeInput.trim() });
      fetchAllProducts({ pincode: pincodeInput.trim() });

      onClose();
    } catch (err) {
      console.error('Error submitting pincode:', err);
      setError(err.message || 'Failed to check pincode. Please try again.');
      toast.error(err.message || 'Failed to check pincode.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    onClose();
    navigate('/profile');
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.15 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pincode-modal-title"
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-[var(--card-bg)] backdrop-blur-[5px] border border-white/30 rounded-2xl shadow-lg w-full max-w-md relative p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-[var(--text)] hover:text-[var(--accent)]" aria-label="Close pincode modal">
              <X size={24} />
            </button>

            <div className="flex flex-col items-center text-center">
              <MapPin size={48} className="text-[var(--accent)] mb-4" />
              <h3 id="pincode-modal-title" className="text-2xl font-bold mb-3">Enter Your Pincode</h3>
              <p className="text-sm opacity-80 mb-6">To show you the best local stores and products, please confirm or enter your delivery pincode.</p>

              <div className="w-full mb-4">
                <label htmlFor="pincode-input" className="sr-only">Pincode</label>
                <input
                  type="text"
                  id="pincode-input"
                  value={pincodeInput}
                  onChange={(e) => {
                    setPincodeInput(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g., 825301"
                  className={inputClasses}
                  maxLength="6"
                  aria-invalid={!!error}
                  aria-describedby={error ? "pincode-error" : undefined}
                  disabled={loading}
                />
                {error && <p id="pincode-error" className="text-red-400 text-xs mt-1 text-left">{error}</p>}
              </div>

              <button
                onClick={handlePincodeSubmit}
                className="bg-[var(--accent)] text-white py-3 px-6 rounded-lg flex items-center justify-center w-full gap-2 font-medium hover:bg-[var(--accent-dark)] transition-all duration-300"
                disabled={loading}
              >
                {loading ? <Loader2 size={20} className="animate-spin mr-2" /> : null}
                {loading ? 'Checking...' : 'Confirm Pincode'}
              </button>

              {error && error.includes('No stores found') && (
                <button
                  onClick={handleEditProfile}
                  className="mt-4 text-[var(--accent)] hover:underline flex items-center gap-2"
                  disabled={loading}
                >
                  <Edit size={16} /> Update Address in Profile
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PincodeModal;