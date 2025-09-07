import asyncHandler from '../middleware/asyncHandler.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js'; // Import Product model
import Store from '../models/Store.js'; // Import Store model
import Coupon from '../models/Coupon.js'; // New: Import Coupon model
import Payment from '../models/Payment.js'; // NEW: Import Payment model
import { generateOtp } from '../utils/helpers.js'; // Assuming a helper for OTP generation
import { sendEmail } from '../services/emailService.js';
import env from '../config/env.js'; // Import env to use FRONTEND_URL
import mongoose from 'mongoose'; // Import mongoose for transactions
import Razorpay from 'razorpay'; // NEW: Import Razorpay for verification
import crypto from 'crypto'; // NEW: Import crypto for signature verification

// Initialize Razorpay instance for server-side verification
const razorpayInstance = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

// @desc    Place a new order (Customer)
// @route   POST /api/orders
// @access  Private/Customer
const placeOrder = asyncHandler(async (req, res) => {
  console.log('Backend: placeOrder controller reached.'); // NEW LOG
  const { items, shippingAddress, paymentMethod, totalPrice, appliedCoupon, transactionId, razorpayOrderId, razorpaySignature } = req.body; // New: Get appliedCoupon, transactionId, and Razorpay details
  console.log('Backend: Received items in req.body:', items); // ADDED LOG

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No items in order.');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  let createdOrder; // Declare createdOrder outside try block to be accessible later

  try {
    // --- Razorpay Server-Side Verification (if paymentMethod is Razorpay) ---
    if (paymentMethod === 'Razorpay') {
      if (!razorpayOrderId || !transactionId || !razorpaySignature) {
        res.status(400);
        throw new Error('Razorpay payment details are missing for verification.');
      }

      const generatedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
        .update(razorpayOrderId + '|' + transactionId)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        res.status(400);
        throw new Error('Razorpay payment verification failed: Invalid signature.');
      }

      // Optionally, fetch payment details from Razorpay to confirm status
      // const paymentDetails = await razorpayInstance.payments.fetch(transactionId);
      // if (paymentDetails.status !== 'captured') {
      //   res.status(400);
      //   throw new Error('Razorpay payment not captured.');
      // }
      console.log('Backend: Razorpay payment verified successfully on server-side.');
    }
    // --- End Razorpay Server-Side Verification ---

    // Extract product IDs from the incoming items
    const productIds = items.map(item => item.product);

    // Fetch all products in one go to avoid N+1 queries
    // Use session for consistency
    const productsInOrder = await Product.find({ _id: { $in: productIds } }).session(session);

    // Create a map for quick lookup
    const productMap = new Map(productsInOrder.map(p => [p._id.toString(), p]));

    // Validate and get store ID from the first item
    const firstItemProduct = productMap.get(items[0].product);
    if (!firstItemProduct) {
      res.status(400);
      throw new Error('Product not found for the first item.');
    }
    const storeId = firstItemProduct.store;
    const store = await Store.findById(storeId).session(session);

    if (!store) {
      res.status(400);
      throw new Error('Store not found for the order.');
    }

    // NEW VALIDATION: Ensure all items belong to the same store
    const uniqueStoreIds = new Set();
    for (const item of items) {
      const product = productMap.get(item.product);
      if (!product) {
        res.status(400);
        throw new Error(`Product with ID ${item.product} not found.`);
      }
      uniqueStoreIds.add(product.store.toString());
    }

    if (uniqueStoreIds.size > 1) {
      res.status(400);
      throw new Error('Cannot place order with products from multiple stores.');
    }
    // END NEW VALIDATION

    // NEW VALIDATION: Ensure customer's shipping pincode matches the store's pincode
    if (shippingAddress.pinCode !== store.address.pinCode) {
      res.status(400);
      throw new Error(`Cannot place order. Store is not available in your selected pincode (${shippingAddress.pinCode}). This store serves pincode ${store.address.pinCode}.`);
    }

    // --- Stock Validation and Decrement ---
    const productsToUpdate = [];
    for (const item of items) {
      const product = productMap.get(item.product); // Get product from map
      if (!product) {
        res.status(404);
        throw new Error(`Product with ID ${item.product} not found.`);
      }
      if (product.stock < item.quantity) {
        res.status(400);
        throw new Error(`Not enough stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}.`);
      }
      productsToUpdate.push({ product, quantity: item.quantity });
    }

    // Decrement stock for all products
    for (const { product, quantity } of productsToUpdate) {
      product.stock -= quantity;
      await product.save({ session }); // Save with session
    }
    // --- End Stock Validation and Decrement ---

    const orderItems = items.map(item => ({
      product: item.product,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      unit: item.unit, // Include unit in order item
    }));

    const order = new Order({
      user: req.user._id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      store: storeId,
      storeName: store.name,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      deliveryOtp: generateOtp(), // Generate OTP for delivery confirmation
      transactionId: transactionId || (paymentMethod === 'Cash on Delivery' ? `COD-${Date.now()}` : undefined), // Assign transactionId for UPI QR Payment/Razorpay or generate for COD
      razorpayOrderId: paymentMethod === 'Razorpay' ? razorpayOrderId : undefined, // NEW: Assign Razorpay Order ID
      razorpaySignature: paymentMethod === 'Razorpay' ? razorpaySignature : undefined, // NEW: Assign Razorpay Signature
      // New: Store coupon details if applied
      coupon: appliedCoupon ? {
        code: appliedCoupon.code,
        discountAmount: appliedCoupon.discountAmount,
        discountType: appliedCoupon.discountType, // NEW: Added discountType
        discountValue: appliedCoupon.discountValue, // NEW: Added discountValue
      } : undefined,
    });

    createdOrder = await order.save({ session }); // Save with session

    // NEW: Create a Payment record
    const paymentStatus = (paymentMethod === 'Credit Card' || paymentMethod === 'UPI QR Payment' || paymentMethod === 'Razorpay') ? 'Paid' : 'Pending';
    const payment = new Payment({
      order: createdOrder._id,
      vendor: store.owner, // Link to the store owner (vendor)
      amount: totalPrice,
      paymentMethod: paymentMethod,
      transactionId: transactionId || `COD-${createdOrder._id}`, // Use transactionId or generate one for COD
      razorpayOrderId: paymentMethod === 'Razorpay' ? razorpayOrderId : undefined, // NEW: Assign Razorpay Order ID
      razorpaySignature: paymentMethod === 'Razorpay' ? razorpaySignature : undefined, // NEW: Assign Razorpay Signature
      status: paymentStatus,
      customer: req.user._id,
    });
    await payment.save({ session }); // Save payment within the transaction

    // New: Mark coupon as used if one was applied
    if (appliedCoupon) {
      const coupon = await Coupon.findById(appliedCoupon._id).session(session);
      if (coupon) {
        coupon.usedCount += 1;
        coupon.usedBy.push(req.user._id);
        await coupon.save({ session }); // Save with session
      }
    }

    await session.commitTransaction(); // Commit all changes if successful
    session.endSession();

    // Respond to the client immediately after successful transaction commit
    res.status(201).json(createdOrder);

  } catch (error) {
    await session.abortTransaction(); // Rollback any changes if an error occurred
    session.endSession();
    console.error('Transaction aborted:', error);
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'Order placement failed due to a transaction error.');
  }

  // Send order confirmation email to customer (outside transaction)
  if (createdOrder) { // Only attempt to send email if order was successfully created
    const orderItemsHtml = createdOrder.items.map(item => `
      <li>${item.name} (Qty: ${item.quantity} ${item.unit}) - ₹${item.price.toFixed(2)}</li>
    `).join('');

    const orderConfirmationEmailHtml = `
      <p>Hello ${createdOrder.customerName},</p>
      <p>Thank you for your order from BazzarNet!</p>
      <p>Your order #${createdOrder._id} has been placed successfully and is being processed.</p>
      
      <h3>Order Summary:</h3>
      <ul>
        ${orderItemsHtml}
      </ul>
      <p><strong>Total Price:</strong> ₹${createdOrder.totalPrice.toFixed(2)}</p>
      ${createdOrder.coupon ? `<p><strong>Coupon Applied:</strong> ${createdOrder.coupon.code} (Discount: ₹${createdOrder.coupon.discountAmount.toFixed(2)})</p>` : ''}
      <p><strong>Payment Method:</strong> ${createdOrder.paymentMethod}</p>
      ${createdOrder.transactionId ? `<p><strong>Transaction ID:</strong> ${createdOrder.transactionId}</p>` : ''}
      <p><strong>Shipping Address:</strong></p>
      <p>
        ${createdOrder.shippingAddress.houseNo}, ${createdOrder.shippingAddress.landmark ? createdOrder.shippingAddress.landmark + ', ' : ''}
        ${createdOrder.shippingAddress.city}, ${createdOrder.shippingAddress.state} - ${createdOrder.shippingAddress.pinCode}
      </p>
      <p>Your delivery OTP is: <strong>${createdOrder.deliveryOtp}</strong>. Please provide this to the delivery person.</p>
      <p>You can track your order status here: <a href="${env.FRONTEND_URL}/my-orders/${createdOrder._id}">${env.FRONTEND_URL}/my-orders/${createdOrder._id}</a></p>
      <p>The BazzarNet Team</p>
    `;
    try {
      await sendEmail(createdOrder.customerEmail, `BazzarNet Order Confirmation #${createdOrder._id}`, 'Your order has been placed!', orderConfirmationEmailHtml);
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError);
      // Log the email error but don't prevent the order from being placed successfully
    }
  }
});

export {
  placeOrder,
  getCustomerOrders,
  getOrderById, // Export new function
  getVendorOrders,
  updateOrderStatus,
  confirmDelivery,
};