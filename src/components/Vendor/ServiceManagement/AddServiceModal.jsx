
import React, { useState } from 'react';
import { BsX, BsCheckLg, BsChevronDown } from 'react-icons/bs';
import { SERVICE_CATEGORIES } from './constants';

const AddServiceModal = ({ isOpen, onClose, onSave, allowedCategory, initialData }) => {
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

    const handleCategoryChange = (e) => {
        if (allowedCategory || initialData) return; // Lock if allowed or editing
        setSelectedCategory(e.target.value);
        setFormData({}); // Reset form data on category switch
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const validData = { ...formData };

        // Post-processing: String -> Array for catering items
        if (selectedCategory === 'catering' && typeof validData.items === 'string') {
            validData.items = validData.items.split(',').map(i => i.trim()).filter(i => i);
        }

        onSave({ category: selectedCategory, ...validData });
        onClose();
    };

    const renderFields = () => {
        switch (selectedCategory) {
            case 'venues':
                return (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#708aa0]">Venue Name</label>
                            <input name="name" value={formData.name || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10" placeholder="e.g. Grand Ballroom" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#708aa0]">Capacity</label>
                                <input name="capacity" value={formData.capacity || ''} onChange={handleInputChange} type="number" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10" placeholder="500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#708aa0]">Price per Day</label>
                                <input name="price" value={formData.price || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10" placeholder="₹25,000" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#708aa0]">Location</label>
                            <input name="location" value={formData.location || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10" placeholder="Complete Address" />
                        </div>
                    </>
                );
            case 'catering':
                return (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#708aa0]">Package Name</label>
                            <input name="name" value={formData.name || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10" placeholder="e.g. Traditional Feast" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#708aa0]">Price per Plate</label>
                                <input name="price" value={formData.price || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10" placeholder="₹850" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#708aa0]">Tier</label>
                                <select name="tier" value={formData.tier || 'Economy'} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10">
                                    <option value="Economy">Economy</option>
                                    <option value="Mid-Range">Mid-Range</option>
                                    <option value="Luxury">Luxury</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#708aa0]">Included Items (comma separated)</label>
                            <textarea name="items" value={formData.items || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10 h-24 resize-none" placeholder="Starter, Main Course, Dessert..." />
                        </div>
                    </>
                );
            default:
                return (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#708aa0]">Service/Package Name</label>
                            <input name="name" value={formData.name || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10" placeholder="Service Name" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#708aa0]">Price / Starting From</label>
                            <input name="price" value={formData.price || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10" placeholder="₹5,000" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#708aa0]">Description</label>
                            <textarea name="description" value={formData.description || ''} onChange={handleInputChange} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#0b2d49]/10 h-24 resize-none" placeholder="Describe your service..." />
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
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#708aa0] uppercase tracking-wider">Service Category</label>
                            {allowedCategory ? (
                                <div className="w-full p-4 bg-gray-50 border-2 border-[#e9eff1] rounded-2xl font-bold text-[#0b2d49]">
                                    {SERVICE_CATEGORIES.find(c => c.id === allowedCategory)?.label || allowedCategory}
                                </div>
                            ) : (
                                <div className="relative">
                                    <select
                                        value={selectedCategory}
                                        onChange={handleCategoryChange}
                                        className="w-full p-4 pr-10 bg-white border-2 border-[#e9eff1] rounded-2xl font-bold text-[#0b2d49] appearance-none focus:border-[#d7a444] focus:ring-0 outline-none transition-all cursor-pointer"
                                    >
                                        {SERVICE_CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#708aa0] pointer-events-none">
                                        <BsChevronDown />
                                    </div>
                                </div>
                            )}
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
