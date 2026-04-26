import React from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import pageNotFoundAnim from '../../../assets/lottie/page_not_found.json';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-surface p-4 overflow-hidden relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-accent/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[350px] h-[350px] bg-primary/10 rounded-full blur-[80px]" />
            
            <div className="max-w-2xl w-full text-center z-10">
                <div className="w-full max-w-[480px] mx-auto mb-8 animate-float">
                    <Lottie 
                        animationData={pageNotFoundAnim} 
                        loop={true} 
                    />
                </div>
                
                <h1 className="font-serif-premium text-4xl md:text-5xl text-primary mb-4">
                    Lost in Space?
                </h1>
                
                <p className="text-secondary text-lg mb-8 max-w-sm mx-auto leading-relaxed">
                    The page you're looking for has drifted away. Let's get you back to the celebration!
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        onClick={() => navigate(-1)}
                        className="px-8 py-3 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all duration-300"
                    >
                        Go Back
                    </button>
                    <button 
                        onClick={() => navigate('/')}
                        className="px-8 py-3 rounded-full bg-primary text-white font-bold hover:bg-secondary transition-all duration-300 shadow-lg shadow-primary/20"
                    >
                        Home Page
                    </button>
                </div>
            </div>

            {/* Subtle branding or helper text */}
            <div className="absolute bottom-8 text-accent/60 text-sm font-medium tracking-widest uppercase">
                Error 404 • Page Not Found
            </div>
        </div>
    );
};

export default NotFound;
