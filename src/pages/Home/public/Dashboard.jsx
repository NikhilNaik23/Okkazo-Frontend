import React from "react";
import Navbar from "../../../components/Layout/public/Navbar";
import Hero from "../../../components/Layout/public/Hero";
import Features from "../../../components/Layout/public/Features";
import Testimonials from "../../../components/Layout/public/Testimonials";
import TrendingEvents from "../../../components/Layout/public/TrendingEvents";
import Footer from "../../../components/Layout/public/Footer";

const Dashboard = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header>
        <Navbar />
      </header>
      <main className="flex-grow">
        <Hero />
        <Features />
        <Testimonials />
        <TrendingEvents />
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
