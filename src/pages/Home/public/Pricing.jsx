import React, { useState } from 'react';
import Navbar from "../../../components/Layout/public/Navbar";
import Footer from "../../../components/Layout/public/Footer";
import { useNavigate } from 'react-router-dom';
import { fetchWithNgrok } from '../../../utils/apiHandler';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const ALLOWED_EMAIL_DOMAINS = new Set(['gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com']);
const NAME_REGEX = /^[A-Za-z][A-Za-z\s.'-]{1,79}$/;
const PHONE_REGEX = /^\+?[0-9][0-9\s()-]{6,19}$/;
const SAFE_SINGLE_LINE_REGEX = /^[A-Za-z0-9][A-Za-z0-9\s&/.'-]{1,79}$/;
const SAFE_SERVICE_DETAIL_REGEX = /^[A-Za-z0-9][A-Za-z0-9\s&/:(),.'-]{1,79}$/;
const ATTENDEE_OPTIONS = new Set(['<50', '50-100', '100-300', '300-500', '500+']);

const sanitizeSingleLine = (value) => String(value || '')
    .replace(/[\u0000-\u001F\u007F]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const isAllowedEmailDomain = (email) => {
    const parts = String(email || '').trim().toLowerCase().split('@');
    if (parts.length !== 2) return false;
    return ALLOWED_EMAIL_DOMAINS.has(parts[1]);
};

const Pricing = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');

        const sanitizedName = sanitizeSingleLine(formData.name);
        const sanitizedEmail = sanitizeSingleLine(formData.email).toLowerCase();
        const sanitizedPhone = sanitizeSingleLine(formData.phone);
        const selectedAttendees = sanitizeSingleLine(formData.attendees);

        if (!Array.isArray(formData.services) || formData.services.length === 0) {
            setSubmitError('Please select at least one service.');
            return;
        }

        if (!NAME_REGEX.test(sanitizedName)) {
            setSubmitError('Please enter a valid full name.');
            return;
        }

        if (!PHONE_REGEX.test(sanitizedPhone)) {
            setSubmitError('Please enter a valid phone number.');
            return;
        }

        if (!isAllowedEmailDomain(sanitizedEmail)) {
            setSubmitError('Email must be from gmail.com, outlook.com, yahoo.com, or icloud.com.');
            return;
        }

        if (!ATTENDEE_OPTIONS.has(selectedAttendees)) {
            setSubmitError('Please select a valid guest count range.');
            return;
        }

        // Combine eventType if 'Other' is selected
        const selectedEventType = formData.eventType === 'Other'
            ? sanitizeSingleLine(formData.otherEventType)
            : sanitizeSingleLine(formData.eventType);

        if (!SAFE_SINGLE_LINE_REGEX.test(selectedEventType)) {
            setSubmitError('Please enter a valid event type.');
            return;
        }

        // Combine services (append other details if 'Other' is selected)
        let finalServices = [...formData.services];
        if (finalServices.includes('Other')) {
            finalServices = finalServices.filter(s => s !== 'Other');
            const otherDetails = sanitizeSingleLine(formData.otherServiceDetails);
            if (otherDetails && !SAFE_SERVICE_DETAIL_REGEX.test(otherDetails)) {
                setSubmitError('Please provide valid details for the Other service.');
                return;
            }
            finalServices.push(otherDetails ? `Other: ${otherDetails}` : 'Other');
        }

        const safeServices = finalServices
            .map((service) => sanitizeSingleLine(service))
            .filter(Boolean)
            .slice(0, 10);

        if (safeServices.some((service) => !SAFE_SERVICE_DETAIL_REGEX.test(service))) {
            setSubmitError('One or more selected services contain invalid characters.');
            return;
        }

        const messageText = String(formData.message || '').trim();
        if (messageText.length > 500) {
            setSubmitError('Message should be 500 characters or fewer.');
            return;
        }

        if (messageText.includes('<') || messageText.includes('>')) {
            setSubmitError('Message contains invalid characters.');
            return;
        }

        const payload = {
            name: sanitizedName,
            email: sanitizedEmail,
            phone: sanitizedPhone,
            eventType: selectedEventType,
            attendees: selectedAttendees,
            services: safeServices,
            message: messageText,
        };

        try {
            setIsSubmitting(true);

            const response = await fetchWithNgrok(`${API_BASE_URL}/api/public/events/quote-request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data?.message || 'Failed to submit your quote request. Please try again.');
            }

            navigate('/quote-success');
        } catch (error) {
            setSubmitError(error?.message || 'Failed to submit your quote request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClasses = "w-full p-3 outline-none text-gray-700 placeholder:text-gray-400 text-sm";
    const wrapperClasses = "bg-white flex items-center rounded-lg overflow-hidden border border-gray-200 focus-within:border-[#09637E] focus-within:ring-1 focus-within:ring-[#09637E] transition-all";

    return (
        <div className="bg-white min-h-screen flex flex-col select-none">
            <header>
                <Navbar />
            </header>
            <main className="flex-grow pt-40 pb-12">
                <div className="container mx-auto px-6 md:px-12 lg:px-20">

                    <div className="flex flex-col lg:flex-row gap-8 items-stretch">
                        {/* Left Side: Project Roadmap */}
                        <div id="dark-section-pricing" className="lg:w-1/2 flex">
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
                                                maxLength={80}
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
                                                maxLength={20}
                                                inputMode="tel"
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
                                            maxLength={120}
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
                                                maxLength={60}
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
                                                        required
                                                        maxLength={80}
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
                                            maxLength={500}
                                            className="w-full p-3 outline-none text-gray-700 text-sm resize-none"
                                            onChange={handleChange}
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-[#09637E] hover:bg-[#074d61] disabled:bg-[#6b8e99] disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-lg shadow-md transition-colors text-lg mt-2 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Get Free Quote'}
                                    </button>

                                    {submitError && (
                                        <p className="text-sm text-red-600 font-medium text-center">{submitError}</p>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Pricing;
