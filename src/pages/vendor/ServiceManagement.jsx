import React, { useState } from "react";
import { 
  BsPlus, 
  BsPencilSquare, 
  BsThreeDotsVertical, 
  BsShop, 
  BsGeoAlt, 
  BsGear,
  BsPlusLg,
  BsTrash
} from "react-icons/bs";
import { MdOutlineRestaurantMenu } from "react-icons/md";
import { toast } from "react-hot-toast";

const ServiceManagement = () => {
  const [activeTab, setActiveTab] = useState("Active Services");

  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      name: "Truffle Mushroom Arancini",
      description: "Crispy risotto balls with black truffle and parmesan",
      category: "VEG",
      price: "12.50",
      status: "Active"
    },
    {
      id: 2,
      name: "Slow-Cooked Butter Chicken",
      description: "Tender chicken in a rich, creamy tomato gravy",
      category: "NON-VEG",
      price: "24.00",
      status: "Active"
    },
    {
      id: 3,
      name: "Mutton Rogan Josh",
      description: "Kashmiri style aromatic lamb curry",
      category: "NON-VEG",
      price: "28.50",
      status: "Active"
    },
    {
      id: 4,
      name: "Paneer Tikka Masala",
      description: "Char-grilled cottage cheese in spiced gravy",
      category: "VEG",
      price: "19.50",
      status: "Active"
    }
  ]);

  const [venues, setVenues] = useState([
    {
      id: 1,
      name: "Grand Crystal Ballroom",
      location: "Manhattan, NY",
      capacity: 500,
      price: "2,500",
      image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800",
      status: "Active"
    },
    {
      id: 2,
      name: "Rooftop Sky Garden",
      location: "Brooklyn, NY",
      capacity: 150,
      price: "1,800",
      image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800",
      status: "Active"
    }
  ]);

  const handleAddItem = () => {
    const newItem = {
        id: Date.now(),
        name: "New Culinary Creation",
        description: "Freshly added menu item with unique flavors.",
        category: "VEG",
        price: "15.00",
        status: "Active"
    };
    setMenuItems([...menuItems, newItem]);
    toast.success("New menu item added!", {
        style: { borderRadius: '16px', background: '#0b2d49', color: '#fff', fontWeight: 'bold' }
    });
  };

  const handleDeleteItem = (id) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
    toast.error("Item removed from menu.", {
        style: { borderRadius: '16px', background: '#0b2d49', color: '#fff', fontWeight: 'bold' }
    });
  };

  const handleAddVenue = () => {
      const newVenue = {
          id: Date.now(),
          name: "Elegant Terrace Room",
          location: "Queens, NY",
          capacity: 100,
          price: "1,200",
          image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800",
          status: "Active"
      };
      setVenues([...venues, newVenue]);
      toast.success("New venue listing created!", {
          style: { borderRadius: '16px', background: '#0b2d49', color: '#fff', fontWeight: 'bold' }
      });
  };

  const filteredMenuItems = menuItems.filter(item => {
      if (activeTab.includes("Active")) return item.status === "Active";
      if (activeTab.includes("Drafts")) return item.status === "Draft";
      return item.status === "Archived";
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <h1 className="text-3xl font-black tracking-tight">Service Management</h1>
        <button 
            onClick={handleAddVenue}
            className="flex items-center gap-2 px-6 py-3 bg-[#0b2d49] text-white rounded-2xl font-bold hover:bg-[#d7a444] transition-all shadow-lg active:scale-95"
        >
          <BsPlusLg strokeWidth={1} />
          Add New Service
        </button>
      </div>

      {/* Primary Tabs */}
      <div className="flex border-b border-[#708aa0]/10 mb-8 overflow-x-auto no-scrollbar">
        {["Active Services (3)", "Drafts (1)", "Archived"].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-4 text-sm font-black transition-all relative shrink-0 ${activeTab === tab ? 'text-[#0b2d49]' : 'text-[#708aa0] hover:text-[#0b2d49]'}`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0b2d49]"></div>
            )}
          </button>
        ))}
      </div>

      {/* Catering Section */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#708aa0]/5 mb-10 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-[#e9eff1] rounded-[1.5rem] flex items-center justify-center text-[#d7a444] shadow-inner">
                    <MdOutlineRestaurantMenu size={32} />
                </div>
                <div>
                    <h2 className="text-xl font-black">Catering Menus</h2>
                    <p className="text-sm text-[#708aa0] font-medium">Consolidated menu items with per-person pricing</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button className="px-6 py-3 bg-white border-2 border-[#e9eff1] text-[#0b2d49] rounded-2xl font-bold text-sm hover:border-[#0b2d49] transition-all flex items-center gap-2">
                    <BsPencilSquare /> Edit Menu
                </button>
                <button 
                    onClick={handleAddItem}
                    className="px-6 py-3 bg-[#0b2d49] text-white rounded-2xl font-bold text-sm hover:bg-[#d7a444] transition-all flex items-center gap-2 shadow-lg shadow-[#0b2d49]/10"
                >
                    <BsPlus size={24} /> Add Item
                </button>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="bg-gray-50/50">
                        <th className="px-8 py-4 text-left text-[10px] font-black text-[#708aa0] uppercase tracking-widest">Item Name & Description</th>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-[#708aa0] uppercase tracking-widest">Diet Category</th>
                        <th className="px-8 py-4 text-left text-[10px] font-black text-[#708aa0] uppercase tracking-widest">Price / Person</th>
                        <th className="px-8 py-4 text-right text-[10px] font-black text-[#708aa0] uppercase tracking-widest">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {filteredMenuItems.length > 0 ? filteredMenuItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/30 transition-all group">
                            <td className="px-8 py-6">
                                <h4 className="font-black text-[#0b2d49] mb-1">{item.name}</h4>
                                <p className="text-xs text-[#5a5b44] font-medium leading-relaxed">{item.description}</p>
                            </td>
                            <td className="px-8 py-6">
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${item.category === 'VEG' ? 'bg-[#d7a444]/10 text-[#d7a444]' : 'bg-red-50 text-red-500'}`}>
                                    ● {item.category}
                                </span>
                            </td>
                            <td className="px-8 py-6">
                                <span className="text-[#0b2d49] font-black">${item.price}</span>
                            </td>
                            <td className="px-8 py-6 text-right">
                                <div className="flex justify-end gap-2">
                                    <button className="p-2 text-[#708aa0] hover:text-[#0b2d49] hover:bg-white shadow-sm rounded-lg transition-all">
                                        <BsPencilSquare size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="p-2 text-[#708aa0] hover:text-red-500 hover:bg-white shadow-sm rounded-lg transition-all"
                                    >
                                        <BsTrash size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="4" className="px-8 py-20 text-center">
                                <p className="text-[#708aa0] font-bold">No items found in this category.</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Venue Section */}
      <div className="mb-10">
        <div className="flex items-center gap-6 mb-8">
            <div className="w-16 h-16 bg-[#e9eff1] rounded-[1.5rem] flex items-center justify-center text-[#d7a444] shadow-inner">
                <BsShop size={28} />
            </div>
            <div>
                <h2 className="text-xl font-black">Venue Listings</h2>
                <p className="text-sm text-[#708aa0] font-medium">Manage your event spaces and capacities</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {venues.map((venue) => (
                <div key={venue.id} className="bg-white rounded-[2.5rem] shadow-sm border border-[#708aa0]/5 overflow-hidden group hover:shadow-xl hover:shadow-[#0b2d49]/5 transition-all duration-500">
                    <div className="relative h-64">
                        <img src={venue.image} alt={venue.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-6 right-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/20">
                            <span className="text-xs font-black text-[#0b2d49] uppercase tracking-tighter flex items-center gap-2">
                                <div className="w-2 h-2 bg-[#d7a444] rounded-full animate-pulse"></div>
                                {venue.capacity} Cap.
                            </span>
                        </div>
                    </div>
                    <div className="p-8">
                        <h3 className="text-lg font-black text-[#0b2d49] mb-1">{venue.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-[#708aa0] font-medium mb-4">
                            <BsGeoAlt /> {venue.location}
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <span className="text-[#d7a444] font-black text-lg">${venue.price} / day</span>
                            <button className="p-2 text-[#708aa0] hover:text-[#0b2d49] hover:bg-gray-50 rounded-xl transition-all">
                                <BsGear size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* List New Venue Card */}
            <button 
                onClick={handleAddVenue}
                className="bg-[#e9eff1]/30 border-2 border-dashed border-[#708aa0]/20 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center group hover:bg-[#e9eff1]/50 hover:border-[#d7a444]/50 transition-all duration-500 min-h-[400px]"
            >
                <div className="w-20 h-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center text-[#d7a444] mb-6 group-hover:scale-110 transition-transform duration-500">
                    <BsPlusLg size={32} />
                </div>
                <h3 className="text-lg font-black text-[#0b2d49] mb-2 uppercase tracking-tight">List New Venue</h3>
                <p className="text-xs text-[#708aa0] font-bold max-w-[200px] leading-relaxed">Add photos, capacity, and pricing to reach more event planners.</p>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceManagement;
