import React from "react";
import Navbar from "../../../components/Layout/public/Navbar";
import Hero from "../../../components/Layout/public/Hero";

const Dashboard = () => {
  return (
    <div>
      <header>
        <Navbar />
      </header>
      <main>
        <Hero />
      </main>
    </div>
  );
};

export default Dashboard;
