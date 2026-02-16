import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BsShop } from "react-icons/bs";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
    registerUser,
    clearError,
    clearRegisterSuccess,
    selectIsLoading,
    selectError,
    selectRegisterSuccess,
    selectRegisterMessage,
} from "../../../store/slices/authSlice";
import { termsContent, privacyContent } from "../../../data/registerData";
import { FormInput, SimpleModal, BrandingPanel } from "../../../components/Auth";

const Register = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const isLoading = useSelector(selectIsLoading);
    const error = useSelector(selectError);
    const registerSuccess = useSelector(selectRegisterSuccess);
    const registerMessage = useSelector(selectRegisterMessage);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
            toast.success(
                registerMessage || "Registration successful! Redirecting to login...",
            );
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
        setFormData((prev) => ({
            ...prev,
            [name]: value,
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

        dispatch(
            registerUser({
                username: formData.username,
                email: formData.email,
                password: formData.password,
            }),
        );
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="flex flex-col lg:flex-row h-screen w-full bg-[#EBF4F6] overflow-hidden"
            >
                {/* Left Side - Form */}
                <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-[#EBF4F6]">
                    <div className="min-h-full flex flex-col items-center justify-center p-8 md:p-12">
                        <div className="max-w-md w-full">
                            {/* Mobile Logo Only */}
                            <div className="lg:hidden flex justify-center mb-6">
                                <Link to="/" className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-[#09637E] rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                        O
                                    </div>
                                </Link>
                            </div>

                            <h2 className="text-3xl font-bold text-[#09637E] mb-2">
                                Join Okkazo
                            </h2>
                            <p className="text-gray-500 mb-6">
                                Start managing or attending world-class events today.
                            </p>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <FormInput
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="e.g. alex_rivera"
                                    label="Username"
                                    required
                                    iconType="user"
                                />

                                <FormInput
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="name@company.com"
                                    label="Email Address"
                                    required
                                    iconType="email"
                                />

                                <FormInput
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Min. 8 characters"
                                    label="Password"
                                    required
                                    iconType="password"
                                    showPassword={showPassword}
                                    onTogglePassword={() => setShowPassword(!showPassword)}
                                />

                                <FormInput
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Re-enter your password"
                                    label="Confirm Password"
                                    required
                                    iconType="confirmPassword"
                                    showPassword={showConfirmPassword}
                                    onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                                    focusColor="#d7a444"
                                />

                                <div className="flex items-start gap-2 mt-2">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={agreedToTerms}
                                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                                        className="mt-1 rounded border-gray-300 text-[#088395] focus:ring-[#088395]"
                                    />
                                    <label htmlFor="terms" className="text-sm text-gray-500">
                                        I agree to the{" "}
                                        <button
                                            type="button"
                                            onClick={() => setActiveModal("terms")}
                                            className="font-semibold text-[#088395] hover:underline cursor-pointer"
                                        >
                                            Terms & Conditions
                                        </button>{" "}
                                        and{" "}
                                        <button
                                            type="button"
                                            onClick={() => setActiveModal("privacy")}
                                            className="font-semibold text-[#088395] hover:underline cursor-pointer"
                                        >
                                            Privacy Policy
                                        </button>
                                        .
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-[#09637E] hover:bg-[#088395] text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-900/10 mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                                <span className="relative bg-white px-4 text-xs text-gray-400 uppercase tracking-widest">
                                    OR
                                </span>
                            </div>

                            <Link to="/vendor/register">
                                <button
                                    type="button"
                                    className="w-full border-2 border-[#7AB2B2] hover:bg-[#7AB2B2]/10 text-[#09637E] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                                >
                                    <BsShop className="text-lg text-[#088395]" />
                                    Register as Vendor
                                </button>
                            </Link>

                            <p className="mt-6 text-center text-sm text-gray-500">
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="text-[#088395] font-bold hover:underline"
                                >
                                    Log In
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Image & Branding */}
                <BrandingPanel />
            </motion.div>

            <SimpleModal
                isOpen={activeModal === "terms"}
                onClose={() => setActiveModal(null)}
                title="Terms and Conditions"
                content={termsContent}
            />
            <SimpleModal
                isOpen={activeModal === "privacy"}
                onClose={() => setActiveModal(null)}
                title="Privacy Policy"
                content={privacyContent}
            />
        </>
    );
};

export default Register;
