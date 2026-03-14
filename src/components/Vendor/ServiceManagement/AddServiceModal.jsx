
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { BsX, BsCheckLg } from 'react-icons/bs';
import { SERVICE_CATEGORIES } from './constants';
import { toast } from 'react-hot-toast';
import { addVendorService } from '../../../store/slices/vendorSlice';

const AddServiceModal = ({ isOpen, onClose, onSave, allowedCategory, initialData }) => {
    const dispatch = useDispatch();

    // If allowedCategory is provided, use it. Otherwise default to first available.
    const [selectedCategory, setSelectedCategory] = useState(allowedCategory || SERVICE_CATEGORIES[0].id);
    const [formData, setFormData] = useState({});

    // Sync state if allowedCategory changes or modal opens
    React.useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Determine category from initialData if not strictly enforced, though allowedCategory usually takes precedence
                const category = initialData.category || allowedCategory || SERVICE_CATEGORIES[0].id;
                setSelectedCategory(category);

                // Prepare form data
                const processedData = { ...initialData };

                // Special handling for array -> string conversions for catering items
                if (category === 'catering' && Array.isArray(processedData.items)) {
                    processedData.items = processedData.items.join(', ');
                }

                setFormData(processedData);
            } else {
                // Reset for new entry
                setFormData({});
                if (allowedCategory) setSelectedCategory(allowedCategory);
                else setSelectedCategory(SERVICE_CATEGORIES[0].id);
            }
        }
    }, [isOpen, initialData, allowedCategory]);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validData = { ...formData };

        // Post-processing: String -> Array for catering items (kept for local UI)
        if (selectedCategory === 'catering' && typeof validData.items === 'string') {
            validData.items = validData.items.split(',').map(i => i.trim()).filter(i => i);
        }

        // If editing, there is currently no backend update endpoint.
        // Update locally via the parent handler.
        if (initialData) {
            onSave({
                ...initialData,
                categoryId: selectedCategory,
                name: validData.name,
                price: validData.price,
                tier: validData.tier || null,
                description: validData.description || null,
                details: selectedCategory === 'catering'
                    ? { items: validData.items }
                    : selectedCategory === 'venues'
                        ? { capacity: validData.capacity, location: validData.location }
                        : { items: validData.items || null },
            });
            onClose();
            return;
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
            payload.details = {
                capacity: validData.capacity,
                location: validData.location,
            };
        } else {
            // Generic: pass items / any extra field into details
            payload.details = {
                items: validData.items || null,
            };
        }

        try {
            const savedService = await dispatch(addVendorService({ payload })).unwrap();

            // Let the parent refresh UI using the saved backend doc
            onSave(savedService);
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err?.message || err || 'Network error — could not save service');
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
                            <label className="text-sm font-bold text-[#708aa0]">Location <span className="text-red-500">*</span></label>
                            <input required name="location" value={formData.location || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10" placeholder="Complete Address" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#708aa0]">Description <span className="text-red-500">*</span></label>
                            <textarea required name="description" value={formData.description || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10 h-24 resize-none" placeholder="Describe the venue features..." />
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
            <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#f8f9fa]">
                    <div>
                        <h2 className="text-xl font-black text-[#0b2d49]">Add New Service</h2>
                        <p className="text-sm text-[#708aa0] font-medium">Create a new offering for your clients</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#708aa0] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all">
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
                    <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-[#708aa0] hover:bg-gray-200 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className="px-8 py-3 bg-[#0b2d49] text-white rounded-xl font-bold hover:bg-[#d7a444] transition-all flex items-center gap-2 shadow-lg shadow-[#0b2d49]/20">
                        <BsCheckLg strokeWidth={1} />
                        Save Service
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AddServiceModal;
