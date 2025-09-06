import React, { useContext, useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars, faTimes, faSignOutAlt, faShoppingCart, faHeart, faUser, faBox, faIdCard, faSun, faMoon, faCreditCard, faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';
import { AppContext } from '../context/AppContext';
import MobileNav from './MobileNav';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Package, Receipt, Store, MessageSquareText } from 'lucide-react'; // Import MessageSquareText for admin help

const Header = () => {
  const { sidebarOpen, toggleSidebar, cart, theme, toggleTheme, isVendor, isAdmin, logout } = useContext(AppContext);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const navigate = useNavigate();

  // Define navigation link classes
  const navLinkClasses = "relative text-[var(--text)] hover:text-[var(--accent)] transition-colors duration-200 py-2 px-3 rounded-md text-lg font-medium";
  const activeLinkClasses = "text-[var(--accent)]";

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const adminLinks = [
    { name: 'Dashboard', path: '/admin-dashboard' },
    { name: 'Users', path: '/admin-users' },
    { name: 'Products', path: '/admin-products' },
    { name: 'Orders', path: '/admin-orders' },
    { name: 'Stores', path: '/admin-stores' },
    { name: 'Support', path: '/admin-support-tickets' }, // Admin Support link
  ];

  const vendorLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Manage Store', path: '/manage-products' },
  ];

  const userLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Products', path: '/products' },
    { name: 'Stores', path: '/stores' },
  ];

  const links = isAdmin ? adminLinks : (isVendor ? vendorLinks : userLinks);

  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.15, ease: 'easeIn' } }
  };

  return (
    <header className="relative flex items-center py-4 bg-[var(--bg)] sticky top-0 z-[1000] rounded-b-2xl shadow-[0_4px_20px_var(--shadow)]">
      <div className="container mx-auto px-5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <span className="text-2xl font-bold text-[var(--accent)] md:text-3xl" aria-label="BazzarNet Home">BazzarNet</span>
          </div>
          <nav className="hidden md:flex items-center gap-2">
            {links.map((link) => (
              <NavLink key={link.name} to={link.path} className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`} aria-label={link.name}>
                {({ isActive }) => (
                  <>
                    {link.name}
                    {isActive && <motion.div className="absolute -bottom-1 left-2 right-2 h-0.5 bg-[var(--accent)]" layoutId="underline" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {!isVendor && !isAdmin && (
            // Removed 'hidden md:flex' to make it visible on all screen sizes
            <div className="flex items-center gap-4 border border-white/20 rounded-full px-4 py-2">
              <NavLink to="/cart" className="relative text-[var(--text)] hover:text-[var(--accent)] transition-colors duration-200" aria-label={`Shopping Cart with ${cartItemCount} items`}>
                <FontAwesomeIcon icon={faShoppingCart} className="text-xl" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-[var(--card-bg)]" aria-hidden="true">
                    {cartItemCount}
                  </span>
                )}
              </NavLink>
              <div className="w-px h-5 bg-white/20" aria-hidden="true"></div>
              <NavLink to="/wishlist" className="text-[var(--text)] hover:text-[var(--accent)] transition-colors duration-200" aria-label="Wishlist">
                <FontAwesomeIcon icon={faHeart} className="text-xl" />
              </NavLink>
            </div>
          )}

          <div className="relative hidden md:block" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="bg-[var(--card-bg)] rounded-full w-10 h-10 flex items-center justify-center hover:scale-110 transition-transform duration-200 border border-white/20"
              aria-label="User Profile Menu"
              aria-expanded={profileOpen}
            >
              <FontAwesomeIcon icon={faUser} className="text-xl" />
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute top-14 right-0 w-48 bg-[var(--card-bg)] border border-white/10 rounded-lg shadow-lg flex flex-col py-1"
                  role="menu"
                >
                  {!isAdmin && (
                    <>
                      <NavLink to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/10" role="menuitem">
                        <FontAwesomeIcon icon={faIdCard} aria-hidden="true" /> Profile
                      </NavLink>
                      <NavLink to="/orders" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/10" role="menuitem">
                        <FontAwesomeIcon icon={faBox} aria-hidden="true" /> Orders
                      </NavLink>
                      {/* NEW: My Tickets link for customers/vendors */}
                      <NavLink to="/profile?tab=tickets" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/10" role="menuitem">
                        <MessageSquareText size={16} aria-hidden="true" /> My Tickets
                      </NavLink>
                    </>
                  )}
                  {isVendor && (
                    <NavLink to="/payments" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/10" role="menuitem">
                      <FontAwesomeIcon icon={faCreditCard} aria-hidden="true" /> Payments
                    </NavLink>
                  )}
                  {isAdmin && (
                    <>
                      <NavLink to="/admin-users" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/10" role="menuitem">
                        <Users size={16} aria-hidden="true" /> Users
                      </NavLink>
                      <NavLink to="/admin-products" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/10" role="menuitem">
                        <Package size={16} aria-hidden="true" /> Products
                      </NavLink>
                      <NavLink to="/admin-orders" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/10" role="menuitem">
                        <Receipt size={16} aria-hidden="true" /> Orders
                      </NavLink>
                      <NavLink to="/admin-stores" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/10" role="menuitem">
                        <Store size={16} aria-hidden="true" /> Stores
                      </NavLink>
                      <NavLink to="/admin-support-tickets" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/10" role="menuitem">
                        <MessageSquareText size={16} aria-hidden="true" /> Support
                      </NavLink>
                    </>
                  )}
                  {/* Removed Help link for admin */}
                  <button onClick={toggleTheme} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/10 w-full" role="menuitem" aria-label={`Toggle ${theme === 'light' ? 'Dark' : 'Light'} Mode`}>
                    <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} aria-hidden="true" />
                    <span>{theme === 'light' ? 'Dark' : 'Light'} Mode</span>
                  </button>
                  <div className="h-px bg-white/10 my-1" aria-hidden="true"></div>
                  <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-white/10" role="menuitem">
                    <FontAwesomeIcon icon={faSignOutAlt} aria-hidden="true" /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button className="md:hidden bg-[var(--card-bg)] rounded-full w-10 h-10 flex items-center justify-center" onClick={toggleSidebar} aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}>
            <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} className="text-xl" aria-hidden="true" />
          </button>
        </div>
      </div>
      
      <MobileNav />
    </header>
  );
};

export default Header;