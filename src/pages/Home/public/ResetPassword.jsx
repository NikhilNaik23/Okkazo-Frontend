import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { BsEye, BsEyeSlash, BsCheckCircle } from "react-icons/bs";
import { MdLock } from "react-icons/md";
import { resetPassword, selectIsLoading } from "../../../store/slices/authSlice";
import {
  getPasswordValidationState,
  isStrongPassword,
  PASSWORD_PATTERN,
  PASSWORD_REQUIREMENTS_MESSAGE,
} from "../../../utils/passwordValidation";

const ResetPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const isLoading = useSelector(selectIsLoading);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const token = searchParams.get("token");
  const passwordChecks = getPasswordValidationState(formData.newPassword);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token");
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isStrongPassword(formData.newPassword)) {
      toast.error(PASSWORD_REQUIREMENTS_MESSAGE);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const result = await dispatch(
      resetPassword({
        token,
        newPassword: formData.newPassword,
      })
    );

    if (resetPassword.fulfilled.match(result)) {
      setSuccess(true);
      toast.success("Password reset successfully!");
    } else {
      toast.error(result.payload || "Failed to reset password");
    }
  };

  if (!token) {
    return null;
  }

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
            Set your new <br /> password
          </h1>
          <p className="text-lg text-gray-200 max-w-md leading-relaxed">
            Choose a strong password to keep your account secure.
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

          {!success ? (
            <>
              <h2 className="text-3xl font-bold text-[#0b2d49] mb-2">
                Create New Password
              </h2>
              <p className="text-gray-500 mb-8">
                {PASSWORD_REQUIREMENTS_MESSAGE}
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Enter new password"
                      pattern={PASSWORD_PATTERN}
                      title={PASSWORD_REQUIREMENTS_MESSAGE}
                      minLength={8}
                      className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:border-[#0b2d49] focus:ring-2 focus:ring-[#0b2d49]/20 outline-none transition-all duration-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <BsEyeSlash size={20} /> : <BsEye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm new password"
                      pattern={PASSWORD_PATTERN}
                      title={PASSWORD_REQUIREMENTS_MESSAGE}
                      minLength={8}
                      className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:border-[#0b2d49] focus:ring-2 focus:ring-[#0b2d49]/20 outline-none transition-all duration-200"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <BsEyeSlash size={20} /> : <BsEye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="text-sm text-gray-500">
                  <p className="mb-2">Password must:</p>
                  <ul className="space-y-1">
                    <li className={`flex items-center gap-2 ${passwordChecks.minLength ? 'text-green-600' : ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${passwordChecks.minLength ? 'bg-green-600' : 'bg-gray-300'}`}></span>
                      Be at least 8 characters long
                    </li>
                    <li className={`flex items-center gap-2 ${passwordChecks.hasUppercase ? 'text-green-600' : ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${passwordChecks.hasUppercase ? 'bg-green-600' : 'bg-gray-300'}`}></span>
                      Include at least 1 uppercase letter
                    </li>
                    <li className={`flex items-center gap-2 ${passwordChecks.hasLetter ? 'text-green-600' : ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${passwordChecks.hasLetter ? 'bg-green-600' : 'bg-gray-300'}`}></span>
                      Include letters
                    </li>
                    <li className={`flex items-center gap-2 ${passwordChecks.hasNumber ? 'text-green-600' : ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${passwordChecks.hasNumber ? 'bg-green-600' : 'bg-gray-300'}`}></span>
                      Include numbers
                    </li>
                    <li className={`flex items-center gap-2 ${passwordChecks.hasSpecial ? 'text-green-600' : ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${passwordChecks.hasSpecial ? 'bg-green-600' : 'bg-gray-300'}`}></span>
                      Include special characters
                    </li>
                    <li className={`flex items-center gap-2 ${formData.newPassword === formData.confirmPassword && formData.confirmPassword ? 'text-green-600' : ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${formData.newPassword === formData.confirmPassword && formData.confirmPassword ? 'bg-green-600' : 'bg-gray-300'}`}></span>
                      Passwords match
                    </li>
                  </ul>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0b2d49] text-white py-3 rounded-xl font-semibold hover:bg-[#0a2640] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BsCheckCircle className="text-green-600" size={40} />
              </div>
              <h2 className="text-3xl font-bold text-[#0b2d49] mb-4">
                Password Reset!
              </h2>
              <p className="text-gray-500 mb-8">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
              <Link
                to="/login"
                className="inline-block w-full bg-[#0b2d49] text-white py-3 rounded-xl font-semibold hover:bg-[#0a2640] transition-colors duration-200 text-center"
              >
                Go to Login
              </Link>
            </div>
          )}

          {/* Back to Login Link */}
          {!success && (
            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="text-[#0b2d49] hover:underline font-medium"
              >
                ← Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ResetPassword;
