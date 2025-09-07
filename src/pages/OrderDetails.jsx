import React, { useContext, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { ChevronDown } from 'lucide-react';
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

const OrderDetails = () => {
  const { orderId } = useParams();
  const { orders, updateOrderStatus, confirmDeliveryWithOtp } = useContext(AppContext);
  const order = orders.find(o => o._id === orderId); // Find order using _id
  const [status, setStatus] = useState(order?.orderStatus || ''); // Use orderStatus
  const [otpInput, setOtpInput] = useState('');

  useEffect(() => {
    if (order) {
      setStatus(order.orderStatus);
    }
  }, [order]);

  if (!order) {
    return (
      <section className="w-full max-w-[1200px] my-10 text-center">
        <h2 className="text-2xl font-bold">Order not found.</h2>
        <Link to="/orders" className="text-[var(--accent)] hover:underline">Back to Orders</Link>
      </section>
    );
  }

  const handleStatusUpdate = () => {
    // Prevent manual update to 'Delivered' if OTP is present and not yet delivered
    if (order.deliveryOtp && status === 'Delivered' && order.orderStatus !== 'Delivered') {
      toast.error('Please confirm delivery using OTP for this order.');
      return;
    }
    updateOrderStatus(order._id, status);
  };

  const handleConfirmDelivery = async () => {
    if (await confirmDeliveryWithOtp(order._id, otpInput)) {
      // Status will be updated by confirmDeliveryWithOtp, so just clear input
      setOtpInput('');
      setStatus('Delivered'); // Update local state to reflect change
    }
  };

  // Determine if 'Delivered' option should be disabled in manual dropdown
  const isDeliveredOptionDisabledManually = order.deliveryOtp && order.orderStatus !== 'Delivered';

  return (
    <section className="w-full max-w-[1200px] my-10">
      <div className="bg-[var(--card-bg)] backdrop-blur-[5px] border border-white/30 rounded-2xl p-8 mx-4">
        <h2 className="text-3xl font-bold mb-6 md:text-4xl">Order Details</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Info & Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-black/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Order Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <p><strong>Order ID:</strong> {order._id}</p>
                <p><strong>Customer:</strong> {order.customerName}</p>
                <p><strong>Order Placed:</strong> {formatTimestamp(order.createdAt)}</p> {/* Display formatted timestamp */}
                <p><strong>Total:</strong> ₹{order.totalPrice.toFixed(2)}</p>
                <p><strong>Status:</strong> <span className="font-semibold text-[var(--accent)]">{status}</span></p>
                {/* Removed direct display of Delivery OTP for vendor */}
              </div>
            </div>
            <div className="bg-black/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Payment & Transaction Details</h3>
              <p className="mb-2"><strong>Payment Method:</strong> {order.paymentMethod}</p>
              <p><strong>Transaction ID:</strong> {order.transactionId || 'N/A'}</p>
            </div>
            <div className="bg-black/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Items</h3>
              <ul className="space-y-2" role="list">
                {order.items.map(item => (
                  <li key={item.product} className="flex justify-between" role="listitem">
                    <div className="flex items-center gap-2">
                      <img 
                        src={getFullImageUrl(item.image)} 
                        alt={item.name} 
                        className="w-12 h-12 object-cover rounded-md" 
                        onError={(e) => { e.target.onerror = null; e.target.src = placeholderImage; }} // Fallback image
                      />
                      <span>{item.name} (Qty: {item.quantity} {item.unit})</span>
                    </div>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Shipping details are not in the new Order model, removing for now */}
            {/* <div className="bg-black/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Shipping Details</h3>
              <p><strong>Tracking Number:</strong> {order.shipping.trackingNumber}</p>
              <p><strong>Carrier:</strong> {order.shipping.carrier}</p>
            </div> */}
          </div>

          {/* Actions & Contact */}
          <div className="space-y-6">
            {order.deliveryOtp && order.orderStatus !== 'Delivered' && (
              <div className="bg-black/10 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4">Confirm Delivery with OTP</h3>
                <input
                  type="text"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  placeholder="Enter OTP from customer"
                  className="w-full p-3 rounded-lg bg-white/10 border border-black/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-[var(--text)] mb-4"
                  maxLength="6"
                  aria-label="Enter OTP for delivery confirmation"
                />
                <button onClick={handleConfirmDelivery} className="w-full bg-[var(--accent)] text-white py-2 px-4 rounded-lg font-medium">Confirm Delivery</button>
              </div>
            )}
            <div className="bg-black/10 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Update Status (Manual)</h3>
              <div className="relative mb-4">
                <label htmlFor="orderStatus" className="sr-only">Order Status</label>
                <select 
                  id="orderStatus"
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)} 
                  className="w-full appearance-none p-3 rounded-lg bg-white/10 border border-black/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] pr-8"
                  aria-label="Update order status"
                  disabled={order.orderStatus === 'Delivered'} // Disable if already delivered by OTP or manually
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option> {/* Added Processing status */}
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered" disabled={isDeliveredOptionDisabledManually}>Delivered</option> {/* Disabled if OTP is required */}
                  <option value="Cancelled">Cancelled</option>
                  <option value="Refunded">Refunded</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--text)]" aria-hidden="true"><ChevronDown size={20} /></div>
              </div>
              <button onClick={handleStatusUpdate} className="w-full bg-[var(--accent)] text-white py-2 px-4 rounded-lg font-medium" disabled={order.orderStatus === 'Delivered'}>Save Changes</button>
            </div>
            <div className="bg-black/10 p-6 rounded-xl space-y-3">
              <button onClick={() => toast.error('Refund issued!')} className="w-full bg-red-500/20 text-red-400 py-2 px-4 rounded-lg font-medium" aria-label={`Issue refund for order ${order._id}`}>Issue Refund</button>
              <button onClick={() => toast.success('Invoice downloaded!')} className="w-full bg-white/10 text-[var(--text)] py-2 px-4 rounded-lg font-medium" aria-label={`Download invoice for order ${order._id}`}>Download Invoice</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderDetails;