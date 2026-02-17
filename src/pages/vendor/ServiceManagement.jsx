import React, { useState, useEffect } from "react";
import {
    BsShop,
    BsGeoAlt,
    BsPlusLg,
    BsPencilSquare,
    BsBriefcase,
    BsCamera,
    BsCameraVideo,
    BsPalette,
    BsMusicNoteBeamed,
    BsBrush,
    BsEnvelope,
    BsSpeaker,
    BsTools,
    BsShieldCheck,
    BsTruck,
    BsBroadcast,
    BsThreeDotsVertical,
    BsTrash
} from "react-icons/bs";
import { MdOutlineRestaurantMenu, MdCake } from "react-icons/md";
import { toast } from "react-hot-toast";
import AddServiceModal from "../../components/Vendor/ServiceManagement/AddServiceModal";
import { SERVICE_CATEGORIES, INITIAL_PACKAGES, INITIAL_VENUES } from "../../components/Vendor/ServiceManagement/constants";

const iconMap = {
    BsShop,
    MdOutlineRestaurantMenu,
    BsCamera,
    BsCameraVideo,
    BsPalette,
    BsMusicNoteBeamed,
    BsBrush,
    BsEnvelope,
    BsSpeaker,
    BsTools,
    BsShieldCheck,
    BsTruck,
    BsBroadcast,
    MdCake
};

import { vendorProfileData } from "../../data/vendorProfileData.jsx";

const ServiceManagement = () => {
    // Determine allowed category from profile
    const profileServiceType = vendorProfileData.businessDetails.serviceCategory;
    const allowedCategoryObj = SERVICE_CATEGORIES.find(cat =>
        cat.label.toLowerCase().includes(profileServiceType.toLowerCase()) ||
        cat.id === profileServiceType.toLowerCase()
    );
    const allowedCategoryId = allowedCategoryObj ? allowedCategoryObj.id : SERVICE_CATEGORIES[0].id;

    const [activeCategory, setActiveCategory] = useState(allowedCategoryId);
    const [editingService, setEditingService] = useState(null);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedServices, setExpandedServices] = useState({});

    // Initialize state with data for venues and catering, others empty
    const [services, setServices] = useState({
        venues: INITIAL_VENUES,
        catering: INITIAL_PACKAGES,
        photography: [],
        videography: [],
        decor: [],
        entertainment: [],
        makeup: [],
        invitations: [],
        sound: [],
        rental: [],
        security: [],
        transport: [],
        media: [],
        cakes: []
    });

    // Only show the category allowed by the profile
    const visibleCategories = [allowedCategoryObj || SERVICE_CATEGORIES[0]];

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleAddService = (serviceData) => {
        const categoryId = allowedCategoryId;

        setServices(prev => {
            const categoryItems = prev[categoryId] || [];

            if (editingService) {
                // Update existing
                const updatedItems = categoryItems.map(item =>
                    item.id === editingService.id ? { ...item, ...serviceData } : item
                );
                return { ...prev, [categoryId]: updatedItems };
            } else {
                // Add new
                const serviceToAdd = {
                    id: Date.now(),
                    ...serviceData,
                    status: "Active"
                };
                return { ...prev, [categoryId]: [...categoryItems, serviceToAdd] };
            }
        });

        toast.success(editingService ? "Service updated successfully!" : "New service added successfully!");
        setEditingService(null); // Reset editing state
    };

    const handleEditService = (item, e) => {
        e.stopPropagation(); // Prevent menu close from affecting this strictly
        setEditingService(item);
        setIsModalOpen(true);
        setActiveMenuId(null);
    };

    const handleDeleteService = (itemId, e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this service?")) {
            setServices(prev => ({
                ...prev,
                [allowedCategoryId]: prev[allowedCategoryId].filter(item => item.id !== itemId)
            }));
            toast.success("Service deleted.");
        }
        setActiveMenuId(null);
    };

    const toggleMenu = (itemId, e) => {
        e.stopPropagation();
        setActiveMenuId(activeMenuId === itemId ? null : itemId);
    };

    const currentServices = services[activeCategory] || [];

    const renderServiceCard = (item) => {
        // Common Menu Component
        const Menu = () => (
            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={(e) => toggleMenu(item.id, e)}
                    className="w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-[#0b2d49] hover:bg-[#0b2d49] hover:text-white transition-all"
                >
                    <BsThreeDotsVertical size={16} />
                </button>

                {activeMenuId === item.id && (
                    <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1 z-20 animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={(e) => handleEditService(item, e)}
                            className="w-full text-left px-4 py-2 text-sm font-bold text-[#0b2d49] hover:bg-gray-50 flex items-center gap-2"
                        >
                            <BsPencilSquare size={12} /> Edit
                        </button>
                        <button
                            onClick={(e) => handleDeleteService(item.id, e)}
                            className="w-full text-left px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                        >
                            <BsTrash size={12} /> Delete
                        </button>
                    </div>
                )}
            </div>
        );

        if (activeCategory === 'catering') {
            return (
                <div key={item.id} className="relative bg-white rounded-[2rem] border-2 border-[#e9eff1] overflow-hidden group hover:border-[#d7a444] transition-all duration-300 hover:shadow-xl flex flex-col h-full">
                    <Menu />
                    <div className="p-8 flex flex-col h-full">
                        <div className="mb-6 mr-8">
                            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest mb-3 ${item.tierBg || 'bg-gray-100'} ${item.tierText || 'text-gray-600'}`}>
                                {item.tier || 'Standard'}
                            </span>
                            <h3 className="text-2xl font-black text-[#0b2d49]">{item.name}</h3>
                        </div>

                        <div className="mb-6 pb-6 border-b border-dashed border-gray-200">
                            <span className="text-3xl font-black text-[#0b2d49]">{item.price}</span>
                            <span className="text-sm text-[#708aa0] font-medium ml-1">approx.</span>
                        </div>

                        <div className="space-y-3 mb-8 flex-grow">
                            {item.items && (expandedServices[item.id] ? item.items : item.items.slice(0, 5)).map((inc, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="mt-1 min-w-[16px] flex items-center justify-center text-[#d7a444]">
                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="14" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"></path></svg>
                                    </div>
                                    <span className="text-[#5a5b44] font-medium text-sm leading-snug">{inc}</span>
                                </div>
                            ))}
                            {item.items && item.items.length > 5 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedServices(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                                    }}
                                    className="text-xs font-bold text-[#708aa0] pl-7 hover:text-[#0b2d49] transition-colors focus:outline-none"
                                >
                                    {expandedServices[item.id] ? "Show Less" : `+ ${item.items.length - 5} more items`}
                                </button>
                            )}
                        </div>


                    </div>
                </div>
            );
        } else if (activeCategory === 'venues') {
            return (
                <div key={item.id} className="relative bg-white rounded-[2rem] border-2 border-[#e9eff1] overflow-hidden group hover:border-[#d7a444] transition-all duration-300 hover:shadow-xl flex flex-col">
                    <Menu />
                    <div className="p-8 flex flex-col h-full bg-white">
                        {/* Top Section */}
                        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                            <img
                                src={item.image || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800"}
                                alt={item.name}
                                className="w-24 h-24 rounded-full object-cover shadow-md border-4 border-white"
                            />
                            <div className="flex-grow">
                                <h3 className="text-3xl font-black text-[#0b2d49] mb-3">{item.name}</h3>
                                <div className="flex flex-wrap items-center gap-6 text-[#708aa0] font-medium text-sm">
                                    <span className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#d7a444]"></span>
                                        ₹{item.price} / day
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <BsGeoAlt size={16} />
                                        {item.location}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <BsBriefcase size={16} />
                                        {item.capacity} Guests
                                    </span>
                                </div>
                            </div>
                            {/* Edit button moved to menu */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0 pt-8 md:pt-0">

                            </div>
                        </div>

                        <div className="h-px bg-gray-100 my-8"></div>

                        {/* Bottom Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Statistics */}
                            <div>
                                <h4 className="text-lg font-black text-[#0b2d49] mb-6">Venue Statistics</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-5 bg-[#f8f9fa] rounded-2xl group-hover:bg-[#f0f4f8] transition-colors">
                                        <span className="text-[#708aa0] font-bold text-sm">Seating Capacity</span>
                                        <span className="text-[#0b2d49] font-black">{item.capacity} Guests</span>
                                    </div>
                                    <div className="flex items-center justify-between p-5 bg-[#f8f9fa] rounded-2xl group-hover:bg-[#f0f4f8] transition-colors">
                                        <span className="text-[#708aa0] font-bold text-sm">Location</span>
                                        <span className="text-[#0b2d49] font-black">{item.location}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-5 bg-[#f8f9fa] rounded-2xl group-hover:bg-[#f0f4f8] transition-colors">
                                        <span className="text-[#708aa0] font-bold text-sm">Daily Rate</span>
                                        <span className="text-[#0b2d49] font-black">₹{item.price}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Gallery Preview */}
                            <div>
                                <h4 className="text-lg font-black text-[#0b2d49] mb-6">Gallery Preview</h4>
                                <div className="rounded-2xl overflow-hidden h-64 border-4 border-white shadow-sm group-hover:shadow-md transition-all">
                                    <img src={item.image || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800"} alt="Gallery" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            // Generic Card for other services
            return (
                <div key={item.id} className="relative bg-white rounded-[2rem] border-2 border-[#e9eff1] overflow-hidden group hover:border-[#d7a444] transition-all duration-300 hover:shadow-xl p-8 flex flex-col">
                    <Menu />
                    <div className="flex justify-between items-start mb-4 pr-8">
                        <h3 className="text-2xl font-black text-[#0b2d49]">{item.name}</h3>
                        <span className="px-3 py-1 bg-[#e9eff1] text-[#708aa0] rounded-lg text-xs font-bold uppercase">{activeCategory}</span>
                    </div>
                    <div className="mb-6">
                        <span className="text-3xl font-black text-[#0b2d49]">{item.price}</span>
                    </div>
                    <div className="flex-grow text-[#708aa0] font-medium mb-6">
                        {item.description || "No description provided."}
                    </div>

                </div>
            );
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingService(null);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-6 border-b border-gray-100 pb-8 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-[#0b2d49]">Service Management</h1>
                        <p className="text-[#708aa0] mt-2 font-medium">Manage your {activeCategory.replace('_', ' ')} offerings</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-[#0b2d49] text-white rounded-2xl font-bold hover:bg-[#d7a444] transition-all shadow-lg active:scale-95 whitespace-nowrap"
                    >
                        <BsPlusLg strokeWidth={1} />
                        <span className="hidden lg:inline">Add New</span>
                    </button>
                </div>

                {/* Scrollable Category Tabs */}
                {visibleCategories.length > 0 && (
                    <div className="w-full overflow-x-auto pb-4 no-scrollbar">
                        <div className="flex gap-3 min-w-max">
                            {visibleCategories.map((cat) => {
                                const Icon = iconMap[cat.icon];
                                const isActive = activeCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`px-5 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 border-2 ${isActive
                                            ? "bg-[#0b2d49] text-white border-[#0b2d49] shadow-lg shadow-[#0b2d49]/20"
                                            : "bg-white text-[#708aa0] border-[#e9eff1] hover:border-[#d7a444] hover:text-[#0b2d49]"
                                            }`}
                                    >
                                        {Icon && <Icon size={18} />}
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Content Grid */}
            <div className={`grid gap-8 pb-20 ${activeCategory === "catering" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : (activeCategory === "venues" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3")}`}>
                {currentServices.map((item) => renderServiceCard(item))}

                {/* Add New Ghost Card (Always visible) */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className={`rounded-[2.5rem] border-3 border-dashed border-[#e9eff1] flex flex-col items-center justify-center p-8 text-center group hover:bg-[#f8f9fa] hover:border-[#d7a444] transition-all duration-300 ${allowedCategoryId === "catering" ? "min-h-[400px]" : (allowedCategoryId === "venues" ? "min-h-[200px]" : "min-h-[300px]")}`}
                >
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#d7a444] mb-4 group-hover:scale-110 transition-transform">
                        <BsPlusLg size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-[#0b2d49]">Add New {allowedCategoryId === "venues" ? "Listing" : "Service"}</h3>
                </button>
            </div>

            <AddServiceModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleAddService}
                allowedCategory={allowedCategoryId}
                initialData={editingService}
            />
        </div>
    );
};

export default ServiceManagement;
