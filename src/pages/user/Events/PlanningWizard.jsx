import React, { useState } from "react";
import Navbar from "../../../components/Layout/user/Navbar";
import Footer from "../../../components/Layout/user/Footer";
import { BsArrowRight } from "react-icons/bs";
import SidebarProgress from "../../../components/Forms/EventWizard/SidebarProgress";
import StepEventDetails from "../../../components/Forms/EventWizard/StepEventDetails";
import StepVendorSelection from "../../../components/Forms/EventWizard/StepVendorSelection";
import StepReview from "../../../components/Forms/EventWizard/StepReview";
import StepConfirmation from "../../../components/Forms/EventWizard/StepConfirmation";
import { planningWizardSteps } from "../../../data/planningWizardData";

const PlanningWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [activeServiceTab, setActiveServiceTab] = useState(0); // Index of active service tab
  
  // Date calculation for 20 days validation
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 20);
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
    services: ['Venue', 'Catering'], // Default selections for demo
    vendors: {}, // { 'Venue': vendorObj, 'Catering': vendorObj }
  });
  
  const steps = planningWizardSteps;

  // Ensure active tab is valid
  React.useEffect(() => {
    if (formData.services.length > 0 && activeServiceTab >= formData.services.length) {
        setActiveServiceTab(0);
    }
  }, [formData.services, activeServiceTab]);

  const handleNext = () => setCurrentStep(prev => prev + 1);
  const handleBack = () => setCurrentStep(prev => prev - 1);
  const handleChange = (field, value) => setFormData({ ...formData, [field]: value });
  
  const handleSelectVendor = (service, vendor) => {
      setFormData(prev => ({
          ...prev,
          vendors: { ...prev.vendors, [service]: vendor }
      }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-32 pb-10 flex gap-8">
        
        <SidebarProgress currentStep={currentStep} steps={steps} />

        {/* Main Content Area */}
        <div className="flex-1">
           {/* Header */}
           <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-[#0b2d49] mb-2">Plan Your Perfect Event</h1>
              <p className="text-gray-500">Step {currentStep}: {steps[currentStep-1]?.title || 'Done'}</p>
           </div>
           
           <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-150">
               {currentStep === 1 && (
                   <StepEventDetails 
                        formData={formData} 
                        handleChange={handleChange} 
                        setFormData={setFormData}
                        minDateString={minDateString}
                   />
               )}
               
               {currentStep === 2 && (
                   <StepVendorSelection 
                        formData={formData}
                        activeServiceTab={activeServiceTab}
                        setActiveServiceTab={setActiveServiceTab}
                        handleSelectVendor={handleSelectVendor}
                   />
               )}
               
               {currentStep === 3 && (
                   <StepReview formData={formData} />
               )}
               
               {currentStep === 4 && (
                   <StepConfirmation />
               )}
           </div>

            {/* Navigation Actions */}
            <div className="flex flex-col gap-4 mt-8">
                {currentStep === 2 && Object.keys(formData.vendors).length < formData.services.length && (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
                        <span className="text-sm">ℹ️</span>
                        Please select a vendor for all {formData.services.length} services to proceed ({Object.keys(formData.vendors).length}/{formData.services.length} selected)
                    </div>
                )}
                {currentStep < 4 && (
                    <div className="flex justify-between items-center">
                   <button 
                      onClick={handleBack}
                      disabled={currentStep === 1}
                      className={`font-bold text-gray-500 hover:text-[#0b2d49] disabled:opacity-30 disabled:hover:text-gray-500 transition-colors ${currentStep === 1 ? 'cursor-not-allowed' : ''}`}
                   >
                       Back
                   </button>
                   <button 
                      onClick={handleNext}
                      disabled={
                          (currentStep === 1 && (
                              !formData.date || 
                              formData.date < minDateString ||
                              !formData.startTime || 
                              !formData.lat || 
                              !formData.lng || 
                              !formData.locationValid ||
                              (formData.listingType === 'Public' && !formData.title) ||
                              formData.services.length === 0
                          )) ||
                           (currentStep === 2 && Object.keys(formData.vendors).length < formData.services.length)
                      }
                      className="px-8 py-3 bg-[#0b2d49] hover:bg-[#163a5a] disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none text-white font-bold rounded-xl shadow-lg shadow-blue-900/10 flex items-center gap-2 transition-all active:scale-95"
                   >
                       {currentStep === 3 ? 'Finish' : 'Next Step'} <BsArrowRight />
                   </button>
               </div>
                )}
            </div>
         </div>

      </main>
      <Footer />
    </div>
  );
};

export default PlanningWizard;
