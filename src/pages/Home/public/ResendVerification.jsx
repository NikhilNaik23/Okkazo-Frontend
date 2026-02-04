import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { MdEmail } from "react-icons/md";
import { resendVerification, selectIsLoading } from "../../../store/slices/authSlice";

const ResendVerification = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    const result = await dispatch(resendVerification({ email }));

    if (resendVerification.fulfilled.match(result)) {
      setSubmitted(true);
      toast.success("Verification email sent! Check your inbox.");
    } else {
      toast.error(result.payload || "Failed to send verification email");
    }
  };

  return (
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
            Verify your <br /> email address
          </h1>
          <p className="text-xl text-white/80 leading-relaxed mb-12">
            Didn't receive the verification email? We can send you another one in just a few seconds.
          </p>

          <p className="absolute bottom-12 left-16 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">© 2026 OKKAZO GLOBAL INC.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#EBF4F6]">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <div className="flex lg:hidden justify-center mb-8">
            <div className="w-10 h-10 bg-[#09637E] rounded-xl flex items-center justify-center text-white font-bold text-xl">
              O
            </div>
          </div>

          {!submitted ? (
            <>
              <div className="mb-10 text-center lg:text-left">
                <h2 className="text-4xl font-black text-[#09637E] mb-3 tracking-tight">
                  Resend Verification
                </h2>
                <p className="text-[#708aa0] font-medium max-w-sm">
                  Enter your email address and we'll send you a new verification link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#09637E] uppercase tracking-widest ml-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#708aa0] group-focus-within:text-[#09637E] transition-colors" size={20} />
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white border border-gray-100 focus:border-[#7AB2B2] focus:ring-4 focus:ring-[#7AB2B2]/10 outline-none transition-all duration-300 font-medium text-sm placeholder:text-[#708aa0]"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 bg-gradient-to-r from-[#09637E] to-[#088395] hover:from-[#088395] hover:to-[#09637E] text-white font-black py-4 rounded-[1.25rem] transition-all duration-300 shadow-xl shadow-[#09637E]/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : "Send Verification Email"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center animate-[fadeInUp_0.5s_ease-out]">
              <div className="w-24 h-24 bg-gradient-to-br from-[#088395]/20 to-[#09637E]/30 rounded-[2rem] flex items-center justify-center text-[#088395] mx-auto mb-8 shadow-lg shadow-[#088395]/10">
                <MdEmail size={48} />
              </div>
              <h2 className="text-3xl font-black text-[#09637E] mb-4">
                Check Your Email
              </h2>
              <p className="text-[#708aa0] font-medium leading-relaxed mb-8">
                We've sent a verification link to <span className="text-[#09637E] font-bold">{email}</span>.
                Please check your inbox and click the link to verify your email.
              </p>
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white">
                <p className="text-sm text-[#708aa0] font-medium">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-[#09637E] font-black hover:underline underline-offset-4 decoration-2"
                  >
                    try again
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Back to Login Link */}
          <div className="mt-10 text-center">
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 text-[#708aa0] font-bold hover:text-[#09637E] transition-colors"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResendVerification;
