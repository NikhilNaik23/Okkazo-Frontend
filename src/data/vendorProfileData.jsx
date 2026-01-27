import React from "react";
import { BsAward, BsCalendarCheck, BsPeople, BsClock } from "react-icons/bs";

export const vendorProfileData = {
  name: "Gourmet Catering Co.",
  rating: "4.9",
  reviews: "124",
  location: "New York, NY",
  about: "With over 15 years of experience in the luxury event industry, Gourmet Catering Co. specializes in creating bespoke culinary experiences that resonate. From intimate garden weddings to large-scale corporate galas, our team of world-class chefs and event professionals work tirelessly to ensure every plate tells a story of quality, freshness, and artistry.",
  stats: [
    { label: "Years Active", value: "15+", icon: <BsAward /> },
    { label: "Events Served", value: "1,200+", icon: <BsCalendarCheck /> },
    { label: "Team Size", value: "45 Pros", icon: <BsPeople /> },
    { label: "Response Time", value: "< 2 hours", icon: <BsClock /> }
  ],
  services: [
    { id: 1, name: "Premium Wedding Package", description: "Full-service 3-course plated dinner with appetizers.", price: "120" },
    { id: 2, name: "Corporate Buffet Experience", description: "International cuisine with live cooking stations.", price: "85" }
  ]
};
