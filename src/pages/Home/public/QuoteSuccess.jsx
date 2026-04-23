import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from "../../../components/Layout/public/Navbar";
import Footer from '../../../components/Layout/public/Footer';
import quoteSuccess from "../../../assets/images/quote-image-background.jpeg"
import { FaCheckCircle } from 'react-icons/fa';

const QuoteSuccess = () => {
    return (
        <div className="bg-white min-h-screen flex flex-col">
            <Navbar />
            <div
                className="flex-grow flex items-center justify-center pt-40 pb-12 relative overflow-hidden"
                style={{
                    backgroundImage: `url(${quoteSuccess})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {/* Overlay for readability */}
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]"></div>

                <div className="container mx-auto px-6 text-center relative z-10">
                    <div className="max-w-xl mx-auto bg-[#EBF4F6] p-12 rounded-3xl shadow-xl border border-[#09637E]/10">
                        <div className="flex justify-center mb-6">
                            <FaCheckCircle className="text-[#09637E] text-6xl shadow-lg rounded-full bg-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-[#09637E] mb-4">
                            Request Received!
                        </h1>
                        <p className="text-xl text-[#088395] mb-8 font-medium">
                            We have sent your estimated price range by email.
                        </p>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Thank you for considering Okkazo. Our team is reviewing your requirements and will follow up with you shortly.
                        </p>

                        <Link to="/">
                            <button className="bg-[#09637E] hover:bg-[#074d61] text-white font-bold py-3 px-8 rounded-xl shadow-md transition-colors transform hover:scale-105">
                                Return to Home
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default QuoteSuccess;
