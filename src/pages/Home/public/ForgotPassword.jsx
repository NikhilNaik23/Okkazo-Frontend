import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { MdEmail } from "react-icons/md";
import { forgotPassword, selectIsLoading } from "../../../store/slices/authSlice";

const ForgotPassword = () => {
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

    const result = await dispatch(forgotPassword({ email }));

    if (forgotPassword.fulfilled.match(result)) {
      setSubmitted(true);
      toast.success("Password reset link sent! Check your email.");
    } else {
      toast.error(result.payload || "Failed to send reset link");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="flex min-h-screen w-full bg-linear-to-br from-[#e9eff1] via-white to-[#f3ddb1]/20"
    >
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-[#0b2d49] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2670&auto=format&fit=crop"
            alt="Event Background"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 p-12 text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
              <img src="/public_logo.png" alt="Okkazo" className="h-8 md:h-10 w-auto" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Forgot your <br /> password?
          </h1>
          <p className="text-lg text-gray-200 max-w-md leading-relaxed">
            No worries! Enter your email and we'll send you a link to reset your password.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="bg-[#0b2d49] p-2 rounded-lg">
              <img src="/public_logo.png" alt="Okkazo" className="h-8 w-auto" />
            </div>
          </div>

          {!submitted ? (
            <>
              <h2 className="text-3xl font-bold text-[#0b2d49] mb-2">
                Reset Password
              </h2>
              <p className="text-gray-500 mb-8">
                Enter your email address and we'll send you instructions to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#0b2d49] focus:ring-2 focus:ring-[#0b2d49]/20 outline-none transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0b2d49] text-white py-3 rounded-xl font-semibold hover:bg-[#0a2640] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MdEmail className="text-green-600" size={40} />
              </div>
              <h2 className="text-3xl font-bold text-[#0b2d49] mb-4">
                Check Your Email
              </h2>
              <p className="text-gray-500 mb-6">
                We've sent a password reset link to <strong>{email}</strong>. 
                Please check your inbox and follow the instructions.
              </p>
              <p className="text-sm text-gray-400 mb-8">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-[#0b2d49] hover:underline font-medium"
                >
                  try again
                </button>
              </p>
            </div>
          )}

          {/* Back to Login Link */}
          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="text-[#0b2d49] hover:underline font-medium"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ForgotPassword;
