import React, { useState, useMemo } from 'react';
import {
    BsChevronLeft,
    BsChevronRight,
    BsCalendarEvent,
    BsXCircle
} from 'react-icons/bs';
import { toast } from 'react-hot-toast';

const initialBookedDates = {
    '2026-02-15': { type: 'event', label: 'Grand Wedding Gala', color: '#0b2d49' },
    '2026-02-16': { type: 'event', label: 'Grand Wedding Gala', color: '#0b2d49' },
    '2026-02-22': { type: 'event', label: 'Corporate Tech Expo', color: '#0b2d49' },
    '2026-02-23': { type: 'event', label: 'Corporate Tech Expo', color: '#0b2d49' },
    '2026-02-24': { type: 'event', label: 'Corporate Tech Expo', color: '#0b2d49' },
    '2026-03-05': { type: 'event', label: 'Summer Music Festival', color: '#0b2d49' },
    '2026-03-06': { type: 'event', label: 'Summer Music Festival', color: '#0b2d49' },
    '2026-03-07': { type: 'event', label: 'Summer Music Festival', color: '#0b2d49' },
    '2026-03-14': { type: 'event', label: 'Annual Charity Dinner', color: '#0b2d49' },
    '2026-03-20': { type: 'event', label: 'Birthday Celebration', color: '#0b2d49' },
    '2026-04-10': { type: 'event', label: 'Product Launch Party', color: '#0b2d49' },
    '2026-04-11': { type: 'event', label: 'Product Launch Party', color: '#0b2d49' },
};

const initialBlockedDates = {
    '2026-02-18': { reason: 'Personal day off' },
    '2026-02-19': { reason: 'Equipment maintenance' },
    '2026-03-01': { reason: 'Team holiday' },
    '2026-03-15': { reason: 'Not available' },
};

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const VendorAvailabilityCalendar = ({ compact = false }) => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [bookedDates] = useState(initialBookedDates);
    const [blockedDates, setBlockedDates] = useState(initialBlockedDates);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockReason, setBlockReason] = useState('');

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
    const isPast = (d) => d && new Date(d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const handleDateClick = (dateStr) => {
        if (!dateStr || isPast(dateStr)) return;
        if (bookedDates[dateStr]) {
            toast(`📅 ${bookedDates[dateStr].label}`, { style: { borderRadius: '16px', background: '#0b2d49', color: '#fff', fontWeight: 'bold' } });
            return;
        }
        if (blockedDates[dateStr]) {
            const updated = { ...blockedDates };
            delete updated[dateStr];
            setBlockedDates(updated);
            toast.success('Date unblocked!', { style: { borderRadius: '16px', background: '#0b2d49', color: '#fff', fontWeight: 'bold' } });
            return;
        }
        setSelectedDate(dateStr);
        setShowBlockModal(true);
        setBlockReason('');
    };

    const handleBlockDate = () => {
        if (!selectedDate) return;
        setBlockedDates({ ...blockedDates, [selectedDate]: { reason: blockReason || 'Not available' } });
        setShowBlockModal(false);
        setSelectedDate(null);
        toast.success('Marked as unavailable!', { style: { borderRadius: '16px', background: '#0b2d49', color: '#fff', fontWeight: 'bold' } });
    };

    const upcomingEvents = useMemo(() => {
        const seen = {};
        return Object.entries(bookedDates).filter(([d]) => !isPast(d)).reduce((acc, [, info]) => {
            if (!seen[info.label]) { seen[info.label] = true; acc.push(info); }
            return acc;
        }, []).slice(0, 4);
    }, [bookedDates]);

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
                        <select
                            value={blockReason}
                            onChange={(e) => setBlockReason(e.target.value)}
                            style={{ width: '100%', padding: '8px 10px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '10px', fontSize: '11px', fontWeight: 700, color: '#0b2d49', marginBottom: '10px', outline: 'none', boxSizing: 'border-box' }}
                        >
                            <option value="">Select reason...</option>
                            <option value="Not available">Not available</option>
                            <option value="Occupied with other event">Occupied with other event</option>
                            <option value="Personal day off">Personal day off</option>
                            <option value="Equipment maintenance">Equipment maintenance</option>
                            <option value="Team holiday">Team holiday</option>
                        </select>
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
