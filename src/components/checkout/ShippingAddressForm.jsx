import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons'; // Import faChevronLeft
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const inputClasses = "w-full p-2 rounded-lg bg-white/10 border border-black/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--text)] text-base md:text-lg";

const ShippingAddressForm = ({ address, errors, handleChange, onNextStep }) => {
  const navigate = useNavigate(); // Initialize useNavigate

  return (
    <div className="flex flex-col gap-4 max-w-[500px] mx-auto" role="form" aria-labelledby="address-heading">
      <h3 id="address-heading" className="text-2xl font-bold mb-2 text-center">Shipping Address</h3>
      
      <div>
        <label htmlFor="houseNo" className="block text-sm font-medium mb-1">House No., Street</label>
        <input
          type="text"
          id="houseNo"
          name="houseNo"
          value={address.houseNo}
          onChange={handleChange}
          placeholder="House No., Street Name"
          className={inputClasses}
          aria-invalid={!!errors?.houseNo}
          aria-describedby={errors?.houseNo ? "houseNo-error" : undefined}
        />
        {errors?.houseNo && <p id="houseNo-error" className="text-red-400 text-xs mt-1">{errors.houseNo}</p>}
      </div>

      <div>
        <label htmlFor="landmark" className="block text-sm font-medium mb-1">Landmark (Optional)</label>
        <input
          type="text"
          id="landmark"
          name="landmark"
          value={address.landmark}
          onChange={handleChange}
          placeholder="e.g., Near City Hospital"
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="city" className="block text-sm font-medium mb-1">City</label>
        <input
          type="text"
          id="city"
          name="city"
          value={address.city}
          onChange={handleChange}
          placeholder="City"
          className={inputClasses}
          aria-invalid={!!errors?.city}
          aria-describedby={errors?.city ? "city-error" : undefined}
        />
        {errors?.city && <p id="city-error" className="text-red-400 text-xs mt-1">{errors.city}</p>}
      </div>

      <div className="relative">
        <label htmlFor="state" className="block text-sm font-medium mb-1">State</label>
        <select
          id="state"
          name="state"
          value={address.state}
          onChange={handleChange}
          className={`${inputClasses} appearance-none pr-8`}
          aria-invalid={!!errors?.state}
          aria-describedby={errors?.state ? "state-error" : undefined}
        >
          <option value="" disabled>Select State</option>
          {indianStates.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 top-8 flex items-center px-2 text-[var(--text)]" aria-hidden="true"><ChevronDown size={20} /></div>
        {errors?.state && <p id="state-error" className="text-red-400 text-xs mt-1">{errors.state}</p>}
      </div>

      <div>
        <label htmlFor="pinCode" className="block text-sm font-medium mb-1">Pin Code</label>
        <input
          type="text"
          id="pinCode"
          name="pinCode"
          value={address.pinCode}
          onChange={handleChange}
          placeholder="e.g., 110001"
          className={inputClasses}
          maxLength="6"
          aria-invalid={!!errors?.pinCode}
          aria-describedby={errors?.pinCode ? "pinCode-error" : undefined}
        />
        {errors?.pinCode && <p id="pinCode-error" className="text-red-400 text-xs mt-1">{errors.pinCode}</p>}
      </div>

      <div> {/* NEW: Mobile Number Field */}
        <label htmlFor="mobile" className="block text-sm font-medium mb-1">Mobile Number</label>
        <input
          type="tel"
          id="mobile"
          name="mobile"
          value={address.mobile}
          onChange={handleChange}
          placeholder="e.g., 9876543210"
          className={inputClasses}
          aria-invalid={!!errors?.mobile}
          aria-describedby={errors?.mobile ? "mobile-error" : undefined}
        />
        {errors?.mobile && <p id="mobile-error" className="text-red-400 text-xs mt-1">{errors.mobile}</p>}
      </div>
      
      <div className="flex justify-between gap-4 mt-4"> {/* NEW: Container for buttons */}
        <button
          type="button"
          onClick={() => navigate('/cart')} // Navigate back to cart
          className="bg-white/10 text-[var(--text)] border-none py-3 px-6 rounded-lg flex items-center justify-center w-full gap-2 font-medium hover:bg-white/20 transition-all duration-300 flex-1"
          aria-label="Back to Cart"
        >
          <FontAwesomeIcon icon={faChevronLeft} aria-hidden="true" /> Back to Cart
        </button>
        <button
          type="button"
          onClick={onNextStep}
          className="bg-[var(--accent)] text-white border-none py-3 px-6 rounded-lg flex items-center justify-center w-full gap-2 font-medium hover:bg-[var(--accent-dark)] transition-all duration-300 flex-1"
          aria-label="Proceed to Summary"
        >
          Proceed to Summary <FontAwesomeIcon icon={faChevronRight} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default ShippingAddressForm;