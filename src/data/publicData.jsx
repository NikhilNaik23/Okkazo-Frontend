import React from "react";
import { BsMegaphone, BsTicketPerforated, BsFileEarmarkText, BsPersonCheck, BsPatchCheckFill } from "react-icons/bs";
import { MdEventNote, MdPlace } from "react-icons/md";

export const features = [
  {
    icon: <MdEventNote className="text-white text-2xl" />,
    title: "Event Organizing",
    description:
      "Streamline logistics with our smart planning wizard. Manage schedules, guests, and venues effortlessly.",
    bg: "bg-[#5a5b44]", 
  },
  {
    icon: <BsMegaphone className="text-white text-2xl" />,
    title: "Marketing & Promotion",
    description:
      "Reach thousands of potential attendees with built-in email tools, social integration, and targeted ads.",
    bg: "bg-[#d7a444]",
  },
  {
    icon: <BsTicketPerforated className="text-white text-2xl" />,
    title: "Ticket Management",
    description:
      "Secure digital ticketing with QR validation. Track real-time sales and revenue directly from your dashboard.",
    bg: "bg-[#0b2d49]", 
  },
];

export const benefits = [
  {
    icon: <BsFileEarmarkText className="text-xl text-white" />,
    title: "5% Service Fee Transparency",
    description:
      "No hidden costs. Keep more of your revenue with our industry-leading flat fee model.",
  },
  {
    icon: <BsPersonCheck className="text-xl text-white" />,
    title: "Expert Event Managers",
    description:
      "Access dedicated support and on-site experts to ensure your high-stakes events run perfectly.",
  },
  {
    icon: <BsPatchCheckFill className="text-xl text-white" />,
    title: "Seamless Vendor Negotiations",
    description:
      "Connect with pre-vetted vendors and manage contracts and payments within the app.",
  },
];

export const trendingEvents = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1459749411177-0473ef71607b?q=80&w=2670&auto=format&fit=crop",
    date: { month: "NOV", day: "18" },
    tag: "CONCERT",
    title: "Groove Music Festival",
    location: "Central Park, NY",
    price: "$45.00",
    tagColor: "text-[#d7a444]",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2670&auto=format&fit=crop",
    date: { month: "DEC", day: "05" },
    tag: "CONFERENCE",
    title: "Future Tech Summit 2024",
    location: "Convention Center, NV",
    price: "$120.00",
    tagColor: "text-[#0b2d49]",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1545989253-02cc26577f8d?q=80&w=2670&auto=format&fit=crop",
    date: { month: "JAN", day: "12" },
    tag: "WORKSHOP",
    title: "Modern Art Showcase",
    location: "The Glass Gallery",
    price: "Free",
    tagColor: "text-[#5a5b44]",
  },
];

export const testimonial = {
  name: "Sarah Jenkins",
  role: "Festival Director",
  avatar: "https://i.pravatar.cc/150?u=sarah",
  quote: "Switching to this platform was the best decision we made for Groove Music. The ticket management is flawless and our vendors love the streamlined portal.",
  rating: 5
};
