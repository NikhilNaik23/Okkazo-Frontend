import React, { useState, useEffect } from "react";
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
import { myOrganizedEvents } from "../../../data/myEventsData";
import StepTickets from "../../../components/Forms/PromoteEvent/Wizard/StepTickets";
import StepPromote from "../../../components/Forms/PromoteEvent/Wizard/StepPromote";
import { confirmPlanning, fetchPlanningByEventId } from "../../../store/slices/planningSlice";

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
        guests: "",
        services: [], // Start with empty selection
        vendors: {}, // { 'Venue': vendorObj, 'Catering': vendorObj }
        isPaid: false, // Payment status
        tickets: [{ id: DEFAULT_TICKET_TIER_ID, name: "General Admission", price: null, quantity: "" }], // Prepopulate defaut tier
        totalCapacity: "",
        ticketType: "paid",
        eventDescription: "",
        promotions: { featured: false, email: false, social: false, insights: false },
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
                ...prev,
                id: prev?.id || eventId,
                vendors: prev?.vendors || {},
                services: Array.isArray(prev?.services) ? prev.services : [],
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
                        isPaid: false,
                        tickets: [{ id: DEFAULT_TICKET_TIER_ID, name: "General Admission", price: null, quantity: "" }],
                        totalCapacity: "",
                        ticketType: "paid",
                        eventDescription: "",
                        promotions: { featured: false, email: false, social: false, insights: false }
                    };

                    const mergedData = { ...defaultData, ...data };
                    // Ensure critical arrays/objects are safe
                    if (!mergedData.services) mergedData.services = [];
                    if (!mergedData.vendors) mergedData.vendors = {};

                    setFormData(mergedData);

                    const getStepIndex = (cid) => {
                        const s = ['manifest', 'category', 'payment', 'vendor', 'review', 'confirmation'];
                        // Get idx and add 1, if not found (like when changing types dynamically which rarely happens on initial load) default to 1
                        const idx = s.indexOf(cid);
                        return idx !== -1 ? idx + 1 : 1;
                    };

                    // If it is paid/Immediate Action, go to Vendor Selection
                    let targetStep = 1;

                    if (mergedData.isPaid) {
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
                const d = new Date(value);
                if (Number.isNaN(d.getTime())) return '';
                return d.toISOString().split('T')[0];
            };

            const toPromotionFlags = (arr) => {
                const values = Array.isArray(arr) ? arr.map((v) => String(v).toLowerCase()) : [];
                return {
                    featured: values.includes('featured'),
                    email: values.includes('email'),
                    social: values.includes('social'),
                    insights: values.includes('insights'),
                };
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

                    // 3) Fallback to old mock data
                    const foundDummy = myOrganizedEvents.find(e => e.id === Number(eventId) || e.id === eventId);
                    if (foundDummy && foundDummy.formData) {
                        const dummyData = { ...foundDummy.formData, id: foundDummy.id };
                        if (foundDummy.status === 'Immediate Action') dummyData.isPaid = true;
                        handleStepLogic(dummyData);
                        return;
                    }

                    // 4) Fetch from backend (new)
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
                            tickets: isPublic
                                ? (mappedTiers.length > 0
                                    ? mappedTiers
                                    : [{ id: DEFAULT_TICKET_TIER_ID, name: 'General Admission', price: 0, quantity: p?.tickets?.totalTickets ?? '' }])
                                : [{ id: DEFAULT_TICKET_TIER_ID, name: 'General Admission', price: null, quantity: '' }],

                            publicStartTime: isPublic ? (p?.schedule?.startAt || '') : '',
                            publicEndTime: isPublic ? (p?.schedule?.endAt || '') : '',
                            salesStartTime: isPublic ? (p?.ticketAvailability?.startAt || '') : '',
                            salesEndTime: isPublic ? (p?.ticketAvailability?.endAt || '') : '',

                            services: Array.isArray(p?.selectedServices) ? p.selectedServices : [],
                            isPaid: Boolean(p?.isPaid),
                            eventDescription: p?.eventDescription || '',
                            promotions: toPromotionFlags(p?.promotionType),
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
                try {
                    const eventId = formData?.id;
                    if (!eventId) throw new Error('Missing event id');

                    const result = await dispatch(confirmPlanning({ eventId }));
                    if (result.meta?.requestStatus !== 'fulfilled') {
                        throw new Error(result.payload || result.error?.message || 'Failed to confirm planning');
                    }

                    const confirmed = result.payload;
                    if (confirmed?.status) setFormData((prev) => ({ ...prev, status: confirmed.status }));

                    setIsPreviewMode(false);
                    setCurrentStep(prev => prev + 1);
                    return;
                } catch (e) {
                    console.error('Failed to confirm planning:', e);
                    window.alert(e?.message || 'Failed to confirm');
                    return;
                }
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

    const isNextDisabled = (currentComponentId === 'category' && formData.services.length === 0) ||
        (currentComponentId === 'vendor' && Object.keys(formData.vendors).length < formData.services.length) ||
        (currentComponentId === 'review' && !isAtBottom);

    if (isRestoring) {
        return (
            <div className="flex flex-col flex-1 min-h-screen bg-surface">
                <div className="flex-1 flex items-center justify-center px-6">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-[10px] font-black tracking-[0.3em] uppercase text-primary/50">
                            Loading your event…
                        </p>
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
                                            formData.tickets.reduce((a, t) => a + (parseInt(t.quantity) || 0), 0) === parseInt(formData.totalCapacity)
                                        ) : (
                                            formData.date && formData.date >= minDateString && formData.startTime &&
                                            formData.guests && formData.guests > 0
                                        ))
                                    )) && (currentComponentId !== 'category' || formData.services.length > 0) && (
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
