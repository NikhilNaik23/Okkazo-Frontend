import React, { useState } from 'react';
import { 
    MdSearch, 
    MdFilterList, 
    MdCheckCircle, 
    MdVolumeOff,
    MdMoreHoriz
} from 'react-icons/md';
import { vendorNotificationsData } from '../../../data/vendorNotificationsData';

const ManagerNotifications = () => {
    const [notifications, setNotifications] = useState(vendorNotificationsData);
    const [activeTab, setActiveTab] = useState('all'); // all, unread, system
    const [searchTerm, setSearchTerm] = useState('');

    const allItems = [
        ...notifications.new.map(n => ({ ...n, category: 'New' })),
        ...notifications.earlier.map(n => ({ ...n, category: 'Earlier' })),
        ...notifications.promotions.map(n => ({ ...n, category: 'Promotions' }))
    ];

    const filteredNotifications = allItems.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             n.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'all' || 
                          (activeTab === 'unread' && n.unread) ||
                          (activeTab === 'system' && n.category !== 'Promotions');
        return matchesSearch && matchesTab;
    });

    const markAllAsRead = () => {
        setNotifications(prev => ({
            ...prev,
            new: prev.new.map(n => ({ ...n, unread: false }))
        }));
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-teal-900 tracking-tight mb-2">Notifications</h1>
                        <p className="text-teal-600/60 font-medium italic">Review your event management alerts and system updates</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={markAllAsRead}
                            className="bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-bold text-teal-900 hover:bg-teal-50 hover:border-teal-600/20 transition-all flex items-center gap-2 shadow-sm"
                        >
                            <MdCheckCircle className="text-teal-600" size={18} />
                            Mark all as read
                        </button>
                    </div>
                </div>

                {/* Filters and Search Bar */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center p-1 bg-gray-50 rounded-xl w-fit">
                        {['all', 'unread', 'system'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                                    activeTab === tab 
                                    ? 'bg-teal-600 text-white shadow-md' 
                                    : 'text-gray-500 hover:text-teal-600'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 lg:w-80">
                            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="text"
                                placeholder="Search notifications..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-600/10 transition-all text-gray-700"
                            />
                        </div>
                        <button className="p-2.5 bg-gray-50 text-teal-900 rounded-xl hover:bg-gray-100 transition-all border border-gray-100">
                            <MdFilterList size={22} />
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notif) => (
                            <div 
                                key={notif.id}
                                className={`group bg-white rounded-2xl p-5 border transition-all flex items-start gap-5 hover:shadow-lg hover:shadow-teal-900/5 ${
                                    notif.unread 
                                    ? 'border-l-4 border-l-teal-500 border-gray-100 shadow-sm' 
                                    : 'border-gray-100 opacity-80'
                                }`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${notif.bgColor} text-2xl shadow-inner`}>
                                    {notif.icon}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-4 mb-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className={`text-lg font-black truncate ${notif.unread ? 'text-teal-900' : 'text-gray-400'}`}>
                                                {notif.title}
                                            </h3>
                                            {notif.unread && (
                                                <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[9px] font-black uppercase rounded-lg tracking-wider">New</span>
                                            )}
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 whitespace-nowrap">{notif.time}</span>
                                    </div>
                                    <p className={`text-[15px] leading-relaxed mb-4 ${notif.unread ? 'text-gray-600' : 'text-gray-400'}`}>
                                        {notif.message}
                                    </p>
                                    
                                    <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-[10px] font-black uppercase tracking-[0.15em] text-teal-600 hover:text-teal-900 transition-colors">Action Required</button>
                                        <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                        <button className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 hover:text-rose-600 transition-colors">Delete</button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button className="p-2 text-gray-300 hover:text-teal-900 hover:bg-gray-50 rounded-lg transition-all">
                                        <MdMoreHoriz size={20} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <MdVolumeOff className="text-gray-300" size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-teal-900 mb-2">No notifications found</h3>
                            <p className="text-gray-400">Try adjusting your search or filters to find what you're looking for.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManagerNotifications;
