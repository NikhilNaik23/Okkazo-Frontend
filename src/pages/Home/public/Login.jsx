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
        className="flex min-h-screen w-full bg-[#EBF4F6]"
      >
        {/* Left Side - Image & Branding */}
        <div className="hidden lg:flex w-1/2 relative bg-[#09637E] items-center justify-center overflow-hidden">
          {/* Background Image Overlay with Gradient */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2670&auto=format&fit=crop"
              alt="Event Background"
              className="w-full h-full object-cover opacity-40 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#09637E] via-[#09637E]/40 to-transparent" />
          </div>

          {/* Branding Content */}
          <div className="relative z-10 p-16 text-white max-w-xl">
            <div className="flex items-center gap-3 mb-10">
              {/* Logo */}
              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/20">
                <img src="/public_logo.png" alt="Okkazo" className="h-10 w-auto" />
              </div>
            </div>
            <h1 className="text-6xl font-black mb-8 leading-[1.1] tracking-tight">
              Create moments <br /> that matter.
            </h1>
            <p className="text-xl text-white/80 leading-relaxed mb-12">
              The all-in-one platform for visionary organizers. Manage ticketing, engagement, and analytics in one seamless dashboard.
            </p>

            {/* Trust Badge / Security Note */}
            <div className="bg-white/10 backdrop-blur-xl p-5 rounded-2xl flex items-start gap-4 border border-white/10 shadow-2xl">
              <div className="bg-[#088395] p-2.5 rounded-xl shrink-0 shadow-lg shadow-[#088395]/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="pt-0.5">
                <p className="font-black text-sm uppercase tracking-wider">Industry Leading Security</p>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">Your data and event transactions are protected with enterprise-grade encryption.</p>
              </div>
            </div>

            <p className="absolute bottom-12 left-16 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">© 2026 OKKAZO GLOBAL INC.</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#EBF4F6]">
          <div className="max-w-md w-full">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-4xl font-black text-[#09637E] mb-3 tracking-tight">Welcome Back</h2>
              <p className="text-[#708aa0] font-medium">Enter your details to access your account.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-[#09637E] uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@company.com"
                    required
                    className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-100 focus:border-[#7AB2B2] focus:ring-4 focus:ring-[#7AB2B2]/10 outline-none transition-all pl-12 font-medium text-sm placeholder:text-[#708aa0]"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#708aa0] group-focus-within:text-[#09637E] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-black text-[#09637E] uppercase tracking-widest ml-1">Password</label>
                  <Link to="/forgot-password" shaking className="text-xs font-bold text-[#088395] hover:text-[#09637E] transition-colors">Forgot password?</Link>
                </div>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-5 py-4 rounded-2xl bg-white border border-gray-100 focus:border-[#7AB2B2] focus:ring-4 focus:ring-[#7AB2B2]/10 outline-none transition-all pl-12 pr-12 font-medium text-sm placeholder:text-[#708aa0]"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#708aa0] group-focus-within:text-[#09637E] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#708aa0] hover:text-[#09637E] cursor-pointer"
                  >
                    {showPassword ? <BsEyeSlash size={18} /> : <BsEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-1 group cursor-pointer">
                <input type="checkbox" id="keep-logged-in" className="w-5 h-5 rounded-lg border-gray-300 text-[#09637E] focus:ring-[#09637E]/20 cursor-pointer transition-all" />
                <label htmlFor="keep-logged-in" className="text-sm font-medium text-[#708aa0] group-hover:text-[#09637E] cursor-pointer transition-colors">Keep me logged in</label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-[#09637E] to-[#088395] hover:from-[#088395] hover:to-[#09637E] text-white font-black py-4 rounded-[1.25rem] transition-all duration-300 shadow-xl shadow-[#09637E]/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin text-lg"></div>
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="relative my-10 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <span className="relative bg-[#EBF4F6] px-5 text-[10px] font-black text-[#708aa0] uppercase tracking-[0.2em]">or continue with</span>
            </div>

            <button type="button" className="w-full bg-white border border-gray-100 hover:border-[#7AB2B2]/30 hover:bg-[#7AB2B2]/5 text-[#09637E] font-bold py-4 rounded-[1.25rem] flex items-center justify-center gap-3 transition-all duration-300 shadow-sm">
              <FcGoogle className="text-2xl" />
              Sign in with Google
            </button>

            <div className="mt-10 text-center space-y-2">
              <p className="text-sm font-medium text-[#708aa0]">
                Don't have an account? <Link to="/register" className="text-[#088395] font-black hover:underline underline-offset-4 decoration-2">Create an account</Link>
              </p>
              <p className="text-sm font-medium text-[#708aa0]">
                Didn't receive verification email? <Link to="/resend-verification" className="text-[#09637E] font-black hover:underline underline-offset-4 decoration-2">Resend it</Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </>

  );
};

export default Login;
