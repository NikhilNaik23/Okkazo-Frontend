import React, { useState } from 'react';
import Navbar from "../../../components/Layout/public/Navbar";
import { useNavigate } from 'react-router-dom';


const Pricing = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        eventType: '',
        otherEventType: '',
        attendees: '',
        services: [],
        otherServiceDetails: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleServiceChange = (service) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.includes(service)
                ? prev.services.filter(s => s !== service)
                : [...prev.services, service]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Combine eventType if 'Other' is selected
        const finalEventType = formData.eventType === 'Other' ? formData.otherEventType : formData.eventType;

        // Combine services (append other details if 'Other' is selected)
        let finalServices = [...formData.services];
        if (finalServices.includes('Other')) {
            // Remove 'Other' string and add the actual details, or keep both. 
            // Let's keep 'Other' and add detail as a separate string or modify it.
            // Simplest for now: just log it as is, backend would handle.
            // OR: replace 'Other' with `Other: ${formData.otherServiceDetails}`
            finalServices = finalServices.filter(s => s !== 'Other');
            finalServices.push(`Other: ${formData.otherServiceDetails}`);
        }

        const finalData = {
            ...formData,
            eventType: finalEventType,
            services: finalServices
        };
        console.log("Form Submitted:", finalData); // specific logging for dev
        navigate('/quote-success');
    };

    const inputClasses = "w-full p-3 outline-none text-gray-700 placeholder:text-gray-400 text-sm";
    const wrapperClasses = "bg-white flex items-center rounded-lg overflow-hidden border border-gray-200 focus-within:border-[#09637E] focus-within:ring-1 focus-within:ring-[#09637E] transition-all";

    return (
        <div className="bg-white min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-grow pt-40 pb-12">
                <div className="container mx-auto px-6 md:px-12 lg:px-20">

                    <div className="flex flex-col lg:flex-row gap-8 items-stretch">
                        {/* Left Side: Project Roadmap */}
                        <div className="lg:w-1/2 flex">
                            <div className="bg-gradient-to-br from-[#09637E] to-[#088395] p-8 rounded-2xl w-full text-white shadow-xl flex flex-col justify-between overflow-hidden">
                                <div>
                                    <h3 className="text-2xl font-black mb-1 tracking-tight">How Okkazo Works</h3>
                                    <p className="text-[#EBF4F6]/80 text-sm mb-8 font-medium">Your journey to a successful event.</p>

                                    <div className="space-y-6 relative pl-4">
                                        {/* Vertical Line */}
                                        <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-white/20"></div>

                                        {/* Step 1: Planning */}
                                        <div className="relative flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-full border-4 border-[#09637E] bg-white overflow-hidden shrink-0 z-10 shadow-lg relative">
                                                <img src="https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&w=150&q=80" alt="Planning" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-[#09637E]/10"></div>
                                            </div>
                                            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/5 flex-grow">
                                                <h4 className="font-bold text-lg leading-none mb-1">Plan & Estimate</h4>
                                                <p className="text-xs text-white/80 leading-relaxed">Select vendors and receive an instant estimated price range.</p>
                                            </div>
                                        </div>

                                        {/* Step 2: Manager Assignment */}
                                        <div className="relative flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-full border-4 border-[#09637E] bg-white overflow-hidden shrink-0 z-10 shadow-lg relative">
                                                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" alt="Event Manager" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-[#09637E]/10"></div>
                                            </div>
                                            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/5 flex-grow">
                                                <h4 className="font-bold text-lg leading-none mb-1">Expert Assurance</h4>
                                                <p className="text-xs text-white/80 leading-relaxed">A dedicated Event Manager is assigned to handle logistics.</p>
                                            </div>
                                        </div>

                                        {/* Step 3: Vendor Coordination */}
                                        <div className="relative flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-full border-4 border-[#09637E] bg-white overflow-hidden shrink-0 z-10 shadow-lg relative">
                                                <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=150&q=80" alt="Coordination" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-[#09637E]/10"></div>
                                            </div>
                                            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/5 flex-grow">
                                                <h4 className="font-bold text-lg leading-none mb-1">Vendor Coordination</h4>
                                                <p className="text-xs text-white/80 leading-relaxed">We verify availability or suggest alternatives via chat.</p>
                                            </div>
                                        </div>

                                        {/* Step 4: Payment & Confirmation */}
                                        <div className="relative flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-full border-4 border-[#09637E] bg-white overflow-hidden shrink-0 z-10 shadow-lg relative">
                                                <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=150&q=80" alt="Secure Booking" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-[#09637E]/10"></div>
                                            </div>
                                            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/5 flex-grow">
                                                <h4 className="font-bold text-lg leading-none mb-1">Secure Confirmation</h4>
                                                <p className="text-xs text-white/80 leading-relaxed">Vendors are locked in after you complete the secure payment.</p>
                                            </div>
                                        </div>

                                        {/* Step 5: Execution */}
                                        <div className="relative flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-full border-4 border-[#09637E] bg-white overflow-hidden shrink-0 z-10 shadow-lg relative">
                                                <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=150&q=80" alt="Event Success" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-[#09637E]/10"></div>
                                            </div>
                                            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/5 flex-grow">
                                                <h4 className="font-bold text-lg leading-none mb-1">Event Success</h4>
                                                <p className="text-xs text-white/80 leading-relaxed">Your event goes live with QR entry and real-time management.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                                    <p className="text-white/60 text-xs uppercase tracking-widest font-bold">Trust the Process</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Quote Form */}
                        <div className="lg:w-1/2 flex">
                            <div className="bg-[#7AB2B2]/20 p-8 rounded-2xl border border-[#7AB2B2]/30 shadow-lg w-full flex flex-col justify-center">
                                <h2 className="text-2xl font-bold text-[#09637E] text-center mb-6">Request a Custom Quote</h2>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Personal Info Row */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className={wrapperClasses}>
                                            <span className="pl-3 text-red-500 font-bold">*</span>
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="Full Name"
                                                required
                                                className={inputClasses}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className={wrapperClasses}>
                                            <span className="pl-3 text-red-500 font-bold">*</span>
                                            <input
                                                type="text"
                                                name="phone"
                                                placeholder="Phone"
                                                required
                                                className={inputClasses}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className={wrapperClasses}>
                                        <span className="pl-3 text-red-500 font-bold">*</span>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Email Address"
                                            required
                                            className={inputClasses}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Event Details Row */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className={wrapperClasses}>
                                            <span className="pl-3 text-red-400">*</span>
                                            <select name="eventType" className="w-full p-3 outline-none text-gray-500 bg-white text-sm" required onChange={handleChange} defaultValue="">
                                                <option value="" disabled>Event Type</option>
                                                <option value="Corporate">Corporate</option>
                                                <option value="Wedding">Wedding</option>
                                                <option value="Birthday">Birthday</option>
                                                <option value="Concert">Concert</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className={wrapperClasses}>
                                            <span className="pl-3 text-red-400">*</span>
                                            <select name="attendees" className="w-full p-3 outline-none text-gray-500 bg-white text-sm" required onChange={handleChange} defaultValue="">
                                                <option value="" disabled>Guest Count</option>
                                                <option value="<50">&lt; 50</option>
                                                <option value="50-100">50 - 100</option>
                                                <option value="100-300">100 - 300</option>
                                                <option value="300-500">300 - 500</option>
                                                <option value="500+">500+</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Conditional 'Other' Input */}
                                    {formData.eventType === 'Other' && (
                                        <div className={`${wrapperClasses} animate-fade-in-down`}>
                                            <span className="pl-3 text-red-400">*</span>
                                            <input
                                                type="text"
                                                name="otherEventType"
                                                placeholder="Please specify event type"
                                                required
                                                className={inputClasses}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    )}

                                    {/* Services Selection */}
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <p className="text-xs font-bold text-[#09637E] mb-2 uppercase tracking-wide">Services you are interested in</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['Venue', 'Catering', 'Decoration', 'Photography', 'Music/Sound', 'Security', 'Other'].map((service) => (
                                                <label key={service} className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer hover:text-[#09637E] transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        value={service}
                                                        onChange={() => handleServiceChange(service)}
                                                        className="accent-[#09637E] w-4 h-4"
                                                    />
                                                    <span>{service}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {/* Conditional Input for 'Other' Service using formData.services */}
                                        {formData.services.includes('Other') && (
                                            <div className="mt-3">
                                                <div className={wrapperClasses}>
                                                    <input
                                                        type="text"
                                                        name="otherServiceDetails"
                                                        placeholder="Please specify other service"
                                                        className={inputClasses}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className={wrapperClasses}>
                                        <textarea
                                            name="message"
                                            rows="3"
                                            placeholder="Tell us more about your event needs..."
                                            className="w-full p-3 outline-none text-gray-700 text-sm resize-none"
                                            onChange={handleChange}
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-[#09637E] hover:bg-[#074d61] text-white font-bold py-3.5 px-4 rounded-lg shadow-md transition-colors text-lg mt-2 flex items-center justify-center gap-2"
                                    >
                                        Get Free Quote
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Pricing;
