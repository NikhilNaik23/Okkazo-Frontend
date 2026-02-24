import React from 'react';
import { BsCheckCircle, BsClock, BsCalendarCheck, BsEnvelopeFill, BsKey } from 'react-icons/bs';

const RegistrationSuccess = ({ email, message, data }) => {
    const applicationId = data?.applicationId || data?.id || 'REF-XXXX';
    
    return (
        <div className="min-h-screen bg-[#EBF4F6] flex items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-[#088395]/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#09637E]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl shadow-[#09637E]/10 text-center animate-[fadeInUp_0.6s_ease-out] border border-white/50">
                <div className="w-20 h-20 bg-gradient-to-br from-[#088395]/20 to-[#09637E]/30 rounded-[1.5rem] flex items-center justify-center text-[#088395] mx-auto mb-6 shadow-lg shadow-[#088395]/20 animate-bounce" style={{ animationDuration: '2s' }}>
                    <BsCheckCircle size={40} />
                </div>
                <h1 className="text-3xl font-black text-[#09637E] mb-3 tracking-tight">Application Received!</h1>
                
                {/* Application ID */}
                <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-[#EBF4F6]/80 rounded-xl">
                    <span className="text-[10px] font-black text-[#708aa0] uppercase tracking-wider">Application ID:</span>
                    <span className="text-sm font-black text-[#088395]">{applicationId}</span>
                </div>

                <p className="text-[#708aa0] font-medium leading-relaxed mb-6 text-sm">
                    {message || "Thank you for applying to join Okkazo. We've sent you an important email to get started!"}
                </p>

                {/* Email Notice Box */}
                <div className="bg-gradient-to-br from-[#088395]/5 to-[#09637E]/10 rounded-2xl p-5 mb-6 border-2 border-[#088395]/20">
                    <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-[#088395] rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
                            <BsEnvelopeFill size={18} />
                        </div>
                        <div className="text-left flex-1">
                            <h3 className="text-xs font-black text-[#09637E] uppercase tracking-wider mb-1">Check Your Email</h3>
                            <p className="text-[11px] text-[#708aa0] font-medium leading-relaxed">
                                We've sent a welcome email to <span className="text-[#088395] font-bold">{email}</span> with a secure link to set your password.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#088395]/10">
                        <BsKey className="text-[#088395]" size={14} />
                        <p className="text-[10px] text-[#708aa0] font-bold">Set your password within 7 days to activate your account</p>
                    </div>
                </div>

                <div className="bg-[#EBF4F6]/50 rounded-2xl p-6 mb-6 text-left border border-[#7AB2B2]/20">
                    <h3 className="text-[10px] font-black text-[#09637E] uppercase tracking-[0.2em] mb-4">What Happens Next?</h3>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-4 group">
                            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-[#088395] shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                                <BsKey size={16} />
                            </div>
                            <div className="pt-0.5">
                                <p className="text-xs text-[#09637E] font-black uppercase tracking-wider">Set Password</p>
                                <p className="text-[11px] text-[#708aa0] font-medium">Click the link in your email to create your password</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4 group">
                            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-[#088395] shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                                <BsClock size={16} />
                            </div>
                            <div className="pt-0.5">
                                <p className="text-xs text-[#09637E] font-black uppercase tracking-wider">Verification</p>
                                <p className="text-[11px] text-[#708aa0] font-medium">Our team will review your documents (2-3 business days)</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4 group">
                            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-[#088395] shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                                <BsCalendarCheck size={16} />
                            </div>
                            <div className="pt-0.5">
                                <p className="text-xs text-[#09637E] font-black uppercase tracking-wider">Start Offering</p>
                                <p className="text-[11px] text-[#708aa0] font-medium">Once approved, you can start offering your services!</p>
                            </div>
                        </li>
                    </ul>
                </div>
                
                <button
                    onClick={() => window.location.href = '/'}
                    className="w-full py-4 bg-gradient-to-r from-[#09637E] to-[#088395] text-white rounded-xl font-black hover:from-[#088395] hover:to-[#09637E] transition-all duration-300 shadow-xl shadow-[#09637E]/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default RegistrationSuccess;
