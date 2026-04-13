import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BsArrowRight } from "react-icons/bs";
import { useDispatch } from "react-redux";
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
import StepTickets from "../../../components/Forms/PromoteEvent/Wizard/StepTickets";
import StepPromote from "../../../components/Forms/PromoteEvent/Wizard/StepPromote";
import { fetchPlanningByEventId } from "../../../store/slices/planningSlice";
import { getInclusiveIstDayRange, getIstDayStringFromNow, toIstDayString } from "../../../utils/istDateTime";
import {
    mapDayTierAllocationsFromBackend,
    normalizeDayTierAllocations,
    validateDayTierAllocations,
} from "../../../utils/dayTierAllocation";

const _motion = motion;
const DEFAULT_TICKET_TIER_ID = 'default-tier';

const PlanningWizard = () => {
    const [searchParams] = useSearchParams();
    const searchKey = searchParams.toString();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [currentStep, setCurrentStep] = useState(1);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [activeServiceTab, setActiveServiceTab] = useState(0); // Index of active service tab
    const [isRestoring, setIsRestoring] = useState(false);
    const [manifestOrbitalStepId, setManifestOrbitalStepId] = useState(null);

    // Date calculation for minimum allowed booking (Available from Today + 6)
    const minDateString = getIstDayStringFromNow(6) || '';

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
        guests: "",
        services: [], // Start with empty selection
        vendors: {}, // { 'Venue': vendorObj, 'Catering': vendorObj }
        platformFeePaid: false,
        tickets: [{ id: DEFAULT_TICKET_TIER_ID, name: "General Admission", price: null, quantity: "" }], // Prepopulate defaut tier
        totalCapacity: "",
        ticketType: "paid",
        ticketDayAllocations: {},
        ticketDayTierAllocations: {},
        eventDescription: "",
        promotions: {},
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

    const DEFAULT_MAX_PRICE_MULTIPLIER = 1.5;
    const computeTotals = React.useMemo(() => {
        const listingType = String(formData?.listingType || 'Private');
        const attendeeCountRaw = listingType === 'Public'
            ? parseInt(formData?.totalCapacity, 10)
            : parseInt(formData?.guests, 10);

        const attendeeCount = Number.isFinite(attendeeCountRaw) ? attendeeCountRaw : 0;
        const attendeeCountForPricing = Math.max(1, attendeeCount || 0);

        const vendors = formData?.vendors && typeof formData.vendors === 'object' ? Object.values(formData.vendors) : [];
        const getVendorLineMin = (v) => {
            const unitPrice = Number(v?.unitPrice ?? v?.priceMin ?? 0);
            if (!Number.isFinite(unitPrice) || unitPrice <= 0) return 0;

            const pricingUnit = v?.pricingUnit
                || (String(v?.category || '').toLowerCase().includes('catering') ? 'PER_PLATE' : 'EVENT');

            const multiplier = pricingUnit === 'PER_PLATE' ? attendeeCountForPricing : 1;
            return Math.round(unitPrice * multiplier);
        };

        const totalMin = vendors.reduce((acc, v) => acc + getVendorLineMin(v), 0);
        const totalMax = vendors.reduce((acc, v) => {
            const maxMultiplier = Number(v?.maxPriceMultiplier || DEFAULT_MAX_PRICE_MULTIPLIER);
            const safeMultiplier = Number.isFinite(maxMultiplier) && maxMultiplier > 0 ? maxMultiplier : DEFAULT_MAX_PRICE_MULTIPLIER;
            return acc + Math.round(getVendorLineMin(v) * safeMultiplier);
        }, 0);
        return { totalMin, totalMax };
    }, [formData?.guests, formData?.listingType, formData?.totalCapacity, formData?.vendors]);

    // Ensure active tab is valid
    React.useEffect(() => {
        if (formData.services.length > 0 && activeServiceTab >= formData.services.length) {
            setActiveServiceTab(0);
        }
    }, [formData.services, activeServiceTab]);

    // Resume Wizard from Event ID
    useEffect(() => {
        const params = new URLSearchParams(searchKey);
        const eventId = params.get('eventId');
        if (eventId) {
            const urlStep = params.get('step');
            const urlTab = params.get('activeServiceTab');

            // Ensure we have an id early so step components relying on it don't crash.
            setFormData((prev) => ({
                ...(String(prev?.id || '').trim() === String(eventId).trim() ? prev : {
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
                    guests: "",
                    services: [],
                    vendors: {},
                    platformFeePaid: false,
                    tickets: [{ id: DEFAULT_TICKET_TIER_ID, name: "General Admission", price: null, quantity: "" }],
                    totalCapacity: "",
                    ticketType: "paid",
                    ticketDayAllocations: {},
                    ticketDayTierAllocations: {},
                    eventDescription: "",
                    promotions: {},
                }),
                id: eventId,
            }));

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
                    guests: "",
                    services: [],
                    vendors: {},
                    platformFeePaid: false,
                    tickets: [{ id: DEFAULT_TICKET_TIER_ID, name: "General Admission", price: null, quantity: "" }],
                    totalCapacity: "",
                    ticketType: "paid",
                    ticketDayAllocations: {},
                    ticketDayTierAllocations: {},
                    eventDescription: "",
                    promotions: {}
                };

                const mergedData = { ...defaultData, ...data };
                // Ensure critical arrays/objects are safe
                if (!mergedData.services) mergedData.services = [];
                if (!mergedData.vendors) mergedData.vendors = {};

                setFormData((prev) => {
                    const sameEvent = String(prev?.id || '').trim() === String(mergedData?.id || '').trim();

                    const incomingServices = Array.isArray(mergedData.services) ? mergedData.services : [];
                    const previousServices = Array.isArray(prev?.services) ? prev.services : [];
                    const safeServices = (incomingServices.length > 0 || !sameEvent)
                        ? incomingServices
                        : previousServices;

                    const incomingVendors = mergedData.vendors && typeof mergedData.vendors === 'object' ? mergedData.vendors : {};
                    const previousVendors = prev?.vendors && typeof prev.vendors === 'object' ? prev.vendors : {};
                    const incomingVendorCount = Object.keys(incomingVendors).length;
                    const previousVendorCount = Object.keys(previousVendors).length;
                    const safeVendors = (incomingVendorCount > 0 || !sameEvent)
                        ? incomingVendors
                        : previousVendors;

                    return {
                        ...mergedData,
                        services: safeServices,
                        vendors: safeVendors,
                    };
                });

                const getStepIndex = (cid) => {
                    const s = ['manifest', 'category', 'payment', 'vendor', 'review', 'confirmation'];
                    // Get idx and add 1, if not found (like when changing types dynamically which rarely happens on initial load) default to 1
                    const idx = s.indexOf(cid);
                    return idx !== -1 ? idx + 1 : 1;
                };

                // If it is paid/Immediate Action, go to Vendor Selection
                let targetStep = 1;

                if (mergedData.platformFeePaid || mergedData.isPaid) {
                    targetStep = getStepIndex('vendor'); // Vendor Selection
                } else if (mergedData.services && mergedData.services.length > 0) {
                    targetStep = getStepIndex('payment'); // Payment
                } else if (mergedData.location && (mergedData.date || mergedData.publicStartTime)) {
                    targetStep = 2; // Preview / Service Selection or Tickets
                }

                // Override with URL params if present
                if (urlStep) {
                    const parsed = parseInt(urlStep, 10);
                    if (!Number.isNaN(parsed)) targetStep = parsed;
                }

                if (urlTab) {
                    const parsedTab = parseInt(urlTab, 10);
                    if (!Number.isNaN(parsedTab)) setActiveServiceTab(parsedTab);
                }

                setCurrentStep(targetStep);
                setIsPreviewMode(false);
            };

            const toDateInput = (value) => {
                if (!value) return '';
                return toIstDayString(value) || '';
            };

            const toPromotionMap = (arr) => {
                const values = Array.isArray(arr) ? arr : [];
                return Object.fromEntries(
                    values
                        .map((v) => String(v).trim())
                        .filter(Boolean)
                        .map((v) => [v, true])
                );
            };

            const toDayAllocationMap = (arr) => {
                const values = Array.isArray(arr) ? arr : [];
                const out = {};
                for (const row of values) {
                    const day = String(row?.day || '').trim();
                    if (!day) continue;
                    const count = parseInt(row?.ticketCount, 10);
                    out[day] = Number.isFinite(count) && count > 0 ? count : '';
                }
                return out;
            };

            const load = async () => {
                setIsRestoring(true);
                try {
                    // 1) Check localStorage (legacy)
                    const myEvents = JSON.parse(localStorage.getItem('my_organized_events') || '[]');
                    const foundEvent = myEvents.find(e => e.id === eventId || e.id === Number(eventId));
                    if (foundEvent && foundEvent.formData) {
                        handleStepLogic(foundEvent.formData);
                        return;
                    }

                    // 2) Check drafts
                    const drafts = JSON.parse(localStorage.getItem('planningWizardDrafts') || '[]');
                    const foundDraft = drafts.find(d => d.id === eventId || d.id === Number(eventId));
                    if (foundDraft && foundDraft.formData) {
                        const draftData = { ...foundDraft.formData, id: foundDraft.id };
                        handleStepLogic(draftData);
                        return;
                    }

                    // 3) Fetch from backend (new)
                    const result = await dispatch(fetchPlanningByEventId(eventId));
                    if (result.meta?.requestStatus === 'fulfilled') {
                        const p = result.payload;
                        const isPublic = String(p?.category || '').toLowerCase() === 'public';

                        const mappedTiers = Array.isArray(p?.tickets?.tiers)
                            ? p.tickets.tiers.map((t, idx) => ({
                                id: `${String(t?.tierName || 'tier')}-${idx}`,
                                name: t?.tierName || `Tier ${idx + 1}`,
                                price: t?.ticketPrice ?? 0,
                                quantity: t?.ticketCount ?? 0,
                            }))
                            : [];

                        const mappedTicketRows = isPublic
                            ? (mappedTiers.length > 0
                                ? mappedTiers
                                : [{ id: DEFAULT_TICKET_TIER_ID, name: 'General Admission', price: 0, quantity: p?.tickets?.totalTickets ?? '' }])
                            : [{ id: DEFAULT_TICKET_TIER_ID, name: 'General Admission', price: null, quantity: '' }];

                        const mappedDayAllocations = isPublic ? toDayAllocationMap(p?.tickets?.dayWiseAllocations) : {};
                        const mappedDayTierAllocations = isPublic
                            ? mapDayTierAllocationsFromBackend({
                                dayWiseAllocations: p?.tickets?.dayWiseAllocations,
                                tickets: mappedTicketRows,
                            })
                            : {};

                        const mapped = {
                            id: p?.eventId || eventId,
                            title: p?.eventTitle || '',
                            type: p?.eventType || 'Birthday',
                            listingType: isPublic ? 'Public' : 'Private',
                            location: p?.location?.name || '',
                            lat: p?.location?.latitude ?? null,
                            lng: p?.location?.longitude ?? null,
                            locationValid: Boolean(p?.location?.latitude && p?.location?.longitude),

                            date: isPublic ? '' : toDateInput(p?.eventDate),
                            startTime: isPublic ? '' : (p?.eventTime || ''),
                            endTime: '',

                            guests: isPublic ? '' : (p?.guestCount ?? ''),

                            totalCapacity: isPublic ? (p?.tickets?.totalTickets ?? '') : '',
                            ticketType: isPublic ? (p?.tickets?.ticketType || 'paid') : 'paid',
                            ticketDayAllocations: mappedDayAllocations,
                            ticketDayTierAllocations: mappedDayTierAllocations,
                            tickets: mappedTicketRows,

                            publicStartTime: isPublic ? (p?.schedule?.startAt || '') : '',
                            publicEndTime: isPublic ? (p?.schedule?.endAt || '') : '',
                            salesStartTime: isPublic ? (p?.ticketAvailability?.startAt || '') : '',
                            salesEndTime: isPublic ? (p?.ticketAvailability?.endAt || '') : '',

                            services: Array.isArray(p?.selectedServices) ? p.selectedServices : [],
                            platformFeePaid: Boolean(p?.platformFeePaid) || Boolean(p?.isPaid),
                            eventDescription: p?.eventDescription || '',
                            promotions: toPromotionMap(p?.promotionType),
                        };

                        handleStepLogic(mapped);
                    }
                } catch (e) {
                    console.error('Failed to load event data', e);
                } finally {
                    setIsRestoring(false);
                }
            };

            load();
        }
    }, [searchKey, dispatch]);

    const handleNext = async () => {
        if (currentComponentId === 'manifest' && !isPreviewMode) {
            handleSaveDraft(); // Auto-save on Manifest
            setIsPreviewMode(true);
        } else {
            if (currentComponentId === 'review') {
                // Deposit payment + confirmation is handled inside StepConfirmation.
                setIsPreviewMode(false);
                setCurrentStep(prev => prev + 1);
                return;
            }

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

    useEffect(() => {
        if (formData.listingType !== 'Public') return;

        setFormData((prev) => {
            const days = getInclusiveIstDayRange(prev.publicStartTime, prev.publicEndTime);
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

            const tierUnchanged =
                JSON.stringify(existingDayTier) === JSON.stringify(nextDayTier);

            if (allocationsUnchanged && tierUnchanged) return prev;
            return {
                ...prev,
                ticketDayAllocations: nextAllocations,
                ticketDayTierAllocations: nextDayTier,
            };
        });
    }, [formData.listingType, formData.publicStartTime, formData.publicEndTime, formData.totalCapacity, formData.ticketType, formData.tickets]);

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

            const normalizedId = String(draftId || '').trim();
            const isPersistedPublicEvent =
                String(formData?.listingType || '').toLowerCase() === 'public' &&
                Boolean(normalizedId) &&
                !normalizedId.startsWith('draft_');

            if (isPersistedPublicEvent) {
                // Public events become backend-owned once created (e.g., PAYMENT_PENDING).
                // Do not keep writing local drafts for persisted IDs.
                const existingDrafts = JSON.parse(localStorage.getItem('planningWizardDrafts') || '[]');
                if (Array.isArray(existingDrafts) && existingDrafts.length > 0) {
                    const updatedDrafts = existingDrafts.filter((d) => String(d?.id || '').trim() !== normalizedId);
                    if (updatedDrafts.length !== existingDrafts.length) {
                        localStorage.setItem('planningWizardDrafts', JSON.stringify(updatedDrafts));
                        window.dispatchEvent(new Event('savedUpdated'));
                    }
                }
                return true;
            }

            if (!draftId) {
                draftId = `draft_${Date.now()}`;
                setFormData(prev => ({ ...prev, id: draftId }));
            }

            // 2. Save to 'planningWizardDrafts' (Drafts)
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

    const manifestScheduleDays = getInclusiveIstDayRange(formData.publicStartTime, formData.publicEndTime);
    const manifestDayAllocations = formData.ticketDayAllocations && typeof formData.ticketDayAllocations === 'object'
        ? formData.ticketDayAllocations
        : {};
    const manifestDayTierAllocations = formData.ticketDayTierAllocations && typeof formData.ticketDayTierAllocations === 'object'
        ? formData.ticketDayTierAllocations
        : {};
    const publicAllocationValidation = validateDayTierAllocations({
        days: manifestScheduleDays,
        tickets: formData.tickets,
        dayAllocations: manifestDayAllocations,
        dayTierAllocations: manifestDayTierAllocations,
    });
    const isPublicDayAllocationReady = publicAllocationValidation.isValid;

    const isNextDisabled = (currentComponentId === 'category' && formData.services.length === 0) ||
        (currentComponentId === 'vendor' && Object.keys(formData.vendors).length < formData.services.length) ||
        (currentComponentId === 'review' && !isAtBottom);

    if (isRestoring) {
        return (
            <div className="flex flex-col flex-1 min-h-screen bg-surface">
                <div className="flex-1 px-6 py-24">
                    <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
                        <div className="h-10 w-72 rounded-2xl bg-primary/10" />
                        <div className="h-4 w-56 rounded bg-primary/10" />
                        <div className="rounded-3xl border border-primary/10 bg-white p-8 space-y-6">
                            <div className="h-12 w-full rounded-2xl bg-primary/10" />
                            <div className="h-12 w-full rounded-2xl bg-primary/10" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="h-40 rounded-2xl bg-primary/10" />
                                <div className="h-40 rounded-2xl bg-primary/10" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                                onStepChange={setManifestOrbitalStepId}
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
                            <StepConfirmation eventId={formData.id} totalMin={computeTotals.totalMin} totalMax={computeTotals.totalMax} />
                        )}
                    </div>

                    {/* Navigation Actions */}
                    <div className={`flex flex-col gap-4 z-50 pointer-events-none 
                        ${isImmersiveStep || ['vendor', 'review', 'promote', 'confirmation'].includes(currentComponentId)
                            ? (currentComponentId === 'manifest'
                                ? 'fixed bottom-3.5 right-10'
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
                                            (new Date(formData.publicEndTime) > new Date(formData.publicStartTime)) &&
                                            (new Date(formData.salesStartTime) < new Date(formData.publicStartTime)) &&
                                            (!formData.salesEndTime || (new Date(formData.salesEndTime) > new Date(formData.salesStartTime) && new Date(formData.salesEndTime) < new Date(formData.publicStartTime))) &&
                                            formData.banner && formData.eventDescription &&
                                            formData.totalCapacity > 0 &&
                                            formData.tickets.reduce((a, t) => a + (parseInt(t.quantity) || 0), 0) === parseInt(formData.totalCapacity, 10) &&
                                            isPublicDayAllocationReady
                                        ) : (
                                            formData.date && formData.date >= minDateString && formData.startTime &&
                                            formData.guests && formData.guests > 0
                                        ))
                                    )) && (currentComponentId !== 'category' || formData.services.length > 0) && (
                                            (currentComponentId !== 'manifest' || formData.listingType !== 'Public' || manifestOrbitalStepId === 'promote') &&
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
                                                        <div className="w-16  h-16 rounded-full bg-primary flex items-center justify-center text-white shadow-xl group-hover:bg-secondary transition-all group-hover:translate-x-2">
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
