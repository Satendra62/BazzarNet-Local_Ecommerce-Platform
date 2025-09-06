import React, { useState, useContext, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AppContext } from '../context/AppContext';
import useFormValidation from '../hooks/useFormValidation';
import * as api from '../services/api';
import { Mail, MessageSquareText, Loader2 } from 'lucide-react'; // ADDED Loader2 here

const inputClasses = "w-full p-2 rounded-lg bg-white/10 border border-black/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--text)]";

const SupportForm = ({ onClose, onSuccess }) => { // NEW: Added onSuccess prop
  const { user, isLoggedIn } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || (isLoggedIn ? 'customer' : 'guest'), // Default to customer if logged in, else guest
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // NEW: Loading state for submission

  const supportValidationLogic = useCallback((data) => {
    let newErrors = {};
    if (!data.name.trim()) {
      newErrors.name = 'Your name is required.';
    }
    if (!data.email.trim()) {
      newErrors.email = 'Your email is required.';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = 'Invalid email address.';
    }
    if (!data.subject.trim()) {
      newErrors.subject = 'Subject is required.';
    } else if (data.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters.';
    }
    if (!data.message.trim()) {
      newErrors.message = 'Message is required.';
    } else if (data.message.trim().length < 20) {
      newErrors.message = 'Message must be at least 20 characters.';
    }
    return newErrors;
  }, []);

  const { errors, validate, resetErrors } = useFormValidation(formData, supportValidationLogic);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate(formData)) {
      setIsSubmitting(true); // Start loading
      try {
        const response = await api.general.submitSupportRequest(formData);
        toast.success(response.message);
        onClose(); // Close modal on success
        if (onSuccess) { // NEW: Call onSuccess callback
          onSuccess();
        }
      } catch (error) {
        toast.error(error.message || 'Failed to submit support request.');
      } finally {
        setIsSubmitting(false); // End loading
      }
    } else {
      toast.error('Please correct the errors in the form.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="supportName" className="block text-sm font-medium mb-1">Your Name</label>
        <input
          type="text"
          id="supportName"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={inputClasses}
          disabled={isLoggedIn || isSubmitting} // Disable if logged in or submitting
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "supportName-error" : undefined}
        />
        {errors.name && <p id="supportName-error" className="text-red-400 text-xs mt-1">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="supportEmail" className="block text-sm font-medium mb-1">Your Email</label>
        <input
          type="email"
          id="supportEmail"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={inputClasses}
          disabled={isLoggedIn || isSubmitting} // Disable if logged in or submitting
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "supportEmail-error" : undefined}
        />
        {errors.email && <p id="supportEmail-error" className="text-red-400 text-xs mt-1">{errors.email}</p>}
      </div>
      <div>
        <label htmlFor="supportSubject" className="block text-sm font-medium mb-1">Subject</label>
        <input
          type="text"
          id="supportSubject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className={inputClasses}
          aria-invalid={!!errors.subject}
          aria-describedby={errors.subject ? "supportSubject-error" : undefined}
          disabled={isSubmitting}
        />
        {errors.subject && <p id="supportSubject-error" className="text-red-400 text-xs mt-1">{errors.subject}</p>}
      </div>
      <div>
        <label htmlFor="supportMessage" className="block text-sm font-medium mb-1">Message</label>
        <textarea
          id="supportMessage"
          name="message"
          rows="5"
          value={formData.message}
          onChange={handleChange}
          className={inputClasses}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "supportMessage-error" : undefined}
          disabled={isSubmitting}
        ></textarea>
        {errors.message && <p id="supportMessage-error" className="text-red-400 text-xs mt-1">{errors.message}</p>}
      </div>
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onClose}
          className="bg-white/10 text-[var(--text)] py-2 px-6 rounded-lg font-medium hover:bg-white/20 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-[var(--accent)] text-white py-2 px-6 rounded-lg flex items-center gap-2 font-medium hover:bg-[var(--accent-dark)] transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Mail size={20} />} Send Request
        </button>
      </div>
    </form>
  );
};

export default SupportForm;