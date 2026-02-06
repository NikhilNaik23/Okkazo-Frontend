import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Layout/user/Navbar";
import { BsCheck2, BsArrowRight } from "react-icons/bs";
import { toast, Toaster } from "react-hot-toast";
import EventDetailsForm from "../../../components/Forms/PromoteEvent/EventDetailsForm";
import VenueLocation from "../../../components/Forms/PromoteEvent/VenueLocation";
import TicketCategories from "../../../components/Forms/PromoteEvent/TicketCategories";
import BannerUpload from "../../../components/Forms/PromoteEvent/BannerUpload";
import RevenueCard from "../../../components/Forms/PromoteEvent/RevenueCard";

const PromoteEvent = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        eventName: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        totalTickets: 0,
        address: "",
        lat: 40.7128,
        lng: -74.0060,
        tickets: [],
        banner: null
    });

    // Load Draft
    useEffect(() => {
        const savedDraft = localStorage.getItem('promoteEventDraft');
        if (savedDraft) {
            try {
                const parsedDraft = JSON.parse(savedDraft);
                setFormData(parsedDraft);
                toast.success("Draft restored from previous session", { id: 'draft-restored' });
            } catch (error) {
                console.error("Failed to parse draft", error);
            }
        }
    }, []);

    const handleSaveDraft = () => {
        try {
            localStorage.setItem('promoteEventDraft', JSON.stringify(formData));
            toast.success("Event details saved as draft!");
        } catch (error) {
            console.error(error);
            if (error.name === 'QuotaExceededError') {
                 toast.error("Draft too large to save (Limit your banner image size)");
            } else {
                 toast.error("Failed to save draft");
            }
        }
    };

    // Calculations
    const totalTicketValue = formData.tickets.reduce((acc, t) => acc + (t.price * t.quantity), 0);
    const serviceCharge = totalTicketValue * 0.05;
    const platformFee = 149.00;
    const projectedRevenue = totalTicketValue - serviceCharge;

    const handleAddTicket = () => {
        const newId = formData.tickets.length > 0 ? Math.max(...formData.tickets.map(t => t.id)) + 1 : 1;
        setFormData({
            ...formData,
            tickets: [...formData.tickets, { id: newId, name: "", price: 0, quantity: 0 }]
        });
    };

    const handleRemoveTicket = (id) => {
        setFormData({
            ...formData,
            tickets: formData.tickets.filter(t => t.id !== id)
        });
    };

    const handleTicketChange = (id, field, value) => {
        // Prevent negative values for price and quantity
        if ((field === 'price' || field === 'quantity') && value < 0) return;
        
        setFormData({
            ...formData,
            tickets: formData.tickets.map(t => t.id === id ? { ...t, [field]: value } : t)
        });
    };

    const isFormComplete = () => {
        return (
            formData.eventName?.trim() &&
            formData.startDate &&
            formData.endDate &&
            Number(formData.totalTickets) > 0 &&
            formData.address &&
            formData.tickets.length > 0 &&
            formData.banner !== null
        );
    };

    const handleNext = () => {
        if (!isFormComplete()) return;

        // Date Validation
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const now = new Date();

        if (start < now) {
            toast.error("Start date must be in the future");
            return;
        }

        if (end <= start) {
            toast.error("End date must be after start date");
            return;
        }

        const totalCategoryQty = formData.tickets.reduce((acc, t) => acc + (parseInt(t.quantity) || 0), 0);
        
        // Validation: Ticket categories sum must match total tickets
        if (totalCategoryQty !== parseInt(formData.totalTickets || 0)) {
             toast.error(`Total tickets (${formData.totalTickets || 0}) must match sum of category quantities (${totalCategoryQty})`);
             return;
        }

        // Validation: No negative quantities (redundant check)
        const hasNegativeQty = formData.tickets.some(t => t.quantity < 0);
        if (hasNegativeQty) {
            toast.error("Ticket quantities cannot be negative");
            return;
        }

        setCurrentStep(prev => prev + 1);
    };

    const handlePaymentSuccess = () => {
        // In a real app, this would be a callback from a payment gateway
        localStorage.removeItem('promoteEventDraft');
        toast.success("Payment Successful! Event Promoted.");
        setCurrentStep(3);
    };

    return (
        <div className="min-h-screen bg-[#e9eff1] flex flex-col font-sans text-[#0b2d49]">
             <Navbar />
             <Toaster position="top-center" />
             
             <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-32 pb-20">
                 {/* Page Header */}
                 <div className="mb-8">
                     <h1 className="text-3xl font-extrabold mb-2">Public Event Promotion Form</h1>
                     <p className="text-gray-500 text-sm">Configure your event details, tickets, and publishing options.</p>
                 </div>
 
                 {currentStep === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Content (Form) */}
                        <div className="lg:col-span-2 space-y-8">
                            <EventDetailsForm formData={formData} setFormData={setFormData} />
                            <VenueLocation formData={formData} setFormData={setFormData} />
                            <TicketCategories 
                                formData={formData} 
                                handleTicketChange={handleTicketChange} 
                                handleRemoveTicket={handleRemoveTicket} 
                                handleAddTicket={handleAddTicket} 
                            />
                        </div>

                        {/* Right Content (Sidebar) */}
                        <div className="space-y-8">
                            {/* Step Indicator (Ref 2) */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex gap-2">
                                    {[1, 2, 3].map(step => (
                                        <div 
                                            key={step} 
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                                step === currentStep 
                                                ? 'bg-[#0b2d49] text-white' 
                                                : step < currentStep 
                                                    ? 'bg-[#0b2d49]/20 text-[#0b2d49]' 
                                                    : 'bg-white text-gray-300 border border-gray-200'
                                            }`}
                                        >
                                            {step < currentStep ? <BsCheck2 /> : step}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <BannerUpload formData={formData} setFormData={setFormData} />

                            <RevenueCard 
                                projectedRevenue={projectedRevenue}
                                totalTicketValue={totalTicketValue}
                                serviceCharge={serviceCharge}
                                platformFee={platformFee}
                            />

                            {/* Action Buttons */}
                            <div className="space-y-4">
                                <button 
                                    onClick={handleNext}
                                    disabled={!isFormComplete()}
                                    className={`w-full py-4 font-bold rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all ${
                                        isFormComplete()
                                        ? 'bg-[#0b2d49] hover:bg-[#d7a444] text-white hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    Pay Platform Fee Only (${platformFee}) <BsArrowRight />
                                </button>
                                <button 
                                    onClick={handleSaveDraft}
                                    className="w-full py-4 bg-white text-[#0b2d49] font-bold rounded-2xl border border-gray-200 hover:border-[#d7a444] transition-all hover:bg-gray-50 active:scale-[0.98]"
                                >
                                    Save as Draft
                                </button>
                                <p className="text-center text-[10px] text-gray-400">Need help? <a href="#" className="underline font-bold text-gray-600">Contact Support</a></p>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="max-w-2xl mx-auto bg-white rounded-3xl p-10 shadow-sm text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#0b2d49]">
                             <span className="text-4xl">💳</span>
                        </div>
                        <h2 className="text-3xl font-extrabold mb-4 text-[#0b2d49]">Confirm Payment</h2>
                        <p className="text-gray-500 mb-8 text-lg">
                            You are about to pay <b className="text-[#0b2d49]">${platformFee}</b> to publish your event <br/>
                            <span className="italic">"{formData.eventName}"</span>
                        </p>
                        
                        <div className="space-y-4">
                            <button 
                                onClick={handlePaymentSuccess}
                                className="w-full py-4 bg-[#0b2d49] text-white font-bold rounded-2xl shadow-xl hover:bg-[#d7a444] hover:-translate-y-1 transition-all"
                            >
                                Pay & Publish
                            </button>
                            <button 
                                onClick={() => setCurrentStep(1)}
                                className="text-gray-400 hover:text-[#0b2d49] font-bold text-sm"
                            >
                                Back to Edit
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="max-w-2xl mx-auto bg-white rounded-3xl p-10 shadow-sm text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                             <BsCheck2 size={48} />
                        </div>
                        <h2 className="text-3xl font-extrabold mb-4 text-[#0b2d49]">Event Published!</h2>
                        <p className="text-gray-500 mb-8">
                            Your event is now live and tickets are available for purchase.
                        </p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-[#0b2d49] text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                )}
            </main>
            
        </div>
    );
};

export default PromoteEvent;
