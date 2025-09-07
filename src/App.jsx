import React, { useContext } from 'react';
import { AppContext } from './context/AppContext';
import PublicRoutes from './routes/PublicRoutes';
import CustomerRoutes from './routes/CustomerRoutes';
import VendorRoutes from './routes/VendorRoutes';
import AdminRoutes from './routes/AdminRoutes';
import PincodeModal from './components/PincodeModal'; // NEW: Import PincodeModal

const App = () => {
  const { theme, isLoggedIn, isVendor, isAdmin, showPincodeModal, setShowPincodeModal } = useContext(AppContext);

  return (
    <div className={`font-poppins min-h-screen flex flex-col transition-all duration-300 ${theme === 'dark' ? 'bg-[#07080a] text-[#E0E0E0]' : 'bg-[#E0E0E0] text-[#333]'}`}>
      {/* Main application routing based on user role */}
      {isLoggedIn ? (
        isAdmin ? (
          <AdminRoutes />
        ) : isVendor ? (
          <VendorRoutes />
        ) : (
          <CustomerRoutes />
        )
      ) : (
        <PublicRoutes />
      )}
      {/* NEW: Render PincodeModal conditionally for logged-in customers without a set pincode */}
      {isLoggedIn && !isVendor && !isAdmin && (
        <PincodeModal isOpen={showPincodeModal} onClose={() => setShowPincodeModal(false)} />
      )}
    </div>
  );
};

export default App;