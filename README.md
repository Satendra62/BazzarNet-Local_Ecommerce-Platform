<<<<<<< HEAD
# BazzarNet: Local E-commerce Platform

## Project Overview

BazzarNet is a modern, responsive e-commerce platform designed to connect local stores with customers for fast and reliable delivery. It supports three distinct user roles: customers, vendors, and administrators, each with tailored functionalities. The application emphasizes a clean UI, smooth animations, and a robust architecture built with React for the frontend and a Node.js/Express backend with MongoDB.

## Key Features

### General
*   **Responsive Design:** Optimized for various screen sizes (mobile, tablet, desktop).
*   **Theming:** Toggle between light and dark modes.
*   **Authentication:** Separate login/registration flows for customers, vendors, and admins using JWT.
*   **Image Uploads:** Integrated image upload functionality for products, store logos, and user profiles using **Cloudinary**.
*   **Form Validation:** Robust input validation on both frontend (custom hook) and backend (Joi).
*   **Notifications:** User-friendly toast notifications for important events.
*   **Pincode-based Filtering:** Stores and products are filtered based on the customer's active pincode, ensuring localized results.
*   **Support Ticket System:** Users can submit support requests, and admins can manage them.
*   **Password Reset:** Secure password reset functionality via email.
*   **Comprehensive Testing:** Unit and integration tests implemented for both frontend and backend to ensure code quality and prevent regressions.

### Customer Features
*   **Product Browsing:** View all products or filter by store/category, respecting active pincode.
*   **Store Browsing:** Discover local stores and their product offerings, filtered by user's pincode.
*   **Product Details:** Detailed view of individual products with pricing, descriptions, ratings, and the ability to leave reviews.
*   **Shopping Cart:** Add, update quantities, and remove items from the cart.
*   **Wishlist:** Save products for later.
*   **Checkout Process:** Multi-step checkout with address management, coupon application, and **Razorpay** payment integration.
*   **Order Confirmation:** Displays order summary, OTP, and QR code for delivery.
*   **Order Tracking:** View past orders and their current status with a visual tracker.
*   **Profile Management:** View and edit personal contact, address, and payment information.
*   **Customer Dashboard:** Overview of cart, wishlist, total orders, recommended products, and products awaiting review.
*   **Support Ticket Management:** View and track their submitted support tickets.

### Vendor Features
*   **Vendor Dashboard:** Overview of total revenue, orders, customers, and products. Includes sales analytics and fast-selling items.
*   **Product Management:** Add, edit, and delete products for their store.
*   **Order Management:** View and update the status of incoming orders, confirm delivery with OTP.
*   **Payments Overview:** Track payment statuses for their sales.
*   **Profile Management:** View and edit business details, legal information (PAN, GST), payment information (bank, UPI), and store logo.
*   **Support Ticket Management:** View and track their submitted support tickets.

### Admin Features
*   **Admin Dashboard:** Centralized overview of platform metrics (total revenue, active users, vendor/user status, order completion, sales trends).
*   **User Management:** View, activate/deactivate, and delete customer and vendor accounts.
*   **Product Management:** View, edit, and delete all products across all stores.
*   **Order Management:** View all orders, update their status, and initiate refunds.
*   **Store Management:** View, activate/deactivate, edit, and delete all stores.
*   **Support Ticket Management:** View, update status, and add notes to support tickets.

## Tech Stack

### Frontend
*   **Framework:** React (with Vite for a fast development experience)
*   **Testing:** Vitest, React Testing Library, Jest DOM
*   **Styling:** Tailwind CSS (utility-first for rapid UI development)
*   **Icons:** Font Awesome (`@fortawesome/react-fontawesome`) and Lucide React (`lucide-react`)
*   **Animations:** Framer Motion
*   **State Management:** React Context API (`useContext`), `useState`, `useEffect`, `useMemo`
*   **Routing:** React Router DOM
*   **Notifications:** React Hot Toast
*   **Charting:** Recharts (for vendor and admin analytics)
*   **QR Code Generation:** `react-qr-code`
*   **Payment Gateway:** **Razorpay (dynamically loaded SDK)**
*   **Language:** JavaScript (ES6+)

### Backend
*   **Framework:** Node.js with Express
*   **Testing:** Jest, Supertest
*   **Database:** MongoDB (using Mongoose ODM)
*   **Authentication:** JWT (JSON Web Tokens)
*   **Validation:** Joi
*   **Email Service:** Nodemailer
*   **File Uploads:** **Multer (for memory storage) with Cloudinary (for cloud storage)**
*   **Payment Gateway:** **Razorpay (server-side integration)**
*   **Security:** `express-mongo-sanitize`, `xss-clean`, `express-rate-limit`
*   **Language:** JavaScript (ES6+ Modules)

## Architecture

The project follows a clear and modular structure for both frontend and backend, promoting maintainability and scalability.

### Frontend (`./src/`) Folder Structure
```
src/
├── assets/
│   └── placeholder.png
├── components/
│   ├── checkout/
│   │   ├── CheckoutSteps.jsx
│   │   ├── CouponSection.jsx
│   │   ├── OrderSummary.jsx
│   │   └── RazorpayPaymentForm.jsx  <-- NEW
│   ├── profile/
│   │   ├── CustomerProfileForm.jsx
│   │   └── VendorProfileForm.jsx
│   ├── reviews/
│   │   ├── ProductReviews.jsx
│   │   └── ReviewForm.jsx
│   ├── CreateSupportTicketModal.jsx  <-- NEW
│   ├── Footer.jsx
│   ├── Header.jsx
│   ├── Header.test.jsx
│   ├── Layout.jsx
│   ├── Loader.jsx
│   ├── LoginButton.jsx
│   ├── MobileNav.jsx
│   ├── Modal.jsx
│   ├── MySupportTicketCard.jsx      <-- NEW
│   ├── MySupportTicketDetailModal.jsx <-- NEW
│   ├── MySupportTicketsSection.jsx  <-- NEW
│   ├── Pagination.jsx
│   ├── PincodeModal.jsx
│   ├── ProductCard.jsx
│   ├── ProductForm.jsx
│   ├── PublicHeader.jsx
│   ├── PublicLayout.jsx
│   ├── SkeletonCard.jsx
│   ├── SkeletonStoreCard.jsx
│   ├── SkeletonText.jsx
│   ├── StatCard.jsx
│   ├── StoreForm.jsx
│   ├── SupportForm.jsx              <-- NEW
│   ├── SupportTicketCard.jsx        <-- NEW
│   ├── SupportTicketDetailModal.jsx <-- NEW
│   ├── UserSignupForm.jsx
│   └── VendorRegistrationForm.jsx
├── context/
│   └── AppContext.jsx
├── hooks/
│   ├── useAdminProducts.js
│   ├── useAdminStores.js
│   ├── useAuth.js
│   ├── useCart.js
│   ├── useCoupons.js
│   ├── useFormValidation.js
│   ├── useMySupportTickets.js       <-- NEW
│   ├── useOrders.js
│   ├── useProducts.js
│   ├── useStores.js
│   ├── useTheme.js
│   ├── useUsers.js
│   ├── useUtils.js
│   ├── useVendorProducts.js
│   └── useWishlist.js
├── pages/
│   ├── About.jsx
│   ├── AdminDashboard.jsx
│   ├── AdminOrderManagement.jsx
│   ├── AdminProductManagement.jsx
│   ├── AdminStoreManagement.jsx
│   ├── AdminSupportTickets.jsx      <-- NEW
│   ├── AdminUserManagement.jsx
│   ├── Careers.jsx                  <-- NEW
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   ├── ContactUs.jsx                <-- NEW
│   ├── CustomerDashboard.jsx
│   ├── CustomerOrderDetails.jsx     <-- NEW
│   ├── Dashboard.jsx
│   ├── FAQ.jsx
│   ├── ForgotPassword.jsx           <-- NEW
│   ├── LandingPage.jsx
│   ├── Login.jsx
│   ├── ManageProducts.jsx
│   ├── OrderConfirmation.jsx
│   ├── OrderDetails.jsx
│   ├── Orders.jsx
│   ├── Payments.jsx
│   ├── PrivacyPolicy.jsx            <-- NEW
│   ├── ProductDetail.jsx
│   ├── Products.jsx
│   ├── Profile.jsx
│   ├── Register.jsx
│   ├── ResetPassword.jsx            <-- NEW
│   ├── StorePage.jsx
│   ├── Stores.jsx
│   └── TermsOfService.jsx           <-- NEW
├── routes/
│   ├── AdminRoutes.jsx
│   ├── CustomerRoutes.jsx
│   ├── PublicRoutes.jsx
│   └── VendorRoutes.jsx
├── services/
│   └── api.js
├── setupTests.js
├── utils/
│   └── imageUtils.js
├── App.jsx
└── main.jsx
```

### Backend (`./backend/`) Folder Structure
```
backend/
├── config/
│   ├── db.js
│   └── env.js
├── controllers/
│   ├── adminController.js
│   ├── authController.js
│   ├── cartController.js
│   ├── couponController.js
│   ├── orderController.js
│   ├── passwordResetController.js
│   ├── paymentController.js
│   ├── productController.js
│   ├── razorpayController.js        <-- NEW
│   ├── storeController.js
│   ├── supportController.js         <-- NEW
│   ├── uploadController.js
│   ├── userController.js
│   └── vendorController.js
├── middleware/
│   ├── asyncHandler.js
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   ├── rateLimitMiddleware.js
│   ├── uploadMiddleware.js
│   └── validationMiddleware.js
├── models/
│   ├── Cart.js
│   ├── Coupon.js
│   ├── Order.js
│   ├── Payment.js
│   ├── Product.js
│   ├── Review.js
│   ├── Store.js
│   ├── SupportTicket.js             <-- NEW
│   ├── User.js
│   └── Wishlist.js
├── routes/
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── cartRoutes.js
│   ├── couponRoutes.js
│   ├── orderRoutes.js
│   ├── passwordResetRoutes.js
│   ├── paymentRoutes.js
│   ├── productRoutes.js
│   ├── razorpayRoutes.js            <-- NEW
│   ├── storeRoutes.js
│   ├── supportRoutes.js             <-- NEW
│   ├── uploadRoutes.js
│   ├── userRoutes.js
│   └── vendorRoutes.js
├── services/
│   └── emailService.js
├── tests/
│   └── auth.test.js
├── uploads/
│   └── .gitkeep
├── utils/
│   ├── helpers.js
│   └── jwt.js
├── validators/
│   ├── authValidator.js
│   ├── couponValidator.js
│   ├── orderValidator.js
│   ├── passwordResetValidator.js
│   ├── productValidator.js
│   ├── reviewValidator.js
│   ├── storeValidator.js
│   ├── supportValidator.js          <-- NEW
│   └── userValidator.js
├── .env
├── AI_RULES.md
├── ABSTRACT.md
├── package.json
├── seeder.js
└── server.js
```

### Key Workflows

*   **Product Management (Vendor):** Vendors use `ManageProducts` page to `addVendorProduct`, `editVendorProduct`, `deleteVendorProduct` via `api.vendor` calls. Image uploads are handled by `api.upload` to **Cloudinary**.
*   **Order Placement (Customer):**
    1.  Customer adds items to cart (`addToCart`).
    2.  Proceeds to `Checkout` (multi-step form).
    3.  `ShippingAddressForm` collects address, which is saved to user profile.
    4.  `CouponSection` allows applying discounts via `api.coupon.validate`.
    5.  `OrderSummary` displays final details.
    6.  `RazorpayPaymentForm` initiates payment. Frontend dynamically loads Razorpay SDK.
    7.  Customer completes payment on Razorpay's secure gateway.
    8.  On successful payment, Razorpay callback provides payment details (payment ID, order ID, signature) to the frontend.
    9.  `checkout` function (in `useCart`) calls `api.customer.placeOrder` with all order details, including Razorpay transaction info.
    10. Backend `placeOrder` controller performs:
        *   **Razorpay server-side verification** using `RAZORPAY_KEY_SECRET`.
        *   Stock validation and decrement (within a MongoDB transaction).
        *   Creates `Order` and `Payment` records.
        *   Updates `Coupon` usage.
        *   Generates a `deliveryOtp`.
        *   Sends an order confirmation email.
    11. Customer is redirected to `OrderConfirmation` with order details, OTP, and QR code.
*   **Order Confirmation (Vendor):** Vendors view orders on `Orders` page. On `OrderDetails` page, they can `confirmDeliveryWithOtp` by entering the customer's OTP, which updates the order status to 'Delivered'.
*   **Profile Management:** Users (customer/vendor) can update their profile via `Profile` page, using `api.userProfile.updateProfile` and `api.userProfile.uploadProfileImage` (which uses **Cloudinary**).
*   **Admin Operations:** Admins use dedicated pages (`AdminUserManagement`, `AdminProductManagement`, `AdminStoreManagement`, `AdminOrderManagement`, **`AdminSupportTickets`**) to manage platform data, calling `api.admin` methods.

## Running the Project Locally

To get the BazzarNet application up and running on your local machine, follow these steps:

1.  **Clone the Repository:**
    ```bash
    git clone <repository-url>
    cd bazzarnet
    ```

2.  **Backend Setup:**
    *   Navigate to the `backend/` directory: `cd backend`
    *   Install dependencies: `npm install`
    *   Create a `.env` file in the `backend/` directory and populate it with your MongoDB URI, JWT secret, email service credentials, **Razorpay API keys, and Cloudinary credentials**.
        ```
        NODE_ENV=development
        PORT=5000
        MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/bazzarnet?retryWrites=true&w=majority
        JWT_SECRET=your_jwt_secret_key
        JWT_EXPIRES_IN=1h
        EMAIL_HOST=smtp.ethereal.email # or your SMTP host
        EMAIL_PORT=587 # or your SMTP port (e.g., 465 for SSL)
        EMAIL_USER=your_email@example.com # or ethereal.email user
        EMAIL_PASS=your_email_password # or ethereal.email password
        FRONTEND_URL=http://localhost:5173
        ADMIN_EMAIL=admin@example.com # Email for receiving support requests
        RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID # Your Razorpay Key ID (starts with rzp_test_ or rzp_live_)
        RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET # Your Razorpay Key Secret
        CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
        CLOUDINARY_API_KEY=your_cloudinary_api_key
        CLOUDINARY_API_SECRET=your_cloudinary_api_secret
        ```
        **Remember to replace placeholders with your actual credentials.** For `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`, you can use [Ethereal Email](https://ethereal.email/) for testing during development.
    *   Start the backend development server: `npm run dev`
    *   This will start the Node.js/Express server, usually at `http://localhost:5000`. If the database is empty, it will automatically seed initial data (customers, vendors, products).
    *   **Run Backend Tests:** While in the `backend/` directory, run: `npm test`

3.  **Frontend Setup:**
    *   Navigate back to the project root directory (where the frontend `package.json` is): `cd ..`
    *   Install dependencies: `npm install`
    *   Create a `.env` file in the project root (same level as `package.json`) and add the frontend API base URL and **Razorpay Key ID**:
        ```
        VITE_API_BASE_URL=http://localhost:5000/api
        VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID # Same as backend Razorpay Key ID
        ```
    *   Start the frontend development server: `npm run dev`
    *   This will start the Vite development server, usually at `http://localhost:5173`.
    *   **Run Frontend Tests:** While in the project root directory, run: `npm test`

4.  **Access the Application:**
    *   Open your web browser and navigate to `http://localhost:5173`.

## Development Guidelines

*   **Styling:** Always use Tailwind CSS. Avoid custom CSS files or inline styles unless absolutely necessary.
*   **Components:** Keep components small, focused, and reusable. New components should be created in `src/components/`.
*   **Pages:** New views should be created in `src/pages/`.
*   **State:** Prefer React Context for global state.
*   **Dependencies:** Avoid adding new libraries unless there's a clear and strong justification.
*   **Backend Modularity:** Adhere to the established backend file structure (models, controllers, routes, middleware, services, utils, validators).
*   **Code Reviews:** All code changes should go through a peer review process (e.g., via Pull Requests) to ensure quality, consistency, and knowledge sharing.
*   **Documentation:**
    *   **API Documentation:** Maintain up-to-date API documentation (e.g., using Swagger/OpenAPI) detailing endpoints, parameters, and responses.
    *   **Internal Code Comments:** Use JSDoc for functions, components, and hooks, and add inline comments for complex logic or non-obvious decisions.
    *   **Directory READMEs:** Consider adding brief `README.md` files in key sub-directories to explain their purpose and contents.
=======
# BazzarNet-Local_Ecommerce-Platform
This is a local E-Commerce Platform based on local stores is available in your PIN code
>>>>>>> 938e39ccd08d63abe1bbbf73065f59e371a0f765
