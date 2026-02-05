import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../../../components/Layout/public/Navbar";
import Hero from "../../../components/Layout/public/Hero";
import Features from "../../../components/Layout/public/Features";
import Testimonials from "../../../components/Layout/public/Testimonials";
import EventLifecycle from "../../../components/Layout/public/EventLifecycle";
import TrendingEvents from "../../../components/Layout/public/TrendingEvents";
import Footer from "../../../components/Layout/public/Footer";

const Dashboard = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  return (
    <div className="flex flex-col min-h-screen select-none">
      <header>
        <Navbar />
      </header>
      <main className="flex-grow">
        <Hero />
        <EventLifecycle />
        <Features />
        <Testimonials />
        <TrendingEvents />
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
