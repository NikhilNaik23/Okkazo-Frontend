import React from 'react';
import Lottie from 'lottie-react';
import serverUnavailableAnim from '../../../assets/lottie/server_unavailable.json';

const ServerUnavailable = () => {
    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-surface p-4 overflow-hidden relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-5%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-5%] right-[-10%] w-[450px] h-[450px] bg-primary/10 rounded-full blur-[100px]" />
            
            <div className="max-w-xl w-full text-center z-10">
                <div className="w-full max-w-[380px] mx-auto mb-6">
                    <Lottie 
                        animationData={serverUnavailableAnim} 
                        loop={true} 
                    />
                </div>
                
                <h1 className="font-serif-premium text-4xl md:text-5xl text-primary mb-4">
                    Server is Napping
                </h1>
                
                <p className="text-secondary text-lg mb-8 max-w-sm mx-auto leading-relaxed">
                    We're currently tidyng up the backend. Please bear with us while we get everything back in order.
                </p>
                
                <div className="flex justify-center">
                    <button 
                        onClick={handleRetry}
                        className="px-10 py-4 rounded-full bg-primary text-white font-bold hover:bg-secondary transition-all duration-300 shadow-xl shadow-primary/30 flex items-center gap-2 group"
                    >
                        <span>Retry Connection</span>
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="group-hover:rotate-180 transition-transform duration-500"
                        >
                            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                            <path d="M21 3v5h-5" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Subtle branding or helper text */}
            <div className="absolute bottom-8 text-accent/60 text-sm font-medium tracking-widest uppercase flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                Service Temporarily Unavailable
            </div>
        </div>
    );
};

export default ServerUnavailable;
