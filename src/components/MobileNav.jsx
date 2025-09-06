import React, { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes // Only faTimes is needed for the close button if other icons are Lucide
} from '@fortawesome/free-solid-svg-icons';
import { AppContext } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Package, Receipt, Store, ShoppingBag, Heart, Truck, User, Home, 
  HelpCircle, LogOut, CreditCard, MessageSquareText // Removed LucideShoppingCart and Heart as they are now in Header
} from 'lucide-react'; // Import Lucide icons

const MobileNav = () => {
  const { sidebarOpen, toggleSidebar, isVendor, isAdmin, logout } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toggleSidebar();
    navigate('/');
  };

  const adminLinks = [
    { name: 'Dashboard', path: '/admin-dashboard', icon: Home },
    { name: 'Users', path: '/admin-users', icon: Users },
    { name: 'Products', path: '/admin-products', icon: Package },
    { name: 'Orders', path: '/admin-orders', icon: Receipt },
    { name: 'Stores', path: '/admin-stores', icon: Store },
    { name: 'Support', path: '/admin-support-tickets', icon: MessageSquareText }, // Admin Support link
    // Removed Help link for admin
    { name: 'Logout', action: handleLogout, icon: LogOut, isLogout: true },
  ];

  const vendorLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Manage Store', path: '/manage-products', icon: Store },
    { name: 'Orders', path: '/orders', icon: Truck },
    { name: 'Payments', path: '/payments', icon: CreditCard }, // Added Payments link for vendor
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'My Tickets', path: '/profile?tab=tickets', icon: MessageSquareText }, // NEW: My Tickets link for vendor
    { name: 'Help', path: '/help', icon: HelpCircle },
    { name: 'Logout', action: handleLogout, icon: LogOut, isLogout: true },
  ];

  const userLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Products', path: '/products', icon: ShoppingBag },
    { name: 'Stores', path: '/stores', icon: Store },
    // Removed Cart and Wishlist from here as they are now in the main Header
    { name: 'Orders', path: '/orders', icon: Truck },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'My Tickets', path: '/profile?tab=tickets', icon: MessageSquareText }, // NEW: My Tickets link for customer
    { name: 'Help', path: '/help', icon: HelpCircle },
    { name: 'Logout', action: handleLogout, icon: LogOut, isLogout: true },
  ];

  const links = isAdmin ? adminLinks : (isVendor ? vendorLinks : userLinks);

  const menuVariants = {
    hidden: { opacity: 0, x: '100%' },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
    exit: { opacity: 0, x: '100%', transition: { duration: 0.2, ease: 'easeInOut' } }
  };

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <>
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={menuVariants}
            className="fixed inset-0 bg-black z-[999] p-6 text-white"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            <div className="flex justify-end mb-8">
              <button
                onClick={toggleSidebar}
                className="text-white hover:text-[var(--accent)] transition-colors duration-200"
                aria-label="Close navigation menu"
              >
                <FontAwesomeIcon icon={faTimes} size="2x" aria-hidden="true" />
              </button>
            </div>
            <nav className="flex flex-col items-start">
              {links.map((link) => {
                const IconComponent = link.icon;
                const linkClasses = `flex items-center w-full justify-start py-2 px-4 no-underline text-lg font-medium hover:bg-white/10 rounded-lg transition-colors duration-200 ${link.isLogout ? 'text-red-400 hover:text-red-500' : ''}`;
                
                return link.isLogout ? (
                  <a
                    key={link.name}
                    href="#"
                    className={linkClasses}
                    onClick={(e) => { e.preventDefault(); link.action(); }}
                    aria-label={link.name}
                  >
                    <IconComponent size={20} className="mr-3 w-5 text-center" aria-hidden="true" />
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={toggleSidebar}
                    className={linkClasses}
                    aria-label={link.name}
                  >
                    <IconComponent size={20} className="mr-3 w-5 text-center" aria-hidden="true" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileNav;