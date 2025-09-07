import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { Loader2 } from 'lucide-react';

const formVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
};

const RazorpayPaymentForm = ({ onPreviousStep, onInitiateRazorpayPayment, isLoading }) => {
  return (
    <motion.div
      key="razorpay-form"
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col gap-4 max-w-[500px] mx-auto"
      role="tabpanel"
      id="razorpay-payment-panel"
      aria-labelledby="payment-heading"
    >
      <h3 id="payment-heading" className="text-2xl font-bold mb-4 text-center">Complete Payment with Razorpay</h3>
      
      <div className="bg-black/10 p-6 rounded-xl text-center">
        <p className="text-lg font-semibold mb-3">Click the button below to proceed to Razorpay for secure payment.</p>
        <p className="text-sm opacity-80">You will be redirected to Razorpay's secure payment gateway.</p>
      </div>

      <div className="flex justify-between gap-4 mt-6">
        <button
          type="button"
          onClick={onPreviousStep}
          className="bg-white/10 text-[var(--text)] border-none py-3 px-6 rounded-lg flex items-center justify-center gap-2 font-medium hover:bg-white/20 transition-all duration-300 flex-1"
          aria-label="Go back to Order Summary"
          disabled={isLoading}
        >
          <FontAwesomeIcon icon={faChevronLeft} aria-hidden="true" /> Back
        </button>
        <button
          type="button"
          onClick={onInitiateRazorpayPayment}
          className="bg-[var(--accent)] text-white border-none py-3 px-6 rounded-lg flex items-center justify-center w-full gap-2 font-medium hover:bg-[var(--accent-dark)] transition-all duration-300 flex-1"
          aria-label="Pay with Razorpay"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 size={20} className="animate-spin mr-2" /> : <FontAwesomeIcon icon={faCreditCard} aria-hidden="true" />}
          {isLoading ? 'Redirecting...' : 'Pay with Razorpay'}
        </button>
      </div>
    </motion.div>
  );
};

export default RazorpayPaymentForm;