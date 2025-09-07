import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import * as api from '../services/api';

const useCart = (isLoggedIn, user, isVendor, isAdmin) => {
  const [cart, setCart] = useState([]);

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn || !user?._id || isVendor || isAdmin) {
      console.log('fetchCart: Clearing cart due to user status (not logged in, or is vendor/admin).');
      setCart([]); // Clear cart if not logged in or not a customer
      return;
    }
    try {
      const userCart = await api.customer.getCart();
      console.log('fetchCart: Successfully fetched cart:', userCart.items);
      setCart(userCart.items);
    } catch (error) {
      console.error('fetchCart: Failed to load cart:', error);
      toast.error(`Failed to load cart: ${error.message}`);
      setCart([]); // Clear cart on error
    }
  }, [isLoggedIn, user?._id, isVendor, isAdmin]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    if (!isLoggedIn || !user?._id) return;
    try {
      await api.customer.clearCart();
      setCart([]);
      toast.success('Your cart has been cleared.');
    } catch (error) {
      toast.error(`Error clearing cart: ${error.message}`);
    }
  }, [isLoggedIn, user?._id]);

  const addToCart = useCallback(async (product) => {
    if (!isLoggedIn || !user?._id) {
      toast.error('Please log in to add items to your cart.');
      return;
    }

    // Determine the actual product ID and store ID
    const actualProductId = product.product?._id || product._id;
    const actualUnit = product.product?.unit || product.unit;
    const productName = product.product?.name || product.name;

    let newProductStoreId;
    // Prioritize product.product.store (from wishlist item) then product.store (from direct product)
    if (product.product?.store) {
      newProductStoreId = product.product.store._id || product.product.store;
    } else if (product.store) {
      newProductStoreId = product.store._id || product.store;
    }

    if (!newProductStoreId) {
      toast.error('Could not determine store for this product.');
      return;
    }

    // Check if cart is not empty and if the new product is from a different store
    if (cart.length > 0) {
      console.log('DEBUG Frontend: Cart is not empty. Inspecting cart[0].product:', cart[0].product);
      console.log('DEBUG Frontend: Inspecting cart[0].product.store:', cart[0].product.store);
      const currentCartStoreId = cart[0].product.store._id;
      if (newProductStoreId.toString() !== currentCartStoreId.toString()) {
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-[var(--card-bg)] text-[var(--text)] shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-white/10`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.102 3.377 1.752 3.377h14.092c1.65 0 2.615-1.877 1.752-3.377L13.5 1.12a1.875 1.875 0 00-3 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">
                    Items from a different store detected!
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    Your cart already contains items from another store. Do you want to clear your cart and add "{productName}"?
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col border-l border-white/10">
              <button
                onClick={async () => {
                  toast.dismiss(t.id);
                  await clearCart();
                  console.log('DEBUG Frontend: Cart length after clearCart:', cart.length); // NEW LOG
                  try {
                    const response = await api.customer.addToCart(actualProductId, 1, actualUnit);
                    setCart(response.items);
                    toast.success(`${productName} added to cart!`);
                  } catch (error) {
                    toast.error(`Error adding to cart: ${error.message}`);
                  }
                }}
                className="w-full border-b border-white/10 p-3 flex items-center justify-center text-sm font-medium text-[var(--accent)] hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors"
              >
                Clear Cart & Add
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full p-3 flex items-center justify-center text-sm font-medium text-gray-400 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ), { duration: Infinity }); // Keep toast open until action is taken
        return; // Stop further execution
      }
    }

    // If cart is empty or product is from the same store, proceed to add
    try {
      const response = await api.customer.addToCart(actualProductId, 1, actualUnit);
      setCart(response.items);
      toast.success(`${productName} added to cart!`);
    } catch (error) {
      toast.error(`Error adding to cart: ${error.message}`);
    }
  }, [isLoggedIn, user?._id, cart, clearCart]);

  const removeFromCart = useCallback(async (productId) => {
    if (!isLoggedIn || !user?._id) return;
    console.log('useCart: removeFromCart called with productId:', productId); // NEW LOG
    try {
      const response = await api.customer.removeFromCart(productId);
      setCart(response.items);
      toast.error(`Item removed from cart.`);
    } catch (error) {
      toast.error(`Error removing from cart: ${error.message}`);
    }
  }, [isLoggedIn, user?._id]);
  
  const updateCartQuantity = useCallback(async (productId, quantity) => {
    if (!isLoggedIn || !user?._id) return;
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    try {
      const response = await api.customer.updateCartItem(productId, quantity);
      setCart(response.items);
    } catch (error) {
      toast.error(`Error updating cart quantity: ${error.message}`);
    }
  }, [isLoggedIn, user?._id, removeFromCart]);

  const checkout = useCallback(async (orderDetails) => {
    if (!isLoggedIn || !user?._id) {
      toast.error('Please log in to place an order.');
      return null;
    }

    // Client-side stock validation before proceeding to backend
    for (const item of cart) {
      if (item.product.stock < item.quantity) {
        toast.error(`"${item.name}" is out of stock or does not have enough quantity available. Please adjust your cart.`);
        return null; // Prevent checkout
      }
    }

    console.log('useCart: Sending orderDetails to API:', orderDetails);
    console.log('useCart: Items in orderDetails:', orderDetails.items);

    try {
      const newOrder = await api.customer.placeOrder(orderDetails);
      setCart([]); // Clear cart after successful order
      toast.success('Order placed successfully!');
      return newOrder;
    } catch (error) {
      toast.error(`Error placing order: ${error.message}`);
      return null;
    }
  }, [isLoggedIn, user?._id, cart]); // Added cart to dependencies

  return {
    cart,
    fetchCart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    checkout,
    setCart, // Expose setCart for external updates if needed (e.g., after login)
    clearCart, // Expose clearCart
  };
};

export default useCart;