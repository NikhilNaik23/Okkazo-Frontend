import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { BsSearch, BsFilter, BsArrowRight, BsArrowLeft, BsHeart, BsHeartFill, BsGeoAlt } from "react-icons/bs";
import { popularEvents, allEvents } from "../../../data/eventsData";
import { selectUser } from "../../../store/slices/authSlice";

const UserDashboard = () => {
    // State for pagination
    const [currentPage, setCurrentPage] = React.useState(1);
    const navigate = useNavigate();
    const user = useSelector(selectUser);
    const eventsPerPage = 8;

    // Pagination Logic
    const indexOfLastItem = currentPage * eventsPerPage;
    const indexOfFirstItem = indexOfLastItem - eventsPerPage;
    const currentItems = allEvents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(allEvents.length / eventsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 800, behavior: 'smooth' }); // Scroll to grid
    };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#e9eff1] via-[#f3ddb1]/30 to-[#e9eff1] font-sans w-full overflow-x-hidden flex flex-col">
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-12">
        
        {/* Welcome & Search Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#0b2d49] mb-2 tracking-tight">
                    Welcome back, {user?.name || user?.fullName || "User"}!
                </h1>
                <p className="text-gray-500 text-sm md:text-lg">Discover the best experiences happening around you.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-96 group">
                    <input 
                        type="text" 
                        placeholder="Search events, artists, venues..." 
                        className="w-full pl-12 pr-4 py-3 md:py-3.5 rounded-full border border-gray-200 focus:border-[#d7a444] focus:ring-4 focus:ring-[#d7a444]/10 outline-none bg-white shadow-sm transition-all group-hover:shadow-md text-sm md:text-base"
                    />
                    <BsSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#d7a444] transition-colors" />
                </div>
                <Link to="/user/planning-wizard" className="w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-3.5 bg-[#0b2d49] text-white rounded-full hover:bg-[#071d30] font-bold shadow-sm cursor-pointer transition-all active:scale-95 text-sm md:text-base border border-transparent shadow-[#0b2d49]/20 hover:shadow-lg">
                    <span className="text-xl">+</span>
                    Plan Event
                </Link>
                <button className="w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-3.5 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-[#d7a444] text-[#0b2d49] font-bold shadow-sm cursor-pointer transition-all active:scale-95 text-sm md:text-base">
                    <BsFilter size={20} />
                    Filter
                </button>
            </div>
        </div>

        {/* Popular Events Section */}
        <div className="mb-20">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <span className="text-orange-500 text-2xl animate-pulse">🔥</span>
                    <h2 className="text-3xl font-bold text-[#0b2d49] tracking-tight">Popular Events</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {popularEvents.map(event => (
                    <div 
                        key={event.id} 
                        onClick={() => navigate(`/user/event/${event.id}`)}
                        className="group relative h-[420px] rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                    >
                        <img src={event.image} alt={event.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b2d49]/90 via-[#0b2d49]/20 to-transparent"></div>
                        
                        <div className="absolute top-6 left-6">
                            <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-sm font-bold rounded-full border border-white/30 shadow-sm">
                                {event.tag}
                            </span>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform transition-transform duration-300">
                            <p className="text-[#d7a444] font-bold text-sm mb-2 uppercase tracking-widest">{event.date}</p>
                            <h3 className="text-3xl font-extrabold mb-3 leading-tight">{event.title}</h3>
                            <div className="flex items-center justify-between mt-6">
                                <div className="flex items-center gap-2 text-sm text-gray-200 font-medium bg-black/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                                    <BsGeoAlt />
                                    {event.location}
                                </div>
                                <span className="px-4 py-2 bg-[#d7a444] text-[#0b2d49] font-bold rounded-xl text-md shadow-lg shadow-orange-500/20">
                                    {event.price}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* All Events Section */}
        <div id="all-events">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-[#0b2d49] tracking-tight">All Events</h2>
                <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                    Showing <span className="text-[#0b2d49] font-bold">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, allEvents.length)}</span> of <span className="text-[#0b2d49] font-bold">{allEvents.length}</span> events
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                 {currentItems.map(event => (
                    <div 
                        key={event.id} 
                        onClick={() => navigate(`/user/event/${event.id}`)}
                        className="bg-white rounded-3xl p-4 hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer group hover:-translate-y-1"
                    >
                        <div className="relative h-48 rounded-2xl overflow-hidden mb-5">
                            <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm cursor-pointer text-gray-400 hover:text-red-500 hover:bg-white transition-all">
                                <BsHeart size={16} />
                            </div>
                            <div className="absolute bottom-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-bold text-[#0b2d49] rounded-lg shadow-sm">
                                {event.tag}
                            </div>
                        </div>
                        
                        <div className="space-y-3 px-1">
                             <p className="text-[#d7a444] font-bold text-xs uppercase tracking-wider">{event.date}</p>
                             <h3 className="font-bold text-[#0b2d49] text-lg line-clamp-2 leading-snug group-hover:text-[#d7a444] transition-colors">{event.title}</h3>
                             <p className="text-sm text-gray-500 flex items-center gap-1.5"><BsGeoAlt size={12}/> {event.location}</p>
                             
                             <div className="pt-4 flex items-center justify-between border-t border-gray-50/50 mt-2">
                                <span className="font-extrabold text-xl text-[#0b2d49]">{event.price}</span>
                                <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md">{event.status}</span>
                             </div>
                        </div>
                    </div>
                 ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-3 mb-10">
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-[#0b2d49] border border-gray-200 hover:border-[#d7a444] hover:text-[#d7a444] shadow-sm cursor-pointer'}`}
                    >
                        <BsArrowLeft /> Previous
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => (
                        <button 
                            key={index}
                            onClick={() => handlePageChange(index + 1)}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all cursor-pointer ${currentPage === index + 1 ? 'bg-[#0b2d49] text-white shadow-lg shadow-blue-900/20' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#d7a444]'}`}
                        >
                            {index + 1}
                        </button>
                    ))}

                    <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-[#0b2d49] border border-gray-200 hover:border-[#d7a444] hover:text-[#d7a444] shadow-sm cursor-pointer'}`}
                    >
                        Next <BsArrowRight />
                    </button>
                </div>
            )}
        </div>

      </main>
    </div>
  );
};

export default UserDashboard;
