import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingBag, faStore, faCartPlus, faTruck, faUser, faQuoteLeft, faArrowRight, faTags, faCheckCircle, faLock } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation } from 'framer-motion'; // Import useAnimation
import Loader from '../components/Loader';
import LoginButton from '../components/LoginButton';

const LandingPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const glitchControls = useAnimation(); // Initialize controls for glitch animation

  useEffect(() => {
    const loaderTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(loaderTimer);
  }, []);

  // Effect to start glitch animation after initial load
  useEffect(() => {
    if (!isLoading) {
      const glitchStartDelay = 0.5; // Delay glitch start slightly after loader disappears
      const timer = setTimeout(() => {
        glitchControls.start("glitch");
      }, (2000 + glitchStartDelay * 1000)); // Total delay: loader duration + glitchStartDelay
      return () => clearTimeout(timer);
    }
  }, [isLoading, glitchControls]); // Depend on isLoading and glitchControls

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const textContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.5,
      },
    },
  };

  const textChildVariants = {
    hidden: { opacity: 0, y: 50, rotateX: 90, transformOrigin: 'bottom center' },
    visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  // Glitch animation variants
  const glitchVariants = {
    initial: {
      x: 0,
      textShadow: "0px 0px 0px rgba(255,0,0,0), 0px 0px 0px rgba(0,0,255,0)",
      filter: "hue-rotate(0deg)",
    },
    glitch: {
      x: [0, -1, 1, 0], // Smaller horizontal shifts
      textShadow: [
        "0.5px 0px 0px rgba(255,0,0,0.2), -0.5px 0px 0px rgba(0,0,255,0.2)", // Subtle shift 1
        "-0.5px 0px 0px rgba(255,0,0,0.2), 0.5px 0px 0px rgba(0,0,255,0.2)", // Subtle shift 2
        "0px 0px 0px rgba(255,0,0,0), 0px 0px 0px rgba(0,0,255,0)",     // Reset
      ],
      filter: [
        "hue-rotate(0deg)",
        "hue-rotate(3deg)", // Smaller hue rotation
        "hue-rotate(0deg)",
        "hue-rotate(-3deg)",
        "hue-rotate(0deg)",
      ],
      transition: {
        x: {
          duration: 0.08, // Slightly slower shifts
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        },
        textShadow: {
          duration: 0.08, // Slightly slower shifts
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        },
        filter: {
          duration: 0.08, // Slightly slower shifts
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        },
      },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <Loader key="loader" />
      ) : (
        <motion.section
          key="landing-content"
          className="w-full max-w-[1200px] mx-auto my-10 relative overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Hero Section */}
          <motion.div
            className="text-center py-20 px-5 text-[var(--text)] rounded-2xl md:py-24 md:px-10 relative z-10"
            variants={textContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              className=" font-black leading-tight md:leading-snug mb-4 tracking-tight break-words"
            >
              <motion.span variants={textChildVariants} className="inline-block text-5xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-9xl font-black">Shop Locally, Delivered Fast⌯⌲ </motion.span>
              <motion.span
                variants={textChildVariants}
                className="inline-block ml-2  px-2 py-1 bg-[var(--accent)] text-white rounded-md shadow-md text-[1.8em] font-black"
              >
               
              </motion.span>
            </motion.h1>
            <motion.p className="text-s sm:text-lg md:text-xl lg:text-xl xl:text-2xl font-medium mb-5" variants={textChildVariants}>
              Support your favorite local stores with quick doorstep delivery.
            </motion.p>
          </motion.div>

          {/* How It Works Section */}
          <div className="container mx-auto px-5 py-20 relative z-10">
            <h2 className="text-3xl font-bold mb-10 md:text-4xl text-center">How It Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
              <motion.div
                className="bg-[var(--card-bg)] backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-[0_8px_40px_var(--shadow)] hover:-translate-y-1 transition-transform duration-300 flex flex-col items-center text-center"
                variants={cardVariants}
                whileInView="visible"
                initial="hidden"
                viewport={{ once: true, amount: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="mb-4"
                >
                  <FontAwesomeIcon icon={faStore} className="text-5xl text-[var(--accent)]" />
                </motion.div>
                <h3 className="text-2xl font-bold text-[var(--accent)] mb-2">Browse Stores</h3>
                <p className="text-[var(--text)] text-lg">Discover local shops and their products.</p>
              </motion.div>
              <motion.div
                className="bg-[var(--card-bg)] backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-[0_8px_40px_var(--shadow)] hover:-translate-y-1 transition-transform duration-300 flex flex-col items-center text-center"
                variants={cardVariants}
                whileInView="visible"
                initial="hidden"
                viewport={{ once: true, amount: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="mb-4"
                >
                  <FontAwesomeIcon icon={faCartPlus} className="text-5xl text-[var(--accent)]" />
                </motion.div>
                <h3 className="text-2xl font-bold text-[var(--accent)] mb-2">Add to Cart</h3>
                <p className="text-[var(--text)] text-lg">Select items and place your order easily.</p>
              </motion.div>
              <motion.div
                className="bg-[var(--card-bg)] backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-[0_8px_40px_var(--shadow)] hover:-translate-y-1 transition-transform duration-300 flex flex-col items-center text-center"
                variants={cardVariants}
                whileInView="visible"
                initial="hidden"
                viewport={{ once: true, amount: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="mb-4"
                >
                  <FontAwesomeIcon icon={faTruck} className="text-5xl text-[var(--accent)]" />
                </motion.div>
                <h3 className="text-2xl font-bold text-[var(--accent)] mb-2">Fast Delivery</h3>
                <p className="text-[var(--text)] text-lg">Get your order delivered in under an hour.</p>
              </motion.div>
              <motion.div
                className="bg-[var(--card-bg)] backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-[0_8px_40px_var(--shadow)] hover:-translate-y-1 transition-transform duration-300 flex flex-col items-center text-center"
                variants={cardVariants}
                whileInView="visible"
                initial="hidden"
                viewport={{ once: true, amount: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="mb-4"
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="text-5xl text-[var(--accent)]" />
                </motion.div>
                <h3 className="text-2xl font-bold text-[var(--accent)] mb-2">Enjoy & Review</h3>
                <p className="text-[var(--text)] text-lg">Receive your order and share your feedback.</p>
              </motion.div>
            </div>
          </div>

          {/* Why BazzarNet Section */}
          <div className="container mx-auto px-5 py-20 relative z-10">
            <h2 className="text-3xl font-bold mb-10 md:text-4xl text-center">Why BazzarNet?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
              <motion.div
                className="bg-[var(--card-bg)] backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-[0_8px_40px_var(--shadow)] hover:-translate-y-1 transition-transform duration-300 flex flex-col items-center text-center"
                variants={cardVariants}
                whileInView="visible"
                initial="hidden"
                viewport={{ once: true, amount: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="mb-4"
                >
                  <FontAwesomeIcon icon={faStore} className="text-5xl text-[var(--accent)]" />
                </motion.div>
                <h3 className="text-2xl font-bold text-[var(--accent)] mb-2">Digitize Your Store</h3>
                <p className="text-[var(--text)] text-lg">Bring your local store online with ease.</p>
              </motion.div>
              <motion.div
                className="bg-[var(--card-bg)] backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-[0_8px_40px_var(--shadow)] hover:-translate-y-1 transition-transform duration-300 flex flex-col items-center text-center"
                variants={cardVariants}
                whileInView="visible"
                initial="hidden"
                viewport={{ once: true, amount: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="mb-4"
                >
                  <FontAwesomeIcon icon={faTruck} className="text-5xl text-[var(--accent)]" />
                </motion.div>
                <h3 className="text-2xl font-bold text-[var(--accent)] mb-2">Fast Local Delivery</h3>
                <p className="text-[var(--text)] text-lg">Get your goods delivered quickly.</p>
              </motion.div>
              <motion.div
                className="bg-[var(--card-bg)] backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-[0_8px_40px_var(--shadow)] hover:-translate-y-1 transition-transform duration-300"
                variants={cardVariants}
                whileInView="visible"
                initial="hidden"
                viewport={{ once: true, amount: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="mb-4"
                >
                  <FontAwesomeIcon icon={faUser} className="text-5xl text-[var(--accent)]" />
                </motion.div>
                <h3 className="text-2xl font-bold text-[var(--accent)] mb-2">Trusted & Secure</h3>
                <p className="text-[var(--text)] text-lg">Shop with confidence and security.</p>
              </motion.div>
              <motion.div
                className="bg-[var(--card-bg)] backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-[0_8px_40px_var(--shadow)] hover:-translate-y-1 transition-transform duration-300"
                variants={cardVariants}
                whileInView="visible"
                initial="hidden"
                viewport={{ once: true, amount: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="mb-4"
                >
                  <FontAwesomeIcon icon={faTags} className="text-5xl text-[var(--accent)]" />
                </motion.div>
                <h3 className="text-2xl font-bold text-[var(--accent)] mb-2">Exclusive Deals</h3>
                <p className="text-[var(--text)] text-lg">Access special offers and discounts.</p>
              </motion.div>
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="container mx-auto px-5 py-20 relative z-10">
            <h2 className="text-3xl font-bold mb-10 md:text-4xl text-center">What Our Customers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                className="bg-[var(--card-bg)] backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-[0_8px_40px_var(--shadow)] hover:-translate-y-1 transition-transform duration-300"
                variants={cardVariants}
                whileInView="visible"
                initial="hidden"
                viewport={{ once: true, amount: 0.5 }}
              >
                <FontAwesomeIcon icon={faQuoteLeft} className="text-4xl text-[var(--accent)] mb-4" />
                <p className="text-[var(--text)] text-lg mb-4">"BazzarNet has revolutionized my local shopping! Fresh groceries delivered right to my door in minutes. Highly recommend!"</p>
                <p className="font-semibold text-lg">- Priya Sharma</p>
                <p className="text-sm opacity-80">Loyal Customer</p>
              </motion.div>
              <motion.div
                className="bg-[var(--card-bg)] backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-[0_8px_40px_var(--shadow)] hover:-translate-y-1 transition-transform duration-300"
                variants={cardVariants}
                whileInView="visible"
                initial="hidden"
                viewport={{ once: true, amount: 0.5 }}
              >
                <FontAwesomeIcon icon={faQuoteLeft} className="text-4xl text-[var(--accent)] mb-4" />
                <p className="text-[var(--text)] text-lg mb-4">"As a small business owner, BazzarNet helped me reach more customers than ever before. The platform is easy to use and the support is fantastic!"</p>
                <p className="font-semibold text-lg">- Rajesh Kumar</p>
                <p className="text-sm opacity-80">Owner, TechGadget Hub</p>
              </motion.div>
            </div>
          </div>

          {/* Call to Action Section */}
          <motion.div
            className="bg-black/10 text-white rounded-3xl p-20 text-center mx-4 shadow-[0_8px_40px_var(--shadow)] relative z-10"
            variants={cardVariants}
            whileInView="visible"
            initial="hidden"
            viewport={{ once: true, amount: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Join the BazzarNet Community!</h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90">Whether you're a customer looking for convenience or a business ready to grow, BazzarNet is for you.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <LoginButton
                className="w-full sm:flex-1 py-3 px-8 rounded-full font-bold text-lg flex items-center justify-center"
              />
              <Link
                to="/products"
                className="bg-transparent border-2 border-white text-white py-3 px-8 rounded-full font-bold text-lg hover:bg-white/20 transition-colors duration-300 shadow-lg flex items-center justify-center gap-2 w-full sm:flex-1"
                aria-label="Explore products"
              >
                Explore Products <FontAwesomeIcon icon={faShoppingBag} />
              </Link>
            </div>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default LandingPage;