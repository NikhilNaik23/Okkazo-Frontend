import React, { useState } from "react";
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
  BsClock
} from "react-icons/bs";
import { toast } from "react-hot-toast";

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

  // Form Section Data
  const categories = ["Catering", "Photography", "Venue", "Decor", "Entertainment", "Other"];

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
        <div className="min-h-screen bg-[#e9eff1] flex items-center justify-center p-6 font-sans">
            <div className="max-w-xl w-full bg-white rounded-[3rem] p-12 shadow-2xl shadow-[#0b2d49]/10 text-center animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-50 rounded-[2.5rem] flex items-center justify-center text-green-500 mx-auto mb-8 shadow-sm border border-green-100">
                    <BsCheckCircle size={48} />
                </div>
                <h1 className="text-4xl font-black text-[#0b2d49] mb-4 tracking-tight">Application Received!</h1>
                <p className="text-[#708aa0] font-medium leading-relaxed mb-10 text-lg">
                    Thank you for applying to join Okkazo. Our team will review your details and get back to you within 24-48 hours via 
                    <span className="text-[#0b2d49] font-bold"> {formData.email}</span>.
                </p>
                <div className="bg-[#e9eff1]/50 rounded-[2rem] p-8 mb-10 text-left border border-[#708aa0]/5">
                    <h3 className="text-xs font-black text-[#708aa0] uppercase tracking-widest mb-6">What Happens Next?</h3>
                    <ul className="space-y-6">
                        <li className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-[#d7a444] shadow-sm shrink-0">
                                <BsClock />
                            </div>
                            <p className="text-sm text-[#5a5b44] font-bold pt-1.5">Verification of business documents</p>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-[#d7a444] shadow-sm shrink-0">
                                <BsCalendarCheck />
                            </div>
                            <p className="text-sm text-[#5a5b44] font-bold pt-1.5">Scheduling a quick onboarding call</p>
                        </li>
                    </ul>
                </div>
                <button 
                   onClick={() => window.location.href = '/'}
                   className="w-full py-5 bg-[#0b2d49] text-white rounded-[1.5rem] font-bold text-lg hover:bg-[#d7a444] transition-all shadow-xl shadow-[#0b2d49]/20"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e9eff1] py-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Registration Header */}
        <div className="text-center mb-16 animate-in slide-in-from-top-10 duration-700">
          <div className="inline-block p-4 bg-[#0b2d49] rounded-3xl mb-6 shadow-xl shadow-[#0b2d49]/10">
            <BsShop size={32} className="text-white" />
          </div>
          <h1 className="text-5xl font-black text-[#0b2d49] mb-4 tracking-tighter">Become a Vendor</h1>
          <p className="text-[#708aa0] font-medium text-lg max-w-lg mx-auto leading-relaxed">
            Expand your reach and manage your event services through the all-in-one Okkazo dashboard.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[3.5rem] p-10 md:p-16 shadow-2xl shadow-[#0b2d49]/5 border border-[#708aa0]/5 animate-in fade-in duration-1000">
          <div className="space-y-12">
            
            {/* Business Basics */}
            <section className="space-y-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 bg-[#f3ddb1] rounded-2xl flex items-center justify-center text-[#d7a444] shadow-sm">
                  <BsShop size={20} />
                </div>
                <h2 className="text-2xl font-black text-[#0b2d49]">Business Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-black text-[#0b2d49] uppercase tracking-widest ml-1">Business Name *</label>
                  <input 
                    type="text" 
                    name="businessName"
                    required
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="Enter legal business name" 
                    className="w-full bg-[#e9eff1]/50 rounded-2xl py-5 px-6 border-none focus:ring-2 focus:ring-[#d7a444]/20 focus:bg-white transition-all font-medium placeholder:text-[#708aa0]"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-black text-[#0b2d49] uppercase tracking-widest ml-1">Service Category *</label>
                  <select 
                    name="serviceCategory"
                    required
                    value={formData.serviceCategory}
                    onChange={handleInputChange}
                    className="w-full bg-[#e9eff1]/50 rounded-2xl py-5 px-6 border-none focus:ring-2 focus:ring-[#d7a444]/20 focus:bg-white transition-all font-medium text-[#0b2d49]"
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* Contact Info */}
            <section className="space-y-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 bg-[#e9eff1] rounded-2xl flex items-center justify-center text-[#0b2d49] shadow-sm">
                  <BsEnvelope size={20} />
                </div>
                <h2 className="text-2xl font-black text-[#0b2d49]">Contact Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3 relative group">
                  <label className="text-sm font-black text-[#0b2d49] uppercase tracking-widest ml-1">Business Email *</label>
                  <BsEnvelope className="absolute left-6 top-[3.7rem] text-[#708aa0] group-focus-within:text-[#0b2d49] transition-colors" />
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@business.com" 
                    className="w-full bg-[#e9eff1]/50 rounded-2xl py-5 pl-14 pr-6 border-none focus:ring-2 focus:ring-[#d7a444]/20 focus:bg-white transition-all font-medium placeholder:text-[#708aa0]"
                  />
                </div>
                <div className="space-y-3 relative group">
                  <label className="text-sm font-black text-[#0b2d49] uppercase tracking-widest ml-1">Phone Number *</label>
                  <BsPhone className="absolute left-6 top-[3.7rem] text-[#708aa0] group-focus-within:text-[#0b2d49] transition-colors" />
                  <input 
                    type="tel" 
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000" 
                    className="w-full bg-[#e9eff1]/50 rounded-2xl py-5 pl-14 pr-6 border-none focus:ring-2 focus:ring-[#d7a444]/20 focus:bg-white transition-all font-medium placeholder:text-[#708aa0]"
                  />
                </div>
              </div>
              <div className="space-y-3 relative group">
                <label className="text-sm font-black text-[#0b2d49] uppercase tracking-widest ml-1">Primary Location *</label>
                <BsMap className="absolute left-6 top-[3.7rem] text-[#708aa0] group-focus-within:text-[#0b2d49] transition-colors" />
                <input 
                    type="text" 
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, State (e.g., New York, NY)" 
                    className="w-full bg-[#e9eff1]/50 rounded-2xl py-5 pl-14 pr-6 border-none focus:ring-2 focus:ring-[#d7a444]/20 focus:bg-white transition-all font-medium placeholder:text-[#708aa0]"
                />
              </div>
            </section>

            {/* Description */}
            <section className="space-y-3">
              <label className="text-sm font-black text-[#0b2d49] uppercase tracking-widest ml-1">Service Description</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell us more about your services, experience, and what makes you unique..."
                className="w-full h-40 bg-[#e9eff1]/50 rounded-[2rem] py-5 px-6 border-none focus:ring-2 focus:ring-[#d7a444]/20 focus:bg-white transition-all font-medium placeholder:text-[#708aa0] resize-none"
              ></textarea>
            </section>

            {/* Agreements */}
            <div className="pt-6 border-t border-gray-100 flex flex-col gap-6">
              <label className="flex items-center gap-4 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-6 h-6 rounded-lg border-[#708aa0]/30 text-[#d7a444] focus:ring-[#d7a444]/20 cursor-pointer" 
                />
                <span className="text-[#5a5b44] font-medium text-sm transition-colors group-hover:text-[#0b2d49]">
                    I agree to the <span className="text-[#d7a444] font-bold hover:underline">Terms of Service</span> and <span className="text-[#d7a444] font-bold hover:underline">Privacy Policy</span>.
                </span>
              </label>
              
              <button 
                type="submit"
                disabled={!isFormValid()}
                className={`w-full py-6 rounded-[2rem] font-black text-xl transition-all shadow-xl flex items-center justify-center gap-3 relative overflow-hidden group/btn ${isFormValid() ? 'bg-[#0b2d49] text-white hover:bg-[#d7a444] shadow-[#0b2d49]/20 active:translate-y-1' : 'bg-gray-200 text-[#708aa0] cursor-not-allowed shadow-none'}`}
              >
                <span>Submit Application</span>
                <BsArrowRight className="group-hover/btn:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </form>

        {/* Footer Info */}
        <div className="mt-12 text-center text-[10px] font-black uppercase text-[#708aa0] tracking-[0.3em]">
          <span className="opacity-50">Secure Registration Process</span>
        </div>
      </div>
    </div>
  );
};

export default VendorRegistration;
