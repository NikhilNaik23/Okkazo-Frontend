import React, { useState } from "react";
import { Link } from "react-router";
import { BsX } from "react-icons/bs";

const Footer = () => {
  const [activeModal, setActiveModal] = useState(null);

  const toggleModal = (modalName) => {
    setActiveModal(modalName);
  };

  const closeModal = (e) => {
    if (e.target.id === "modal-overlay") {
      setActiveModal(null);
    }
  };

  const modalContent = {
    help: {
      title: "Help Center",
      body: (
        <div className="space-y-4">
          <p>Welcome to the Okkazo Help Center. How can we assist you today?</p>
          <ul className="list-disc list-inside space-y-2">
             <li><strong>Account Issues:</strong> Reset password, update profile.</li>
             <li><strong>Ticketing:</strong> Where to find your tickets, refund policy.</li>
             <li><strong>Event Creation:</strong> Guide for organizers.</li>
          </ul>
          <p>Contact support at <a href="mailto:support@okkazo.com" className="text-[#d7a444] hover:underline">support@okkazo.com</a> for urgent inquiries.</p>
        </div>
      )
    },
    privacy: {
      title: "Privacy Policy",
      body: (
        <div className="space-y-4">
          <p>At Okkazo, we value your privacy. This policy outlines how we collect, use, and protect your data.</p>
          <h4 className="font-bold text-[#0b2d49]">1. Information Collection</h4>
          <p>We collect user account info and analytics data to improve your experience.</p>
          <h4 className="font-bold text-[#0b2d49]">2. Data Usage</h4>
          <p>Your data is used to personalize event recommendations and process secure payments.</p>
        </div>
      )
    },
    terms: {
      title: "Terms of Service",
      body: (
        <div className="space-y-4">
          <p>By using Okkazo, you agree to the following terms.</p>
          <h4 className="font-bold text-[#0b2d49]">1. User Conduct</h4>
          <p>Respectful behavior is required at all times. Harassment will result in account bans.</p>
          <h4 className="font-bold text-[#0b2d49]">2. Ticket Sales</h4>
          <p>All ticket sales are final unless an event is cancelled by the organizer.</p>
        </div>
      )
    }
  };

  return (
    <>
      <footer className="bg-[#0b2d49] text-white py-8 mt-auto border-t border-[#1c3f5e]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">© 2024 Okkazo. All rights reserved.</p>
          
          <div className="flex gap-6 text-sm font-medium text-gray-300">
              <button onClick={() => toggleModal('help')} className="hover:text-[#d7a444] transition-colors cursor-pointer">Help Center</button>
              <button onClick={() => toggleModal('privacy')} className="hover:text-[#d7a444] transition-colors cursor-pointer">Privacy Policy</button>
              <button onClick={() => toggleModal('terms')} className="hover:text-[#d7a444] transition-colors cursor-pointer">Terms of Service</button>
          </div>
        </div>
      </footer>

      {/* Modal Overlay */}
      {activeModal && (
        <div 
          id="modal-overlay"
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={closeModal}
        >
          <div className="bg-white text-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#0b2d49] p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">{modalContent[activeModal].title}</h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="text-gray-300 hover:text-white hover:bg-white/10 p-1 rounded-full transition-all"
              >
                <BsX size={24} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 text-sm leading-relaxed text-gray-600">
               {modalContent[activeModal].body}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 flex justify-end">
              <button 
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-[#d7a444] hover:bg-[#d0a862] text-[#0b2d49] font-bold rounded-lg text-sm transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
