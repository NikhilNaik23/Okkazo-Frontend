import React from "react";
import { Link } from "react-router";
import { BsEye, BsEyeSlash, BsShop } from "react-icons/bs";
import { RiCloseLine } from "react-icons/ri";

const Modal = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b2d49]/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl relative animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#f8faFC]">
          <h3 className="text-xl font-bold text-[#0b2d49]">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-[#d7a444] transition-colors p-1 rounded-full hover:bg-gray-100">
            <RiCloseLine size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar text-gray-600 leading-relaxed text-sm">
            {content}
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-[#0b2d49] text-white rounded-lg font-semibold hover:bg-[#d7a444] transition-colors">
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

const Register = () => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [activeModal, setActiveModal] = React.useState(null);

    const termsContent = (
        <div className="space-y-4">
            <p><strong>1. Acceptance of Terms</strong><br/>By accessing and using Okkazo, you agree to be bound by these Terms and Conditions.</p>
            <p><strong>2. User Accounts</strong><br/>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
            <p><strong>3. Event Management</strong><br/>Organizers must provide accurate information about events. Okkazo is not responsible for cancellations or disputes between organizers and attendees.</p>
            <p><strong>4. Payments & Refunds</strong><br/>All transactions are processed securely. Refund policies are determined by the individual event organizers.</p>
            <p><strong>5. Termination</strong><br/>We reserve the right to terminate accounts that violate our community guidelines or terms of service.</p>
        </div>
    );

    const privacyContent = (
        <div className="space-y-4">
            <p><strong>1. Information Collection</strong><br/>We collect information you provide directly to us, such as your name, email, and payment details.</p>
            <p><strong>2. Use of Information</strong><br/>We use your info to facilitate event registration, improve our services, and communicate with you.</p>
            <p><strong>3. Data Sharing</strong><br/>We do not sell your personal data. We share data with event organizers for the events you register for.</p>
            <p><strong>4. Security</strong><br/>We employ industry-standard security measures to protect your data.</p>
            <p><strong>5. Your Rights</strong><br/>You have the right to access, correct, or delete your personal information at any time.</p>
        </div>
    );

  return (
    <>
    <div className="flex flex-col min-h-screen w-full bg-linear-to-br from-[#e9eff1] via-[#f3ddb1] to-[#e9eff1] items-center justify-center p-4">
      
      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 w-full max-w-lg mt-20 md:mt-0">
         {/* Header */}
         <div className="text-center mb-8">
             <div className="flex justify-center mb-4">
                <Link to="/" className="flex items-center gap-2">
                    {/* Using simple text or icon if logo not fitting, but user asked for logo. The logo might be best placed outside or small. */}
                    <div className="w-10 h-10 bg-[#0b2d49] rounded-xl flex items-center justify-center text-white font-bold text-xl">O</div>
                    <span className="text-2xl font-bold text-[#0b2d49]">Okkazo</span>
                </Link>
             </div>
             <h2 className="text-3xl font-bold text-[#0b2d49] mb-2">Join Okkazo</h2>
             <p className="text-[#5a5b44]">Start managing or attending world-class events today.</p>
         </div>

         <form className="flex flex-col gap-4">
            <div>
                <label className="block text-sm font-semibold text-[#0b2d49] mb-1">Full Name</label>
                <div className="relative">
                    <input type="text" placeholder="e.g. Alex Rivera" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#d7a444] focus:ring-1 focus:ring-[#d7a444] outline-none transition-all pl-10" />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-[#0b2d49] mb-1">Email Address</label>
                <div className="relative">
                    <input type="email" placeholder="name@company.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#d7a444] focus:ring-1 focus:ring-[#d7a444] outline-none transition-all pl-10" />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-semibold text-[#0b2d49] mb-1">Phone Number</label>
                <div className="relative">
                    <input type="tel" placeholder="+1 (555) 000-0000" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#d7a444] focus:ring-1 focus:ring-[#d7a444] outline-none transition-all pl-10" />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                         </svg>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-[#0b2d49] mb-1">Password</label>
                <div className="relative">
                    <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Min. 8 characters"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#d7a444] focus:ring-1 focus:ring-[#d7a444] outline-none transition-all pl-10" 
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                         </svg>
                    </div>
                     <button 
                         type="button" 
                         onClick={() => setShowPassword(!showPassword)}
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                     >
                       {showPassword ? <BsEyeSlash /> : <BsEye />}
                     </button>
                </div>
            </div>

            <div className="flex items-start gap-2 mt-2">
                <input type="checkbox" id="terms" className="mt-1 rounded border-gray-300 text-[#d7a444] focus:ring-[#d7a444]" />
                <label htmlFor="terms" className="text-sm text-gray-500">I agree to the <button type="button" onClick={() => setActiveModal('terms')} className="font-semibold text-[#d7a444] hover:underline cursor-pointer">Terms & Conditions</button> and <button type="button" onClick={() => setActiveModal('privacy')} className="font-semibold text-[#d7a444] hover:underline cursor-pointer">Privacy Policy</button>.</label>
            </div>

            <button type="submit" className="w-full bg-[#0b2d49] hover:bg-[#d7a444] text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-900/10 mt-2 cursor-pointer">
                Create Account
            </button>
         </form>

         <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
            </div>
            <span className="relative bg-white px-4 text-xs text-gray-400 uppercase tracking-widest">OR</span>
         </div>

         <button type="button" className="w-full border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-[#0b2d49] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer">
            <BsShop className="text-lg" />
            Register as Vendor
         </button>
         
         <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-[#d7a444] font-bold hover:underline">Log In</Link>
         </p>

      </div>
      
       <div className="mt-8 text-[10px] text-gray-400">
        © 2026 OKKAZO GLOBAL INC.
       </div>

    </div>

    {/* Modals */}
    <Modal 
        isOpen={activeModal === 'terms'} 
        onClose={() => setActiveModal(null)} 
        title="Terms and Conditions" 
        content={termsContent} 
    />
    <Modal 
        isOpen={activeModal === 'privacy'} 
        onClose={() => setActiveModal(null)} 
        title="Privacy Policy" 
        content={privacyContent} 
    />
    </>
  );
};

export default Register;
