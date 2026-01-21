import React from "react";
import { BsMegaphone, BsTicketPerforated } from "react-icons/bs";
import { MdEventNote } from "react-icons/md";

const features = [
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

const Features = () => {
  return (
    <section className="py-20 bg-white flex justify-center">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0b2d49] mb-4">
            Powerful Tools for Every Occasion
          </h2>
          <p className="text-gray-500 text-lg">
            Everything you need to host successful events from scratch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[#f8f9fa] rounded-3xl p-8 transition-transform hover:-translate-y-2 duration-300"
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 shadow-md ${feature.bg}`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-[#0b2d49] mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
