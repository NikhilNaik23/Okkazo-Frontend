import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Clock, Edit } from 'lucide-react';
import { motion } from 'framer-motion';

const ManagerEventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div className="p-8 max-w-[1920px] mx-auto min-h-screen">
            <motion.button
                onClick={() => navigate(-1)}
                whileHover={{ x: -5 }}
                className="flex items-center gap-2 text-gray-500 hover:text-teal-600 mb-6 font-medium transition-colors"
            >
                <ArrowLeft className="w-5 h-5" /> Back to Events
            </motion.button>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Banner */}
                <div className="h-64 bg-gray-200 relative">
                    <img
                        src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                        alt="Event Banner"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                        <div className="text-white">
                            <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                                Planning
                            </span>
                            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Alpha Tech Conf 2024</h1>
                            <p className="opacity-90 font-medium">Event ID: #{id}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div className="flex gap-8">
                            <div className="flex items-center gap-3 text-gray-600">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <Calendar className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Date</p>
                                    <p className="font-semibold">Oct 24, 2023</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <Clock className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Time</p>
                                    <p className="font-semibold">09:00 AM</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <MapPin className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Location</p>
                                    <p className="font-semibold">San Francisco, CA</p>
                                </div>
                            </div>
                        </div>

                        <button className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-xl font-bold hover:bg-teal-100 transition-colors">
                            <Edit className="w-4 h-4" /> Edit Details
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Event Description</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                </p>
                            </section>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 h-fit">
                            <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 font-medium">Tickets Sold</span>
                                    <span className="font-bold text-gray-900">1,240 / 1,500</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-teal-500 h-2 rounded-full w-[82%]"></div>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                    <span className="text-gray-500 font-medium">Revenue</span>
                                    <span className="font-bold text-teal-600">$42,000</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerEventDetails;
