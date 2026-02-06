import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const UserLayout = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-[#EBF4F6]">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;
