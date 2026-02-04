import React from "react";
import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#09637E] text-white py-10">
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
              <a href="#" className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#03A9F4] transition-colors">
                <FaFacebookF size={14} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#03A9F4] transition-colors">
                <FaTwitter size={14} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#03A9F4] transition-colors">
                <FaLinkedinIn size={14} />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-bold mb-4">Platform</h4>
            <ul className="flex flex-col gap-2 text-gray-400 text-sm">
              <li><Link to="#" className="hover:text-white">Start Planning</Link></li>
              <li><Link to="#" className="hover:text-white">Register</Link></li>
              <li><Link to="#" className="hover:text-white">Ticket Support</Link></li>
              <li><Link to="#" className="hover:text-white">Browse Events</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">For Business</h4>
            <ul className="flex flex-col gap-2 text-gray-400 text-sm">
              <li><Link to="#" className="hover:text-white">Vendor Portal</Link></li>
              <li><Link to="#" className="hover:text-white">Event Services</Link></li>
              <li><Link to="#" className="hover:text-white">Partnerships</Link></li>
              <li><Link to="#" className="hover:text-white">Enterprise</Link></li>
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
          <p>© 2026 Okkazo. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-gray-300">Privacy Policy</Link>
            <Link to="#" className="hover:text-gray-300">Terms of Service</Link>
            <Link to="#" className="hover:text-gray-300">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
