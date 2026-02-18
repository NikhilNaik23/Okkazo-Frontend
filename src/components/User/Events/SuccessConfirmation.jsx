import React from "react";
import { BsCheck2Circle, BsRocketTakeoff, BsArrowRight } from "react-icons/bs";

const SuccessConfirmation = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 pt-40 pb-20 text-center animate-in fade-in slide-in-from-bottom-12 duration-1000">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7AB2B2]/5 rounded-full blur-[120px] pointer-events-none -z-10" />

            <div className="relative mb-12 inline-block">
                <div className="w-32 h-32 bg-[#088395] rounded-full flex items-center justify-center mx-auto text-[#EBF4F6] shadow-[0_0_50px_rgba(8,131,149,0.4)] animate-bounce-slow">
                    <BsCheck2Circle size={64} />
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#7AB2B2] rounded-full flex items-center justify-center text-[#041C24] shadow-lg animate-pulse">
                    <BsRocketTakeoff size={20} />
                </div>
            </div>

            <div className="space-y-6 max-w-2xl mx-auto">
                <p className="text-[#088395] font-black uppercase tracking-[0.4em] text-xs">Acknowledge Reality</p>
                <h2 className="text-6xl md:text-8xl font-serif-premium text-[#09637E] italic leading-tight">
                    Your event <br />
                    <span className="not-italic">is now live.</span>
                </h2>
                <p className="text-[#09637E]/60 text-lg leading-relaxed font-medium pt-4">
                    The invitations have been broadcast. The digital realm now anticipates your event. Prepare for the extraordinary journey ahead.
                </p>
            </div>

            <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-6">
                <button
                    onClick={() => window.location.reload()}
                    className="group px-10 py-5 bg-[#09637E] text-[#EBF4F6] rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-4 hover:bg-[#088395] hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                    <span>View Event Dashboard</span>
                    <BsArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                    onClick={() => window.location.reload()}
                    className="px-10 py-5 border-2 border-[#09637E]/10 text-[#09637E] rounded-full font-black uppercase tracking-widest text-xs hover:border-[#09637E] transition-all"
                >
                    Share Announcement
                </button>
            </div>

            <div className="mt-20 pt-12 border-t border-[#09637E]/5 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/40 mb-1">Status</p>
                    <p className="text-xs font-bold text-[#088395]">LIVE & ACTIVE</p>
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/40 mb-1">Promotion</p>
                    <p className="text-xs font-bold text-[#088395]">INITIALIZED</p>
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/40 mb-1">Reach</p>
                    <p className="text-xs font-bold text-[#088395]">WORLDWIDE</p>
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/40 mb-1">Analytics</p>
                    <p className="text-xs font-bold text-[#088395]">READY</p>
                </div>
            </div>
        </div>
    );
};

export default SuccessConfirmation;
