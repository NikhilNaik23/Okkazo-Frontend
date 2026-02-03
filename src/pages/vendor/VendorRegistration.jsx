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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b2d49]/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl shadow-[#0b2d49]/20 animate-[scaleIn_0.3s_ease-out]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e9eff1]">
          <h2 className="text-lg font-black text-[#0b2d49]">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#e9eff1] hover:bg-[#d7a444]/20 flex items-center justify-center text-[#708aa0] hover:text-[#0b2d49] transition-all duration-200 hover:scale-110"
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
            className="w-full py-3 bg-gradient-to-r from-[#0b2d49] to-[#0b2d49]/90 text-white rounded-xl font-bold text-sm hover:from-[#d7a444] hover:to-[#d0a862] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
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
    
    switch(type) {
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
    switch(type) {
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
            style: { borderRadius: '16px', background: '#0b2d49', color: '#fff' }
        }
    );
  };

  if (step === 2) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#e9eff1] via-[#f3ddb1]/20 to-[#e9eff1] flex items-center justify-center p-4 font-sans relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-[#d7a444]/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#0b2d49]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            
            <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl shadow-[#0b2d49]/10 text-center animate-[fadeInUp_0.6s_ease-out] border border-white/50">
                <div className="w-20 h-20 bg-gradient-to-br from-[#d7a444]/20 to-[#d0a862]/30 rounded-[1.5rem] flex items-center justify-center text-[#d7a444] mx-auto mb-6 shadow-lg shadow-[#d7a444]/20 animate-bounce" style={{ animationDuration: '2s' }}>
                    <BsCheckCircle size={40} />
                </div>
                <h1 className="text-3xl font-black text-[#0b2d49] mb-3 tracking-tight">Application Received!</h1>
                <p className="text-[#708aa0] font-medium leading-relaxed mb-6 text-sm">
                    Thank you for applying to join Okkazo. Our team will review your details and get back to you within 24-48 hours via 
                    <span className="text-[#d7a444] font-bold"> {formData.email}</span>.
                </p>
                <div className="bg-gradient-to-br from-[#e9eff1]/80 to-[#f3ddb1]/20 rounded-xl p-5 mb-6 text-left border border-[#d7a444]/10">
                    <h3 className="text-[10px] font-black text-[#708aa0] uppercase tracking-widest mb-4">What Happens Next?</h3>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3 group">
                            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-[#d7a444] shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                                <BsClock size={14} />
                            </div>
                            <p className="text-xs text-[#5a5b44] font-bold pt-1">Verification of business documents</p>
                        </li>
                        <li className="flex items-start gap-3 group">
                            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-[#d7a444] shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                                <BsCalendarCheck size={14} />
                            </div>
                            <p className="text-xs text-[#5a5b44] font-bold pt-1">Scheduling a quick onboarding call</p>
                        </li>
                    </ul>
                </div>
                <button 
                   onClick={() => window.location.href = '/'}
                   className="w-full py-4 bg-gradient-to-r from-[#0b2d49] to-[#0b2d49]/90 text-white rounded-xl font-bold hover:from-[#d7a444] hover:to-[#d0a862] transition-all duration-300 shadow-lg shadow-[#0b2d49]/20 hover:shadow-[#d7a444]/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e9eff1] via-[#f3ddb1]/10 to-[#e9eff1] py-10 px-4 font-sans relative overflow-hidden">
      {/* Animated background decorations */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#d7a444]/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-[#0b2d49]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-[#5a5b44]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      
      <div className="max-w-2xl mx-auto relative">
        {/* Registration Header */}
        <div className="text-center mb-8 animate-[fadeInDown_0.7s_ease-out]">
          <div className="inline-block p-3 bg-gradient-to-br from-[#0b2d49] to-[#0b2d49]/80 rounded-2xl mb-4 shadow-xl shadow-[#0b2d49]/20 hover:scale-110 transition-transform duration-300 cursor-pointer">
            <BsShop size={26} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#0b2d49] mb-2 tracking-tight">Become a Vendor</h1>
          <p className="text-[#708aa0] font-medium text-sm max-w-md mx-auto leading-relaxed">
            Expand your reach and manage your event services through Okkazo.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white via-[#f3ddb1]/20 to-[#d0a862]/10 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 shadow-2xl shadow-[#0b2d49]/10 border border-[#d7a444]/10 animate-[fadeInUp_0.8s_ease-out] hover:shadow-[#d7a444]/20 transition-shadow duration-500">
          <div className="space-y-6">
            
            {/* Business Basics */}
            <section className="space-y-4 group/section">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 bg-gradient-to-br from-[#f3ddb1] to-[#d0a862]/30 rounded-xl flex items-center justify-center text-[#d7a444] shadow-sm group-hover/section:scale-110 transition-transform duration-300">
                  <BsShop size={16} />
                </div>
                <h2 className="text-lg font-black text-[#0b2d49]">Business Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#0b2d49] uppercase tracking-widest ml-1">Business Name *</label>
                  <input 
                    type="text" 
                    name="businessName"
                    required
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="Enter legal business name" 
                    className="w-full bg-[#e9eff1]/50 rounded-xl py-3 px-4 border border-transparent focus:border-[#d7a444]/30 focus:ring-2 focus:ring-[#d7a444]/10 focus:bg-white transition-all duration-300 font-medium text-sm placeholder:text-[#708aa0] hover:bg-[#e9eff1]/70"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#0b2d49] uppercase tracking-widest ml-1">Service Category *</label>
                  <select 
                    name="serviceCategory"
                    required
                    value={formData.serviceCategory}
                    onChange={handleInputChange}
                    className="w-full bg-[#e9eff1]/50 rounded-xl py-3 px-4 border border-transparent focus:border-[#d7a444]/30 focus:ring-2 focus:ring-[#d7a444]/10 focus:bg-white transition-all duration-300 font-medium text-sm text-[#0b2d49] hover:bg-[#e9eff1]/70 cursor-pointer"
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* Contact Info */}
            <section className="space-y-4 group/section">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 bg-gradient-to-br from-[#e9eff1] to-[#708aa0]/20 rounded-xl flex items-center justify-center text-[#0b2d49] shadow-sm group-hover/section:scale-110 transition-transform duration-300">
                  <BsEnvelope size={16} />
                </div>
                <h2 className="text-lg font-black text-[#0b2d49]">Contact Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 relative group">
                  <label className="text-[10px] font-black text-[#0b2d49] uppercase tracking-widest ml-1">Business Email *</label>
                  <BsEnvelope className="absolute left-4 top-[2.1rem] text-[#708aa0] group-focus-within:text-[#d7a444] transition-colors duration-300" size={14} />
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@business.com" 
                    className="w-full bg-[#e9eff1]/50 rounded-xl py-3 pl-10 pr-4 border border-transparent focus:border-[#d7a444]/30 focus:ring-2 focus:ring-[#d7a444]/10 focus:bg-white transition-all duration-300 font-medium text-sm placeholder:text-[#708aa0] hover:bg-[#e9eff1]/70"
                  />
                </div>
                <div className="space-y-1.5 relative group">
                  <label className="text-[10px] font-black text-[#0b2d49] uppercase tracking-widest ml-1">Phone Number *</label>
                  <BsPhone className="absolute left-4 top-[2.1rem] text-[#708aa0] group-focus-within:text-[#d7a444] transition-colors duration-300" size={14} />
                  <input 
                    type="tel" 
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000" 
                    className="w-full bg-[#e9eff1]/50 rounded-xl py-3 pl-10 pr-4 border border-transparent focus:border-[#d7a444]/30 focus:ring-2 focus:ring-[#d7a444]/10 focus:bg-white transition-all duration-300 font-medium text-sm placeholder:text-[#708aa0] hover:bg-[#e9eff1]/70"
                  />
                </div>
              </div>
              <div className="space-y-1.5 relative group">
                <label className="text-[10px] font-black text-[#0b2d49] uppercase tracking-widest ml-1">Primary Location *</label>
                <BsMap className="absolute left-4 top-[2.1rem] text-[#708aa0] group-focus-within:text-[#d7a444] transition-colors duration-300" size={14} />
                <input 
                    type="text" 
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, State (e.g., New York, NY)" 
                    className="w-full bg-[#e9eff1]/50 rounded-xl py-3 pl-10 pr-4 border border-transparent focus:border-[#d7a444]/30 focus:ring-2 focus:ring-[#d7a444]/10 focus:bg-white transition-all duration-300 font-medium text-sm placeholder:text-[#708aa0] hover:bg-[#e9eff1]/70"
                />
              </div>
            </section>

            {/* Description */}
            <section className="space-y-1.5">
              <label className="text-[10px] font-black text-[#0b2d49] uppercase tracking-widest ml-1">Service Description</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell us more about your services, experience, and what makes you unique..."
                className="w-full h-24 bg-[#e9eff1]/50 rounded-xl py-3 px-4 border border-transparent focus:border-[#d7a444]/30 focus:ring-2 focus:ring-[#d7a444]/10 focus:bg-white transition-all duration-300 font-medium text-sm placeholder:text-[#708aa0] resize-none hover:bg-[#e9eff1]/70"
              ></textarea>
            </section>

            {/* Documents Upload */}
            <section className="space-y-4 group/section">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 bg-gradient-to-br from-[#d0a862]/30 to-[#d7a444]/20 rounded-xl flex items-center justify-center text-[#d7a444] shadow-sm group-hover/section:scale-110 transition-transform duration-300">
                  <BsFileEarmarkText size={16} />
                </div>
                <h2 className="text-lg font-black text-[#0b2d49]">Documents Upload</h2>
              </div>
              <p className="text-[#708aa0] text-[11px] font-medium ml-11">
                Upload verification documents (PDF, JPG, PNG - Max 5MB)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Business License Upload */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#0b2d49] uppercase tracking-widest ml-1">
                    Business License *
                  </label>
                  <input
                    type="file"
                    ref={businessLicenseRef}
                    onChange={(e) => handleFileUpload(e, 'businessLicense')}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                  {!businessLicense ? (
                    <div
                      onClick={() => businessLicenseRef.current?.click()}
                      className="w-full bg-[#e9eff1]/50 rounded-xl p-4 border-2 border-dashed border-[#708aa0]/20 hover:border-[#d7a444] hover:bg-gradient-to-br hover:from-[#f3ddb1]/20 hover:to-[#d7a444]/5 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#f3ddb1] to-[#d0a862]/50 rounded-lg flex items-center justify-center text-[#d7a444] group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                          <BsCloudUpload size={18} />
                        </div>
                        <div>
                          <p className="text-[#0b2d49] font-bold text-xs">Click to upload</p>
                          <p className="text-[#708aa0] text-[10px]">Business certificate</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full bg-gradient-to-r from-[#e9eff1]/70 to-[#f3ddb1]/20 rounded-xl p-3 border border-[#d7a444]/20 flex items-center justify-between animate-[fadeIn_0.3s_ease-out]">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#f3ddb1] to-[#d0a862]/50 rounded-lg flex items-center justify-center text-[#d7a444] shadow-sm">
                          <BsFileEarmarkText size={14} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[#0b2d49] font-bold text-xs truncate max-w-[100px]">{businessLicense.name}</p>
                          <p className="text-[#708aa0] text-[10px]">{(businessLicense.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile('businessLicense')}
                        className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-100 hover:scale-110 transition-all duration-200"
                      >
                        <BsTrash size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Owner Identity Upload */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#0b2d49] uppercase tracking-widest ml-1">
                    Owner Identity *
                  </label>
                  <input
                    type="file"
                    ref={ownerIdentityRef}
                    onChange={(e) => handleFileUpload(e, 'ownerIdentity')}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                  {!ownerIdentity ? (
                    <div
                      onClick={() => ownerIdentityRef.current?.click()}
                      className="w-full bg-[#e9eff1]/50 rounded-xl p-4 border-2 border-dashed border-[#708aa0]/20 hover:border-[#d7a444] hover:bg-gradient-to-br hover:from-[#f3ddb1]/20 hover:to-[#d7a444]/5 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#f3ddb1] to-[#d0a862]/50 rounded-lg flex items-center justify-center text-[#d7a444] group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                          <BsCloudUpload size={18} />
                        </div>
                        <div>
                          <p className="text-[#0b2d49] font-bold text-xs">Click to upload</p>
                          <p className="text-[#708aa0] text-[10px]">ID or passport</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full bg-gradient-to-r from-[#e9eff1]/70 to-[#f3ddb1]/20 rounded-xl p-3 border border-[#d7a444]/20 flex items-center justify-between animate-[fadeIn_0.3s_ease-out]">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#f3ddb1] to-[#d0a862]/50 rounded-lg flex items-center justify-center text-[#d7a444] shadow-sm">
                          <BsFileEarmarkText size={14} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[#0b2d49] font-bold text-xs truncate max-w-[100px]">{ownerIdentity.name}</p>
                          <p className="text-[#708aa0] text-[10px]">{(ownerIdentity.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile('ownerIdentity')}
                        className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-100 hover:scale-110 transition-all duration-200"
                      >
                        <BsTrash size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Other Proofs Upload */}
              <div className="space-y-1.5 mt-4">
                <label className="text-[10px] font-black text-[#0b2d49] uppercase tracking-widest ml-1">
                  Other Documents <span className="text-[#708aa0] font-medium normal-case">(Optional - Max 3)</span>
                </label>
                <input
                  type="file"
                  ref={otherProofsRef}
                  onChange={(e) => handleFileUpload(e, 'otherProofs')}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
                
                {/* Uploaded Files List */}
                {otherProofs.length > 0 && (
                  <div className="space-y-1.5 mb-2">
                    {otherProofs.map((file, index) => (
                      <div key={index} className="w-full bg-gradient-to-r from-[#e9eff1]/70 to-[#5a5b44]/5 rounded-lg p-2.5 border border-[#5a5b44]/15 flex items-center justify-between animate-[fadeIn_0.3s_ease-out] hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gradient-to-br from-[#5a5b44]/20 to-[#5a5b44]/10 rounded-md flex items-center justify-center text-[#5a5b44]">
                            <BsFileEarmarkText size={12} />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-[#0b2d49] font-medium text-xs truncate max-w-[180px]">{file.name}</p>
                            <p className="text-[#708aa0] text-[10px]">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('otherProofs', index)}
                          className="w-6 h-6 bg-red-50 rounded-md flex items-center justify-center text-red-500 hover:bg-red-100 hover:scale-110 transition-all duration-200"
                        >
                          <BsTrash size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button for Other Proofs */}
                {otherProofs.length < fileUploadConfig.maxOtherProofs && (
                  <div
                    onClick={() => otherProofsRef.current?.click()}
                    className="w-full bg-[#e9eff1]/50 rounded-xl p-3 border-2 border-dashed border-[#708aa0]/20 hover:border-[#5a5b44] hover:bg-gradient-to-br hover:from-[#5a5b44]/10 hover:to-[#5a5b44]/5 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#5a5b44]/15 to-[#5a5b44]/10 rounded-lg flex items-center justify-center text-[#5a5b44] group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <BsCloudUpload size={16} />
                      </div>
                      <div>
                        <p className="text-[#0b2d49] font-bold text-xs">Add more documents</p>
                        <p className="text-[#708aa0] text-[10px]">Portfolio, certifications, insurance</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Agreements */}
            <div className="pt-4 border-t border-[#e9eff1] flex flex-col gap-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-5 h-5 rounded-md border-[#708aa0]/30 text-[#d7a444] focus:ring-[#d7a444]/20 cursor-pointer transition-all hover:border-[#d7a444]" 
                />
                <span className="text-[#5a5b44] font-medium text-xs transition-colors group-hover:text-[#0b2d49]">
                    I agree to the <span onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }} className="text-[#d7a444] font-bold hover:underline cursor-pointer">Terms of Service</span> and <span onClick={(e) => { e.preventDefault(); setShowPrivacyModal(true); }} className="text-[#d7a444] font-bold hover:underline cursor-pointer">Privacy Policy</span>.
                </span>
              </label>
              
              <button 
                type="submit"
                disabled={!isFormValid()}
                className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group/btn ${isFormValid() ? 'bg-gradient-to-r from-[#0b2d49] to-[#0b2d49]/90 text-white hover:from-[#d7a444] hover:to-[#d0a862] shadow-lg shadow-[#0b2d49]/20 hover:shadow-[#d7a444]/30 hover:scale-[1.02] active:scale-[0.98]' : 'bg-gray-200 text-[#708aa0] cursor-not-allowed shadow-none'}`}
              >
                <span>Submit Application</span>
                <BsArrowRight className="group-hover/btn:translate-x-1 transition-transform duration-300" size={16} />
              </button>
            </div>
          </div>
        </form>

        {/* Footer Info */}
        <div className="mt-6 text-center text-[9px] font-black uppercase text-[#708aa0] tracking-[0.2em]">
          <span className="opacity-40">Secure Registration Process</span>
        </div>
      </div>

      {/* Terms of Service Modal */}
      <Modal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)} 
        title={termsOfService.title}
      >
        <div className="space-y-4">
          <p className="font-bold text-[#0b2d49]">{termsOfService.intro}</p>
          <p>{termsOfService.description}</p>
          
          <div className="space-y-3">
            {termsOfService.sections.map((section, index) => (
              <div key={index}>
                <h4 className="font-bold text-[#0b2d49] mb-1">{section.title}</h4>
                <p>{section.content}</p>
              </div>
            ))}
          </div>
          
          <p className="text-[#708aa0] text-xs mt-4">Last updated: {termsOfService.lastUpdated}</p>
        </div>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal 
        isOpen={showPrivacyModal} 
        onClose={() => setShowPrivacyModal(false)} 
        title={privacyPolicy.title}
      >
        <div className="space-y-4">
          <p className="font-bold text-[#0b2d49]">{privacyPolicy.intro}</p>
          <p>{privacyPolicy.description}</p>
          
          <div className="space-y-3">
            {privacyPolicy.sections.map((section, index) => (
              <div key={index}>
                <h4 className="font-bold text-[#0b2d49] mb-1">{section.title}</h4>
                <p>{section.content}</p>
              </div>
            ))}
          </div>
          
          <p className="text-[#708aa0] text-xs mt-4">Last updated: {privacyPolicy.lastUpdated}</p>
        </div>
      </Modal>
    </div>
  );
};

export default VendorRegistration;
