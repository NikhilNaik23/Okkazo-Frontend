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
  ],
  businessDetails: {
    businessName: "Gourmet Catering Co.",
    serviceCategory: "Catering",
    email: "contact@gourmetcatering.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    description: "With over 15 years of experience in the luxury event industry, Gourmet Catering Co. specializes in creating bespoke culinary experiences that resonate. From intimate garden weddings to large-scale corporate galas, our team of world-class chefs and event professionals work tirelessly to ensure every plate tells a story of quality, freshness, and artistry."
  },
  documents: {
    businessLicense: {
      name: "Business_License_GourmetCatering.pdf",
      size: 245678,
      uploadDate: "Oct 15, 2023",
      status: "Verified"
    },
    ownerIdentity: {
      name: "Owner_ID_Document.pdf",
      size: 189234,
      uploadDate: "Oct 15, 2023",
      status: "Verified"
    },
    otherProofs: [
      {
        name: "Food_Safety_Certificate.pdf",
        size: 156789,
        uploadDate: "Oct 15, 2023",
        status: "Verified"
      },
      {
        name: "Insurance_Policy.pdf",
        size: 234567,
        uploadDate: "Oct 15, 2023",
        status: "Verified"
      }
    ]
  }
};
