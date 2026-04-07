import React, { useEffect, useMemo, useState } from 'react';
import { Search, ChevronDown, Filter, Calendar as CalendarIcon, LayoutGrid, List, Kanban as KanbanIcon, MoreHorizontal, X, Plus, Users, Calendar, Archive, Download, CheckSquare, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ManagerEventCard from '../../../components/Global/cards/ManagerEventCard';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchManagerPlanningEvents,
    fetchManagerPromoteEvents,
} from '../../../store/slices/managerEventsSlice';

const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1505373877841-8d43f703fb8f?q=80&w=1000&auto=format&fit=crop';

const formatShortDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
};

const normalizeUpper = (value) => String(value || '').toUpperCase().replace(/_/g, ' ').trim();

const mapPlanningStatusToCardStatus = (status) => {
    const s = normalizeUpper(status);
    if (s === 'PAYMENT PENDING') return 'Payment';
    if (s === 'PENDING APPROVAL') return 'Review';
    if (s === 'APPROVED') return 'Finalizing';
    if (s === 'CONFIRMED') return 'Confirmed';
    if (s === 'IMMEDIATE ACTION') return 'Planning';
    if (s === 'COMPLETED') return 'Completed';
    if (s === 'REJECTED') return 'Rejected';
    return s ? s[0] + s.slice(1).toLowerCase() : 'Planning';
};

const mapPromoteStatusToCardStatus = (eventStatus) => {
    const s = normalizeUpper(eventStatus);
    if (s === 'LIVE') return 'Live Now';
    if (s === 'IN REVIEW') return 'Review';
    if (s === 'PAYMENT REQUIRED') return 'Planning';
    if (s === 'MANAGER UNASSIGNED') return 'Planning';
    if (s === 'COMPLETE') return 'Completed';
    return s ? s[0] + s.slice(1).toLowerCase() : 'Planning';
};

const getPlanningPayStatusLabel = (planning) => {
    if (!planning) return 'Unpaid';

    if (planning?.fullPaymentPaid) return 'Full Payment Paid';
    if (planning?.depositPaid && !planning?.fullPaymentPaid) return 'Deposit Paid';
    if (planning?.platformFeePaid || planning?.isPaid) return 'Platform Fee Paid';
    return 'Unpaid';
};

const isActiveEvent = (item) => {
    if (!item) return false;
    if (item.type === 'planning') {
        const s = normalizeUpper(item.status);
        return s !== 'COMPLETED' && s !== 'REJECTED';
    }
    if (item.type === 'promote') {
        const s = normalizeUpper(item.eventStatus);
        return s !== 'COMPLETE';
    }
    return false;
};

const Tabs = ({ activeTab, onTabChange }) => {
    const tabs = ['All Events', 'Active', 'Planning', 'Promote'];
    return (
        <div className="flex bg-white/50 backdrop-blur-sm p-1 rounded-xl border border-gray-100 w-fit">
            {tabs.map(tab => (
                <button
                    key={tab}
                    onClick={() => onTabChange(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab
                        ? 'bg-white text-teal-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                        }`}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
};

const ManagerEvents = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [activeTab, setActiveTab] = useState('All Events');
    const [selectedEvents, setSelectedEvents] = useState([]);

    const { planningEvents, promoteEvents, error } = useSelector(
        (state) => state.managerEvents
    );

    useEffect(() => {
        const POLL_MS = 10_000;

        const poll = () => {
            dispatch(fetchManagerPlanningEvents({ limit: 200 }));
            dispatch(fetchManagerPromoteEvents({ limit: 200 }));
        };

        poll();
        const intervalId = setInterval(poll, POLL_MS);

        return () => clearInterval(intervalId);
    }, [dispatch]);

    const mixedEvents = useMemo(() => {
        const plannings = (planningEvents || []).map((p) => ({ ...p, type: 'planning' }));
        const promotes = (promoteEvents || []).map((p) => ({ ...p, type: 'promote' }));
        return [...plannings, ...promotes].sort((a, b) => {
            const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tb - ta;
        });
    }, [planningEvents, promoteEvents]);

    const cards = useMemo(() => {
        return mixedEvents.map((e) => {
            if (e.type === 'planning') {
                const scheduleDate = e?.schedule?.startAt || e?.eventDate || null;
                const selectedServicesCount = Array.isArray(e?.selectedServices) ? e.selectedServices.length : 0;
                const selectedVendorsCount = Array.isArray(e?.selectedVendors) ? e.selectedVendors.length : 0;
                return {
                    id: e.eventId,
                    type: 'planning',
                    image: e?.eventBanner?.url || DEFAULT_EVENT_IMAGE,
                    status: mapPlanningStatusToCardStatus(e?.status),
                    category: String(e?.eventType || e?.category || 'EVENT').toUpperCase(),
                    payStatus: getPlanningPayStatusLabel(e),
                    title: e?.eventTitle || 'Event',
                    date: formatShortDate(scheduleDate),
                    time: '—',
                    location: e?.location?.name || '—',
                    metricLabel: 'Vendors Selected',
                    metricValue: selectedVendorsCount,
                    metricTotal: Math.max(selectedServicesCount, selectedVendorsCount),
                    revenueData: null,
                    team: [],
                    raw: e,
                };
            }

            const scheduleDate = e?.schedule?.startAt || null;
            const noOfTickets = Number(e?.tickets?.noOfTickets || 0);
            const sold = Number(e?.ticketAnalytics?.ticketsSold || 0);
            return {
                id: e.eventId,
                type: 'promote',
                image: e?.eventBanner?.url || DEFAULT_EVENT_IMAGE,
                status: mapPromoteStatusToCardStatus(e?.eventStatus),
                category: String(e?.eventCategory || 'EVENT').toUpperCase(),
                payStatus: e?.platformFeePaid ? 'Paid' : 'Unpaid',
                title: e?.eventTitle || 'Event',
                date: formatShortDate(scheduleDate),
                time: '—',
                location: e?.venue?.locationName || '—',
                metricLabel: 'Tickets Sold',
                metricValue: sold,
                metricTotal: noOfTickets,
                revenueData: null,
                team: [],
                raw: e,
            };
        });
    }, [mixedEvents]);

    // Filter Logic
    const filteredEvents = useMemo(() => {
        return (cards || []).filter((event) => {
            const title = String(event?.title || '').toLowerCase();
            const location = String(event?.location || '').toLowerCase();
            const q = String(searchQuery || '').toLowerCase();

            const matchesSearch = !q || title.includes(q) || location.includes(q);
            const matchesStatus = true;

            let matchesTab = true;
            if (activeTab === 'Active') matchesTab = isActiveEvent(event?.raw);
            if (activeTab === 'Planning') matchesTab = event.type === 'planning';
            if (activeTab === 'Promote') matchesTab = event.type === 'promote';

            return matchesSearch && matchesStatus && matchesTab;
        });
    }, [cards, searchQuery, activeTab]);

    const handleManage = (id) => {
        navigate(`/manager/events/${id}`);
    };

    const activeCount = useMemo(() => {
        return mixedEvents.filter(isActiveEvent).length;
    }, [mixedEvents]);

    const toggleSelect = (id) => {
        if (selectedEvents.includes(id)) {
            setSelectedEvents(selectedEvents.filter(eventId => eventId !== id));
        } else {
            setSelectedEvents([...selectedEvents, id]);
        }
    };

    return (
        <div className="p-8 max-w-480 mx-auto min-h-screen space-y-8">

            {/* Top Bar: Title + Stats Row */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Events Overview</h1>
                    <div className="flex gap-2 text-gray-500 font-medium items-center">
                        <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded text-xs font-bold">PRO</span>
                        <span>Manage your portfolio</span>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 gap-4 w-full lg:w-auto">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center min-w-35">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Active</span>
                        <span className="text-2xl font-extrabold text-gray-800">{activeCount}</span>
                    </div>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-3xl overflow-hidden min-h-150 flex flex-col">
                {/* Control Bar */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex flex-col xl:flex-row gap-4 items-center justify-between">

                    {/* Left: Tabs */}
                    <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

                    {/* Right: Actions */}
                    <div className="flex gap-3 w-full xl:w-auto overflow-x-auto">
                        {/* Bulk Actions (visible when selected) */}
                        <>
                            {selectedEvents.length > 0 && (
                                <div
                                    className="flex items-center gap-2 bg-teal-50 px-3 py-2 rounded-xl text-teal-800 font-bold text-sm mr-2"
                                >
                                    <CheckSquare className="w-4 h-4" /> {selectedEvents.length} Selected
                                    <div className="h-4 w-px bg-teal-200 mx-2" />
                                    <button className="hover:text-teal-900 flex items-center gap-1"><Download className="w-3 h-3" /> Export</button>
                                    <button className="hover:text-teal-900 flex items-center gap-1"><Archive className="w-3 h-3" /> Archive</button>
                                </div>
                            )}
                        </>

                        <div className="relative flex-1 min-w-50">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search events..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm font-medium transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-teal-600 hover:border-teal-200 transition-all relative">
                            <Filter className="w-5 h-5" />
                        </button>
                        <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-400'}`}><LayoutGrid className="w-4 h-4" /></button>
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-400'}`}><List className="w-4 h-4" /></button>
                            <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-400'}`}><KanbanIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 bg-gray-50/50 flex-grow">
                    <>
                        {viewMode === 'grid' && (
                            <div
                                key="grid"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6"
                            >
                                {filteredEvents.map((event) => (
                                    <div key={event.id} className="relative group/card">
                                        {/* Selection Checkbox Overlay */}
                                        <div className="absolute top-4 left-4 z-30 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                            <input
                                                type="checkbox"
                                                checked={selectedEvents.includes(event.id)}
                                                onChange={() => toggleSelect(event.id)}
                                                className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer shadow-sm"
                                            />
                                        </div>
                                        <ManagerEventCard
                                            {...event}
                                            onManage={() => handleManage(event.id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {viewMode === 'list' && (
                            <div
                                key="list"
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                            >
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 w-10"><input type="checkbox" className="rounded border-gray-300" /></th>
                                            <th className="px-6 py-4">Event</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Metric</th>
                                            <th className="px-6 py-4 text-right">Team</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredEvents.map((event) => (
                                            <tr key={event.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4"><input type="checkbox" checked={selectedEvents.includes(event.id)} onChange={() => toggleSelect(event.id)} className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" /></td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={event.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                                        <div>
                                                            <p className="font-bold text-gray-900">{event.title}</p>
                                                            <p className="text-xs text-gray-500">{event.date}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">{event.status}</span></td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <span className="text-xs font-bold block">{event.metricLabel}</span>
                                                        <span className="text-sm text-gray-600">{event.metricValue}/{event.metricTotal}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end -space-x-2">
                                                        {event.team.map((src, i) => <img key={i} src={src} className="w-8 h-8 rounded-full border-2 border-white" />)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleManage(event.id)} className="text-teal-600 font-bold text-sm hover:underline">Manage</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {/* Kanban placeholder for brevity, reusing logic from before but wrapped in new layout */}
                        {viewMode === 'kanban' && <div className="text-center p-10 text-gray-400">Kanban View Available</div>}
                    </>
                </div>

                {/* Footer Pagination */}
                <div className="p-4 border-t border-gray-100 bg-white flex justify-between items-center text-sm text-gray-500">
                    <span>Showing 1-8 of 24 events</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerEvents;
     