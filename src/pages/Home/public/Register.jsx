import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BsEye, BsEyeSlash, BsShop } from "react-icons/bs";
import { RiCloseLine } from "react-icons/ri";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { registerUser, clearError, clearRegisterSuccess, selectIsLoading, selectError, selectRegisterSuccess, selectRegisterMessage } from "../../../store/slices/authSlice";

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
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const isLoading = useSelector(selectIsLoading);
    const error = useSelector(selectError);
    const registerSuccess = useSelector(selectRegisterSuccess);
    const registerMessage = useSelector(selectRegisterMessage);
    
    const [showPassword, setShowPassword] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    // Redirect to login after successful registration
    useEffect(() => {
        if (registerSuccess) {
            toast.success(registerMessage || "Registration successful! Redirecting to login...");
            const timer = setTimeout(() => {
                dispatch(clearRegisterSuccess());
                navigate("/login");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [registerSuccess, registerMessage, navigate, dispatch]);

    // Show error toast when Redux error changes
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            dispatch(clearError());
            dispatch(clearRegisterSuccess());
        };
    }, [dispatch]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) dispatch(clearError());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!agreedToTerms) {
            toast.error("Please agree to the Terms & Conditions and Privacy Policy.");
            return;
        }

        if (formData.password.length < 8) {
            toast.error("Password must be at least 8 characters long.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        dispatch(registerUser({
            username: formData.username,
            email: formData.email,
            password: formData.password,
        }));
    };

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
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="flex min-h-screen w-full bg-linear-to-bl from-[#e9eff1] via-white to-[#f3ddb1]/20"
    >
      
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-linear-to-bl from-[#e9eff1]/50 via-white to-[#f3ddb1]/20">
         <div className="max-w-md w-full">
            {/* Mobile Logo Only */}
            <div className="lg:hidden flex justify-center mb-6">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-[#0b2d49] rounded-xl flex items-center justify-center text-white font-bold text-xl">O</div>
                </Link>
            </div>

            <h2 className="text-3xl font-bold text-[#0b2d49] mb-2">Join Okkazo</h2>
            <p className="text-gray-500 mb-6">Start managing or attending world-class events today.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-semibold text-[#0b2d49] mb-1">Username</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder="e.g. alex_rivera" 
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#d7a444] focus:ring-1 focus:ring-[#d7a444] outline-none transition-all pl-10" 
                        />
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
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="name@company.com" 
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#d7a444] focus:ring-1 focus:ring-[#d7a444] outline-none transition-all pl-10" 
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-[#0b2d49] mb-1">Password</label>
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Min. 8 characters"
                            required
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

                <div>
                    <label className="block text-sm font-semibold text-[#0b2d49] mb-1">Confirm Password</label>
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Re-enter your password"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#d7a444] focus:ring-1 focus:ring-[#d7a444] outline-none transition-all pl-10" 
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-2 mt-2">
                    <input 
                        type="checkbox" 
                        id="terms" 
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-[#d7a444] focus:ring-[#d7a444]" 
                    />
                    <label htmlFor="terms" className="text-sm text-gray-500">I agree to the <button type="button" onClick={() => setActiveModal('terms')} className="font-semibold text-[#d7a444] hover:underline cursor-pointer">Terms & Conditions</button> and <button type="button" onClick={() => setActiveModal('privacy')} className="font-semibold text-[#d7a444] hover:underline cursor-pointer">Privacy Policy</button>.</label>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-[#0b2d49] hover:bg-[#d7a444] text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-900/10 mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Creating Account...
                        </>
                    ) : (
                        "Create Account"
                    )}
                </button>
            </form>

            <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <span className="relative bg-white px-4 text-xs text-gray-400 uppercase tracking-widest">OR</span>
            </div>

            <button type="button" className="w-full border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-[#0b2d49] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer">
                <BsShop className="text-lg" />
                Register as Vendor
            </button>
            
            <p className="mt-6 text-center text-sm text-gray-500">
                Already have an account? <Link to="/login" className="text-[#d7a444] font-bold hover:underline">Log In</Link>
            </p>
         </div>
      </div>

      {/* Right Side - Image & Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-[#0b2d49] items-center justify-center overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0 opacity-40">
           <img 
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2670&auto=format&fit=crop" 
            alt="Event Background" 
            className="w-full h-full object-cover"
           />
        </div>
        
        {/* Branding Content */}
        <div className="relative z-10 p-12 text-white text-right"> 
          <div className="flex items-center gap-3 mb-6 justify-end">
             {/* Logo */}
             <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                <img src="/public_logo.png" alt="Okkazo" className="h-8 md:h-10 w-auto" />
             </div>
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Join the future of <br /> event management.
          </h1>
          <p className="text-lg text-gray-200 max-w-md leading-relaxed ml-auto">
            Experience seamless ticketing, real-time analytics, and unparalleled engagement tools designed for the modern organizer.
          </p>

          {/* Testimonial or Tagline */}
          <div className="mt-12 ml-auto bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/10 max-w-sm text-left">
             <p className="text-lg italic font-light mb-4">"Okkazo transformed how we handle our annual tech summit. It's simply brilliant."</p>
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                     <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" alt="User" className="w-full h-full object-cover"/>
                </div>
                <div>
                    <p className="font-bold text-sm">Sarah Jenkins</p>
                    <p className="text-xs text-xs text-[#d7a444]">Event Director, TechFlow</p>
                </div>
             </div>
          </div>
          
          <p className="absolute bottom-8 right-12 text-xs text-gray-400">© 2026 OKKAZO GLOBAL INC.</p>
        </div>
      </div>

    </motion.div>

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
