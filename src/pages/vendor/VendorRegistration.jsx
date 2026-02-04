import React, { useState, useRef, useEffect } from "react";
import {
  BsShop,
  BsEnvelope,
  BsPhone,
  BsMap,
  BsPerson,
  BsInfoCircle,
  BsCheckCircle,
  BsArrowRight,
  BsXCircle,
  BsCalendarCheck,
  BsClock,
  BsCloudUpload,
  BsFileEarmarkText,
  BsTrash,
  BsX
} from "react-icons/bs";
import { toast } from "react-hot-toast";
import { vendorServiceCategories } from "../../data/planningWizardData";
import { termsOfService, privacyPolicy, fileUploadConfig } from "../../data/vendorRegistrationData";

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09637E]/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl shadow-[#09637E]/20 animate-[scaleIn_0.3s_ease-out]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e9eff1]">
          <h2 className="text-lg font-black text-[#09637E]">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#e9eff1] hover:bg-[#088395]/20 flex items-center justify-center text-[#708aa0] hover:text-[#09637E] transition-all duration-200 hover:scale-110"
          >
            <BsX size={20} />
          </button>
        </div>
        {/* Modal Content */}
        <div className="p-5 overflow-y-auto max-h-[60vh] text-sm text-[#5a5b44] leading-relaxed">
          {children}
        </div>
        {/* Modal Footer */}
        <div className="p-5 border-t border-[#e9eff1] bg-[#e9eff1]/30">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-[#09637E] to-[#088395] text-white rounded-xl font-bold text-sm hover:from-[#088395] hover:to-[#09637E] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

const VendorRegistration = () => {
  const [step, setStep] = useState(1); // 1: Form, 2: Success
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

  // Handle file uploads
  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > fileUploadConfig.maxFileSize) {
      toast.error("File size must be less than 5MB.");
      return;
    }

    // Validate file type
    const allowedTypes = fileUploadConfig.allowedTypes;
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF, JPG, and PNG files are allowed");
      return;
    }

    switch (type) {
      case 'businessLicense':
        setBusinessLicense(file);
        toast.success("Business license uploaded");
        break;
      case 'ownerIdentity':
        setOwnerIdentity(file);
        toast.success("Owner identity uploaded");
        break;
      case 'otherProofs':
        if (otherProofs.length >= 3) {
          toast.error("Maximum 3 additional documents allowed");
          return;
        }
        setOtherProofs([...otherProofs, file]);
        toast.success("Document uploaded");
        break;
      default:
        break;
    }
  };

  // Remove uploaded file
  const removeFile = (type, index = null) => {
    switch (type) {
      case 'businessLicense':
        setBusinessLicense(null);
        if (businessLicenseRef.current) businessLicenseRef.current.value = '';
        break;
      case 'ownerIdentity':
        setOwnerIdentity(null);
        if (ownerIdentityRef.current) ownerIdentityRef.current.value = '';
        break;
      case 'otherProofs':
        setOtherProofs(otherProofs.filter((_, i) => i !== index));
        break;
      default:
        break;
    }
  };

  // Form Section Data
  const categories = vendorServiceCategories;

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
    return (
      <div className="min-h-screen bg-[#EBF4F6] flex items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#088395]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#09637E]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl shadow-[#09637E]/10 text-center animate-[fadeInUp_0.6s_ease-out] border border-white/50">
          <div className="w-20 h-20 bg-gradient-to-br from-[#088395]/20 to-[#09637E]/30 rounded-[1.5rem] flex items-center justify-center text-[#088395] mx-auto mb-6 shadow-lg shadow-[#088395]/20 animate-bounce" style={{ animationDuration: '2s' }}>
            <BsCheckCircle size={40} />
          </div>
          <h1 className="text-3xl font-black text-[#09637E] mb-3 tracking-tight">Application Received!</h1>
          <p className="text-[#708aa0] font-medium leading-relaxed mb-6 text-sm">
            Thank you for applying to join Okkazo. Our team will review your details and get back to you within 24-48 hours via
            <span className="text-[#088395] font-bold"> {formData.email}</span>.
          </p>
          <div className="bg-[#EBF4F6]/50 rounded-2xl p-6 mb-6 text-left border border-[#7AB2B2]/20">
            <h3 className="text-[10px] font-black text-[#09637E] uppercase tracking-[0.2em] mb-4">What Happens Next?</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-4 group">
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-[#088395] shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                  <BsClock size={16} />
                </div>
                <div className="pt-0.5">
                  <p className="text-xs text-[#09637E] font-black uppercase tracking-wider">Verification</p>
                  <p className="text-[11px] text-[#708aa0] font-medium">Review of business documents</p>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-[#088395] shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                  <BsCalendarCheck size={16} />
                </div>
                <div className="pt-0.5">
                  <p className="text-xs text-[#09637E] font-black uppercase tracking-wider">Onboarding</p>
                  <p className="text-[11px] text-[#708aa0] font-medium">Scheduling a quick intro call</p>
                </div>
              </li>
            </ul>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-4 bg-gradient-to-r from-[#09637E] to-[#088395] text-white rounded-xl font-black hover:from-[#088395] hover:to-[#09637E] transition-all duration-300 shadow-xl shadow-[#09637E]/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
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
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Conditional Other Category Input */}
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
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#09637E] uppercase tracking-widest ml-1">Business License *</label>
                      <input type="file" ref={businessLicenseRef} onChange={(e) => handleFileUpload(e, 'businessLicense')} accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
                      {!businessLicense ? (
                        <div onClick={() => businessLicenseRef.current?.click()} className="w-full bg-[#EBF4F6]/50 rounded-2xl p-5 border-2 border-dashed border-[#7AB2B2]/30 hover:border-[#7AB2B2] hover:bg-white transition-all duration-300 cursor-pointer group text-center">
                          <BsCloudUpload size={24} className="mx-auto mb-2 text-[#7AB2B2] group-hover:scale-110 transition-transform" />
                          <p className="text-[#09637E] font-bold text-xs">Tap to upload</p>
                        </div>
                      ) : (
                        <div className="w-full bg-white rounded-2xl p-4 border border-[#7AB2B2]/20 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <BsFileEarmarkText className="text-[#09637E] shrink-0" />
                            <p className="text-[#09637E] font-bold text-xs truncate">{businessLicense.name}</p>
                          </div>
                          <button type="button" onClick={() => removeFile('businessLicense')} className="text-red-500 hover:scale-110 transition-transform"><BsTrash size={14} /></button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#09637E] uppercase tracking-widest ml-1">Owner Identity *</label>
                      <input type="file" ref={ownerIdentityRef} onChange={(e) => handleFileUpload(e, 'ownerIdentity')} accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
                      {!ownerIdentity ? (
                        <div onClick={() => ownerIdentityRef.current?.click()} className="w-full bg-[#EBF4F6]/50 rounded-2xl p-5 border-2 border-dashed border-[#7AB2B2]/30 hover:border-[#7AB2B2] hover:bg-white transition-all duration-300 cursor-pointer group text-center">
                          <BsCloudUpload size={24} className="mx-auto mb-2 text-[#7AB2B2] group-hover:scale-110 transition-transform" />
                          <p className="text-[#09637E] font-bold text-xs">Tap to upload</p>
                        </div>
                      ) : (
                        <div className="w-full bg-white rounded-2xl p-4 border border-[#7AB2B2]/20 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <BsFileEarmarkText className="text-[#09637E] shrink-0" />
                            <p className="text-[#09637E] font-bold text-xs truncate">{ownerIdentity.name}</p>
                          </div>
                          <button type="button" onClick={() => removeFile('ownerIdentity')} className="text-red-500 hover:scale-110 transition-transform"><BsTrash size={14} /></button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Other Proofs */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-[#09637E] uppercase tracking-widest ml-1">Additional Proofs (Optional)</label>
                    <input type="file" ref={otherProofsRef} onChange={(e) => handleFileUpload(e, 'otherProofs')} accept=".pdf,.jpg,.jpeg,.png" className="hidden" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {otherProofs.map((file, index) => (
                        <div key={index} className="w-full bg-white rounded-2xl p-4 border border-[#7AB2B2]/20 flex items-center justify-between shadow-sm animate-[fadeInUp_0.3s_ease-out]">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <BsFileEarmarkText className="text-[#09637E] shrink-0" />
                            <p className="text-[#09637E] font-bold text-xs truncate">{file.name}</p>
                          </div>
                          <button type="button" onClick={() => removeFile('otherProofs', index)} className="text-red-500 hover:scale-110 transition-transform"><BsTrash size={14} /></button>
                        </div>
                      ))}

                      {otherProofs.length < 3 && (
                        <div
                          onClick={() => otherProofsRef.current?.click()}
                          className="w-full bg-[#EBF4F6]/50 rounded-2xl p-4 border-2 border-dashed border-[#7AB2B2]/30 hover:border-[#7AB2B2] hover:bg-white transition-all duration-300 cursor-pointer group flex items-center justify-center gap-3"
                        >
                          <BsCloudUpload size={18} className="text-[#7AB2B2] group-hover:scale-110 transition-transform" />
                          <p className="text-[#09637E] font-bold text-xs">Add Document ({otherProofs.length}/3)</p>
                        </div>
                      )}
                    </div>
                  </div>
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
      <div className="hidden lg:flex w-1/2 h-full relative bg-[#09637E] items-center justify-center overflow-hidden">
        {/* Background Image */}
        <img
          src="/vendor_hero.png"
          alt="Vendors marketplace"
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
        />

        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09637E] via-transparent to-[#09637E]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09637E]/60 to-transparent" />

        {/* Content */}
        <div className="relative z-10 p-16 text-white max-w-xl">
          <div className="bg-white/10 backdrop-blur-xl w-16 h-16 rounded-2xl flex items-center justify-center mb-10 border border-white/20">
            <BsShop size={32} />
          </div>
          <h2 className="text-6xl font-black mb-8 leading-[1.1]">Grow your business with Okkazo.</h2>
          <p className="text-xl text-white/80 leading-relaxed mb-12">
            Join thousands of premium vendors offering world-class services to visionary event organizers across the globe.
          </p>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <h4 className="text-3xl font-black text-[#7AB2B2]">0</h4>
              <p className="text-sm font-bold uppercase tracking-widest text-white/60">Active Events</p>
            </div>
            <div className="space-y-3">
              <h4 className="text-3xl font-black text-[#7AB2B2]">24/7</h4>
              <p className="text-sm font-bold uppercase tracking-widest text-white/60">Expert Support</p>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="absolute top-12 right-12 flex items-center gap-3">
          <img src="/public_logo.png" alt="Okkazo" className="h-10 w-auto opacity-80" />
        </div>
      </div>

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
