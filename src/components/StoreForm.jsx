import React, { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { ChevronDown, UploadCloud, Loader2 } from 'lucide-react'; // Added Loader2 icon
import useFormValidation from '../hooks/useFormValidation';
import * as api from '../services/api';
import placeholderImage from '../assets/placeholder.png';
import { getFullImageUrl } from '../utils/imageUtils';

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const StoreForm = ({ onSubmit, initialData = null }) => {
  const [store, setStore] = useState({
    name: '',
    description: '',
    category: '',
    address: {
      houseNo: '',
      landmark: '',
      city: '',
      state: '',
      pinCode: '',
    },
    phone: '',
    email: '',
    logo: '',
    isActive: true,
  });
  const [logoFile, setLogoFile] = useState(null);
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // NEW: Loading state

  const categories = [
    'Groceries', 'Bakery', 'Butcher', 'Cafe', 'Electronics', 
    'Furniture', 'Decor', 'Clothing', 'Other'
  ];

  const storeValidationLogic = useCallback((data) => {
    let newErrors = {};
    if (!data.name.trim()) {
      newErrors.name = 'Store Name is required.';
    }
    if (!data.description.trim()) {
      newErrors.description = 'Description is required.';
    }
    if (!data.category) {
      newErrors.category = 'Category is required.';
    }
    if (!data.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^\+?\d{10,15}$/.test(data.phone)) {
      newErrors.phone = 'Phone number is invalid.';
    }
    if (!data.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = 'Email address is invalid.';
    }
    if (!data.address.houseNo.trim()) {
      newErrors.address = { ...newErrors.address, houseNo: 'House No. is required.' };
    }
    if (!data.address.city.trim()) {
      newErrors.address = { ...newErrors.address, city: 'City is required.' };
    }
    if (!data.address.state.trim()) {
      newErrors.address = { ...newErrors.address, state: 'State is required.' };
    }
    if (!data.address.pinCode.trim()) {
      newErrors.address = { ...newErrors.address, pinCode: 'Pin Code is required.' };
    } else if (!/^\d{6}$/.test(data.address.pinCode)) {
      newErrors.address = { ...newErrors.address, pinCode: 'Pin Code must be 6 digits.' };
    }
    if (!logoFile && !data.logo.trim()) {
      newErrors.logo = 'Store logo is required (upload a file or provide a URL).';
    }
    return newErrors;
  }, [logoFile]);

  const { errors, validate, resetErrors } = useFormValidation(store, storeValidationLogic);

  useEffect(() => {
    if (initialData) {
      setStore({
        name: initialData.name || '',
        description: initialData.description || '',
        category: initialData.category || '',
        address: initialData.address || { houseNo: '', landmark: '', city: '', state: '', pinCode: '' },
        phone: initialData.phone || '',
        email: initialData.email || '',
        logo: initialData.logo || '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
      setLogoFile(null);
    } else {
      setStore({
        name: '', description: '', category: '',
        address: { houseNo: '', landmark: '', city: '', state: '', pinCode: '' },
        phone: '', email: '', logo: '', isActive: true,
      });
      setLogoFile(null);
    }
    resetErrors();
  }, [initialData, resetErrors]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setStore(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else if (type === 'checkbox') {
      setStore(prev => ({ ...prev, [name]: checked }));
    } else {
      setStore(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLogoFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
      setStore(prev => ({ ...prev, logo: '' }));
    } else {
      setLogoFile(null);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return store.logo;

    const formData = new FormData();
    formData.append('image', logoFile);

    try {
      const response = await api.upload.uploadImage(formData);
      toast.success('Logo uploaded successfully!');
      return response.filePath;
    } catch (error) {
      toast.error(`Logo upload failed: ${error.message}`);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validate(store)) {
      setIsSubmitting(true); // Start loading
      try {
        let logoUrl = store.logo;
        if (logoFile) {
          logoUrl = await handleLogoUpload();
        } else if (!logoUrl.trim()) {
          toast.error('Store logo is required.');
          return;
        }

        const submittedStore = {
          ...store,
          logo: logoUrl,
        };
        onSubmit(submittedStore);
      } catch (error) {
        console.error('Store form submission error:', error);
      } finally {
        setIsSubmitting(false); // End loading
      }
    } else {
      toast.error('Please correct the errors in the form.');
    }
  };

  const inputClasses = "w-full p-2 rounded-lg bg-white/10 border border-black/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";

  const previewLogoSrc = logoFile ? URL.createObjectURL(logoFile) : getFullImageUrl(store.logo);

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label={initialData ? 'Edit Store Form' : 'Add New Store Form'}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="storeName" className="block text-sm font-medium mb-1">Store Name</label>
          <input 
            type="text" 
            id="storeName"
            name="name" 
            value={store.name} 
            onChange={handleChange} 
            className={inputClasses} 
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "storeName-error" : undefined}
            disabled={isSubmitting}
          />
          {errors.name && <p id="storeName-error" className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>
        <div className="relative">
          <label htmlFor="storeCategory" className="block text-sm font-medium mb-1">Category</label>
          <select 
            name="category" 
            id="storeCategory"
            value={store.category} 
            onChange={handleChange} 
            className={`${inputClasses} appearance-none pr-8`}
            aria-invalid={!!errors.category}
            aria-describedby={errors.category ? "storeCategory-error" : undefined}
            disabled={isSubmitting}
          >
            <option value="" disabled>Select a category</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-2 text-[var(--text)]" aria-hidden="true"><ChevronDown size={20} /></div>
          {errors.category && <p id="storeCategory-error" className="text-red-400 text-xs mt-1">{errors.category}</p>}
        </div>
      </div>
      
      <div>
        <label htmlFor="storeDescription" className="block text-sm font-medium mb-1">Description</label>
        <textarea 
          name="description" 
          id="storeDescription"
          rows="3" 
          value={store.description} 
          onChange={handleChange} 
          className={inputClasses}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? "storeDescription-error" : undefined}
          disabled={isSubmitting}
        ></textarea>
        {errors.description && <p id="storeDescription-error" className="text-red-400 text-xs mt-1">{errors.description}</p>}
      </div>

      <div>
        <label htmlFor="storeLogoFile" className="block text-sm font-medium mb-1">Store Logo</label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            id="storeLogoFile"
            ref={fileInputRef}
            onChange={handleLogoFileChange}
            className="hidden"
            accept="image/*"
            aria-label="Upload store logo file"
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="bg-white/10 text-[var(--text)] py-2 px-4 rounded-lg flex items-center gap-2 font-medium hover:bg-white/20 transition-colors"
            aria-controls="storeLogoPreview"
            disabled={isSubmitting}
          >
            <UploadCloud size={20} /> Choose File
          </button>
          <span className="text-sm opacity-70">
            {logoFile ? logoFile.name : (store.logo ? 'Existing Logo' : 'No file chosen')}
          </span>
        </div>
        {errors.logo && <p id="storeLogo-error" className="text-red-400 text-xs mt-1">{errors.logo}</p>}

        {!logoFile && (
          <div className="mt-4">
            <label htmlFor="storeLogoUrl" className="block text-sm font-medium mb-1">Or enter Logo URL</label>
            <input 
              type="text" 
              id="storeLogoUrl"
              name="logo" 
              value={store.logo} 
              onChange={handleChange} 
              placeholder="e.g., https://example.com/store-logo.jpg"
              className={inputClasses} 
              aria-invalid={!!errors.logo}
              aria-describedby={errors.logo ? "storeLogoUrl-error" : undefined}
              disabled={isSubmitting}
            />
            {errors.logo && <p id="storeLogoUrl-error" className="text-red-400 text-xs mt-1">{errors.logo}</p>}
          </div>
        )}

        {(logoFile || store.logo) && (
          <div id="storeLogoPreview" className="mt-4 w-32 h-32 border border-white/30 rounded-lg overflow-hidden flex items-center justify-center">
            <img 
              src={previewLogoSrc} 
              alt="Logo Preview" 
              className="max-w-full max-h-full object-contain" 
              onError={(e) => { e.target.onerror = null; e.target.src = placeholderImage; }}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="storePhone" className="block text-sm font-medium mb-1">Phone</label>
          <input 
            type="tel" 
            id="storePhone"
            name="phone" 
            value={store.phone} 
            onChange={handleChange} 
            className={inputClasses} 
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "storePhone-error" : undefined}
            disabled={isSubmitting}
          />
          {errors.phone && <p id="storePhone-error" className="text-red-400 text-xs mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="storeEmail" className="block text-sm font-medium mb-1">Email</label>
          <input 
            type="email" 
            id="storeEmail"
            name="email" 
            value={store.email} 
            onChange={handleChange} 
            className={inputClasses} 
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "storeEmail-error" : undefined}
            disabled={isSubmitting}
          />
          {errors.email && <p id="storeEmail-error" className="text-red-400 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="addressHouseNo" className="block text-sm font-medium mb-1">House No., Street</label>
        <input 
          type="text" 
          id="addressHouseNo"
          name="address.houseNo" 
          value={store.address.houseNo} 
          onChange={handleChange} 
          className={inputClasses} 
          aria-invalid={!!errors.address?.houseNo}
          aria-describedby={errors.address?.houseNo ? "addressHouseNo-error" : undefined}
          disabled={isSubmitting}
        />
        {errors.address?.houseNo && <p id="addressHouseNo-error" className="text-red-400 text-xs mt-1">{errors.address.houseNo}</p>}
      </div>
      <div>
        <label htmlFor="addressLandmark" className="block text-sm font-medium mb-1">Landmark (Optional)</label>
        <input 
          type="text" 
          id="addressLandmark"
          name="address.landmark" 
          value={store.address.landmark} 
          onChange={handleChange} 
          className={inputClasses} 
          disabled={isSubmitting}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="addressCity" className="block text-sm font-medium mb-1">City</label>
          <input 
            type="text" 
            id="addressCity"
            name="address.city" 
            value={store.address.city} 
            onChange={handleChange} 
            className={inputClasses} 
            aria-invalid={!!errors.address?.city}
            aria-describedby={errors.address?.city ? "addressCity-error" : undefined}
            disabled={isSubmitting}
          />
          {errors.address?.city && <p id="addressCity-error" className="text-red-400 text-xs mt-1">{errors.address.city}</p>}
        </div>
        <div className="relative">
          <label htmlFor="addressState" className="block text-sm font-medium mb-1">State</label>
          <select 
            name="address.state" 
            id="addressState"
            value={store.address.state} 
            onChange={handleChange} 
            className={`${inputClasses} appearance-none pr-8`}
            aria-invalid={!!errors.address?.state}
            aria-describedby={errors.address?.state ? "addressState-error" : undefined}
            disabled={isSubmitting}
          >
            <option value="" disabled>Select State</option>
            {indianStates.map(state => <option key={state} value={state}>{state}</option>)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-2 text-[var(--text)]" aria-hidden="true"><ChevronDown size={20} /></div>
          {errors.address?.state && <p id="addressState-error" className="text-red-400 text-xs mt-1">{errors.address.state}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="addressPinCode" className="block text-sm font-medium mb-1">Pin Code</label>
        <input 
          type="text" 
          id="addressPinCode"
          name="address.pinCode" 
          value={store.address.pinCode} 
          onChange={handleChange} 
          className={inputClasses} 
          maxLength="6"
          aria-invalid={!!errors.address?.pinCode}
          aria-describedby={errors.address?.pinCode ? "addressPinCode-error" : undefined}
          disabled={isSubmitting}
        />
        {errors.address?.pinCode && <p id="addressPinCode-error" className="text-red-400 text-xs mt-1">{errors.address.pinCode}</p>}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="storeIsActive"
          name="isActive"
          checked={store.isActive}
          onChange={handleChange}
          className="h-4 w-4 text-[var(--accent)] rounded border-gray-300 focus:ring-[var(--accent)]"
          disabled={isSubmitting}
        />
        <label htmlFor="storeIsActive" className="text-sm font-medium">Store is Active</label>
      </div>

      <div className="flex justify-end">
        <button 
          type="submit" 
          className="bg-[var(--accent)] text-white py-2 px-6 rounded-lg font-medium hover:bg-[var(--accent-dark)] transition-colors flex items-center gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : null}
          {initialData ? (isSubmitting ? 'Saving...' : 'Save Changes') : (isSubmitting ? 'Adding...' : 'Add Store')}
        </button>
      </div>
    </form>
  );
};

export default StoreForm;