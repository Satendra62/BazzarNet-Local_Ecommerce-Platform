import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { AppContext } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react'; // Import Lucide icons

const Login = () => {
  const { loginAsUser, loginAsVendor, loginAsAdmin } = useContext(AppContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('user');
  const [isLoading, setIsLoading] = useState(false);

  // User Login State
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userErrors, setUserErrors] = useState({});
  const [showUserPassword, setShowUserPassword] = useState(false); // New state

  // Vendor Login State
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorPassword, setVendorPassword] = useState('');
  const [vendorErrors, setVendorErrors] = useState({});
  const [showVendorPassword, setShowVendorPassword] = useState(false); // New state

  // Admin Login State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminErrors, setAdminErrors] = useState({});
  const [showAdminPassword, setShowAdminPassword] = useState(false); // New state

  const validateUserLogin = () => {
    let newErrors = {};
    if (!userEmail.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(userEmail)) {
      newErrors.email = 'Email address is invalid.';
    }
    if (!userPassword) {
      newErrors.password = 'Password is required.';
    } else if (userPassword.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }
    setUserErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateVendorLogin = () => {
    let newErrors = {};
    if (!vendorEmail.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(vendorEmail)) {
      newErrors.email = 'Email address is invalid.';
    }
    if (!vendorPassword) {
      newErrors.password = 'Password is required.';
    } else if (vendorPassword.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }
    setVendorErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAdminLogin = () => {
    let newErrors = {};
    if (!adminEmail.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(adminEmail)) {
      newErrors.email = 'Email address is invalid.';
    }
    if (!adminPassword) {
      newErrors.password = 'Password is required.';
    }
    setAdminErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUserLogin = async (e) => {
    e.preventDefault();
    if (validateUserLogin()) {
      setIsLoading(true);
      try {
        if (await loginAsUser(userEmail, userPassword)) {
          navigate('/dashboard');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error('Please fill in all required fields.');
    }
  };

  const handleVendorLogin = async (e) => {
    e.preventDefault();
    if (validateVendorLogin()) {
      setIsLoading(true);
      try {
        if (await loginAsVendor(vendorEmail, vendorPassword)) {
          navigate('/dashboard');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error('Please fill in all required fields.');
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (validateAdminLogin()) {
      setIsLoading(true);
      try {
        if (await loginAsAdmin(adminEmail, adminPassword)) {
          navigate('/admin-dashboard');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error('Please fill in all required fields.');
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  const inputClasses = "w-full p-3 my-2 text-[var(--text)] border border-white/30 rounded-lg bg-white/10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--bg-body)] p-4">
      <div className="bg-[var(--card-bg)] backdrop-blur-[5px] border border-white/30 rounded-2xl flex flex-col p-8 shadow-[0_8px_40px_var(--shadow)] w-full max-w-[400px] mx-4 text-center text-[var(--auth-text)]">
        <h2 className="text-2xl font-bold mb-6 text-[var(--accent)]">Welcome to BazzarNet</h2>
        
        <div className="flex justify-center bg-black/10 rounded-lg p-1 mb-6" role="tablist">
          <button
            onClick={() => setActiveTab('user')}
            className={`w-1/3 py-2 rounded-md font-semibold transition-colors duration-300 ${activeTab === 'user' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text)]'}`}
            role="tab"
            aria-selected={activeTab === 'user'}
            aria-controls="user-login-panel"
            id="user-login-tab"
          >
            User
          </button>
          <button
            onClick={() => setActiveTab('vendor')}
            className={`w-1/3 py-2 rounded-md font-semibold transition-colors duration-300 ${activeTab === 'vendor' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text)]'}`}
            role="tab"
            aria-selected={activeTab === 'vendor'}
            aria-controls="vendor-login-panel"
            id="vendor-login-tab"
          >
            Vendor
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`w-1/3 py-2 rounded-md font-semibold transition-colors duration-300 ${activeTab === 'admin' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text)]'}`}
            role="tab"
            aria-selected={activeTab === 'admin'}
            aria-controls="admin-login-panel"
            id="admin-login-tab"
          >
            Admin
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'user' && (
            <motion.form
              key="user"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleUserLogin}
              className="flex flex-col"
              role="tabpanel"
              id="user-login-panel"
              aria-labelledby="user-login-tab"
            >
              <label htmlFor="userEmail" className="sr-only">Email</label>
              <input
                type="email"
                id="userEmail"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Email"
                className={inputClasses}
                aria-invalid={!!userErrors.email}
                aria-describedby={userErrors.email ? "userEmail-error" : undefined}
              />
              {userErrors.email && <p id="userEmail-error" className="text-red-400 text-xs text-left -mt-1 mb-2">{userErrors.email}</p>}

              <label htmlFor="userPassword" className="sr-only">Password</label>
              <div className="relative w-full">
                <input
                  type={showUserPassword ? 'text' : 'password'}
                  id="userPassword"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="Password"
                  className={`${inputClasses} pr-10`}
                  aria-invalid={!!userErrors.password}
                  aria-describedby={userErrors.password ? "userPassword-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowUserPassword(!showUserPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text)] opacity-70 hover:opacity-100"
                  aria-label={showUserPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showUserPassword}
                >
                  {showUserPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {userErrors.password && <p id="userPassword-error" className="text-red-400 text-xs text-left -mt-1 mb-2">{userErrors.password}</p>}

              <button
                type="submit"
                className="bg-[var(--accent)] text-white border-none py-3 px-6 rounded-lg flex items-center justify-center w-full gap-2 font-medium hover:bg-[var(--accent-dark)] transition-all duration-300 mt-4"
                disabled={isLoading}
              >
                {isLoading ? <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> : <FontAwesomeIcon icon={faSignInAlt} aria-hidden="true" />}
                {isLoading ? 'Signing In...' : 'Sign in as User'}
              </button>
            </motion.form>
          )}
          {activeTab === 'vendor' && (
            <motion.form
              key="vendor"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleVendorLogin}
              className="flex flex-col"
              role="tabpanel"
              id="vendor-login-panel"
              aria-labelledby="vendor-login-tab"
            >
              <label htmlFor="vendorEmail" className="sr-only">Email</label>
              <input
                type="email"
                id="vendorEmail"
                value={vendorEmail}
                onChange={(e) => setVendorEmail(e.target.value)}
                placeholder="Email"
                className={inputClasses}
                aria-invalid={!!vendorErrors.email}
                aria-describedby={vendorErrors.email ? "vendorEmail-error" : undefined}
              />
              {vendorErrors.email && <p id="vendorEmail-error" className="text-red-400 text-xs text-left -mt-1 mb-2">{vendorErrors.email}</p>}

              <label htmlFor="vendorPassword" className="sr-only">Password</label>
              <div className="relative w-full">
                <input
                  type={showVendorPassword ? 'text' : 'password'}
                  id="vendorPassword"
                  value={vendorPassword}
                  onChange={(e) => setVendorPassword(e.target.value)}
                  placeholder="Password"
                  className={`${inputClasses} pr-10`}
                  aria-invalid={!!vendorErrors.password}
                  aria-describedby={vendorErrors.password ? "vendorPassword-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowVendorPassword(!showVendorPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text)] opacity-70 hover:opacity-100"
                  aria-label={showVendorPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showVendorPassword}
                >
                  {showVendorPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {vendorErrors.password && <p id="vendorPassword-error" className="text-red-400 text-xs text-left -mt-1 mb-2">{vendorErrors.password}</p>}

              <button
                type="submit"
                className="bg-[var(--accent)] text-white border-none py-3 px-6 rounded-lg flex items-center justify-center w-full gap-2 font-medium hover:bg-[var(--accent-dark)] transition-all duration-300 mt-4"
                disabled={isLoading}
              >
                {isLoading ? <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> : <FontAwesomeIcon icon={faSignInAlt} aria-hidden="true" />}
                {isLoading ? 'Signing In...' : 'Sign in as Vendor'}
              </button>
            </motion.form>
          )}
          {activeTab === 'admin' && (
            <motion.form
              key="admin"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleAdminLogin}
              className="flex flex-col"
              role="tabpanel"
              id="admin-login-panel"
              aria-labelledby="admin-login-tab"
            >
              <label htmlFor="adminEmail" className="sr-only">Admin Email</label>
              <input
                type="email"
                id="adminEmail"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="Email"
                className={inputClasses}
                aria-invalid={!!adminErrors.email}
                aria-describedby={adminErrors.email ? "adminEmail-error" : undefined}
              />
              {adminErrors.email && <p id="adminEmail-error" className="text-red-400 text-xs text-left -mt-1 mb-2">{adminErrors.email}</p>}

              <label htmlFor="adminPassword" className="sr-only">Admin Password</label>
              <div className="relative w-full">
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  id="adminPassword"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Password"
                  className={`${inputClasses} pr-10`}
                  aria-invalid={!!adminErrors.password}
                  aria-describedby={adminErrors.password ? "adminPassword-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text)] opacity-70 hover:opacity-100"
                  aria-label={showAdminPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showAdminPassword}
                >
                  {showAdminPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {adminErrors.password && <p id="adminPassword-error" className="text-red-400 text-xs text-left -mt-1 mb-2">{adminErrors.password}</p>}

              <button
                type="submit"
                className="bg-[var(--accent)] text-white border-none py-3 px-6 rounded-lg flex items-center justify-center w-full gap-2 font-medium hover:bg-[var(--accent-dark)] transition-all duration-300 mt-4"
                disabled={isLoading}
              >
                {isLoading ? <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> : <FontAwesomeIcon icon={faSignInAlt} aria-hidden="true" />}
                {isLoading ? 'Signing In...' : 'Sign in as Admin'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
        <p className="text-center text-sm mt-6">
          Don't have an account? <Link to="/register" className="text-[var(--accent)] font-semibold">Sign up here.</Link>
        </p>
        <p className="text-center text-sm mt-2">
          <Link to="/forgot-password" className="text-[var(--accent)] font-semibold">Forgot Password?</Link>
        </p>
        {/* NEW: Back to Home link */}
        <p className="text-center text-sm mt-4">
          <Link to="/" className="text-[var(--accent)] font-semibold">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;