import React, { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { ChevronDown, UploadCloud, Loader2 } from 'lucide-react'; // Added Loader2 icon
import useFormValidation from '../hooks/useFormValidation';
import * as api from '../services/api';
import placeholderImage from '../assets/placeholder.png';
import { getFullImageUrl } from '../utils/imageUtils';

const ProductForm = ({ onSubmit, initialData = null }) => {
  const [product, setProduct] = useState({
    name: '',
    price: '',
    originalPrice: '',
    stock: '',
    unit: 'pc',
    category: '',
    description: '',
    image: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // NEW: Loading state

  const categories = [
    'Groceries', 'Bakery', 'Butcher', 'Cafe', 'Electronics', 
    'Furniture', 'Decor', 'Clothing', 'Other'
  ];

  const units = ['pc', 'kg', 'g', 'L', 'ml', 'dozen', 'pack', 'set', 'pair', 'unit'];

  const productValidationLogic = useCallback((data) => {
    let newErrors = {};
    const priceValue = parseFloat(data.price);
    const originalPriceValue = data.originalPrice ? parseFloat(data.originalPrice) : null;
    const stockValue = parseInt(data.stock);

    if (!data.name.trim()) {
      newErrors.name = 'Product Name is required.';
    }
    if (!data.category) {
      newErrors.category = 'Category is required.';
    }
    if (!data.unit) {
      newErrors.unit = 'Unit is required.';
    }
    if (isNaN(priceValue) || priceValue <= 0) {
      newErrors.price = 'Price must be a positive number.';
    }
    if (originalPriceValue !== null && (isNaN(originalPriceValue) || originalPriceValue <= 0)) {
      newErrors.originalPrice = 'Original Price must be a positive number.';
    }
    if (originalPriceValue !== null && originalPriceValue <= priceValue) {
      newErrors.originalPrice = 'Original price must be greater than the current price.';
    }
    if (isNaN(stockValue) || stockValue < 0) {
      newErrors.stock = 'Stock must be a non-negative number.';
    }
    if (!data.description.trim()) {
      newErrors.description = 'Description is required.';
    } else if (data.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long.';
    }
    if (!imageFile && !data.image.trim()) {
      newErrors.image = 'Product image is required (upload a file or provide a URL).';
    }
    return newErrors;
  }, [imageFile]);

  const { errors, validate, resetErrors } = useFormValidation(product, productValidationLogic);

  useEffect(() => {
    if (initialData) {
      setProduct({
        name: initialData.name || '',
        price: initialData.price || '',
        originalPrice: initialData.originalPrice || '',
        stock: initialData.stock || '',
        unit: initialData.unit || 'pc',
        category: initialData.category || '',
        description: initialData.description || '',
        image: initialData.image || '',
      });
      setImageFile(null);
    } else {
      setProduct({
        name: '', price: '', originalPrice: '', stock: '',
        unit: 'pc',
        category: '', description: '', image: '',
      });
      setImageFile(null);
    }
    resetErrors();
  }, [initialData, resetErrors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setProduct(prev => ({ ...prev, image: '' }));
    } else {
      setImageFile(null);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return product.image;

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await api.upload.uploadImage(formData);
      toast.success('Image uploaded successfully!');
      return response.filePath;
    } catch (error) {
      toast.error(`Image upload failed: ${error.message}`);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validate(product)) {
      setIsSubmitting(true); // Start loading
      try {
        let imageUrl = product.image;
        if (imageFile) {
          imageUrl = await handleImageUpload();
        } else if (!imageUrl.trim()) {
          toast.error('Product image is required.');
          return;
        }

        const submittedProduct = {
          ...product,
          price: parseFloat(product.price),
          originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : null,
          stock: parseInt(product.stock),
          image: imageUrl,
        };
        onSubmit(submittedProduct);
      } catch (error) {
        console.error('Product form submission error:', error);
      } finally {
        setIsSubmitting(false); // End loading
      }
    } else {
      toast.error('Please correct the errors in the form.');
    }
  };

  const inputClasses = "w-full p-2 rounded-lg bg-white/10 border border-black/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";

  const previewImageSrc = imageFile ? URL.createObjectURL(imageFile) : getFullImageUrl(product.image);

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label={initialData ? 'Edit Product Form' : 'Add New Product Form'}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="productName" className="block text-sm font-medium mb-1">Product Name</label>
          <input 
            type="text" 
            id="productName"
            name="name" 
            value={product.name} 
            onChange={handleChange} 
            className={inputClasses} 
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "productName-error" : undefined}
            disabled={isSubmitting}
          />
          {errors.name && <p id="productName-error" className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>
        <div className="relative">
          <label htmlFor="productCategory" className="block text-sm font-medium mb-1">Category</label>
          <select 
            name="category" 
            id="productCategory"
            value={product.category} 
            onChange={handleChange} 
            className={`${inputClasses} appearance-none pr-8`}
            aria-invalid={!!errors.category}
            aria-describedby={errors.category ? "productCategory-error" : undefined}
            disabled={isSubmitting}
          >
            <option value="" disabled>Select a category</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-2 text-[var(--text)]" aria-hidden="true"><ChevronDown size={20} /></div>
          {errors.category && <p id="productCategory-error" className="text-red-400 text-xs mt-1">{errors.category}</p>}
        </div>
      </div>
      
      <div>
        <label htmlFor="productImageFile" className="block text-sm font-medium mb-1">Product Image</label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            id="productImageFile"
            ref={fileInputRef}
            onChange={handleImageFileChange}
            className="hidden"
            accept="image/*"
            aria-label="Upload product image file"
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="bg-white/10 text-[var(--text)] py-2 px-4 rounded-lg flex items-center gap-2 font-medium hover:bg-white/20 transition-colors"
            aria-controls="productImagePreview"
            disabled={isSubmitting}
          >
            <UploadCloud size={20} /> Choose File
          </button>
          <span className="text-sm opacity-70">
            {imageFile ? imageFile.name : (product.image ? 'Existing Image' : 'No file chosen')}
          </span>
        </div>
        {errors.image && <p id="productImage-error" className="text-red-400 text-xs mt-1">{errors.image}</p>}
        
        {!imageFile && (
          <div className="mt-4">
            <label htmlFor="productImageUrl" className="block text-sm font-medium mb-1">Or enter Image URL</label>
            <input 
              type="text" 
              id="productImageUrl"
              name="image" 
              value={product.image} 
              onChange={handleChange} 
              placeholder="e.g., https://example.com/image.jpg"
              className={inputClasses} 
              aria-invalid={!!errors.image}
              aria-describedby={errors.image ? "productImageUrl-error" : undefined}
              disabled={isSubmitting}
            />
            {errors.image && <p id="productImageUrl-error" className="text-red-400 text-xs mt-1">{errors.image}</p>}
          </div>
        )}

        {(imageFile || product.image) && (
          <div id="productImagePreview" className="mt-4 w-32 h-32 border border-white/30 rounded-lg overflow-hidden flex items-center justify-center">
            <img 
              src={previewImageSrc} 
              alt="Image Preview" 
              className="max-w-full max-h-full object-contain" 
              onError={(e) => { e.target.onerror = null; e.target.src = placeholderImage; }}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="productPrice" className="block text-sm font-medium mb-1">Price (₹)</label>
          <input 
            type="number" 
            id="productPrice"
            name="price" 
            value={product.price} 
            onChange={handleChange} 
            className={inputClasses} 
            aria-invalid={!!errors.price}
            aria-describedby={errors.price ? "productPrice-error" : undefined}
            disabled={isSubmitting}
          />
          {errors.price && <p id="productPrice-error" className="text-red-400 text-xs mt-1">{errors.price}</p>}
        </div>
        <div>
          <label htmlFor="originalPrice" className="block text-sm font-medium mb-1">Original Price (Optional)</label>
          <input 
            type="number" 
            id="originalPrice"
            name="originalPrice" 
            value={product.originalPrice} 
            onChange={handleChange} 
            className={inputClasses} 
            aria-invalid={!!errors.originalPrice}
            aria-describedby={errors.originalPrice ? "originalPrice-error" : undefined}
            disabled={isSubmitting}
          />
          {errors.originalPrice && <p id="originalPrice-error" className="text-red-400 text-xs mt-1">{errors.originalPrice}</p>}
        </div>
        <div>
          <label htmlFor="productStock" className="block text-sm font-medium mb-1">Stock</label>
          <input 
            type="number" 
            id="productStock"
            name="stock" 
            value={product.stock} 
            onChange={handleChange} 
            className={inputClasses} 
            aria-invalid={!!errors.stock}
            aria-describedby={errors.stock ? "productStock-error" : undefined}
            disabled={isSubmitting}
          />
          {errors.stock && <p id="productStock-error" className="text-red-400 text-xs mt-1">{errors.stock}</p>}
        </div>
      </div>
      <div className="relative">
        <label htmlFor="productUnit" className="block text-sm font-medium mb-1">Unit</label>
        <select 
          name="unit" 
          id="productUnit"
          value={product.unit} 
          onChange={handleChange} 
          className={`${inputClasses} appearance-none pr-8`}
          aria-invalid={!!errors.unit}
          aria-describedby={errors.unit ? "productUnit-error" : undefined}
          disabled={isSubmitting}
        >
          {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-2 text-[var(--text)]" aria-hidden="true"><ChevronDown size={20} /></div>
        {errors.unit && <p id="productUnit-error" className="text-red-400 text-xs mt-1">{errors.unit}</p>}
      </div>

      <div>
        <label htmlFor="productDescription" className="block text-sm font-medium mb-1">Description</label>
        <textarea 
          name="description" 
          id="productDescription"
          rows="3" 
          value={product.description} 
          onChange={handleChange} 
          className={inputClasses}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? "productDescription-error" : undefined}
          disabled={isSubmitting}
        ></textarea>
        {errors.description && <p id="productDescription-error" className="text-red-400 text-xs mt-1">{errors.description}</p>}
      </div>
      <div className="flex justify-end">
        <button 
          type="submit" 
          className="bg-[var(--accent)] text-white py-2 px-6 rounded-lg font-medium hover:bg-[var(--accent-dark)] transition-colors flex items-center gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : null}
          {initialData ? (isSubmitting ? 'Saving...' : 'Save Changes') : (isSubmitting ? 'Adding...' : 'Add Product')}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;