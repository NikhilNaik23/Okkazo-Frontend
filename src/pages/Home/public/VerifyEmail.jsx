import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { BsCheckCircle, BsXCircle } from "react-icons/bs";
import { MdEmail } from "react-icons/md";
import { verifyEmail, selectIsLoading } from "../../../store/slices/authSlice";

const VerifyEmail = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const isLoading = useSelector(selectIsLoading);

  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [errorMessage, setErrorMessage] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setErrorMessage("Invalid or missing verification token");
        return;
      }

      const result = await dispatch(verifyEmail({ token }));

      if (verifyEmail.fulfilled.match(result)) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(result.payload || "Email verification failed");
      }
    };

    verify();
  }, [token, dispatch]);

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
            Verify your <br /> email address
          </h1>
          <p className="text-lg text-gray-200 max-w-md leading-relaxed">
            Complete your account setup by verifying your email.
          </p>
        </div>
      </div>

      {/* Right Side - Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="bg-[#0b2d49] p-2 rounded-lg">
              <img src="/public_logo.png" alt="Okkazo" className="h-8 w-auto" />
            </div>
          </div>

          <div className="text-center">
            {/* Verifying State */}
            {(status === "verifying" || isLoading) && (
              <>
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MdEmail className="text-blue-600 animate-pulse" size={40} />
                </div>
                <h2 className="text-3xl font-bold text-[#0b2d49] mb-4">
                  Verifying Email...
                </h2>
                <p className="text-gray-500 mb-8">
                  Please wait while we verify your email address.
                </p>
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-4 border-[#0b2d49] border-t-transparent rounded-full animate-spin"></div>
                </div>
              </>
            )}

            {/* Success State */}
            {status === "success" && !isLoading && (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BsCheckCircle className="text-green-600" size={40} />
                </div>
                <h2 className="text-3xl font-bold text-[#0b2d49] mb-4">
                  Email Verified!
                </h2>
                <p className="text-gray-500 mb-8">
                  Your email has been successfully verified. You can now log in to your account.
                </p>
                <Link
                  to="/login"
                  className="inline-block w-full bg-[#0b2d49] text-white py-3 rounded-xl font-semibold hover:bg-[#0a2640] transition-colors duration-200 text-center"
                >
                  Go to Login
                </Link>
              </>
            )}

            {/* Error State */}
            {status === "error" && !isLoading && (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BsXCircle className="text-red-600" size={40} />
                </div>
                <h2 className="text-3xl font-bold text-[#0b2d49] mb-4">
                  Verification Failed
                </h2>
                <p className="text-gray-500 mb-4">
                  {errorMessage}
                </p>
                <p className="text-sm text-gray-400 mb-8">
                  The link may have expired or already been used.
                </p>
                <div className="space-y-4">
                  <Link
                    to="/resend-verification"
                    className="inline-block w-full bg-[#0b2d49] text-white py-3 rounded-xl font-semibold hover:bg-[#0a2640] transition-colors duration-200 text-center"
                  >
                    Resend Verification Email
                  </Link>
                  <Link
                    to="/login"
                    className="inline-block w-full border-2 border-[#0b2d49] text-[#0b2d49] py-3 rounded-xl font-semibold hover:bg-[#0b2d49] hover:text-white transition-colors duration-200 text-center"
                  >
                    Go to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VerifyEmail;
