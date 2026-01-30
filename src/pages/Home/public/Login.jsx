import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FcGoogle } from "react-icons/fc";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { loginUser, fetchCurrentUser, clearError, selectIsLoading, selectError, selectIsAuthenticated, selectUserRole } from "../../../store/slices/authSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Redirect after successful login and user data is fetched
  useEffect(() => {
    if (isAuthenticated && userRole) {
      if (userRole === 'ADMIN') {
        navigate("/admin");
      } else {
        navigate("/user/dashboard");
      }
    }
  }, [isAuthenticated, userRole, navigate]);

  // Show error toast when Redux error changes
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

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

    const result = await dispatch(loginUser({
      email: formData.email,
      password: formData.password,
    }));

    // If login was successful, fetch user data to get role
    if (loginUser.fulfilled.match(result)) {
      dispatch(fetchCurrentUser());
    }
  };

  return (
    <>
    <motion.div 
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="flex min-h-screen w-full bg-linear-to-br from-[#e9eff1] via-white to-[#f3ddb1]/20"
    >
      {/* Left Side - Image & Branding */}
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
        <div className="relative z-10 p-12 text-white">
          <div className="flex items-center gap-3 mb-6">
             {/* Logo */}
             <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                <img src="/public_logo.png" alt="Okkazo" className="h-8 md:h-10 w-auto" />
             </div>
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Create moments that <br /> matter.
          </h1>
          <p className="text-lg text-gray-200 max-w-md leading-relaxed">
            The all-in-one platform for visionary organizers. Manage ticketing, engagement, and analytics in one seamless dashboard.
          </p>

          {/* Trust Badge / Security Note */}
          <div className="mt-12 bg-white/10 backdrop-blur-md p-4 rounded-xl flex items-start gap-4 border border-white/10 max-w-sm">
            <div className="bg-[#d7a444] p-2 rounded-full shrink-0">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
               </svg>
            </div>
            <div>
                <p className="font-bold text-sm">Industry Leading Security</p>
                <p className="text-xs text-gray-300 mt-1">Your data and event transactions are protected with enterprise-grade encryption.</p>
            </div>
          </div>
          
          <p className="absolute bottom-8 left-12 text-xs text-gray-400">© 2026 OKKAZO GLOBAL INC.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-linear-to-br from-[#e9eff1]/50 via-white to-[#f3ddb1]/20">
        <div className="max-w-md w-full">
          <h2 className="text-3xl font-bold text-[#0b2d49] mb-2">Welcome Back</h2>
          <p className="text-gray-500 mb-8">Enter your details to access your account.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold text-[#0b2d49] mb-2">Email Address</label>
              <div className="relative">
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@company.com"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#d7a444] focus:ring-1 focus:ring-[#d7a444] outline-none transition-all pl-10"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-[#0b2d49]">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-[#d7a444] hover:text-[#0b2d49]">Forgot password?</Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#d7a444] focus:ring-1 focus:ring-[#d7a444] outline-none transition-all pl-10"
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

            <div className="flex items-center gap-2">
                <input type="checkbox" id="keep-logged-in" className="rounded border-gray-300 text-[#d7a444] focus:ring-[#d7a444]" />
                <label htmlFor="keep-logged-in" className="text-sm text-gray-600">Keep me logged in</label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#0b2d49] hover:bg-[#d7a444] text-white font-bold py-3 rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
            </button>
          </form>

          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
            </div>
            <span className="relative bg-white px-4 text-xs text-gray-400 uppercase tracking-widest">or continue with</span>
          </div>
          
          <button type="button" className="w-full border border-gray-300 hover:bg-gray-50 bg-white text-gray-700 font-semibold py-3 rounded-lg flex items-center justify-center gap-3 transition-colors">
            <FcGoogle className="text-xl" />
            Sign in with Google
          </button>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account? <Link to="/register" className="text-[#d7a444] font-bold hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </motion.div>
    </>
  );
};

export default Login;
