import React, { useCallback, useEffect, useState } from "react";
import {
  BsShieldLock,
  BsBell,
  BsEnvelope,
  BsPhone,
  BsLock,
  BsQuestionCircle,
  BsCreditCard
} from "react-icons/bs";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import {
  isStrongPassword,
  PASSWORD_REQUIREMENTS_MESSAGE,
} from "../../utils/passwordValidation";
import { fetchWithAuth } from "../../utils/apiHandler";
import { refreshAccessToken } from "../../store/slices/authSlice";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const safeJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const AccountSettings = () => {
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState({
    email: true,
    app: true,
    marketing: false
  });

  const [vendorInfo] = useState({
    email: "contact@gourmetcatering.com",
    phone: "+1 (555) 123-4567"
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [payoutStatus, setPayoutStatus] = useState(null);
  const [isLoadingPayoutStatus, setIsLoadingPayoutStatus] = useState(false);
  const [isCreatingOnboardingLink, setIsCreatingOnboardingLink] = useState(false);

  const hasPasswordInput =
    passwordForm.currentPassword ||
    passwordForm.newPassword ||
    passwordForm.confirmNewPassword;

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (hasPasswordInput) {
      if (!passwordForm.currentPassword) {
        toast.error("Please enter your current password.");
        return;
      }

      if (!isStrongPassword(passwordForm.newPassword)) {
        toast.error(PASSWORD_REQUIREMENTS_MESSAGE);
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
        toast.error("New password and confirm password do not match.");
        return;
      }
    }

    toast.success("Account changes saved successfully!", {
      style: {
        borderRadius: '16px',
        background: '#0b2d49',
        color: '#fff',
        fontWeight: 'bold'
      }
    });
  };

  const Toggle = ({ enabled, onChange }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`w-14 h-8 rounded-full transition-all relative ${enabled ? 'bg-[#10b981]' : 'bg-gray-200'}`}
    >
      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${enabled ? 'left-7' : 'left-1'}`}></div>
    </button>
  );

  const loadPayoutStatus = useCallback(async () => {
    setIsLoadingPayoutStatus(true);
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/orders/vendor-payouts/onboarding-status`,
        { method: "GET" },
        { dispatch, refreshAction: refreshAccessToken }
      );

      const data = await safeJson(response);
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to load payout status");
      }

      setPayoutStatus(data.data || null);
    } catch (error) {
      toast.error(error?.message || "Failed to load payout status");
    } finally {
      setIsLoadingPayoutStatus(false);
    }
  }, [dispatch]);

  const handleConnectPayouts = async () => {
    const mode = String(payoutStatus?.vendorPayoutMode || "DEMO").trim().toUpperCase();
    if (mode === "DEMO") {
      toast("Vendor payouts are currently in demo mode. Ask admin to switch to Razorpay mode for live onboarding.");
      return;
    }

    setIsCreatingOnboardingLink(true);
    try {
      const callbackUrl = `${window.location.origin}${window.location.pathname}`;
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/orders/vendor-payouts/onboarding-link`,
        {
          method: "POST",
          body: JSON.stringify({ callbackUrl }),
        },
        { dispatch, refreshAction: refreshAccessToken }
      );

      const data = await safeJson(response);
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to create onboarding link");
      }

      const onboardingUrl = String(data?.data?.onboardingUrl || "").trim();
      if (!onboardingUrl) {
        throw new Error("Razorpay onboarding URL is missing");
      }

      window.open(onboardingUrl, "_blank", "noopener,noreferrer");
      toast.success("Razorpay onboarding opened in a new tab");
      loadPayoutStatus();
    } catch (error) {
      toast.error(error?.message || "Failed to start payout onboarding");
    } finally {
      setIsCreatingOnboardingLink(false);
    }
  };

  useEffect(() => {
    loadPayoutStatus();
  }, [loadPayoutStatus]);

  const onboardingStatus = String(payoutStatus?.onboardingStatus || "NOT_STARTED").trim().toUpperCase();
  const payoutsEnabled = Boolean(payoutStatus?.payoutsEnabled);
  const vendorPayoutMode = String(payoutStatus?.vendorPayoutMode || "DEMO").trim().toUpperCase() === "RAZORPAY"
    ? "RAZORPAY"
    : "DEMO";
  const isDemoPayoutMode = vendorPayoutMode === "DEMO";

  const payoutBadge = isDemoPayoutMode
    ? { label: "Demo Mode", tone: "bg-indigo-50 text-indigo-700 border-indigo-200" }
    : payoutsEnabled
    ? { label: "Connected", tone: "bg-green-50 text-green-700 border-green-200" }
    : onboardingStatus === "PENDING"
      ? { label: "Pending Setup", tone: "bg-amber-50 text-amber-700 border-amber-200" }
      : onboardingStatus === "REJECTED"
        ? { label: "Needs Attention", tone: "bg-red-50 text-red-700 border-red-200" }
        : { label: "Not Connected", tone: "bg-gray-50 text-gray-700 border-gray-200" };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <h1 className="text-3xl font-black mb-10 tracking-tight">Account Settings</h1>

      <div className="space-y-8">
        {/* Account Information */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#708aa0]/5 overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gray-50/30">
            <h2 className="text-xl font-black text-[#0b2d49] mb-1">Account Information</h2>
            <p className="text-xs text-[#708aa0] font-medium uppercase tracking-widest">Update your email address and security credentials.</p>
          </div>

          <div className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-black text-[#0b2d49] uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <BsEnvelope className="absolute left-6 top-1/2 -translate-y-1/2 text-[#708aa0]" />
                  <input
                    type="email"
                    disabled
                    value={vendorInfo.email}
                    className="w-full bg-gray-50/50 rounded-2xl py-4 pl-14 pr-6 border-none text-[#708aa0] font-bold cursor-not-allowed opacity-70"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-black text-[#0b2d49] uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative group">
                  <BsPhone className="absolute left-6 top-1/2 -translate-y-1/2 text-[#708aa0]" />
                  <input
                    type="text"
                    disabled
                    value={vendorInfo.phone}
                    className="w-full bg-gray-50/50 rounded-2xl py-4 pl-14 pr-6 border-none text-[#708aa0] font-bold cursor-not-allowed opacity-70"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <h3 className="text-sm font-black text-[#0b2d49] uppercase tracking-widest ml-1">Change Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative">
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Current Password"
                    className="w-full bg-[#e9eff1]/50 rounded-2xl py-4 px-6 border-none focus:ring-2 focus:ring-[#d7a444]/20 focus:bg-white transition-all font-medium placeholder:text-[#708aa0]"
                  />
                </div>
                <div className="relative">
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="New Password"
                    className="w-full bg-[#e9eff1]/50 rounded-2xl py-4 px-6 border-none focus:ring-2 focus:ring-[#d7a444]/20 focus:bg-white transition-all font-medium placeholder:text-[#708aa0]"
                  />
                </div>
                <div className="relative">
                  <input
                    type="password"
                    name="confirmNewPassword"
                    value={passwordForm.confirmNewPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Confirm New Password"
                    className="w-full bg-[#e9eff1]/50 rounded-2xl py-4 px-6 border-none focus:ring-2 focus:ring-[#d7a444]/20 focus:bg-white transition-all font-medium placeholder:text-[#708aa0]"
                  />
                </div>
              </div>
              <p className="text-xs text-[#708aa0] font-semibold">
                {PASSWORD_REQUIREMENTS_MESSAGE}
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                className="px-8 py-4 bg-[#10b981] text-white rounded-2xl font-bold hover:bg-[#0b2d49] transition-all shadow-lg active:scale-95"
              >
                Save Account Changes
              </button>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#708aa0]/5 overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gray-50/30">
            <h2 className="text-xl font-black text-[#0b2d49] mb-1">Notification Preferences</h2>
            <p className="text-xs text-[#708aa0] font-medium uppercase tracking-widest">Manage how you receive alerts and platform updates.</p>
          </div>

          <div className="p-10 space-y-6">
            <div className="flex items-center justify-between p-6 bg-gray-50/30 rounded-3xl border border-transparent hover:border-[#708aa0]/10 transition-all">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-white rounded-2xl text-[#d7a444] shadow-sm">
                  <BsEnvelope size={24} />
                </div>
                <div>
                  <h4 className="font-black text-[#0b2d49]">Email Notifications</h4>
                  <p className="text-xs text-[#708aa0] font-medium">Receive booking confirmations and invoices via email.</p>
                </div>
              </div>
              <Toggle
                enabled={notifications.email}
                onChange={(val) => setNotifications({ ...notifications, email: val })}
              />
            </div>

            <div className="flex items-center justify-between p-6 bg-gray-50/30 rounded-3xl border border-transparent hover:border-[#708aa0]/10 transition-all">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-white rounded-2xl text-[#0b2d49] shadow-sm">
                  <BsBell size={24} />
                </div>
                <div>
                  <h4 className="font-black text-[#0b2d49]">App Alerts</h4>
                  <p className="text-xs text-[#708aa0] font-medium">Get push notifications for new consultation requests.</p>
                </div>
              </div>
              <Toggle
                enabled={notifications.app}
                onChange={(val) => setNotifications({ ...notifications, app: val })}
              />
            </div>

            <div className="flex items-center justify-between p-6 bg-gray-50/30 rounded-3xl border border-transparent hover:border-[#708aa0]/10 transition-all">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-white rounded-2xl text-[#708aa0] shadow-sm">
                  <BsShieldLock size={24} />
                </div>
                <div>
                  <h4 className="font-black text-[#0b2d49]">Marketing Emails</h4>
                  <p className="text-xs text-[#708aa0] font-medium">Occasional tips on how to grow your vendor business.</p>
                </div>
              </div>
              <Toggle
                enabled={notifications.marketing}
                onChange={(val) => setNotifications({ ...notifications, marketing: val })}
              />
            </div>
          </div>
        </div>

        {/* Payout & Billing */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#708aa0]/5 overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gray-50/30">
            <h2 className="text-xl font-black text-[#0b2d49] mb-1">Payout & Billing Settings</h2>
            <p className="text-xs text-[#708aa0] font-medium uppercase tracking-widest">
              {isDemoPayoutMode
                ? "Demo payout mode is enabled by admin. No live Razorpay transfer will happen."
                : "Connect Razorpay payouts. Bank details stay inside Razorpay, not in Okkazo."}
            </p>
          </div>
          <div className="p-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 rounded-3xl border border-[#708aa0]/10 bg-[#f8fbfc] p-8">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-[#e9eff1] rounded-2xl flex items-center justify-center text-[#708aa0]">
                  <BsCreditCard size={24} />
                </div>
                <div>
                  <p className="text-sm font-black text-[#0b2d49] uppercase tracking-tight">Razorpay Payout Account</p>
                  <p className="text-xs text-[#708aa0] font-semibold mt-1">
                    Status: <span className={`inline-flex items-center px-2 py-0.5 rounded border ${payoutBadge.tone}`}>{payoutBadge.label}</span>
                  </p>
                  <p className="text-xs text-[#708aa0] font-medium mt-2 max-w-xl">
                    {isDemoPayoutMode
                      ? "Admin has enabled demo payout mode for testing. Vendors are treated as payout-ready without connecting Razorpay."
                      : "Complete onboarding on Razorpay to receive payouts. Okkazo stores only payout account linkage and payout amounts."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={loadPayoutStatus}
                  disabled={isLoadingPayoutStatus}
                  className="px-5 py-3 rounded-2xl border border-gray-200 bg-white text-[#0b2d49] font-bold text-sm hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoadingPayoutStatus ? "Refreshing..." : "Refresh Status"}
                </button>
                <button
                  onClick={handleConnectPayouts}
                  disabled={isCreatingOnboardingLink || isDemoPayoutMode}
                  className="px-5 py-3 rounded-2xl bg-[#10b981] text-white font-bold text-sm hover:bg-[#0b2d49] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isDemoPayoutMode
                    ? "Demo Mode Enabled"
                    : (isCreatingOnboardingLink
                      ? "Opening..."
                      : (payoutsEnabled ? "Reopen Razorpay Onboarding" : "Connect Razorpay Payouts"))}
                </button>
              </div>
            </div>

            <div className="mt-6 text-xs text-[#708aa0] font-semibold bg-white border border-[#708aa0]/10 rounded-2xl p-4">
              Payout formula: vendor receive = locked price - commission. Only settlement values and transfer identifiers are stored.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
