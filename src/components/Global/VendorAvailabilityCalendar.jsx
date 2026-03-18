import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BsChevronLeft,
    BsChevronRight,
    BsCalendarEvent,
    BsXCircle,
    BsChevronDown
} from 'react-icons/bs';
import { toast } from 'react-hot-toast';

import { useDispatch } from 'react-redux';
import { fetchWithAuth } from '../../utils/apiHandler';
import { refreshAccessToken } from '../../store/slices/authSlice';

const API_BASE_URL = 'http://localhost:8080';

const safeJson = async (response) => {
    try {
        return await response.json();
    } catch {
        return null;
    }
};

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MotionDiv = motion.div;

const VendorAvailabilityCalendar = ({ compact = false }) => {
    const dispatch = useDispatch();
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [bookedDates, setBookedDates] = useState({});
    const [blockedDates, setBlockedDates] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockReason, setBlockReason] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const from = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
        const to = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        const run = async () => {
            try {
                const qs = new URLSearchParams({ from, to });
                const response = await fetchWithAuth(
                    `${API_BASE_URL}/api/vendor/me/availability?${qs.toString()}`,
                    { method: 'GET' },
                    { dispatch, refreshAction: refreshAccessToken }
                );

                const data = await safeJson(response);
                if (!response.ok || !data?.success) {
                    throw new Error(data?.message || 'Failed to load availability');
                }

                const unavailable = Array.isArray(data?.data?.unavailable) ? data.data.unavailable : [];
                const nextBooked = {};
                const nextBlocked = {};

                unavailable.forEach((item) => {
                    const day = item?.day;
                    if (!day) return;

                    const source = String(item?.source || '').toUpperCase();
                    if (source === 'BOOKING') {
                        nextBooked[day] = {
                            type: 'event',
                            label: item?.reason || 'Booked',
                            color: '#0b2d49',
                        };
                        return;
                    }

                    if (source === 'MANUAL' && !nextBooked[day]) {
                        nextBlocked[day] = { reason: item?.reason || 'Not available' };
                    }
                });

                if (!cancelled) {
                    setBookedDates(nextBooked);
                    setBlockedDates(nextBlocked);
                }
            } catch (e) {
                if (!cancelled) {
                    console.error('Failed to load vendor availability:', e);
                    setBookedDates({});
                    setBlockedDates({});
                }
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [currentMonth, currentYear, dispatch]);

    const BLOCK_REASONS = [
        "Not available",
        "Occupied with other event",
        "Personal day off",
        "Equipment maintenance",
        "Team holiday"
    ];

    const calendarDays = useMemo(() => {
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
        const days = [];
        for (let i = firstDay - 1; i >= 0; i--) days.push({ day: prevMonthDays - i, current: false, date: null });
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            days.push({ day: d, current: true, date: dateStr });
        }
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) days.push({ day: i, current: false, date: null });
        return days;
    }, [currentMonth, currentYear]);

    const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); } else setCurrentMonth(m => m - 1); };
    const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); } else setCurrentMonth(m => m + 1); };

    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayStart = useMemo(() => new Date(`${todayStr}T00:00:00`), [todayStr]);
    const isPast = useCallback((d) => d && new Date(d) < todayStart, [todayStart]);

    const handleDateClick = async (dateStr) => {
        if (!dateStr || isPast(dateStr)) return;
        if (bookedDates[dateStr]) {
            toast(`📅 ${bookedDates[dateStr].label}`, { style: { borderRadius: '16px', background: '#0b2d49', color: '#fff', fontWeight: 'bold' } });
            return;
        }
        if (blockedDates[dateStr]) {
            try {
                const qs = new URLSearchParams({ day: dateStr });
                const response = await fetchWithAuth(
                    `${API_BASE_URL}/api/vendor/me/availability/unavailable?${qs.toString()}`,
                    { method: 'DELETE' },
                    { dispatch, refreshAction: refreshAccessToken }
                );
                const data = await safeJson(response);
                if (!response.ok || !data?.success) {
                    throw new Error(data?.message || 'Failed to unblock date');
                }

                const updated = { ...blockedDates };
                delete updated[dateStr];
                setBlockedDates(updated);
                toast.success('Date unblocked!', { style: { borderRadius: '16px', background: '#0b2d49', color: '#fff', fontWeight: 'bold' } });
            } catch (e) {
                console.error('Failed to unblock date:', e);
                toast.error(e?.message || 'Failed to unblock date');
            }
            return;
        }
        setSelectedDate(dateStr);
        setShowBlockModal(true);
        setBlockReason('');
    };

    const handleBlockDate = async () => {
        if (!selectedDate) return;
        try {
            const response = await fetchWithAuth(
                `${API_BASE_URL}/api/vendor/me/availability/unavailable`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        day: selectedDate,
                        reason: blockReason || 'Not available',
                    }),
                },
                { dispatch, refreshAction: refreshAccessToken }
            );
            const data = await safeJson(response);
            if (!response.ok || !data?.success) {
                throw new Error(data?.message || 'Failed to block date');
            }

            setBlockedDates({ ...blockedDates, [selectedDate]: { reason: blockReason || 'Not available' } });
            setShowBlockModal(false);
            setSelectedDate(null);
            toast.success('Marked as unavailable!', { style: { borderRadius: '16px', background: '#0b2d49', color: '#fff', fontWeight: 'bold' } });
        } catch (e) {
            console.error('Failed to block date:', e);
            toast.error(e?.message || 'Failed to block date');
        }
    };

    const upcomingEvents = useMemo(() => {
        const seen = {};
        return Object.entries(bookedDates).filter(([d]) => !isPast(d)).reduce((acc, [, info]) => {
            if (!seen[info.label]) { seen[info.label] = true; acc.push(info); }
            return acc;
        }, []).slice(0, 4);
    }, [bookedDates, isPast]);

    const cellSize = compact ? 40 : 40;

    return (
        <div style={{ backgroundColor: '#fff', padding: compact ? '20px' : '24px', borderRadius: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid rgba(112,138,160,0.05)', position: 'relative', overflow: 'hidden', minWidth: 0, width: '100%', boxSizing: 'border-box' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: compact ? '10px' : '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: 'rgba(215,164,68,0.1)', color: '#d7a444', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <BsCalendarEvent size={15} />
                    </div>
                    <span style={{ fontSize: compact ? '15px' : '16px', fontWeight: 900, color: '#0b2d49', whiteSpace: 'nowrap' }}>Availability</span>
                </div>
                <button
                    onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); }}
                    style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#d7a444', background: 'rgba(215,164,68,0.06)', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                    Today
                </button>
            </div>

            {/* Month Nav */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', backgroundColor: 'rgba(233,239,241,0.5)', borderRadius: '10px', padding: '8px' }}>
                <button onClick={prevMonth} style={{ padding: '4px 6px', background: 'none', border: 'none', cursor: 'pointer', color: '#708aa0', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
                    <BsChevronLeft size={10} />
                </button>
                <span style={{ fontSize: '13px', fontWeight: 900, color: '#0b2d49' }}>
                    {MONTHS[currentMonth]} {currentYear}
                </span>
                <button onClick={nextMonth} style={{ padding: '4px 6px', background: 'none', border: 'none', cursor: 'pointer', color: '#708aa0', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
                    <BsChevronRight size={10} />
                </button>
            </div>

            {/* Day Headers + Grid in table-like layout for guaranteed column alignment */}
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '1px', tableLayout: 'fixed' }}>
                <thead>
                    <tr>
                        {DAYS.map((d, i) => (
                            <th key={i} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 900, color: '#708aa0', padding: '5px 0', textTransform: 'uppercase' }}>
                                {d}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 6 }, (_, row) => (
                        <tr key={row}>
                            {calendarDays.slice(row * 7, row * 7 + 7).map((cell, col) => {
                                const booked = cell.date ? bookedDates[cell.date] : null;
                                const blocked = cell.date ? blockedDates[cell.date] : null;
                                const isToday = cell.date === todayStr;
                                const past = isPast(cell.date);

                                let bg = 'transparent';
                                let color = '#0b2d49';
                                let fw = 600;
                                let border = 'none';
                                let cursor = 'pointer';
                                let opacity = 1;

                                if (!cell.current) { color = '#708aa0'; opacity = 0.2; cursor = 'default'; }
                                else if (past) { color = '#708aa0'; opacity = 0.3; cursor = 'default'; }
                                else if (booked) { bg = booked.color; color = '#fff'; fw = 800; }
                                else if (blocked) { bg = '#fef2f2'; color = '#ef4444'; fw = 800; border = '1px solid #fecaca'; }
                                else if (isToday) { bg = '#d7a444'; color = '#fff'; fw = 800; }

                                return (
                                    <td
                                        key={col}
                                        onClick={() => cell.current && handleDateClick(cell.date)}
                                        title={booked ? booked.label : blocked ? `Blocked: ${blocked.reason}` : ''}
                                        style={{
                                            textAlign: 'center',
                                            height: `${cellSize}px`,
                                            fontSize: compact ? '13px' : '13px',
                                            fontWeight: fw,
                                            backgroundColor: bg,
                                            color,
                                            border,
                                            cursor,
                                            opacity,
                                            borderRadius: '4px',
                                            transition: 'background 0.15s',
                                            padding: 0,
                                        }}
                                        onMouseEnter={(e) => { if (cell.current && !past && !booked && !blocked && !isToday) e.currentTarget.style.backgroundColor = '#e9eff1'; }}
                                        onMouseLeave={(e) => { if (cell.current && !past && !booked && !blocked && !isToday) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                    >
                                        {cell.day}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Legend */}
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(112,138,160,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {[
                        { c: '#0b2d49', l: 'Booked' },
                        { c: '#fef2f2', l: 'Blocked', b: '1px solid #fecaca' },
                    ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', fontWeight: 700, color: '#708aa0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: item.c, border: item.b || 'none', display: 'inline-block', flexShrink: 0 }} />
                            {item.l}
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', fontWeight: 900, color: '#d7a444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#d7a444', display: 'inline-block', flexShrink: 0 }} />
                    Today
                </div>
            </div>

            {/* Upcoming events (non-compact) */}
            {!compact && upcomingEvents.length > 0 && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(112,138,160,0.1)' }}>
                    <p style={{ fontSize: '8px', fontWeight: 900, color: '#708aa0', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '6px' }}>Upcoming Events</p>
                    {upcomingEvents.map((info, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0', fontSize: '11px', fontWeight: 700, color: '#0b2d49' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '3px', backgroundColor: info.color, flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{info.label}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Block Modal */}
            {showBlockModal && (
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.97)', borderRadius: '2rem', zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                    <div style={{ width: '100%', maxWidth: '220px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                            <div style={{ width: '40px', height: '40px', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                                <BsXCircle size={18} />
                            </div>
                            <h4 style={{ fontSize: '13px', fontWeight: 900, color: '#0b2d49', margin: '0 0 2px' }}>Mark Unavailable</h4>
                            <p style={{ fontSize: '10px', color: '#708aa0', fontWeight: 600, margin: 0 }}>
                                {selectedDate && new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </p>
                        </div>
                        <div className="relative mb-4 z-50">
                            {/* Trigger */}
                            <div
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`w-full py-3.5 pl-4 pr-4 bg-[#f8f9fa] border-2 rounded-xl text-[13px] font-bold text-[#0b2d49] cursor-pointer transition-all flex items-center justify-between ${isDropdownOpen ? 'border-[#d7a444] shadow-sm' : 'border-[#e9eff1] hover:border-[#d7a444]/50'}`}
                            >
                                <span className={!blockReason ? 'text-[#708aa0]' : ''}>
                                    {blockReason || "Select reason..."}
                                </span>
                                <BsChevronDown
                                    size={12}
                                    className={`text-[#708aa0] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                    strokeWidth={1}
                                />
                            </div>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <>
                                        {/* Click Outside Listener (Invisible Backdrop) */}
                                        <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />

                                        <MotionDiv
                                            initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                            transition={{ duration: 0.2, ease: "easeOut" }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#e9eff1] rounded-xl shadow-xl z-20 overflow-hidden max-h-[200px] overflow-y-auto custom-scrollbar"
                                        >
                                            {BLOCK_REASONS.map((reason) => (
                                                <div
                                                    key={reason}
                                                    onClick={() => { setBlockReason(reason); setIsDropdownOpen(false); }}
                                                    className={`px-4 py-3 text-[13px] font-bold cursor-pointer transition-colors border-b border-[#f8f9fa] last:border-none flex items-center justify-between ${blockReason === reason ? 'bg-[#f8f9fa] text-[#d7a444]' : 'text-[#0b2d49] hover:bg-[#f8f9fa] hover:text-[#0b2d49]'}`}
                                                >
                                                    {reason}
                                                    {blockReason === reason && <div className="w-1.5 h-1.5 rounded-full bg-[#d7a444]" />}
                                                </div>
                                            ))}
                                        </MotionDiv>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => { setShowBlockModal(false); setSelectedDate(null); }} style={{ flex: 1, padding: '8px', border: '2px solid #e9eff1', borderRadius: '10px', fontSize: '11px', fontWeight: 900, color: '#0b2d49', backgroundColor: 'white', cursor: 'pointer' }}>
                                Cancel
                            </button>
                            <button onClick={handleBlockDate} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '10px', fontSize: '11px', fontWeight: 900, color: 'white', backgroundColor: '#ef4444', cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,0.25)' }}>
                                Block
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorAvailabilityCalendar;
