import React, { useContext, useState, useEffect } => 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { AppContext } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import * as api from '../services/api'; // Import API service
// Removed: import { useRazorpay } from 'react-razorpay'; // No longer using this hook

// Import modular components
import CheckoutSteps from '../components/checkout/CheckoutSteps';
import ShippingAddressForm from '../components/checkout/ShippingAddressForm';
import OrderSummary from '../components/checkout/OrderSummary';
import CouponSection from '../components/checkout/CouponSection';
import RazorpayPaymentForm from '../components/checkout/RazorpayPaymentForm'; // NEW: Import RazorpayPaymentForm

// Helper function to dynamically load the Razorpay script
const loadRazorpayScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { cart, checkout, user, appliedCoupon, discountAmount, updateUserInContext } = useContext(AppContext);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('address');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Razorpay'); // Changed: Default to Razorpay
  
  // Initialize shippingAddress from user profile, ensuring a deep copy
  const [shippingAddress, setShippingAddress] = useState(() => {
    if (user?.address) {
      return { ...user.address }; // Deep copy to avoid direct mutation of user object
    }
    return {
      houseNo: '',
      landmark: '',
      city: '',
      state: '',
      pinCode: '',
      mobile: '',
    };
  });

  const [addressErrors, setAddressErrors] = useState({});
  const [isRazorpayLoading, setIsRazorpayLoading] = useState(false); // NEW: Loading state for Razorpay initiation

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalTotal = subtotal - discountAmount;

  // Dynamically load Razorpay script on component mount
  useEffect(() => {
    loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
  }, []);

  // Effect to update shippingAddress if user.address in context changes
  useEffect(() => {
    if (user?.address) {
      // Only update if the address from context is different from current state
      if (JSON.stringify(user.address) !== JSON.stringify(shippingAddress)) {
        setShippingAddress({ ...user.address });
      }
    }
  }, [user?.address]); // Depend on user.address

  // Handlers for form changes
  const handleShippingAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  // Validation functions for each step
  const validateAddress = () => {
    let newErrors = {};
    if (!shippingAddress.houseNo.trim()) {
      newErrors.houseNo = 'House No. is required.';
    }
    if (!shippingAddress.city.trim()) {
      newErrors.city = 'City is required.';
    }
    if (!shippingAddress.state.trim()) {
      newErrors.state = 'State is required.';
    }
    if (!shippingAddress.pinCode.trim()) {
      newErrors.pinCode = 'Pin Code is required.';
    } else if (!/^\d{6}$/.test(shippingAddress.pinCode)) {
      newErrors.pinCode = 'Pin Code must be 6 digits.';
    }
    // Removed hardcoded pincode validation: else if (shippingAddress.pinCode !== VALID_PINCODE) { ... }
    if (!shippingAddress.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required.';
    } else if (!/^\+?\d{10,15}$/.test(shippingAddress.mobile)) {
      newErrors.mobile = 'Mobile number is invalid.';
    }
    setAddressErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = async () => {
    if (currentStep === 'address') {
      if (validateAddress()) {
        // Save address to user profile if it's new or changed
        if (JSON.stringify(user?.address) !== JSON.stringify(shippingAddress)) {
          try {
            const updatedUser = await api.userProfile.updateProfile({ address: shippingAddress });
            updateUserInContext(updatedUser); // Update user in context
            toast.success('Shipping address saved to profile!');
          } catch (error) {
            toast.error(`Failed to save address to profile: ${error.message}`);
            // Optionally, prevent proceeding if saving fails
            return;
          }
        }
        setCurrentStep('coupon');
      } else {
        toast.error('Please enter a valid shipping address.');
      }
    } else if (currentStep === 'coupon') {
      setCurrentStep('summary');
    } else if (currentStep === 'summary') {
      setCurrentStep('payment');
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 'coupon') {
      setCurrentStep('address');
    } else if (currentStep === 'summary') {
      setCurrentStep('coupon');
    } else if (currentStep === 'payment') {
      setCurrentStep('summary');
    }
  };

  // NEW: Function to initiate Razorpay payment
  const initiateRazorpayPayment = async () => {
    setIsRazorpayLoading(true);
    try {
      // Log the Razorpay Key ID to verify it's being picked up
      console.log('Razorpay Key ID from .env:', import.meta.env.VITE_RAZORPAY_KEY_ID);

      // 1. Create an order on your backend
      const razorpayOrder = await api.razorpay.createOrder(finalTotal);

      // 2. Ensure Razorpay script is loaded and global Razorpay object is available
      if (!window.Razorpay) {
        const loaded = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
        if (!loaded) {
          throw new Error('Razorpay SDK failed to load.');
        }
      }

      // 3. Create a new Razorpay instance
      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Your Razorpay Key ID
        amount: razorpayOrder.amount * 100, // Amount in paise
        currency: razorpayOrder.currency,
        name: 'BazzarNet',
        description: 'Order Payment',
        order_id: razorpayOrder.orderId,
        handler: async (response) => {
          // This function is called on successful payment
          console.log('Razorpay Success Response:', response);
          const paymentDetails = {
            paymentMethod: 'Razorpay',
            transactionId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          };
          await handlePlaceOrder(paymentDetails); // Proceed to place order with Razorpay details
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: shippingAddress.mobile || user?.phone || '',
        },
        notes: {
          address: `${shippingAddress.houseNo}, ${shippingAddress.city}, ${shippingAddress.pinCode}`,
        },
        theme: {
          color: '#22D3EE', // Your accent color
        },
      });

      // 4. Open the Razorpay checkout
      rzp.open();

    } catch (error) {
      console.error('Error initiating Razorpay payment:', error);
      toast.error(error.message || 'Failed to initiate Razorpay payment.');
    } finally {
      setIsRazorpayLoading(false);
    }
  };

  const handlePlaceOrder = async (paymentDetails = {}) => {
    console.log('Attempting to place order. Current cart:', cart);
    cart.forEach((item, index) => {
      console.log(`Cart item ${index}:`, item);
      console.log(`Cart item ${index} unit:`, item.unit);
    });

    if (cart.length === 0) {
      console.error('Cart is empty when trying to place order!');
      toast.error('Your cart is empty. Please add items before checking out.');
      return;
    }

    let orderPayload = {
      totalPrice: finalTotal,
      items: cart.map(item => ({
        product: item.product._id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
      })),
      shippingAddress: shippingAddress,
      appliedCoupon: appliedCoupon,
    };

    // Only Razorpay payment method is active
    orderPayload = {
      ...orderPayload,
      paymentMethod: 'Razorpay',
      transactionId: paymentDetails.transactionId,
      razorpayOrderId: paymentDetails.razorpayOrderId,
      razorpaySignature: paymentDetails.razorpaySignature,
    };
    
    console.log('Order details prepared for API call:', orderPayload);
    const newOrder = await checkout(orderPayload);
    if (newOrder) {
      navigate('/confirmation', { state: { orderDetails: newOrder } });
    }
  };

  if (cart.length === 0 && currentStep !== 'confirmation') {
    return (
      <section className="w-full max-w-[1200px] my-10">
        <div className="bg-[var(--card-bg)] backdrop-blur-[5px] border border-white/30 rounded-2xl p-8 mx-4 text-center">
          <FontAwesomeIcon icon={faShoppingCart} className="text-6xl text-[var(--accent)] mb-4" aria-hidden="true" />
          <h2 className="text-2xl font-bold mb-4">Your cart is empty!</h2>
          <p className="text-lg mb-4">Add some items to proceed to checkout.</p>
          <Link to="/products" className="bg-[var(--accent)] text-white border-none py-2 px-6 rounded-lg font-medium hover:bg-[var(--accent-dark)] transition-all duration-300">
            Start Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-[1200px] my-10">
      <div className="bg-[var(--card-bg)] backdrop-blur-[5px] border border-white/30 rounded-2xl p-8 mx-4">
        <h2 className="text-3xl font-bold mb-5 md:text-4xl text-center">Checkout</h2>
        
        <CheckoutSteps currentStep={currentStep} />

        <AnimatePresence mode="wait">
          {currentStep === 'address' && (
            <motion.div
              key="address-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ShippingAddressForm
                address={shippingAddress}
                errors={addressErrors}
                handleChange={handleShippingAddressChange}
                onNextStep={handleNextStep}
              />
            </motion.div>
          )}

          {currentStep === 'coupon' && (
            <motion.div
              key="coupon-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CouponSection
                currentTotalPrice={subtotal}
                onNextStep={handleNextStep}
                onPreviousStep={handlePreviousStep}
              />
            </motion.div>
          )}

          {currentStep === 'summary' && (
            <motion.div
              key="summary-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <OrderSummary
                cart={cart}
                subtotal={subtotal}
                total={finalTotal}
                appliedCoupon={appliedCoupon}
                discountAmount={discountAmount}
                shippingAddress={shippingAddress}
                onEditAddress={() => setCurrentStep('address')}
                onNextStep={handleNextStep}
                onPreviousStep={handlePreviousStep}
              />
            </motion.div>
          )}

          {currentStep === 'payment' && (
            <motion.div
              key="payment-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="max-w-[500px] mx-auto">
                <h3 className="text-2xl font-bold mb-4 text-center">Select Payment Method</h3>
                <div className="bg-black/10 p-6 rounded-xl mb-6">
                  <label className="flex items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Razorpay"
                      checked={selectedPaymentMethod === 'Razorpay'}
                      onChange={() => setSelectedPaymentMethod('Razorpay')}
                      className="form-radio h-4 w-4 text-[var(--accent)] focus:ring-[var(--accent)]"
                      disabled // Disable to ensure it's always selected
                    />
                    <span className="ml-3 text-lg font-medium">Razorpay</span>
                  </label>
                </div>

                {/* Only render Razorpay form */}
                <RazorpayPaymentForm
                  onPreviousStep={handlePreviousStep}
                  onInitiateRazorpayPayment={initiateRazorpayPayment}
                  isLoading={isRazorpayLoading}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Checkout;