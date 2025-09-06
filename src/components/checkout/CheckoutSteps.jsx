import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const CheckoutSteps = ({ currentStep }) => {
  const steps = ['Address', 'Coupon', 'Summary', 'Payment']; // New: Added 'Payment' step

  return (
    <div className="flex justify-center items-center gap-4 mb-8 text-sm md:text-base">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <motion.span
            className={`font-semibold ${currentStep === step.toLowerCase() ? 'text-[var(--accent)]' : 'opacity-60'}`}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: currentStep === step.toLowerCase() ? 1 : 0.6 }}
            transition={{ duration: 0.3 }}
          >
            {index + 1}. {step}
          </motion.span>
          {index < steps.length - 1 && (
            <FontAwesomeIcon icon={faChevronRight} className="opacity-40" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CheckoutSteps;