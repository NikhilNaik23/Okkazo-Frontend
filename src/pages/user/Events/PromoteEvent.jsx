import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { BsArrowRight } from "react-icons/bs";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';

// Wizard Components
import VerticalStepTransition from "../../../components/Forms/PromoteEvent/Wizard/VerticalStepTransition";
import StepDetails from "../../../components/Forms/PromoteEvent/Wizard/StepDetails";
import StepSphere from "../../../components/Forms/PromoteEvent/Wizard/StepSphere";
import StepMedia from "../../../components/Forms/PromoteEvent/Wizard/StepMedia";
import StepTickets from "../../../components/Forms/PromoteEvent/Wizard/StepTickets";
import StepSchedule from "../../../components/Forms/PromoteEvent/Wizard/StepSchedule";
import StepPromote from "../../../components/Forms/PromoteEvent/Wizard/StepPromote";
import StepVerify from "../../../components/Forms/PromoteEvent/Wizard/StepVerify";
import StepReview from "../../../components/Forms/PromoteEvent/Wizard/StepReview";
import PaymentConfirmation from "../../../components/User/Events/PaymentConfirmation";
import SuccessConfirmation from "../../../components/User/Events/SuccessConfirmation";

import { promoteEventSteps, initialPromoteEventState } from "../../../data/promoteEventData";
import {
    fetchFeesConfig,
    selectFeesStatus,
    selectPlatformFee,
    selectServiceChargePercent,
} from '../../../store/slices/feesSlice';
import { getInclusiveIstDayRange } from '../../../utils/istDateTime';
import { normalizeDayTierAllocations, validateDayTierAllocations } from '../../../utils/dayTierAllocation';

const DRAFT_STORAGE_KEY = 'promoteEventDraft_v3';

const buildDraftForStorage = (data) => {
    if (!data || typeof data !== 'object') return initialPromoteEventState;

    const { banner, bannerFile, authDocuments, ...rest } = data;

    return {
        ...initialPromoteEventState,
        ...rest,
        // Media files and previews can exceed localStorage quotas.
        banner: null,
        bannerFile: null,
        authDocuments: [],
    };
};

const PromoteEvent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const payForEvent = location.state?.payForEvent;
    const isPaymentOnlyEntry = Boolean(payForEvent?.eventId);

    const platformFee = useSelector(selectPlatformFee);
    const serviceChargePercent = useSelector(selectServiceChargePercent);
    const feesStatus = useSelector(selectFeesStatus);

    const [currentStep, setCurrentStep] = useState(1);
    const [isPaymentStep, setIsPaymentStep] = useState(() => !!payForEvent?.eventId);
    const [isSuccessStep, setIsSuccessStep] = useState(false);

    const [payContext] = useState(() => (
        payForEvent?.eventId
            ? {
                eventId: payForEvent.eventId,
                eventTitle: payForEvent.eventTitle,
                amount: payForEvent.amount,
              }
            : null
    ));

    const [formData, setFormData] = useState(() => {
        // Payment-only entry from Campaign Studio
        if (payForEvent?.eventId) {
            return {
                ...initialPromoteEventState,
                eventName: payForEvent.eventTitle || 'Promote Event',
                promotions: {},
                authDocuments: [],
            };
        }

        // Normal wizard entry: restore draft if present
        try {
            const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && typeof parsed === 'object') {
                    return { ...initialPromoteEventState, ...parsed };
                }
            }
        } catch (e) {
            console.error('Draft load failed', e);
        }

        return initialPromoteEventState;
    });

    useEffect(() => {
        setFormData((prev) => {
            const days = getInclusiveIstDayRange(prev.startDate, prev.endDate);
            const existing = prev.ticketDayAllocations && typeof prev.ticketDayAllocations === 'object'
                ? prev.ticketDayAllocations
                : {};
            const cap = parseInt(prev.totalCapacity, 10);
            const hasCap = Number.isFinite(cap) && cap > 0;

            const nextAllocations = {};
            for (const day of days) {
                const parsed = parseInt(existing[day], 10);
                if (!Number.isFinite(parsed) || parsed <= 0) {
                    nextAllocations[day] = '';
                    continue;
                }
                nextAllocations[day] = hasCap ? Math.min(parsed, cap) : parsed;
            }

            const existingKeys = Object.keys(existing);
            const nextKeys = Object.keys(nextAllocations);
            const allocationsUnchanged =
                existingKeys.length === nextKeys.length &&
                nextKeys.every((k) => String(existing[k] ?? '') === String(nextAllocations[k] ?? ''));

            const existingDayTier = prev.ticketDayTierAllocations && typeof prev.ticketDayTierAllocations === 'object'
                ? prev.ticketDayTierAllocations
                : {};
            const nextDayTier = normalizeDayTierAllocations({
                days,
                tickets: prev.tickets,
                existing: existingDayTier,
                dayAllocations: nextAllocations,
                ticketType: prev.ticketType,
            });

            const tierUnchanged = JSON.stringify(existingDayTier) === JSON.stringify(nextDayTier);

            if (allocationsUnchanged && tierUnchanged) return prev;
            return {
                ...prev,
                ticketDayAllocations: nextAllocations,
                ticketDayTierAllocations: nextDayTier,
            };
        });
    }, [formData.startDate, formData.endDate, formData.totalCapacity, formData.ticketType, formData.tickets]);

    const promoteScheduleDays = getInclusiveIstDayRange(formData.startDate, formData.endDate);
    const promoteDayAllocations = formData.ticketDayAllocations && typeof formData.ticketDayAllocations === 'object'
        ? formData.ticketDayAllocations
        : {};
    const promoteDayTierAllocations = formData.ticketDayTierAllocations && typeof formData.ticketDayTierAllocations === 'object'
        ? formData.ticketDayTierAllocations
        : {};
    const promoteAllocationValidation = validateDayTierAllocations({
        days: promoteScheduleDays,
        tickets: formData.tickets,
        dayAllocations: promoteDayAllocations,
        dayTierAllocations: promoteDayTierAllocations,
    });
    const hasPerDayTicketAllocations = promoteAllocationValidation.isValid;

    // Helper: Step definitions (calculated dynamically for completion status)
    const steps = promoteEventSteps.map(step => ({
        ...step,
        completed: (
            (step.id === 1 && !!formData.eventName && (formData.eventDescription?.trim().length || 0) >= 10) ||
            (step.id === 2 && !!formData.category && (formData.category !== 'Other' || !!formData.customCategory?.trim()) && (formData.interests?.length || 0) > 0) ||
            (step.id === 3 && !!formData.banner && !!formData.bannerFile) ||
            (step.id === 4 && !!formData.startDate && !!formData.endDate && !!formData.ticketReleaseDate && !!formData.ticketSalesEndDate && !!formData.address && !!formData.lat && !!formData.lng) ||
            (step.id === 5 &&
                formData.totalCapacity > 0 &&
                formData.tickets.length > 0 &&
                formData.tickets.reduce((sum, t) => sum + (parseInt(t.quantity) || 0), 0) === parseInt(formData.totalCapacity) &&
                formData.tickets.every(t => !!t.name && (formData.ticketType === 'free' || (t.price !== "" && t.price > 0))) &&
                (promoteScheduleDays.length === 0 || hasPerDayTicketAllocations)
            ) ||
            (step.id === 6) || // Promote is optional
            (step.id === 7 && formData.authDocuments?.length > 0) || // Verify: at least 1 doc
            (step.id === 8) // Review
        )
    }));

    const isCurrentStepCompleted = steps[currentStep - 1]?.completed;

    useEffect(() => {
        if (payContext?.eventId) return;
        try {
            const draft = buildDraftForStorage(formData);
            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
        } catch (e) {
            console.warn('Draft save failed', e);
            try {
                const draft = buildDraftForStorage(formData);
                localStorage.removeItem(DRAFT_STORAGE_KEY);
                localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
            } catch (retryError) {
                console.warn('Draft save retry failed', retryError);
            }
        }
    }, [formData, payContext]);

    useEffect(() => {
        // Wizard flow needs platform fee for payment.
        if (isPaymentOnlyEntry) return;
        if (feesStatus === 'loading' || platformFee != null) return;
        dispatch(fetchFeesConfig());
    }, [dispatch, isPaymentOnlyEntry, platformFee, feesStatus]);

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

    const getFinalizeValidationErrors = () => {
        const errors = [];

        const hasEventName = (formData.eventName || '').trim().length > 0;
        const hasDescription = (formData.eventDescription || '').trim().length >= 10;
        if (!hasEventName || !hasDescription) {
            errors.push('Complete Step 1: event name and description (min 10 characters).');
        }

        const hasCategory = !!formData.category;
        const hasCustomCategory = formData.category !== 'Other' || (formData.customCategory || '').trim().length > 0;
        const hasInterests = (formData.interests?.length || 0) > 0;
        if (!hasCategory || !hasCustomCategory || !hasInterests) {
            errors.push('Complete Step 2: category and at least one event field.');
        }

        if (!formData.banner || !formData.bannerFile) {
            errors.push('Complete Step 3: upload an event banner.');
        }

        const totalCapacity = parseInt(formData.totalCapacity, 10) || 0;
        const ticketRows = Array.isArray(formData.tickets) ? formData.tickets : [];
        const ticketQtySum = ticketRows.reduce((sum, t) => sum + (parseInt(t.quantity, 10) || 0), 0);
        const ticketsValid =
            totalCapacity > 0 &&
            ticketRows.length > 0 &&
            ticketRows.every((t) => !!t.name && (parseInt(t.quantity, 10) || 0) > 0) &&
            ticketQtySum === totalCapacity &&
            (
                formData.ticketType === 'free' ||
                ticketRows.every((t) => {
                    const price = parseFloat(t.price);
                    return Number.isFinite(price) && price > 0;
                })
            );
        const hasSchedule = !!formData.startDate && !!formData.endDate && !!formData.ticketReleaseDate && !!formData.ticketSalesEndDate;
        const hasVenue = (formData.address || '').trim().length > 0;
        const hasCoordinates = Number.isFinite(Number(formData.lat)) && Number.isFinite(Number(formData.lng));
        if (!hasSchedule || !hasVenue || !hasCoordinates) {
            errors.push('Complete Step 4: schedule, venue address, and map location.');
        }

        if (!ticketsValid) {
            errors.push('Complete Step 5: valid ticket tiers and quantities matching total tickets.');
        }

        if (promoteScheduleDays.length > 0 && !promoteAllocationValidation.isValid) {
            errors.push('Daily ticket totals must match per-tier day allocations and each tier total must match its quantity.');
        }

        if ((formData.authDocuments?.length || 0) === 0) {
            errors.push('Complete Step 7: upload at least one authenticity proof document.');
        }

        return errors;
    };

    // Navigation
    const handleNext = () => {
        if (currentStep < 8) {
            setCurrentStep(prev => prev + 1);
        } else {
            const validationErrors = getFinalizeValidationErrors();
            if (validationErrors.length > 0) {
                toast.error(validationErrors[0], {
                    id: 'promote-finalize-validation',
                    duration: 4500,
                    style: {
                        background: '#09637E',
                        color: '#EBF4F6',
                        fontSize: '11px',
                        fontWeight: 'bold',
                    },
                });
                return;
            }
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

    const handleStepClick = (idx) => {
        const targetStep = idx + 1;

        if (targetStep <= currentStep) {
            setCurrentStep(targetStep);
            return;
        }

        const missingStepIndex = steps.findIndex((step, i) => i + 1 < targetStep && !step.completed);
        if (missingStepIndex !== -1) {
            const missingStepNumber = missingStepIndex + 1;
            const message = missingStepNumber === 7
                ? 'Upload at least one authenticity proof in Step 7 before proceeding.'
                : `Complete Step ${missingStepNumber} before moving ahead.`;

            toast.error(message, {
                id: 'promote-step-guard',
                duration: 4000,
                style: {
                    background: '#09637E',
                    color: '#EBF4F6',
                    fontSize: '11px',
                    fontWeight: 'bold',
                },
            });

            setCurrentStep(missingStepNumber);
            return;
        }

        setCurrentStep(targetStep);
    };

    const handlePaymentSuccess = (eventId, transactionId) => {
        // If we entered as payment-only for an existing promote record, just show success.
        if (payContext?.eventId) {
            setIsPaymentStep(false);
            setIsSuccessStep(true);
            return;
        }

        // Build campaign object with real eventId from backend
        const isFree = formData.tickets.every(t => !t.price || parseFloat(t.price) === 0);

        const newCampaign = {
            id: eventId || `new_${Date.now()}`,
            title: formData.eventName || "Untitled Event",
            subtitle: (formData.category || "Uncategorized").toUpperCase(),
            status: "Pending Review",
            revenue: isFree ? "-" : "₹0.00",
            revenueLabel: isFree ? "Free Event" : "Projected Revenue",
            conversion: null,
            centerText: "In Review",
            gradient: "bg-gradient-to-b from-[#EBF4F6]/80 via-[#7AB2B2]/20 to-white/90",
            buttonText: "View Submission",
            transactionId: transactionId || null,
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
        localStorage.removeItem(DRAFT_STORAGE_KEY);
    };

    // Render Logic
    if (isSuccessStep) return <SuccessConfirmation />;

    return (
        <div className="flex min-h-screen bg-[#EBF4F6] font-sans text-[#09637E] overflow-hidden relative">
            {/* Sidebar / Vertical Transition */}
            <div className="relative z-20">
                <VerticalStepTransition
                    currentStep={currentStep - 1} // 0-based index for visual transition
                    steps={steps}
                    onStepClick={handleStepClick}
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
                                platformFee={platformFee ?? 15000}
                                setCurrentStep={() => {
                                    if (payContext?.eventId) {
                                        navigate('/user/my-events');
                                    } else {
                                        setIsPaymentStep(false);
                                    }
                                }}
                                handlePaymentSuccess={handlePaymentSuccess}
                                existingPayment={payContext ? {
                                    eventId: payContext.eventId,
                                    amount: payContext.amount,
                                    eventTitle: payContext.eventTitle,
                                } : null}
                            />
                        ) : (
                            <div className="transition-all duration-500 ease-in-out">
                                {currentStep === 1 && <StepDetails formData={formData} setFormData={setFormData} />}
                                {currentStep === 2 && <StepSphere formData={formData} setFormData={setFormData} />}
                                {currentStep === 3 && <StepMedia formData={formData} setFormData={setFormData} />}
                                {currentStep === 4 && <StepSchedule formData={formData} setFormData={setFormData} />}
                                {currentStep === 5 && (
                                    <StepTickets
                                        formData={formData}
                                        setFormData={setFormData}
                                        tickets={formData.tickets}
                                        onAdd={handleAddTicket}
                                        onRemove={handleRemoveTicket}
                                        onChange={handleTicketChange}
                                    />
                                )}
                                {currentStep === 6 && <StepPromote formData={formData} setFormData={setFormData} />}
                                {currentStep === 7 && <StepVerify formData={formData} setFormData={setFormData} />}
                                {currentStep === 8 && (
                                    <StepReview
                                        formData={formData}
                                        platformFee={platformFee ?? 15000}
                                        serviceChargePercent={serviceChargePercent ?? 2.5}
                                    />
                                )}
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
                            <span>{currentStep === 8 ? 'Finalize & Pay' : 'Next Step'}</span>
                            <BsArrowRight size={18} className={`${isCurrentStepCompleted ? 'group-hover:translate-x-1' : ''} transition-transform`} />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PromoteEvent;
