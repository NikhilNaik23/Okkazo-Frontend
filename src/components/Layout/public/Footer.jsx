import React, { useState } from "react";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (e, modalType) => {
    e.preventDefault();
    setActiveModal(modalType);
    document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
  };

  const closeModal = () => {
    setActiveModal(null);
    document.body.style.overflow = "unset";
  };

  const modalContent = {
    privacy: {
      title: "Privacy Policy",
      content: (
        <>
          <p className="mb-4"><strong>Effective Date:</strong> January 1, 2026</p>
          <p className="mb-4">At Okkazo, we prioritize your privacy. This Privacy Policy outlines how we collect, use, and protect your personal information.</p>

          <h4 className="font-bold text-lg mb-2 text-[#09637E]">1. Information We Collect</h4>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li><strong>Personal Information:</strong> Name, email address, phone number, and payment details when you register or purchase tickets.</li>
            <li><strong>Usage Data:</strong> Information about how you use our platform, including browser type and access times.</li>
          </ul>

          <h4 className="font-bold text-lg mb-2 text-[#09637E]">2. How We Use Your Information</h4>
          <p className="mb-4">We use your data to:</p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>Process transactions and manage bookings.</li>
            <li>Improve our platform and user experience.</li>
            <li>Send important updates and promotional materials (you can opt-out anytime).</li>
          </ul>

          <h4 className="font-bold text-lg mb-2 text-[#09637E]">3. Data Security</h4>
          <p className="mb-4">We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.</p>

          <h4 className="font-bold text-lg mb-2 text-[#09637E]">4. Contact Us</h4>
          <p>If you have questions about this policy, please contact us at <a href="mailto:privacy@okkazo.com" className="text-blue-500 underline">privacy@okkazo.com</a>.</p>
        </>
      )
    },
    terms: {
      title: "Terms of Service",
      content: (
        <>
          <p className="mb-4"><strong>Effective Date:</strong> January 1, 2026</p>
          <p className="mb-4">Welcome to Okkazo. By accessing our platform, you agree to comply with these Terms of Service.</p>

          <h4 className="font-bold text-lg mb-2 text-[#09637E]">1. Acceptance of Terms</h4>
          <p className="mb-4">By using our services, you agree to be bound by these terms. If you do not agree, strictly do not use our platform.</p>

          <h4 className="font-bold text-lg mb-2 text-[#09637E]">2. User Accounts</h4>
          <p className="mb-4">You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>

          <h4 className="font-bold text-lg mb-2 text-[#09637E]">3. Event Guidelines</h4>
          <p className="mb-4">Organizers must ensure all events comply with local laws and regulations. Okkazo reserves the right to remove non-compliant events.</p>

          <h4 className="font-bold text-lg mb-2 text-[#09637E]">4. Refunds and Cancellations</h4>
          <p className="mb-4">Refund policies are set by individual event organizers. Okkazo is not responsible for refunds unless explicitly stated.</p>

          <h4 className="font-bold text-lg mb-2 text-[#09637E]">5. Limitation of Liability</h4>
          <p>Okkazo is not liable for any indirect, incidental, or consequential damages arising from the use of our services.</p>
        </>
      )
    }
  };

  return (
    <>
      <footer id="public-footer" className="bg-[#09637E] text-white py-10 relative z-30">
        <div className="container mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand/About */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-2">
                <Link to="/">
                  <img src="/public_logo.png" alt="Okkazo-logo" className="h-14 pt-4 w-auto object-contain" />
                </Link>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Empowering event organizers and attendees with seamless management
                tools and unforgettable experiences.
              </p>
              <div className="flex gap-3">
                <a href="https://facebook.com" className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#03A9F4] transition-colors">
                  <FaFacebookF size={14} />
                </a>
                <a href="https://twitter.com" className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#03A9F4] transition-colors">
                  <FaTwitter size={14} />
                </a>
                <a href="https://linkedin.com" className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#03A9F4] transition-colors">
                  <FaLinkedinIn size={14} />
                </a>
                <a href="https://instagram.com" className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#03A9F4] transition-colors">
                  <FaInstagram size={14} />
                </a>
              </div>
            </div>

            {/* Links Columns */}
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="flex flex-col gap-2 text-gray-400 text-sm">
                <li><Link to="/login" className="hover:text-white">Start Planning</Link></li>
                <li><Link to="/register" className="hover:text-white">Register</Link></li>
                <li><Link to="/login" className="hover:text-white">Ticket Support</Link></li>
                <li><Link to="/login" className="hover:text-white">Browse Events</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">For Business</h4>
              <ul className="flex flex-col gap-2 text-gray-400 text-sm">
                <li><Link to="/login" className="hover:text-white">Vendor Portal</Link></li>
                <li><Link to="/login" className="hover:text-white">Event Services</Link></li>
                <li><Link to="/login" className="hover:text-white">Partnerships</Link></li>
                <li><Link to="/login" className="hover:text-white">Enterprise</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="flex flex-col gap-2 text-gray-400 text-sm">
                <li><Link to="#" className="hover:text-white">About Us</Link></li>
                <li><Link to="#" className="hover:text-white">Careers</Link></li>
                <li><Link to="#" className="hover:text-white">Press</Link></li>
                <li><Link to="#" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p className="text-white">© 2026 Okkazo. All rights reserved.</p>
            <div className="flex gap-6 text-gray-400">
              <Link
                to="#"
                onClick={(e) => openModal(e, 'privacy')}
                className="hover:text-white cursor-pointer"
              >
                Privacy Policy
              </Link>
              <Link
                to="#"
                onClick={(e) => openModal(e, 'terms')}
                className="hover:text-white cursor-pointer"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Overlay */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>

          <div className="relative bg-white text-gray-800 w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-3xl shadow-2xl animate-scale-up">
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-8 py-5 border-b border-gray-100 flex justify-between items-center z-10">
              <h3 className="text-2xl font-bold text-[#09637E]">
                {modalContent[activeModal].title}
              </h3>
              <button
                onClick={closeModal}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-[#EBF4F6] text-gray-500 hover:text-[#09637E] flex items-center justify-center transition-colors"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <div className="p-8 text-sm md:text-base leading-relaxed text-gray-600">
              {modalContent[activeModal].content}
            </div>

            <div className="sticky bottom-0 bg-white px-8 py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-[#09637E] text-white rounded-xl hover:bg-[#08556d] transition-colors font-semibold"
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
