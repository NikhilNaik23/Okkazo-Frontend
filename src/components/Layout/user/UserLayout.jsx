import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const UserLayout = () => {
  const location = useLocation();
  const hideFooterPaths = ['/user/planning-wizard', '/user/promote'];
  const showFooter = !hideFooterPaths.includes(location.pathname);

  return (
    <div className={`flex flex-col min-h-screen bg-[#EBF4F6]`}>
      <Navbar />
      <main className="flex-1 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col min-h-0"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default UserLayout;
