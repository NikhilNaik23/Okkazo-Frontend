import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsArrowRight } from "react-icons/bs";
import SidebarProgress from "../../../components/Forms/EventWizard/SidebarProgress";
import OrbitalStage from "../../../components/Forms/EventWizard/OrbitalStage";
import StepEventDetails from "../../../components/Forms/EventWizard/StepEventDetails";
import StepVendorSelection from "../../../components/Forms/EventWizard/StepVendorSelection";
import StepReview from "../../../components/Forms/EventWizard/StepReview";
import StepConfirmation from "../../../components/Forms/EventWizard/StepConfirmation";
import { planningWizardSteps } from "../../../data/planningWizardData";
import ManifestPreview from "../../../components/Forms/EventWizard/ManifestPreview";
import StepCategorySelection from "../../../components/Forms/EventWizard/StepCategorySelection";

const PlanningWizard = () => {
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
    });

    const isImmersiveStep = currentStep === 1 || currentStep === 2;

    const steps = planningWizardSteps;

    // Ensure active tab is valid
    React.useEffect(() => {
        if (formData.services.length > 0 && activeServiceTab >= formData.services.length) {
            setActiveServiceTab(0);
        }
    }, [formData.services, activeServiceTab]);

    const handleNext = () => {
        if (currentStep === 1 && !isPreviewMode) {
            setIsPreviewMode(true);
        } else {
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
            <main className={`flex-1 w-full mx-auto flex transition-all duration-700 ${isImmersiveStep ? 'max-w-none relative px-6' : (currentStep === 3 ? 'max-w-none px-0 pt-0' : 'max-w-7xl px-6 pt-8 gap-8')}`}>

                {!isImmersiveStep && currentStep !== 3 && <SidebarProgress currentStep={currentStep} steps={steps} />}

                {/* Main Content Area */}
                <div className="flex-1 relative h-full min-h-0">
                    {/* Header - Only for non-immersive steps, hide for Step 3 */}
                    {!isImmersiveStep && currentStep !== 3 && (
                        <div className="mb-8 animate-fade-in text-center lg:text-left">
                            <h1 className="text-4xl font-black text-[#0b2d49] tracking-tight mb-2">Manifest Your Event</h1>
                            <p className="text-teal-900/40 font-bold uppercase tracking-widest text-[10px]">Step {currentStep}: {steps[currentStep - 1]?.title || 'Done'}</p>
                        </div>
                    )}

                    <div className={`transition-all duration-700 ${isImmersiveStep || currentStep >= 3 ? 'bg-transparent shadow-none border-none p-0 h-full' : 'bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-150'}`}>
                        {currentStep === 1 && (
                            <OrbitalStage
                                formData={formData}
                                handleChange={handleChange}
                                setFormData={setFormData}
                                minDateString={minDateString}
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
                            <StepVendorSelection
                                formData={formData}
                                activeServiceTab={activeServiceTab}
                                setActiveServiceTab={setActiveServiceTab}
                                handleSelectVendor={handleSelectVendor}
                                handleNext={handleNext}
                                handleBack={handleBack}
                            />
                        )}

                        {currentStep === 4 && (
                            <StepReview formData={formData} />
                        )}

                        {currentStep === 5 && (
                            <StepConfirmation />
                        )}
                    </div>

                    {/* Navigation Actions */}
                    <div className={`flex flex-col gap-4 z-[100] pointer-events-none 
                        ${isImmersiveStep || currentStep >= 3
                            ? (currentStep === 1
                                ? 'fixed bottom-[14px] right-10'
                                : 'fixed bottom-8 left-10 right-10')
                            : 'mt-12 relative'}`}>

                        {currentStep < 5 && currentStep !== 3 && (
                            <div className={`flex items-center ${isImmersiveStep ? (currentStep === 1 ? 'justify-end' : 'justify-between') : 'justify-between'}`}>
                                {(!isImmersiveStep || currentStep === 2) && (
                                    <button
                                        onClick={handleBack}
                                        disabled={currentStep === 1}
                                        className={`font-bold flex items-center gap-4 transition-all hover:text-[#0b2d49] disabled:opacity-0 disabled:pointer-events-none pointer-events-auto 
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
                                                disabled={
                                                    (currentStep === 2 && formData.services.length === 0) ||
                                                    (currentStep === 3 && Object.keys(formData.vendors).length < formData.services.length)
                                                }
                                                className={`transition-all active:scale-95 group flex items-center gap-6 cursor-pointer pointer-events-auto 
                                                    ${isImmersiveStep
                                                        ? (currentStep === 1 ? 'pb-12 bg-transparent' : 'pb-2 bg-transparent')
                                                        : 'px-8 py-3 bg-[#0b2d49] hover:bg-[#163a5a] text-white font-bold rounded-xl shadow-lg shadow-blue-900/10'}`}
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
                                                        {currentStep === 4 ? 'Finish' : 'Next Step'} <BsArrowRight />
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
