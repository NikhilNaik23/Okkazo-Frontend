import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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

const PlanningWizard = () => {
    const [searchParams] = useSearchParams();
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
    });

    const isImmersiveStep = currentStep === 1 || currentStep === 2 || currentStep === 3;

    const steps = planningWizardSteps;

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

                if (foundEvent && foundEvent.formData) {
                    setFormData(foundEvent.formData);
                    // If it is paid/Immediate Action, go to Vendor Selection (Step 4)
                    let targetStep = 1;

                    if (foundEvent.status === "Immediate Action" || foundEvent.formData.isPaid) {
                        targetStep = 4; // Vendor Selection
                    } else if (foundEvent.formData.services && foundEvent.formData.services.length > 0) {
                        targetStep = 3; // Payment
                    } else if (foundEvent.formData.date && foundEvent.formData.location) {
                        targetStep = 2; // Preview / Service Selection
                    }

                    setCurrentStep(targetStep);
                    // Force update in case of race conditions
                    setTimeout(() => setCurrentStep(targetStep), 100);
                } else {
                    // Fallback: Check drafts if we implement full draft editing later
                    const drafts = JSON.parse(localStorage.getItem('planningWizardDrafts') || '[]');
                    const foundDraft = drafts.find(d => d.id === eventId);
                    if (foundDraft && foundDraft.formData) {
                        setFormData(foundDraft.formData);
                        // Drafts usually start at step 1 or last saved step (if we tracked it)
                    }
                }
            } catch (e) {
                console.error("Failed to load event data", e);
            }
        }
    }, [searchParams]);

    const handleNext = () => {
        if (currentStep === 1 && !isPreviewMode) {
            handleSaveDraft(); // Auto-save on Manifest
            setIsPreviewMode(true);
        } else {
            if (currentStep === 2) {
                handleSaveDraft(); // Auto-save details & services
            }
            setIsPreviewMode(false);
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
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
            const existingDrafts = JSON.parse(localStorage.getItem('planningWizardDrafts') || '[]');
            const eventId = searchParams.get('eventId'); // Check if we are editing an existing draft/event

            // Create a pseudo-ID or use title if unique enough
            // Create a pseudo-ID or use title if unique enough
            let draftId = eventId || formData.id;

            if (!draftId) {
                draftId = `draft_${Date.now()}`;
                // Update state so subsequent saves use the same ID
                setFormData(prev => ({ ...prev, id: draftId }));
            }

            const newDraft = {
                id: draftId,
                title: formData.title || `Untitled ${formData.type} Draft`,
                date: formData.date || "TBD",
                location: formData.location || "Location TBD",
                image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=2069&auto=format&fit=crop", // Default draft image
                status: "Draft",
                sold: `Last edited ${new Date().toLocaleDateString()}`,
                formData: { ...formData, id: draftId }, // Store full form data for restoration later
                timestamp: Date.now()
            };

            // Remove existing draft with same ID if it exists to "replace" it
            const filteredDrafts = existingDrafts.filter(d => d.id !== draftId);

            // Add updated draft to top
            const updatedDrafts = [newDraft, ...filteredDrafts].slice(0, 5);
            localStorage.setItem('planningWizardDrafts', JSON.stringify(updatedDrafts));

            // Dispatch event for dashboard updates
            window.dispatchEvent(new Event('savedUpdated'));

            return true; // Success
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

    const isNextDisabled = (currentStep === 2 && formData.services.length === 0) ||
        (currentStep === 4 && Object.keys(formData.vendors).length < formData.services.length) ||
        (currentStep === 5 && !isAtBottom);

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
        <div className={`flex flex-col flex-1 font-sans transition-colors duration-700 ${isImmersiveStep ? 'bg-[#eff6f7]' : (currentStep === 3 ? 'bg-white' : 'bg-gray-50')} min-h-screen`}>
            <main className={`flex-1 w-full mx-auto flex transition-all duration-700 ${isImmersiveStep ? 'max-w-none relative px-6' : ((currentStep >= 3) ? 'max-w-none px-0 pt-0' : 'max-w-7xl px-6 pt-8 gap-8')}`}>

                {!isImmersiveStep && currentStep !== 4 && currentStep !== 5 && currentStep !== 6 && <SidebarProgress currentStep={currentStep} steps={steps} />}

                {/* Main Content Area */}
                <div className="flex-1 relative h-full min-h-0">
                    {/* Header - Only for non-immersive steps, hide for Step 4 & 5 & 6 */}
                    {!isImmersiveStep && currentStep !== 4 && currentStep !== 5 && currentStep !== 6 && (
                        <div className="mb-8 animate-fade-in text-center lg:text-left">
                            <h1 className="text-4xl font-black text-primary tracking-tight mb-2">Manifest Your Event</h1>
                            <p className="text-teal-900/40 font-bold uppercase tracking-widest text-[10px]">Step {currentStep}: {steps[currentStep - 1]?.title || 'Done'}</p>
                        </div>
                    )}

                    <div className={`transition-all duration-700 ${isImmersiveStep || currentStep >= 4 ? 'bg-transparent shadow-none border-none p-0 h-full' : 'bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-150'}`}>
                        {currentStep === 1 && (
                            <OrbitalStage
                                formData={formData}
                                handleChange={handleChange}
                                setFormData={setFormData}
                                minDateString={minDateString}
                                onSaveDraft={handleSaveDraft}
                            />
                        )}

                        {currentStep === 2 && (
                            <StepCategorySelection
                                selectedServices={formData.services}
                                onToggleService={handleToggleService}
                                onUpdateService={handleUpdateService}
                            />
                        )}

                        {currentStep === 3 && (
                            <StepPayment
                                onNext={handleNext}
                                onBack={handleBack}
                                formData={formData}
                                handleChange={handleChange}
                            />
                        )}

                        {currentStep === 4 && (
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

                        {currentStep === 5 && (
                            <StepReview formData={formData} onRemoveVendor={handleRemoveVendor} />
                        )}

                        {currentStep === 6 && (
                            <StepConfirmation />
                        )}
                    </div>

                    {/* Navigation Actions */}
                    <div className={`flex flex-col gap-4 z-[100] pointer-events-none 
                        ${isImmersiveStep || currentStep >= 4
                            ? (currentStep === 1
                                ? 'fixed bottom-[14px] right-10'
                                : 'fixed bottom-8 left-10 right-10')
                            : 'mt-12 relative'}`}>

                        {currentStep < 6 && currentStep !== 3 && currentStep !== 4 && (
                            <div className={`flex items-center ${isImmersiveStep ? (currentStep === 1 ? 'justify-end' : 'justify-between') : 'justify-between'}`}>
                                {(!isImmersiveStep || currentStep === 2) && (
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
                                        formData.date &&
                                        formData.date >= minDateString &&
                                        formData.startTime &&
                                        formData.locationValid &&
                                        (formData.listingType !== 'Public' || formData.title)
                                    )) && (currentStep !== 2 || formData.services.length > 0) && (
                                            <motion.button
                                                initial={isImmersiveStep ? { opacity: 0, x: 20 } : false}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                onClick={handleNext}
                                                disabled={isNextDisabled}
                                                className={`transition-all active:scale-95 group flex items-center gap-6 pointer-events-auto 
                                                    ${isImmersiveStep
                                                        ? (currentStep === 1 ? 'pb-12 bg-transparent cursor-pointer' : 'pb-2 bg-transparent cursor-pointer')
                                                        : `px-8 py-3 text-white font-bold rounded-xl shadow-lg shadow-blue-900/10 
                                                           ${isNextDisabled
                                                            ? 'bg-gray-400 cursor-not-allowed opacity-80'
                                                            : 'bg-primary hover:bg-secondary cursor-pointer'}`}`}
                                            >
                                                {isImmersiveStep ? (
                                                    <>
                                                        <span className={`font-serif-premium italic text-teal-900 group-hover:text-teal-700 transition-colors ${currentStep === 1 ? 'text-6xl' : 'text-5xl'}`}>
                                                            {currentStep === 1 ? 'Manifest' : 'Advance'}
                                                        </span>
                                                        <div className="w-16  h-16 rounded-full bg-[#09637E] flex items-center justify-center text-white shadow-xl group-hover:bg-[#088395] transition-all group-hover:translate-x-2">
                                                            <BsArrowRight size={28} />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        {currentStep === 5 ? 'Finish' : 'Next Step'} <BsArrowRight />
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
