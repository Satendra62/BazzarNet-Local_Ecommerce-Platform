import React, { useContext, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { AppContext } from '../context/AppContext';
import QRCode from 'react-qr-code';
import placeholderImage from '../assets/placeholder.png'; // Import placeholder image
import { getFullImageUrl } from '../utils/imageUtils'; // Import utility

// Helper function to format ISO timestamp
const formatTimestamp = (isoString) => {
  const date = new Date(isoString);
  const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
  const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: true };
  const formattedDate = date.toLocaleDateString(undefined, optionsDate);
  const formattedTime = date.toLocaleTimeString(undefined, optionsTime);
  return `${formattedDate} at ${formattedTime}`;
};

const OrderConfirmation = () => {
  const { user } = useContext(AppContext);
  const location = useLocation();
  const { orderDetails } = location.state || { orderDetails: null };

  if (!orderDetails) {
    return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">No order details found.</h2>
            <Link to="/dashboard" className="bg-[var(--accent)] text-white py-2 px-6 rounded-lg font-medium hover:bg-[var(--accent-dark)] transition-all duration-300">
                Back to Dashboard
            </Link>
        </div>
    );
  }

  const { _id: orderId, totalPrice, items, deliveryOtp, createdAt, paymentMethod, transactionId, razorpayOrderId, coupon, shippingAddress } = orderDetails; // NEW: Destructure razorpayOrderId

  // Data to encode in QR code (e.g., order ID and OTP)
  const qrCodeValue = JSON.stringify({ orderId, deliveryOtp });

  return (
    <section className="w-full max-w-[1200px] my-10">
      <div className="bg-[var(--card-bg)] backdrop-blur-[5px] border border-white/30 rounded-2xl p-8 mx-4 text-center">
        <FontAwesomeIcon icon={faCheckCircle} className="text-6xl text-green-500 mb-4" aria-hidden="true" />
        <h2 className="text-3xl font-bold mb-2">Thank You for Your Order, {user?.name}!</h2>
        <p className="text-lg mb-6">Your order has been placed successfully.</p>
        
        <div className="text-left max-w-md mx-auto bg-black/10 p-6 rounded-lg" aria-labelledby="order-summary-heading">
            <h3 id="order-summary-heading" className="text-xl font-semibold mb-4 border-b border-white/20 pb-2">Order Summary</h3>
            <p className="mb-2"><strong>Order ID:</strong> {orderId}</p>
            <p className="mb-2"><strong>Order Date:</strong> {formatTimestamp(createdAt)}</p>
            <p className="mb-2"><strong>Payment Method:</strong> {paymentMethod}</p>
            {transactionId && <p className="mb-2"><strong>Transaction ID:</strong> {transactionId}</p>}
            {razorpayOrderId && <p className="mb-4"><strong>Razorpay Order ID:</strong> {razorpayOrderId}</p>}
            <div className="mb-4">
                <h4 className="font-semibold">Items:</h4>
                <ul role="list">
                    {items.map(item => (
                        <li key={item.product} className="flex justify-between py-1" role="listitem">
                            <div className="flex items-center gap-2">
                                <img 
                                  src={getFullImageUrl(item.image)} 
                                  alt={item.name} 
                                  className="w-8 h-8 object-cover rounded-md" 
                                  onError={(e) => { e.target.onerror = null; e.target.src = placeholderImage; }} // Fallback image
                                />
                                <span>{item.name} x {item.quantity} {item.unit}</span>
                            </div>
                            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
            </div>
            {coupon && ( // New: Display coupon details if available
              <div className="flex justify-between py-1 text-green-400">
                <span>Coupon ({coupon.code}):</span>
                <span>- ₹{coupon.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <p className="mb-4"><strong>Total:</strong> ₹{totalPrice.toFixed(2)}</p>
            <p className="text-sm opacity-80">You will receive an email confirmation shortly.</p>
        </div>

        {/* Shipping Address Display */}
        <div className="text-left max-w-md mx-auto bg-black/10 p-6 rounded-lg mt-8" aria-labelledby="shipping-address-heading">
            <h3 id="shipping-address-heading" className="text-xl font-semibold mb-4 border-b border-white/20 pb-2">Shipping Address</h3>
            <p>{shippingAddress.houseNo}, {shippingAddress.landmark ? shippingAddress.landmark + ', ' : ''}{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pinCode}</p>
            <p>Mobile: {shippingAddress.mobile}</p>
        </div>

        {/* OTP and QR Code Section */}
        <div className="bg-black/10 p-6 rounded-lg max-w-md mx-auto mt-8">
            <h3 className="text-xl font-semibold mb-4">Delivery Confirmation</h3>
            <p className="mb-4">Please show this QR code to the delivery person to confirm your order.</p>
            <div className="flex justify-center mb-4 p-2 bg-white rounded-lg">
                <QRCode value={qrCodeValue} size={180} level="H" className="rounded-lg" aria-label={`QR code for order ${orderId} with OTP ${deliveryOtp}`} />
            </div>
            <p className="text-lg font-bold">OTP: <span className="text-[var(--accent)]">{deliveryOtp}</span></p>
            <p className="text-sm opacity-80 mt-2">The delivery person will scan this QR or ask for the OTP.</p>
        </div>

        <Link to="/dashboard" className="inline-block mt-8 bg-[var(--accent)] text-white py-2 px-6 rounded-lg font-medium hover:bg-[var(--accent-dark)] transition-all duration-300">
            Continue Shopping
        </Link>
      </div>
    </section>
  );
};

export default OrderConfirmation;