import React, { useState, useRef } from "react";
import {
    BsShop,
    BsEnvelope,
    BsPhone,
    BsMap,
    BsFileEarmarkText,
    BsArrowRight
} from "react-icons/bs";
import { toast } from "react-hot-toast";
import { vendorServiceCategories } from "../../data/planningWizardData";
import { termsOfService, privacyPolicy } from "../../data/vendorRegistrationData";

// Components
import Modal from "../../components/Global/Modal";
import { RegistrationSuccess, FileUploadField, MultiFileUpload, SidePanel } from "../../components/Vendor/Registration";

const VendorRegistration = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        businessName: "",
        serviceCategory: "",
        email: "",
        phone: "",
        location: "",
        description: ""
    });
    const [agreed, setAgreed] = useState(false);

    // Modal states
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

    // File upload states
    const [businessLicense, setBusinessLicense] = useState(null);
    const [ownerIdentity, setOwnerIdentity] = useState(null);
    const [otherProofs, setOtherProofs] = useState([]);

    // File input refs
    const businessLicenseRef = useRef(null);
    const ownerIdentityRef = useRef(null);
    const otherProofsRef = useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const isFormValid = () => {
        return (
            formData.businessName &&
            formData.serviceCategory &&
            (formData.serviceCategory !== "Other" || formData.customService) &&
            formData.email &&
            formData.phone &&
            agreed
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isFormValid()) {
            toast.error("Please fill in all required fields.");
            return;
        }

        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 2000)),
            {
                loading: 'Submitting your application...',
                success: () => {
                    setStep(2);
                    return <b>Application sent successfully!</b>;
                },
                error: <b>Submission failed. Please try again.</b>,
            },
            {
                style: { borderRadius: '16px', background: '#09637E', color: '#fff' }
            }
        );
    };

    if (step === 2) {
        return <RegistrationSuccess email={formData.email} />;
    }

    return (
        <div className="flex flex-col lg:flex-row h-screen w-full bg-[#EBF4F6] overflow-hidden">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-[#EBF4F6]">
                <div className="min-h-full flex flex-col items-center justify-center p-8 md:p-12">
                    <div className="max-w-xl w-full">
                        {/* Mobile Logo Only */}
                        <div className="lg:hidden flex justify-center mb-6">
                            <div className="w-10 h-10 bg-[#09637E] rounded-xl flex items-center justify-center text-white font-bold text-xl">
                                O
                            </div>
                        </div>

                        {/* Registration Header */}
                        <div className="text-center mb-10 animate-[fadeInDown_0.7s_ease-out]">
                            <div className="inline-block p-4 bg-gradient-to-br from-[#09637E] to-[#088395] rounded-3xl mb-6 shadow-xl shadow-[#09637E]/20 hover:scale-110 transition-transform duration-300 cursor-pointer">
                                <BsShop size={32} className="text-white" />
                            </div>
                            <h1 className="text-4xl font-black text-[#09637E] mb-3 tracking-tight">Become a Vendor</h1>
                            <p className="text-[#708aa0] font-medium text-base max-w-md mx-auto leading-relaxed">
                                Expand your reach and manage your event services through Okkazo.
                            </p>
                        </div>

                        {/* Form Container */}
                        <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-[#09637E]/5 border border-white animate-[fadeInUp_0.8s_ease-out]">
                            <div className="space-y-8">

                                {/* Business Basics */}
                                <section className="space-y-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#7AB2B2]/20 to-[#088395]/30 rounded-2xl flex items-center justify-center text-[#09637E] shadow-sm">
                                            <BsShop size={20} />
                                        </div>
                                        <h2 className="text-xl font-black text-[#09637E]">Business Details</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-[#09637E] uppercase tracking-widest ml-1">Business Name *</label>
                                            <input
                                                type="text"
                                                name="businessName"
                                                required
                                                value={formData.businessName}
                                                onChange={handleInputChange}
                                                placeholder="Enter legal business name"
                                                className="w-full bg-white rounded-2xl py-3.5 px-5 border border-gray-100 focus:border-[#7AB2B2] focus:ring-4 focus:ring-[#7AB2B2]/10 outline-none transition-all duration-300 font-medium text-sm placeholder:text-[#708aa0]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-[#09637E] uppercase tracking-widest ml-1">Service Category *</label>
                                            <select
                                                name="serviceCategory"
                                                required
                                                value={formData.serviceCategory}
                                                onChange={handleInputChange}
                                                className="w-full bg-white rounded-2xl py-3.5 px-5 border border-gray-100 focus:border-[#7AB2B2] focus:ring-4 focus:ring-[#7AB2B2]/10 outline-none transition-all duration-300 font-medium text-sm text-[#09637E] cursor-pointer"
                                            >
                                                <option value="" disabled>Select Category</option>
                                                {vendorServiceCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {formData.serviceCategory === "Other" && (
                                        <div className="space-y-2 animate-[fadeInDown_0.3s_ease-out]">
                                            <label className="text-xs font-black text-[#09637E] uppercase tracking-widest ml-1">Custom Service Name *</label>
                                            <input
                                                type="text"
                                                name="customService"
                                                required
                                                placeholder="e.g. Drone Photography, Pet Sitting"
                                                className="w-full bg-white rounded-2xl py-3.5 px-5 border border-gray-100 focus:border-[#7AB2B2] focus:ring-4 focus:ring-[#7AB2B2]/10 outline-none transition-all duration-300 font-medium text-sm placeholder:text-[#708aa0]"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-[#09637E] uppercase tracking-widest ml-1">Business Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Tell us about your services, experience, and what makes you unique..."
                                            rows={4}
                                            className="w-full bg-white rounded-2xl py-3.5 px-5 border border-gray-100 focus:border-[#7AB2B2] focus:ring-4 focus:ring-[#7AB2B2]/10 outline-none transition-all duration-300 font-medium text-sm placeholder:text-[#708aa0] resize-none"
                                        ></textarea>
                                    </div>
                                </section>

                                {/* Contact Info */}
                                <section className="space-y-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#7AB2B2]/20 to-[#088395]/30 rounded-2xl flex items-center justify-center text-[#09637E] shadow-sm">
                                            <BsEnvelope size={20} />
                                        </div>
                                        <h2 className="text-xl font-black text-[#09637E]">Contact Info</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 relative group">
                                            <label className="text-xs font-black text-[#09637E] uppercase tracking-widest ml-1">Business Email *</label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    name="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="name@business.com"
                                                    className="w-full bg-white rounded-2xl py-3.5 px-5 border border-gray-100 focus:border-[#7AB2B2] focus:ring-4 focus:ring-[#7AB2B2]/10 outline-none transition-all duration-300 font-medium text-sm placeholder:text-[#708aa0] pl-12"
                                                />
                                                <BsEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[#708aa0] group-focus-within:text-[#09637E] transition-colors" />
                                            </div>
                                        </div>
                                        <div className="space-y-2 relative group">
                                            <label className="text-xs font-black text-[#09637E] uppercase tracking-widest ml-1">Phone Number *</label>
                                            <div className="relative">
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    required
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="+1 (555) 000-0000"
                                                    className="w-full bg-white rounded-2xl py-3.5 px-5 border border-gray-100 focus:border-[#7AB2B2] focus:ring-4 focus:ring-[#7AB2B2]/10 outline-none transition-all duration-300 font-medium text-sm placeholder:text-[#708aa0] pl-12"
                                                />
                                                <BsPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#708aa0] group-focus-within:text-[#09637E] transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2 relative group">
                                        <label className="text-xs font-black text-[#09637E] uppercase tracking-widest ml-1">Primary Location *</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="location"
                                                required
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                placeholder="City, State (e.g., New York, NY)"
                                                className="w-full bg-white rounded-2xl py-3.5 px-5 border border-gray-100 focus:border-[#7AB2B2] focus:ring-4 focus:ring-[#7AB2B2]/10 outline-none transition-all duration-300 font-medium text-sm placeholder:text-[#708aa0] pl-12"
                                            />
                                            <BsMap className="absolute left-4 top-1/2 -translate-y-1/2 text-[#708aa0] group-focus-within:text-[#09637E] transition-colors" />
                                        </div>
                                    </div>
                                </section>

                                {/* Documents Upload */}
                                <section className="space-y-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#7AB2B2]/20 to-[#088395]/30 rounded-2xl flex items-center justify-center text-[#09637E] shadow-sm">
                                            <BsFileEarmarkText size={20} />
                                        </div>
                                        <h2 className="text-xl font-black text-[#09637E]">Verification Documents</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FileUploadField
                                            label="Business License"
                                            file={businessLicense}
                                            onFileChange={setBusinessLicense}
                                            onRemove={() => {
                                                setBusinessLicense(null);
                                                if (businessLicenseRef.current) businessLicenseRef.current.value = '';
                                            }}
                                            inputRef={businessLicenseRef}
                                        />
                                        <FileUploadField
                                            label="Owner Identity"
                                            file={ownerIdentity}
                                            onFileChange={setOwnerIdentity}
                                            onRemove={() => {
                                                setOwnerIdentity(null);
                                                if (ownerIdentityRef.current) ownerIdentityRef.current.value = '';
                                            }}
                                            inputRef={ownerIdentityRef}
                                        />
                                    </div>

                                    <MultiFileUpload
                                        files={otherProofs}
                                        onAddFile={(file) => setOtherProofs([...otherProofs, file])}
                                        onRemoveFile={(index) => setOtherProofs(otherProofs.filter((_, i) => i !== index))}
                                        inputRef={otherProofsRef}
                                        maxFiles={3}
                                    />
                                </section>

                                {/* Agreements and Submit */}
                                <div className="pt-6 border-t border-gray-100 flex flex-col gap-6">
                                    <label className="flex items-center gap-4 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={agreed}
                                            onChange={(e) => setAgreed(e.target.checked)}
                                            className="w-6 h-6 rounded-lg border-[#7AB2B2]/50 text-[#09637E] focus:ring-[#09637E]/20 cursor-pointer"
                                        />
                                        <span className="text-sm font-medium text-[#708aa0]">
                                            I agree to the <span onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }} className="text-[#09637E] font-bold hover:underline">Terms of Service</span> and <span onClick={(e) => { e.preventDefault(); setShowPrivacyModal(true); }} className="text-[#09637E] font-bold hover:underline">Privacy Policy</span>.
                                        </span>
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={!isFormValid()}
                                        className={`w-full py-5 rounded-[1.25rem] font-black text-base transition-all duration-300 flex items-center justify-center gap-3 ${isFormValid() ? 'bg-gradient-to-r from-[#09637E] to-[#088395] text-white shadow-xl shadow-[#09637E]/20 hover:scale-[1.02] active:scale-[0.98]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                    >
                                        <span>Submit Application</span>
                                        <BsArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Right Side - Image & Branding */}
            <SidePanel />

            {/* Modals */}
            <Modal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} title={termsOfService.title}>
                <div className="space-y-4">
                    <p className="font-bold text-[#09637E]">{termsOfService.intro}</p>
                    <p className="text-xs text-[#708aa0] italic">{termsOfService.description}</p>
                    {termsOfService.sections.map((section, index) => (
                        <div key={index}>
                            <h4 className="font-bold text-[#09637E] mb-1">{section.title}</h4>
                            <p>{section.content}</p>
                        </div>
                    ))}
                </div>
            </Modal>

            <Modal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} title={privacyPolicy.title}>
                <div className="space-y-4">
                    <p className="font-bold text-[#09637E]">{privacyPolicy.intro}</p>
                    <p className="text-xs text-[#708aa0] italic">{privacyPolicy.description}</p>
                    {privacyPolicy.sections.map((section, index) => (
                        <div key={index}>
                            <h4 className="font-bold text-[#09637E] mb-1">{section.title}</h4>
                            <p>{section.content}</p>
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    );
};

export default VendorRegistration;
