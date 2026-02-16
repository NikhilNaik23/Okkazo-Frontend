import React from 'react';
import { BsCheckCircle, BsClock, BsCalendarCheck } from 'react-icons/bs';

const RegistrationSuccess = ({ email }) => {
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
                <p className="text-[#708aa0] font-medium leading-relaxed mb-6 text-sm">
                    Thank you for applying to join Okkazo. Our team will review your details and get back to you within 24-48 hours via
                    <span className="text-[#088395] font-bold"> {email}</span>.
                </p>
                <div className="bg-[#EBF4F6]/50 rounded-2xl p-6 mb-6 text-left border border-[#7AB2B2]/20">
                    <h3 className="text-[10px] font-black text-[#09637E] uppercase tracking-[0.2em] mb-4">What Happens Next?</h3>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-4 group">
                            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-[#088395] shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                                <BsClock size={16} />
                            </div>
                            <div className="pt-0.5">
                                <p className="text-xs text-[#09637E] font-black uppercase tracking-wider">Verification</p>
                                <p className="text-[11px] text-[#708aa0] font-medium">Review of business documents</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4 group">
                            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-[#088395] shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                                <BsCalendarCheck size={16} />
                            </div>
                            <div className="pt-0.5">
                                <p className="text-xs text-[#09637E] font-black uppercase tracking-wider">Onboarding</p>
                                <p className="text-[11px] text-[#708aa0] font-medium">Scheduling a quick intro call</p>
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
