import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null);
  const prevActiveElement = useRef(null);

  useEffect(() => {
    if (isOpen) {
      prevActiveElement.current = document.activeElement; // Store the element that was focused before the modal opened
      modalRef.current?.focus(); // Focus the modal itself
      document.body.style.overflow = 'hidden'; // Prevent scrolling body when modal is open

      const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = ''; // Restore body scrolling
        prevActiveElement.current?.focus(); // Return focus to the previously active element
      };
    }
  }, [isOpen, onClose]);

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
          aria-labelledby="modal-title"
          tabIndex="-1" // Make the overlay focusable for screen readers
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-[var(--card-bg)] backdrop-blur-[5px] border border-white/30 rounded-2xl shadow-lg w-full max-w-2xl relative"
            onClick={(e) => e.stopPropagation()}
            ref={modalRef} // Attach ref to the modal content
          >
            <div className="flex justify-between items-center p-6 border-b border-white/20">
              <h3 id="modal-title" className="text-2xl font-bold">{title}</h3>
              <button onClick={onClose} className="text-[var(--text)] hover:text-[var(--accent)]" aria-label={`Close ${title} modal`}>
                <FontAwesomeIcon icon={faTimes} size="lg" aria-hidden="true" />
              </button>
            </div>
            {/* This div will now handle scrolling if content is too tall */}
            <div className="p-6 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;