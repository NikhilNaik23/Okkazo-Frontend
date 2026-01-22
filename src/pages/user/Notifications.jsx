import React from "react";
import Navbar from "../../components/Layout/user/Navbar";
import Footer from "../../components/Layout/user/Footer";
import { BsTicketPerforated, BsChatLeftText, BsArrowRepeat, BsStar, BsTag, BsStars, BsCheck2All } from "react-icons/bs";

const Notifications = () => {
    const notifications = {
        new: [
            {
                id: 1,
                title: "Booking Confirmed!",
                message: "Your ticket for 'Neon Lights Concert' has been successfully booked. Check your email for details.",
                time: "2 mins ago",
                unread: true,
                icon: <BsTicketPerforated className="text-emerald-500" />,
                bgColor: "bg-emerald-50"
            },
            {
                id: 2,
                title: "Message from Organizer",
                message: "The event manager for 'Tech Future Summit' sent you a message regarding the agenda.",
                time: "1 hour ago",
                unread: true,
                icon: <BsChatLeftText className="text-blue-500" />,
                bgColor: "bg-blue-50"
            }
        ],
        earlier: [
            {
                id: 3,
                title: "Event Time Changed",
                message: "'Abstract Painting Workshop' has been rescheduled to 7:30 PM this Friday.",
                time: "Yesterday, 4:30 PM",
                unread: false,
                icon: <BsArrowRepeat className="text-amber-500" />,
                bgColor: "bg-amber-50"
            },
            {
                id: 4,
                title: "How was the event?",
                message: "Share your experience at 'Morning Yoga by the Lake' and help others discover it.",
                time: "Oct 24, 2023",
                unread: false,
                icon: <BsStar className="text-indigo-500" />,
                bgColor: "bg-indigo-50"
            }
        ],
        promotions: [
            {
                id: 5,
                title: "Flash Sale: 20% Off",
                message: "Get 20% discount on all music festivals this weekend. Use code FEST20.",
                time: "Oct 22, 2023",
                unread: false,
                icon: <BsTag className="text-rose-500" />,
                bgColor: "bg-rose-50"
            },
            {
                id: 6,
                title: "Recommended for you",
                message: "Based on your interests: 'AI for Good Hackathon' is happening next week.",
                time: "Oct 20, 2023",
                unread: false,
                icon: <BsStars className="text-purple-500" />,
                bgColor: "bg-purple-50"
            }
        ]
    };

    return (
        <div className="min-h-screen bg-[#e9eff1] flex flex-col font-sans text-[#0b2d49]">
            <Navbar />

            <main className="flex-1 max-w-5xl mx-auto w-full px-6 pt-32 pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black mb-3 tracking-tight">Notifications</h1>
                        <p className="text-gray-500 font-medium">Stay updated with your event activities and messages.</p>
                    </div>
                    <button className="flex items-center gap-2 text-sm font-black text-[#d7a444] hover:underline transition-all group">
                        <BsCheck2All size={18} className="group-hover:scale-110 transition-transform" />
                        Mark all as read
                    </button>
                </div>

                <div className="space-y-12">
                    {/* New Section */}
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 pl-2">New</p>
                        <div className="space-y-4">
                            {notifications.new.map((n) => (
                                <div key={n.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex gap-6 group hover:shadow-md transition-all relative overflow-hidden cursor-pointer">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white shadow-sm shadow-black/5 ${n.bgColor}`}>
                                        {n.icon}
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="font-black text-[#0b2d49] text-sm group-hover:text-[#d7a444] transition-colors">{n.title}</h3>
                                            <span className="text-[10px] font-black text-gray-400">{n.time}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-2xl">{n.message}</p>
                                    </div>
                                    {n.unread && <div className="absolute right-6 bottom-6 w-2 h-2 bg-green-500 rounded-full shadow-sm shadow-green-200"></div>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Earlier Section */}
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 pl-2">Earlier</p>
                        <div className="space-y-4">
                            {notifications.earlier.map((n) => (
                                <div key={n.id} className="bg-white/60 backdrop-blur-sm p-6 rounded-[2rem] shadow-sm border border-gray-100/50 flex gap-6 group hover:bg-white hover:shadow-md transition-all cursor-pointer">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white shadow-sm shadow-black/5 ${n.bgColor} opacity-80`}>
                                        {n.icon}
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="font-black text-[#0b2d49] text-sm group-hover:text-[#d7a444] transition-colors">{n.title}</h3>
                                            <span className="text-[10px] font-black text-gray-400">{n.time}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-2xl">{n.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Promotions Section */}
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 pl-2">Promotions</p>
                        <div className="space-y-4">
                            {notifications.promotions.map((n) => (
                                <div key={n.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex gap-6 group hover:shadow-md transition-all cursor-pointer">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white shadow-sm shadow-black/5 ${n.bgColor}`}>
                                        {n.icon}
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="font-black text-[#0b2d49] text-sm group-hover:text-[#d7a444] transition-colors">{n.title}</h3>
                                            <span className="text-[10px] font-black text-gray-400">{n.time}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-2xl">{n.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Button */}
                    <div className="pt-8 text-center">
                        <button className="px-12 py-4 bg-white text-[#0b2d49] font-black rounded-2xl shadow-sm border border-gray-100 hover:bg-[#d7a444] hover:text-[#0b2d49] hover:border-[#d7a444] transition-all active:scale-95 text-xs uppercase tracking-widest">
                            Load more notifications
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Notifications;
