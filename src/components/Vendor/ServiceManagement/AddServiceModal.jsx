
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { BsX, BsCheckLg } from 'react-icons/bs';
import { SERVICE_CATEGORIES } from './constants';
import { toast } from 'react-hot-toast';
import {
    addVendorService,
    deleteVendorService,
    updateVendorService,
    uploadVenueServiceImages,
    deleteVenueServiceImage,
    setVenueServiceProfileImage,
} from '../../../store/slices/vendorSlice';

const parseGoogleMapsLatLng = (rawUrl) => {
    if (!rawUrl) return null;

    let url;
    try {
        url = new URL(String(rawUrl).trim());
    } catch {
        return null;
    }

    // Common Google Maps patterns:
    // 1) https://www.google.com/maps/@lat,lng,zoomz
    // 2) https://www.google.com/maps?q=lat,lng
    // 3) https://www.google.com/maps/search/?api=1&query=lat,lng
    const atMatch = url.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (atMatch) {
        return { lat: Number(atMatch[1]), lng: Number(atMatch[2]) };
    }

    const q = url.searchParams.get('q') || url.searchParams.get('query');
    if (q) {
        const qMatch = String(q).match(/(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/);
        if (qMatch) return { lat: Number(qMatch[1]), lng: Number(qMatch[2]) };
    }

    const hash = (url.hash || '').replace('#', '');
    const hashMatch = hash.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (hashMatch) {
        return { lat: Number(hashMatch[1]), lng: Number(hashMatch[2]) };
    }

    return null;
};

const isSupportedGoogleMapsUrl = (rawUrl) => {
    if (!rawUrl) return false;

    let url;
    try {
        url = new URL(String(rawUrl).trim());
    } catch {
        return false;
    }

    const hostname = String(url.hostname || '').toLowerCase();
    const pathname = String(url.pathname || '').toLowerCase();

    // Accept standard Google Maps URLs only (matches links we generate from "Use current location")
    const isGoogle = hostname === 'www.google.com' || hostname.endsWith('.google.com');
    const isMapsPath = pathname.startsWith('/maps');
    if (!isGoogle || !isMapsPath) return false;

    // Must contain coordinates we can extract
    const coords = parseGoogleMapsLatLng(url.toString());
    return Boolean(coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng));
};

const reverseGeocodeAreaName = async ({ lat, lng }) => {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lng))}`
    );
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.error || 'Failed to resolve location');
    }

    const address = data?.address || {};
    return (
        address.city ||
        address.town ||
        address.village ||
        address.suburb ||
        address.county ||
        address.state_district ||
        address.state ||
        data?.display_name ||
        null
    );
};

const AddServiceModal = ({ isOpen, onClose, onSave, allowedCategory, initialData }) => {
    const dispatch = useDispatch();

    // If allowedCategory is provided, use it. Otherwise default to first available.
    const [selectedCategory, setSelectedCategory] = useState(allowedCategory || SERVICE_CATEGORIES[0].id);
    const [formData, setFormData] = useState({});
    const [venueLocationLoading, setVenueLocationLoading] = useState(false);
    const [venueImages, setVenueImages] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [existingVenueImages, setExistingVenueImages] = useState([]);
    const [imageActionPublicId, setImageActionPublicId] = useState(null);

    // Sync state if allowedCategory changes or modal opens
    React.useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Determine category from initialData if not strictly enforced, though allowedCategory usually takes precedence
                const category = initialData.categoryId || initialData.category || allowedCategory || SERVICE_CATEGORIES[0].id;
                setSelectedCategory(category);

                // Prepare form data (normalize backend shape -> form fields)
                const processedData = {
                    name: initialData?.name || '',
                    price: initialData?.price ?? '',
                    tier: initialData?.tier || '',
                    description: initialData?.description || '',
                };

                if (category === 'catering') {
                    const srcItems = initialData?.details?.items ?? initialData?.items;
                    const itemsList = Array.isArray(srcItems)
                        ? srcItems
                        : (typeof srcItems === 'string' ? srcItems.split(',').map(i => i.trim()).filter(Boolean) : []);
                    processedData.items = itemsList.join(', ');
                }

                if (category === 'venues') {
                    processedData.capacity = initialData?.details?.capacity ?? initialData?.capacity ?? '';
                    processedData.mapsUrl = initialData?.details?.locationMapsUrl ?? initialData?.details?.mapsUrl ?? '';
                    processedData.locationAreaName = initialData?.details?.locationAreaName ?? '';
                    processedData.locationLat = initialData?.details?.locationLat ?? initialData?.details?.lat ?? '';
                    processedData.locationLng = initialData?.details?.locationLng ?? initialData?.details?.lng ?? '';
                }

                setFormData(processedData);

                const existing = Array.isArray(initialData?.details?.images) ? initialData.details.images : [];
                setExistingVenueImages(existing);
            } else {
                // Reset for new entry
                setFormData({});
                setSelectedCategory(allowedCategory || SERVICE_CATEGORIES[0].id);
            }

            // Always reset image selection when the modal opens
            setVenueImages([]);

            if (!initialData) {
                setExistingVenueImages([]);
            }
        }
    }, [isOpen, initialData, allowedCategory]);

    const handleDeleteExistingVenueImage = async (publicId) => {
        const serviceId = initialData?._id || initialData?.id;
        if (!serviceId) {
            toast.error('Missing service id — could not delete image');
            return;
        }
        if (!publicId) return;

        setImageActionPublicId(publicId);
        try {
            const updated = await dispatch(deleteVenueServiceImage({ id: serviceId, publicId })).unwrap();
            setExistingVenueImages(Array.isArray(updated?.details?.images) ? updated.details.images : []);
            toast.success('Image deleted');
        } catch (err) {
            console.error(err);
            toast.error(err?.message || err || 'Could not delete image');
        } finally {
            setImageActionPublicId(null);
        }
    };

    const handleSetProfileVenueImage = async (publicId) => {
        const serviceId = initialData?._id || initialData?.id;
        if (!serviceId) {
            toast.error('Missing service id — could not update profile image');
            return;
        }
        if (!publicId) return;

        setImageActionPublicId(publicId);
        try {
            const updated = await dispatch(setVenueServiceProfileImage({ id: serviceId, publicId })).unwrap();
            setExistingVenueImages(Array.isArray(updated?.details?.images) ? updated.details.images : []);
            toast.success('Profile image updated');
        } catch (err) {
            console.error(err);
            toast.error(err?.message || err || 'Could not update profile image');
        } finally {
            setImageActionPublicId(null);
        }
    };

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resolveVenueLocationFromUrl = async (rawUrl) => {
        if (!isSupportedGoogleMapsUrl(rawUrl)) {
            setFormData(prev => ({
                ...prev,
                locationLat: '',
                locationLng: '',
                locationAreaName: '',
            }));
            toast.error('Please paste a Google Maps link that contains coordinates (e.g. /maps/place/.../@lat,lng or /maps?q=lat,lng)');
            return false;
        }

        const coords = parseGoogleMapsLatLng(rawUrl);
        if (!coords || !Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) {
            setFormData(prev => ({
                ...prev,
                locationLat: '',
                locationLng: '',
                locationAreaName: '',
            }));
            return false;
        }

        setVenueLocationLoading(true);
        try {
            const areaName = await reverseGeocodeAreaName(coords);
            setFormData(prev => ({
                ...prev,
                locationLat: coords.lat,
                locationLng: coords.lng,
                locationAreaName: areaName || '',
            }));
            return true;
        } catch {
            setFormData(prev => ({
                ...prev,
                locationLat: coords.lat,
                locationLng: coords.lng,
                locationAreaName: '',
            }));
            return true;
        } finally {
            setVenueLocationLoading(false);
        }
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported in this browser');
            return;
        }

        setVenueLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

                setFormData(prev => ({
                    ...prev,
                    mapsUrl,
                }));

                await resolveVenueLocationFromUrl(mapsUrl);
            },
            () => {
                setVenueLocationLoading(false);
                toast.error('Could not get your current location');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSaving) return;

        const validData = { ...formData };

        const selectedVenueImages = selectedCategory === 'venues' ? (venueImages || []) : [];
        const existingVenueImagesCount =
            selectedCategory === 'venues'
                ? (Array.isArray(existingVenueImages) ? existingVenueImages.length : 0)
                : 0;

        if (selectedCategory === 'venues') {
            const hasUrl = Boolean(String(validData.mapsUrl || '').trim());
            if (!hasUrl) {
                toast.error('Please paste a Google Maps location URL');
                return;
            }

            if (!isSupportedGoogleMapsUrl(validData.mapsUrl)) {
                toast.error('Google Maps URL must look like https://www.google.com/maps/place/.../@lat,lng or https://www.google.com/maps?q=lat,lng');
                return;
            }

            const coords = parseGoogleMapsLatLng(String(validData.mapsUrl || '').trim());
            const hasCoords = Boolean(coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng));
            if (!hasCoords) {
                toast.error('Could not extract coordinates from the Google Maps URL');
                return;
            }

            const totalImages = existingVenueImagesCount + selectedVenueImages.length;
            if (totalImages <= 0) {
                toast.error('Please upload at least 1 venue image');
                return;
            }
            if (totalImages > 10) {
                toast.error('You can upload up to 10 venue images');
                return;
            }
        }

        // Post-processing: String -> Array for catering items (kept for local UI)
        if (selectedCategory === 'catering' && typeof validData.items === 'string') {
            validData.items = validData.items.split(',').map(i => i.trim()).filter(i => i);
        }

        // ── Build API payload ──────────────────────────────────────────────────
        // Common fields that live at the top level of VendorService
        const payload = {
            categoryId: selectedCategory,
            name: validData.name,
            price: validData.price,
            tier: validData.tier || null,
            description: validData.description || null,
            // Everything else (items, capacity, location …) goes into `details`
            details: {},
        };

        // Category-specific detail fields
        if (selectedCategory === 'catering') {
            payload.details = { items: validData.items };
        } else if (selectedCategory === 'venues') {
            const coords = parseGoogleMapsLatLng(String(validData.mapsUrl || '').trim());
            payload.details = {
                capacity: validData.capacity,
                locationMapsUrl: String(validData.mapsUrl || '').trim(),
                locationLat: coords ? Number(coords.lat) : Number(validData.locationLat),
                locationLng: coords ? Number(coords.lng) : Number(validData.locationLng),
                locationAreaName: validData.locationAreaName || null,
                // Back-compat: keep a plain string field too
                location: validData.locationAreaName || String(validData.mapsUrl || '').trim(),
            };
        } else {
            // Generic: pass items / any extra field into details
            payload.details = {
                items: validData.items || null,
            };
        }

        setIsSaving(true);

        // If editing, update via backend
        if (initialData) {
            const id = initialData?._id || initialData?.id;
            if (!id) {
                toast.error('Missing service id — could not update');
                setIsSaving(false);
                return;
            }

            try {
                let updatedService = await dispatch(updateVendorService({ id, payload })).unwrap();

                if (selectedVenueImages.length > 0) {
                    try {
                        updatedService = await dispatch(
                            uploadVenueServiceImages({ id, files: selectedVenueImages })
                        ).unwrap();
                    } catch (uploadErr) {
                        console.error(uploadErr);
                        toast.error(uploadErr?.message || uploadErr || 'Service updated, but image upload failed');
                    }
                }

                onSave(updatedService);
                onClose();
            } catch (err) {
                console.error(err);
                toast.error(err?.message || err || 'Network error — could not update service');
            } finally {
                setIsSaving(false);
            }
            return;
        }

        try {
            let savedService = await dispatch(addVendorService({ payload })).unwrap();

            if (selectedVenueImages.length > 0) {
                const savedId = savedService?._id || savedService?.id;
                try {
                    savedService = await dispatch(
                        uploadVenueServiceImages({ id: savedId, files: selectedVenueImages })
                    ).unwrap();
                } catch (uploadErr) {
                    console.error(uploadErr);

                    // Venue images are required — rollback create if upload fails
                    try {
                        if (savedId) {
                            await dispatch(deleteVendorService({ id: savedId })).unwrap();
                        }
                    } catch (rollbackErr) {
                        console.error('Failed to rollback service after image upload failure', rollbackErr);
                    }

                    toast.error(uploadErr?.message || uploadErr || 'Could not upload venue images');
                    return;
                }
            }

            onSave(savedService);
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err?.message || err || 'Network error — could not save service');
        } finally {
            setIsSaving(false);
        }
    };

    const renderFields = () => {
        switch (selectedCategory) {
            case 'venues':
                return (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#708aa0]">Venue Name <span className="text-red-500">*</span></label>
                            <input required name="name" value={formData.name || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10" placeholder="e.g. Grand Ballroom" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#708aa0]">Capacity <span className="text-red-500">*</span></label>
                                <input required type="number" min="1" onWheel={(e) => e.target.blur()} name="capacity" value={formData.capacity || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#708aa0]">Price per Day <span className="text-red-500">*</span></label>
                                <input required type="number" min="1" onWheel={(e) => e.target.blur()} name="price" value={formData.price || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="25000" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3">
                                <label className="text-sm font-bold text-[#708aa0]">Google Maps URL <span className="text-red-500">*</span></label>
                                <button
                                    type="button"
                                    onClick={handleUseCurrentLocation}
                                    disabled={venueLocationLoading}
                                    className="text-xs font-bold text-[#0b2d49] hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    Use current location
                                </button>
                            </div>
                            <input
                                required
                                name="mapsUrl"
                                value={formData.mapsUrl || ''}
                                onChange={handleInputChange}
                                onBlur={(e) => resolveVenueLocationFromUrl(e.target.value)}
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10"
                                placeholder="Paste Google Maps location link"
                            />

                            {(venueLocationLoading || formData.locationAreaName || formData.locationLat || formData.locationLng) && (
                                <div className="text-[11px] font-medium text-[#94a3b8]">
                                    {venueLocationLoading ? 'Resolving location…' : (
                                        <>
                                            {formData.locationAreaName ? `Area: ${formData.locationAreaName}` : 'Area: (not resolved)'}
                                            {Number.isFinite(Number(formData.locationLat)) && Number.isFinite(Number(formData.locationLng))
                                                ? ` • ${Number(formData.locationLat).toFixed(6)}, ${Number(formData.locationLng).toFixed(6)}`
                                                : ''}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#708aa0]">Description <span className="text-red-500">*</span></label>
                            <textarea required name="description" value={formData.description || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10 h-24 resize-none" placeholder="Describe the venue features..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#708aa0]">Venue Images <span className="text-red-500">*</span></label>
                            <input
                                type="file"
                                accept="image/png,image/jpeg"
                                multiple
                                onChange={(e) => setVenueImages(Array.from(e.target.files || []))}
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10"
                            />
                            {(initialData?.details?.images?.length > 0 || (Array.isArray(venueImages) && venueImages.length > 0)) && (
                                <div className="text-[11px] font-medium text-[#94a3b8]">
                                    {Array.isArray(existingVenueImages) && existingVenueImages.length > 0 ? `Existing: ${existingVenueImages.length} • ` : ''}
                                    {Array.isArray(venueImages) && venueImages.length > 0 ? `Selected: ${venueImages.length}` : 'Selected: 0'}
                                </div>
                            )}

                            {initialData && Array.isArray(existingVenueImages) && existingVenueImages.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                                    {existingVenueImages.map((img, idx) => {
                                        const url = img?.url || img?.fileUrl;
                                        const publicId = img?.publicId;
                                        if (!url) return null;

                                        const isBusy = imageActionPublicId && String(imageActionPublicId) === String(publicId);

                                        return (
                                            <div key={publicId || url} className="relative rounded-xl overflow-hidden border border-gray-100 bg-white">
                                                <img src={url} alt="Venue" className="w-full h-24 object-cover" />

                                                {idx === 0 && (
                                                    <div className="absolute top-2 left-2 text-[10px] font-black tracking-widest uppercase bg-[#0b2d49] text-white px-2 py-1 rounded-lg">
                                                        Profile
                                                    </div>
                                                )}

                                                <div className="p-2 flex items-center justify-between gap-2">
                                                    <button
                                                        type="button"
                                                        disabled={isSaving || isBusy || idx === 0}
                                                        onClick={() => handleSetProfileVenueImage(publicId)}
                                                        className="text-[11px] font-black text-[#0b2d49] hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                                                    >
                                                        Set as profile
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={isSaving || isBusy}
                                                        onClick={() => handleDeleteExistingVenueImage(publicId)}
                                                        className="text-[11px] font-black text-red-500 hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                                                    >
                                                        {isBusy ? 'Working…' : 'Delete'}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                );

            case 'catering':
                return (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#708aa0]">Package Name <span className="text-red-500">*</span></label>
                            <input required name="name" value={formData.name || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10" placeholder="e.g. Traditional Feast" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#708aa0]">Price per Plate <span className="text-red-500">*</span></label>
                                <input required type="number" min="1" onWheel={(e) => e.target.blur()} name="price" value={formData.price || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="850" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#708aa0]">Tier <span className="text-red-500">*</span></label>
                                <select required name="tier" value={formData.tier || 'Economy'} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10">
                                    <option value="Economy">Economy</option>
                                    <option value="Mid-Range">Mid-Range</option>
                                    <option value="Luxury">Luxury</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#708aa0]">Included Items (comma separated) <span className="text-red-500">*</span></label>
                            <textarea required name="items" value={formData.items || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10 h-24 resize-none" placeholder="Starter, Main Course, Dessert..." />
                        </div>
                    </>
                );

            case 'makeup':
            case 'security':
            case 'transport':
            case 'cakes':
            case 'invitations':
                {
                    let priceLabel = 'Price';
                    let pricePlaceholder = '5000';
                    let itemsLabel = 'Included Services/Items';
                    let itemsPlaceholder = 'e.g. Item 1, Item 2...';
                    let namePlaceholder = 'Service Name';

                    if (selectedCategory === 'makeup') {
                        priceLabel = 'Price per Person';
                        pricePlaceholder = '15000';
                        namePlaceholder = 'e.g. Bridal HD Makeup';
                        itemsPlaceholder = 'e.g. Lashes, Draping, Hair...';
                    }
                    if (selectedCategory === 'security') {
                        priceLabel = 'Price per Team/Shift';
                        pricePlaceholder = '25000';
                        namePlaceholder = 'e.g. Bouncers Team (4 Pax)';
                        itemsPlaceholder = 'e.g. 4 Bouncers, 6 Hours...';
                    }
                    if (selectedCategory === 'transport') {
                        priceLabel = 'Price per Vehicle/Day';
                        pricePlaceholder = '12000';
                        namePlaceholder = 'e.g. Luxury Sedan Rental';
                        itemsPlaceholder = 'e.g. 8 Hours, 80km, Fuel...';
                    }
                    if (selectedCategory === 'cakes') {
                        priceLabel = 'Price per Kg';
                        pricePlaceholder = '1500';
                        namePlaceholder = 'e.g. Chocolate Truffle Cake';
                        itemsPlaceholder = 'e.g. Eggless, Fondant Finish...';
                    }
                    if (selectedCategory === 'invitations') {
                        priceLabel = 'Price per 100 Units';
                        pricePlaceholder = '5000';
                        namePlaceholder = 'e.g. Royal Scroll Invites';
                        itemsPlaceholder = 'e.g. Gold Foiling, Boxed...';
                    }

                    return (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#708aa0]">Package/Service Name <span className="text-red-500">*</span></label>
                                <input required name="name" value={formData.name || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10" placeholder={namePlaceholder} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#708aa0]">{priceLabel} <span className="text-red-500">*</span></label>
                                    <input required type="number" min="1" onWheel={(e) => e.target.blur()} name="price" value={formData.price || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder={pricePlaceholder} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#708aa0]">Tier <span className="text-red-500">*</span></label>
                                    <select required name="tier" value={formData.tier || 'Standard'} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10">
                                        <option value="Basic">Basic</option>
                                        <option value="Standard">Standard</option>
                                        <option value="Premium">Premium</option>
                                        <option value="Luxury">Luxury</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#708aa0]">Description <span className="text-red-500">*</span></label>
                                <textarea required name="description" value={formData.description || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10 h-24 resize-none" placeholder="Describe what makes this service special..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#708aa0]">{itemsLabel} <span className="text-red-500">*</span></label>
                                <input required name="items" value={formData.items || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10" placeholder={itemsPlaceholder} />
                            </div>
                        </>
                    );
                }

            // Default for Per Event services (Photography, Videography, Decor, etc.)
            default:
                return (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#708aa0]">Package Name <span className="text-red-500">*</span></label>
                            <input required name="name" value={formData.name || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10" placeholder="e.g. Candid Photography" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#708aa0]">Price per Event/Day <span className="text-red-500">*</span></label>
                                <input required type="number" min="1" onWheel={(e) => e.target.blur()} name="price" value={formData.price || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="50000" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#708aa0]">Tier <span className="text-red-500">*</span></label>
                                <select required name="tier" value={formData.tier || 'Standard'} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10">
                                    <option value="Silver">Silver</option>
                                    <option value="Gold">Gold</option>
                                    <option value="Platinum">Platinum</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#708aa0]">Description <span className="text-red-500">*</span></label>
                            <textarea required name="description" value={formData.description || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10 h-24 resize-none" placeholder="Describe coverage details..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#708aa0]">Included Deliverables <span className="text-red-500">*</span></label>
                            <textarea required name="items" value={formData.items || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10 h-24 resize-none" placeholder="e.g. 500 Edited Photos, 1 Album, Drone Shot..." />
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b2d49]/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#f8f9fa]">
                    <div>
                        <h2 className="text-xl font-black text-[#0b2d49]">Add New Service</h2>
                        <p className="text-sm text-[#708aa0] font-medium">Create a new offering for your clients</p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#708aa0] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#708aa0] disabled:hover:border-gray-200"
                    >
                        <BsX size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-6">
                        {/* Category Selector */}
                        <div className="space-y-3 relative z-20">
                            <label className="text-xs font-bold text-[#708aa0] tracking-widest uppercase mb-1">Service Category</label>
                            <div className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-[#0b2d49] font-bold">
                                {SERVICE_CATEGORIES.find(c => c.id === selectedCategory)?.label}
                                <span className="bg-[#f0f4f8] text-[#708aa0] text-[10px] uppercase px-2 py-1 rounded font-black tracking-widest cursor-default">
                                    {initialData ? "Editing" : "Fixed"}
                                </span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gray-100 border-t border-dashed border-gray-200"></div>

                        {/* Dynamic Fields */}
                        <div className="space-y-5 animate-in slide-in-from-bottom-2 fade-in duration-300" key={selectedCategory}>
                            {renderFields()}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-[#f8f9fa] border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-6 py-3 rounded-xl font-bold text-[#708aa0] hover:bg-gray-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        aria-busy={isSaving}
                        className="px-8 py-3 bg-[#0b2d49] text-white rounded-xl font-bold hover:bg-[#d7a444] transition-all flex items-center gap-2 shadow-lg shadow-[#0b2d49]/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-[#0b2d49]"
                    >
                        {isSaving ? (
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                            <BsCheckLg strokeWidth={1} />
                        )}
                        {isSaving ? 'Saving…' : 'Save Service'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AddServiceModal;
