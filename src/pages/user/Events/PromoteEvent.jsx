import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { BsArrowRight } from "react-icons/bs";

// Wizard Components
import VerticalStepTransition from "../../../components/Forms/PromoteEvent/Wizard/VerticalStepTransition";
import StepDetails from "../../../components/Forms/PromoteEvent/Wizard/StepDetails";
import StepMedia from "../../../components/Forms/PromoteEvent/Wizard/StepMedia";
import StepTickets from "../../../components/Forms/PromoteEvent/Wizard/StepTickets";
import StepSchedule from "../../../components/Forms/PromoteEvent/Wizard/StepSchedule";
import StepPromote from "../../../components/Forms/PromoteEvent/Wizard/StepPromote";
import StepVerify from "../../../components/Forms/PromoteEvent/Wizard/StepVerify";
import StepReview from "../../../components/Forms/PromoteEvent/Wizard/StepReview";
import PaymentConfirmation from "../../../components/User/Events/PaymentConfirmation";
import SuccessConfirmation from "../../../components/User/Events/SuccessConfirmation";

import { promoteEventSteps, initialPromoteEventState } from "../../../data/promoteEventData";

const PromoteEvent = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [isPaymentStep, setIsPaymentStep] = useState(false);
    const [isSuccessStep, setIsSuccessStep] = useState(false);

    const [formData, setFormData] = useState(initialPromoteEventState);

    // Helper: Step definitions (calculated dynamically for completion status)
    const steps = promoteEventSteps.map(step => ({
        ...step,
        completed: (
            (step.id === 1 && !!formData.eventName && !!formData.category && formData.category !== 'Other') ||
            (step.id === 2 && !!formData.banner) ||
            (step.id === 3 &&
                formData.totalCapacity > 0 &&
                formData.tickets.length > 0 &&
                formData.tickets.reduce((sum, t) => sum + (parseInt(t.quantity) || 0), 0) === parseInt(formData.totalCapacity) &&
                formData.tickets.every(t => !!t.name && (formData.ticketType === 'free' || (t.price !== "" && t.price > 0)))
            ) ||
            (step.id === 4 && !!formData.startDate && !!formData.endDate) ||
            (step.id === 5) || // Promote is optional
            (step.id === 6 && formData.authDocuments?.length > 0) || // Verify: at least 1 doc
            (step.id === 7) // Review
        )
    }));

    const isCurrentStepCompleted = steps[currentStep - 1]?.completed;

    // Persist draft
    useEffect(() => {
        const saved = localStorage.getItem('promoteEventDraft_v3');
        if (saved) {
            try {
                setFormData(JSON.parse(saved));
                // toast.success("Draft restored", { style: { background: '#088395', color: '#fff' } });
            } catch (e) {
                console.error("Draft load failed", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('promoteEventDraft_v3', JSON.stringify(formData));
    }, [formData]);

    // Ticket Handlers
    const handleAddTicket = () => {
        const newId = formData.tickets.length > 0 ? Math.max(...formData.tickets.map(t => t.id)) + 1 : 1;
        setFormData({
            ...formData,
            tickets: [...formData.tickets, { id: newId, name: "", price: "", quantity: "" }]
        });
    };

    const handleRemoveTicket = (id) => {
        setFormData({ ...formData, tickets: formData.tickets.filter(t => t.id !== id) });
    };

    const handleTicketChange = (id, field, value) => {
        if ((field === 'price' || field === 'quantity') && value !== "" && value <= 0) {
            toast.error("Entrance Fee and Availability must be at least 1", {
                id: 'ticket-validation',
                style: {
                    background: '#09637E',
                    color: '#EBF4F6',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                }
            });
            return;
        }
        setFormData({
            ...formData,
            tickets: formData.tickets.map(t => t.id === id ? { ...t, [field]: value } : t)
        });
    };

    // Navigation
    const handleNext = () => {
        if (currentStep < 7) {
            setCurrentStep(prev => prev + 1);
        } else {
            setIsPaymentStep(true);
        }
    };

    const handleBack = () => {
        if (isPaymentStep) {
            setIsPaymentStep(false);
            return;
        }
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handlePaymentSuccess = () => {
        // Create new campaign object
        // Create new campaign object
        const isFree = formData.tickets.every(t => !t.price || parseFloat(t.price) === 0);

        const newCampaign = {
            id: `new_${Date.now()}`,
            title: formData.eventName || "Untitled Event",
            subtitle: (formData.category || "Uncategorized").toUpperCase(),
            status: "Pending Review",
            revenue: isFree ? "-" : "₹0.00",
            revenueLabel: isFree ? "Free Event" : "Projected Revenue",
            conversion: null,
            centerText: "In Review",
            gradient: "bg-gradient-to-b from-[#EBF4F6]/80 via-[#7AB2B2]/20 to-white/90",
            buttonText: "View Submission",
            createdAt: new Date().toISOString()
        };

        // Save to localStorage
        try {
            const existing = JSON.parse(localStorage.getItem('promoted_campaigns') || '[]');
            const updated = [newCampaign, ...(Array.isArray(existing) ? existing : [])];
            localStorage.setItem('promoted_campaigns', JSON.stringify(updated));
            // Dispatch event for any active listeners
            window.dispatchEvent(new Event('savedUpdated'));
        } catch (e) {
            console.error("Failed to save campaign", e);
        }

        setIsPaymentStep(false);
        setIsSuccessStep(true);
        localStorage.removeItem('promoteEventDraft_v3');
    };

    // Render Logic
    if (isSuccessStep) return <SuccessConfirmation />;

    return (
        <div className="flex min-h-screen bg-[#EBF4F6] font-sans text-[#09637E] overflow-hidden relative">
            <Toaster position="top-right" toastOptions={{ style: { background: '#09637E', color: '#EBF4F6', border: '1px solid #7AB2B2' } }} />

            {/* Sidebar / Vertical Transition */}
            <div className="relative z-20">
                <VerticalStepTransition
                    currentStep={currentStep - 1} // 0-based index for visual transition
                    steps={steps}
                    onStepClick={(idx) => setCurrentStep(idx + 1)}
                />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 ml-80 relative h-screen overflow-y-auto scrollbar-hide bg-[#EBF4F6] z-10">

                <div className="p-16 pt-32 pb-40 relative z-10 min-h-full flex flex-col justify-center">
                    <div className="max-w-5xl mx-auto w-full">
                        {/* Draft Status */}
                        <div className="absolute top-12 right-16 text-[10px] items-center gap-2 font-black uppercase tracking-[0.2em] text-[#7AB2B2] hidden md:flex">
                            <div className="w-2 h-2 rounded-full bg-[#088395] animate-pulse"></div>
                            Draft Saved {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>

                        {/* Step Render */}
                        {isPaymentStep ? (
                            <PaymentConfirmation
                                formData={formData}
                                platformFee={15000}
                                setCurrentStep={() => setIsPaymentStep(false)}
                                handlePaymentSuccess={handlePaymentSuccess}
                            />
                        ) : (
                            <div className="transition-all duration-500 ease-in-out">
                                {currentStep === 1 && <StepDetails formData={formData} setFormData={setFormData} />}
                                {currentStep === 2 && <StepMedia formData={formData} setFormData={setFormData} />}
                                {currentStep === 3 && (
                                    <StepTickets
                                        formData={formData}
                                        setFormData={setFormData}
                                        tickets={formData.tickets}
                                        onAdd={handleAddTicket}
                                        onRemove={handleRemoveTicket}
                                        onChange={handleTicketChange}
                                    />
                                )}
                                {currentStep === 4 && <StepSchedule formData={formData} setFormData={setFormData} />}
                                {currentStep === 5 && <StepPromote formData={formData} setFormData={setFormData} />}
                                {currentStep === 6 && <StepVerify formData={formData} setFormData={setFormData} />}
                                {currentStep === 7 && <StepReview formData={formData} />}
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating Controls (No Footer Bar) */}
                {!isPaymentStep && (
                    <div className="fixed bottom-12 right-12 z-50 flex gap-4">
                        {currentStep > 1 && (
                            <button
                                onClick={handleBack}
                                className="px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs text-[#7AB2B2] bg-[#09637E]/20 backdrop-blur-md border border-[#7AB2B2]/20 hover:bg-[#7AB2B2] hover:text-[#09637E] transition-all shadow-lg"
                            >
                                Go Back
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            disabled={!isCurrentStepCompleted}
                            className={`group px-10 py-5 rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-4 transition-all duration-300 shadow-xl ${isCurrentStepCompleted
                                ? 'bg-[#088395] text-[#EBF4F6] hover:bg-[#7AB2B2] hover:text-[#09637E] hover:shadow-[0_0_30px_rgba(122,178,178,0.4)] hover:scale-105 active:scale-95'
                                : 'bg-[#09637E]/10 text-[#09637E]/40 cursor-not-allowed'
                                }`}
                        >
                            <span>{currentStep === 7 ? 'Finalize & Pay' : 'Next Step'}</span>
                            <BsArrowRight size={18} className={`${isCurrentStepCompleted ? 'group-hover:translate-x-1' : ''} transition-transform`} />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PromoteEvent;
