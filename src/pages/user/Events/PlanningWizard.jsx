import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BsArrowRight } from "react-icons/bs";
import SidebarProgress from "../../../components/Forms/EventWizard/SidebarProgress";
import SidebarOverview from "../../../components/Forms/EventWizard/SidebarOverview";
import OrbitalStage from "../../../components/Forms/EventWizard/OrbitalStage";
import StepEventDetails from "../../../components/Forms/EventWizard/StepEventDetails";
import StepVendorSelection from "../../../components/Forms/EventWizard/StepVendorSelection";
import StepReview from "../../../components/Forms/EventWizard/StepReview";
import StepConfirmation from "../../../components/Forms/EventWizard/StepConfirmation";
import { planningWizardSteps } from "../../../data/planningWizardData";
import ManifestPreview from "../../../components/Forms/EventWizard/ManifestPreview";
import StepCategorySelection from "../../../components/Forms/EventWizard/StepCategorySelection";
import StepPayment from "../../../components/Forms/EventWizard/StepPayment";
import { myOrganizedEvents } from "../../../data/myEventsData";
import StepTickets from "../../../components/Forms/PromoteEvent/Wizard/StepTickets";
import StepPromote from "../../../components/Forms/PromoteEvent/Wizard/StepPromote";

const PlanningWizard = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [activeServiceTab, setActiveServiceTab] = useState(0); // Index of active service tab

    // Date calculation for minimum allowed booking (Available from Today + 6)
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 6);
    const minDateString = minDate.toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        title: "",
        type: "Birthday", // Default private type
        listingType: "Private", // Private (No tickets) by default
        location: "",
        lat: null,
        lng: null,
        locationValid: false,
        date: "",
        startTime: "",
        endTime: "",
        services: [], // Start with empty selection
        vendors: {}, // { 'Venue': vendorObj, 'Catering': vendorObj }
        isPaid: false, // Payment status
        tickets: [{ id: Date.now(), name: "General Admission", price: null, quantity: "" }], // Prepopulate defaut tier
        totalCapacity: "",
        ticketType: "paid",
        eventDescription: "",
        promotions: { featured: false, email: false, social: false, insights: false },
    });

    const baseSteps = planningWizardSteps.map((s, idx) => ({ ...s, componentId: ['manifest', 'category', 'payment', 'vendor', 'review', 'confirmation'][idx] }));
    const steps = formData.listingType === 'Public' ? [
        { id: 1, componentId: 'manifest', title: "Event Configuration", desc: "Build your event" },
        { id: 2, componentId: 'category', title: "Category Selection", desc: "Choose service categories" },
        { id: 3, componentId: 'payment', title: "Payment", desc: "Secure your booking" },
        { id: 4, componentId: 'vendor', title: "Vendor Selection", desc: "Choose your team" },
        { id: 5, componentId: 'review', title: "Review & Bill", desc: "Finalize your plan" },
        { id: 6, componentId: 'confirmation', title: "Confirmation", desc: "All set!" },
    ] : baseSteps;

    const currentComponentId = steps[currentStep - 1]?.componentId || 'manifest';
    const isImmersiveStep = ['manifest', 'category', 'payment'].includes(currentComponentId);

    // Ensure active tab is valid
    React.useEffect(() => {
        if (formData.services.length > 0 && activeServiceTab >= formData.services.length) {
            setActiveServiceTab(0);
        }
    }, [formData.services, activeServiceTab]);

    // Resume Wizard from Event ID
    useEffect(() => {
        const eventId = searchParams.get('eventId');
        if (eventId) {
            try {
                // Check 'my_organized_events' where we save new paid events
                const myEvents = JSON.parse(localStorage.getItem('my_organized_events') || '[]');
                const foundEvent = myEvents.find(e => e.id === eventId || e.id === Number(eventId));

                const handleStepLogic = (data) => {
                    const defaultData = {
                        title: "",
                        type: "Birthday",
                        listingType: "Private",
                        location: "",
                        lat: null,
                        lng: null,
                        locationValid: false,
                        date: "",
                        startTime: "",
                        endTime: "",
                        services: [],
                        vendors: {},
                        isPaid: false,
                        tickets: [{ id: Date.now(), name: "General Admission", price: null, quantity: "" }],
                        totalCapacity: "",
                        ticketType: "paid",
                        eventDescription: "",
                        promotions: { featured: false, email: false, social: false, insights: false }
                    };

                    const mergedData = { ...defaultData, ...data };
                    // Ensure critical arrays/objects are safe
                    if (!mergedData.services) mergedData.services = [];
                    if (!mergedData.vendors) mergedData.vendors = {};

                    setFormData(mergedData);

                    const getStepIndex = (cid) => {
                        const s = ['manifest', 'category', 'payment', 'vendor', 'review', 'confirmation'];
                        // Get idx and add 1, if not found (like when changing types dynamically which rarely happens on initial load) default to 1
                        const idx = s.indexOf(cid);
                        return idx !== -1 ? idx + 1 : 1;
                    };

                    // If it is paid/Immediate Action, go to Vendor Selection
                    let targetStep = 1;

                    if (mergedData.isPaid) {
                        targetStep = getStepIndex('vendor'); // Vendor Selection
                    } else if (mergedData.services && mergedData.services.length > 0) {
                        targetStep = getStepIndex('payment'); // Payment
                    } else if (mergedData.location && (mergedData.date || mergedData.publicStartTime)) {
                        targetStep = 2; // Preview / Service Selection or Tickets
                    }

                    // Override with URL params if present
                    const urlStep = searchParams.get('step');
                    if (urlStep) {
                        targetStep = parseInt(urlStep);
                    }

                    const urlTab = searchParams.get('activeServiceTab');
                    if (urlTab) {
                        setActiveServiceTab(parseInt(urlTab));
                    }

                    setCurrentStep(targetStep);
                    setIsPreviewMode(false);
                };

                if (foundEvent && foundEvent.formData) {
                    handleStepLogic(foundEvent.formData);
                } else {
                    // Fallback to checking drafts
                    const drafts = JSON.parse(localStorage.getItem('planningWizardDrafts') || '[]');
                    const foundDraft = drafts.find(d => d.id === eventId || d.id === Number(eventId));

                    if (foundDraft && foundDraft.formData) {
                        // Ensure ID is persisted in state
                        const draftData = { ...foundDraft.formData, id: foundDraft.id };
                        handleStepLogic(draftData);
                    } else {
                        // Fallback to Dummy Data (for Immediate Action mocks)
                        const foundDummy = myOrganizedEvents.find(e => e.id === Number(eventId) || e.id === eventId);
                        if (foundDummy && foundDummy.formData) {
                            const dummyData = { ...foundDummy.formData, id: foundDummy.id };
                            // Ensure isPaid matches status
                            if (foundDummy.status === 'Immediate Action') {
                                dummyData.isPaid = true;
                            }
                            handleStepLogic(dummyData);
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to load event data", e);
            }
        }
    }, [searchParams]);

    const handleNext = () => {
        if (currentComponentId === 'manifest' && !isPreviewMode) {
            handleSaveDraft(); // Auto-save on Manifest
            setIsPreviewMode(true);
        } else {
            if (currentComponentId === 'category') {
                handleSaveDraft(); // Auto-save details & services
            }
            setIsPreviewMode(false);
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        const returnTo = searchParams.get('returnTo');
        if (returnTo) {
            navigate(`/user/${returnTo}`);
            return;
        }

        if (isPreviewMode) {
            setIsPreviewMode(false);
        } else {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleToggleService = (category) => {
        setFormData(prev => {
            const isSelected = prev.services.includes(category);
            const services = isSelected
                ? prev.services.filter(s => s !== category)
                : [...prev.services, category];

            // Clean up vendors if category is removed
            const vendors = { ...prev.vendors };
            if (isSelected) {
                delete vendors[category];
            }

            return { ...prev, services, vendors };
        });
    };

    const handleUpdateService = (oldName, newName) => {
        setFormData(prev => {
            const services = prev.services.map(s => s === oldName ? newName : s);
            const vendors = { ...prev.vendors };
            if (vendors[oldName]) {
                vendors[newName] = vendors[oldName];
                delete vendors[oldName];
            }
            return { ...prev, services, vendors };
        });
    };

    const handleSelectVendor = (service, vendor) => {
        setFormData(prev => ({
            ...prev,
            vendors: { ...prev.vendors, [service]: vendor }
        }));
    };

    const handleSaveDraft = () => {
        try {
            // 1. Identification
            const eventId = searchParams.get('eventId');
            let draftId = eventId || formData.id;

            if (!draftId) {
                draftId = `draft_${Date.now()}`;
                setFormData(prev => ({ ...prev, id: draftId }));
            }

            // 2. Check 'my_organized_events' (Immediate Action / Paid events)
            const myEvents = JSON.parse(localStorage.getItem('my_organized_events') || '[]');
            const existingEventIndex = myEvents.findIndex(e => e.id === draftId || e.id === Number(draftId));

            if (existingEventIndex !== -1) {
                // Update existing event in 'my_organized_events'
                const updatedEvent = {
                    ...myEvents[existingEventIndex],
                    title: formData.title || myEvents[existingEventIndex].title,
                    date: formData.date || myEvents[existingEventIndex].date,
                    location: formData.location || myEvents[existingEventIndex].location,
                    // valid to update other fields?
                    formData: { ...formData, id: draftId },
                    timestamp: Date.now()
                };

                myEvents[existingEventIndex] = updatedEvent;
                localStorage.setItem('my_organized_events', JSON.stringify(myEvents));

                // Dispatch update
                window.dispatchEvent(new Event('savedUpdated'));
                return true;
            }

            // 3. Fallback to 'planningWizardDrafts' (Drafts)
            const existingDrafts = JSON.parse(localStorage.getItem('planningWizardDrafts') || '[]');

            const newDraft = {
                id: draftId,
                title: formData.title || `Untitled ${formData.type} Draft`,
                date: formData.date || "TBD",
                location: formData.location || "Location TBD",
                image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=2069&auto=format&fit=crop",
                status: "Draft",
                sold: `Last edited ${new Date().toLocaleDateString()}`,
                formData: { ...formData, id: draftId },
                timestamp: Date.now()
            };

            const filteredDrafts = existingDrafts.filter(d => d.id !== draftId);
            const updatedDrafts = [newDraft, ...filteredDrafts].slice(0, 5);
            localStorage.setItem('planningWizardDrafts', JSON.stringify(updatedDrafts));

            window.dispatchEvent(new Event('savedUpdated'));
            return true;
        } catch (error) {
            console.error("Failed to save draft:", error);
            return false;
        }
    };

    const [isAtBottom, setIsAtBottom] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);

        const handleScroll = () => {
            const buffer = 50;
            const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - buffer;
            setIsAtBottom(isBottom);
        };

        window.addEventListener('scroll', handleScroll);
        // Check initial position in case content is short
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [currentStep]);

    const handleRemoveVendor = (service) => {
        setFormData(prev => {
            const vendors = { ...prev.vendors };
            delete vendors[service];
            return { ...prev, vendors };
        });
    };

    const handleAddTicket = () => {
        setFormData(prev => ({
            ...prev,
            tickets: [...prev.tickets, { id: Date.now(), name: "", price: "", quantity: "" }]
        }));
    };

    const handleRemoveTicket = (id) => {
        setFormData(prev => ({
            ...prev,
            tickets: prev.tickets.filter(t => t.id !== id)
        }));
    };

    const handleTicketChange = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            tickets: prev.tickets.map(t =>
                t.id === id ? { ...t, [field]: value } : t
            )
        }));
    };

    const isNextDisabled = (currentComponentId === 'category' && formData.services.length === 0) ||
        (currentComponentId === 'vendor' && Object.keys(formData.vendors).length < formData.services.length) ||
        (currentComponentId === 'review' && !isAtBottom);

    if (isPreviewMode) {
        return (
            <ManifestPreview
                formData={formData}
                onBack={() => setIsPreviewMode(false)}
                onConfirm={handleNext}
            />
        );
    }

    return (
        <div className={`flex flex-col flex-1 font-sans transition-colors duration-700 ${isImmersiveStep ? 'bg-[#eff6f7]' : (currentComponentId === 'payment' ? 'bg-white' : 'bg-gray-50')} min-h-screen`}>
            <main className={`flex-1 w-full mx-auto flex flex-col transition-all duration-700 ${isImmersiveStep ? 'max-w-none relative px-6' : ((['payment', 'vendor', 'review', 'promote', 'confirmation'].includes(currentComponentId)) ? 'max-w-none px-0 pt-0' : 'max-w-7xl px-6 pt-8 gap-8')}`}>

                {!isImmersiveStep && !['vendor', 'review', 'confirmation'].includes(currentComponentId) && <SidebarProgress currentStep={currentStep} steps={steps} />}

                {/* Main Content Area */}
                <div className="flex-1 relative h-full min-h-0">
                    {/* Header - Only for non-immersive steps */}
                    {!isImmersiveStep && !['vendor', 'review', 'confirmation'].includes(currentComponentId) && (
                        <div className="mb-8 animate-fade-in text-center lg:text-left">
                            <h1 className="text-4xl font-black text-primary tracking-tight mb-2">Manifest Your Event</h1>
                            <p className="text-teal-900/40 font-bold uppercase tracking-widest text-[10px]">Step {currentStep}: {steps[currentStep - 1]?.title || 'Done'}</p>
                        </div>
                    )}

                    <div className={`transition-all duration-700 ${isImmersiveStep || ['vendor', 'review', 'confirmation'].includes(currentComponentId) ? 'bg-transparent shadow-none border-none p-0 h-full' : 'bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-150'}`}>
                        {currentComponentId === 'manifest' && (
                            <OrbitalStage
                                formData={formData}
                                handleChange={handleChange}
                                setFormData={setFormData}
                                minDateString={minDateString}
                                onSaveDraft={handleSaveDraft}
                                handleAddTicket={handleAddTicket}
                                handleRemoveTicket={handleRemoveTicket}
                                handleTicketChange={handleTicketChange}
                            />
                        )}



                        {currentComponentId === 'category' && (
                            <StepCategorySelection
                                selectedServices={formData.services}
                                onToggleService={handleToggleService}
                                onUpdateService={handleUpdateService}
                            />
                        )}

                        {currentComponentId === 'payment' && (
                            <StepPayment
                                onNext={handleNext}
                                onBack={handleBack}
                                formData={formData}
                                handleChange={handleChange}
                            />
                        )}

                        {currentComponentId === 'vendor' && (
                            <StepVendorSelection
                                formData={formData}
                                activeServiceTab={activeServiceTab}
                                setActiveServiceTab={setActiveServiceTab}
                                handleSelectVendor={handleSelectVendor}
                                handleNext={handleNext}
                                handleBack={handleBack}
                                handleChange={handleChange}
                                minDateString={minDateString}
                            />
                        )}

                        {currentComponentId === 'review' && (
                            <StepReview formData={formData} onRemoveVendor={handleRemoveVendor} />
                        )}



                        {currentComponentId === 'confirmation' && (
                            <StepConfirmation eventId={formData.id} />
                        )}
                    </div>

                    {/* Navigation Actions */}
                    <div className={`flex flex-col gap-4 z-[100] pointer-events-none 
                        ${isImmersiveStep || ['vendor', 'review', 'promote', 'confirmation'].includes(currentComponentId)
                            ? (currentComponentId === 'manifest'
                                ? 'fixed bottom-[14px] right-10'
                                : 'fixed bottom-8 left-10 right-10')
                            : 'mt-12 relative'}`}>

                        {currentComponentId !== 'confirmation' && currentComponentId !== 'payment' && currentComponentId !== 'vendor' && (
                            <div className={`flex items-center ${isImmersiveStep ? (currentComponentId === 'manifest' ? 'justify-end' : 'justify-between') : 'justify-between'}`}>
                                {(!isImmersiveStep || currentComponentId !== 'manifest') && (
                                    <button
                                        onClick={handleBack}
                                        disabled={currentStep === 1}
                                        className={`font-bold flex items-center gap-4 transition-all hover:text-primary disabled:opacity-0 disabled:pointer-events-none pointer-events-auto 
                                            ${isImmersiveStep ? 'text-teal-900/40 group' : 'text-gray-500'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-full border border-teal-900/10 flex items-center justify-center transition-all 
                                            ${isImmersiveStep ? 'group-hover:border-teal-900/40 group-hover:bg-teal-900/10' : 'border-gray-200'}`}>
                                            <BsArrowRight className="rotate-180" size={20} />
                                        </div>
                                        <span className="text-[10px] tracking-[0.2em] uppercase">Back</span>
                                    </button>
                                )}

                                <AnimatePresence>
                                    {(!isImmersiveStep || (
                                        formData.listingType &&
                                        formData.title &&
                                        formData.type &&
                                        formData.locationValid &&
                                        (formData.listingType === 'Public' ? (
                                            formData.publicStartTime && formData.publicEndTime && formData.salesStartTime &&
                                            formData.banner && formData.eventDescription &&
                                            formData.totalCapacity > 0 &&
                                            formData.tickets.reduce((a, t) => a + (parseInt(t.quantity) || 0), 0) === parseInt(formData.totalCapacity)
                                        ) : (
                                            formData.date && formData.date >= minDateString && formData.startTime &&
                                            formData.guests && formData.guests > 0
                                        ))
                                    )) && (currentComponentId !== 'category' || formData.services.length > 0) && (
                                            <motion.button
                                                initial={isImmersiveStep ? { opacity: 0, x: 20 } : false}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                onClick={handleNext}
                                                disabled={isNextDisabled}
                                                className={`transition-all active:scale-95 group flex items-center gap-6 pointer-events-auto 
                                                    ${isImmersiveStep
                                                        ? (currentComponentId === 'manifest' ? 'pb-12 bg-transparent cursor-pointer' : 'pb-2 bg-transparent cursor-pointer')
                                                        : `px-8 py-3 text-white font-bold rounded-xl shadow-lg shadow-blue-900/10 
                                                           ${isNextDisabled
                                                            ? 'bg-gray-400 cursor-not-allowed opacity-80'
                                                            : 'bg-primary hover:bg-secondary cursor-pointer'}`}`}
                                            >
                                                {isImmersiveStep ? (
                                                    <>
                                                        <span className={`font-serif-premium italic text-teal-900 group-hover:text-teal-700 transition-colors ${currentComponentId === 'manifest' ? 'text-6xl' : 'text-5xl'}`}>
                                                            {currentComponentId === 'manifest' ? 'Manifest' : 'Advance'}
                                                        </span>
                                                        <div className="w-16  h-16 rounded-full bg-[#09637E] flex items-center justify-center text-white shadow-xl group-hover:bg-[#088395] transition-all group-hover:translate-x-2">
                                                            <BsArrowRight size={28} />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        {currentComponentId === 'review' || currentComponentId === 'promote' ? 'Finish' : 'Next Step'} <BsArrowRight />
                                                    </>
                                                )}
                                            </motion.button>
                                        )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>

            </main >
        </div >
    );
};

export default PlanningWizard;
