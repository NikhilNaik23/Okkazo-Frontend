import React, { useMemo, useState } from 'react';
import { 
    CheckCircle, Clock, ChevronRight, Star, ExternalLink, 
    AlertCircle, Mail, Phone, Download, Send, Plus, MessageSquare, MoreHorizontal
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Badge } from '../ui';
import { pipelineStages } from '../../../../data/managerEventDetailsData';
import { CircleDot, ShieldCheck } from 'lucide-react';

const OverviewTab = ({ event, onAddTeamMember, onRemoveTeamMember, getInitials, onMessageClient }) => {
    const [addingTeam, setAddingTeam] = useState(false);
    const [pickedStaffKey, setPickedStaffKey] = useState('');
    const [savingTeam, setSavingTeam] = useState(false);

    const pipeline = useMemo(() => {
        const normalizeStatus = (value) => {
            const s = String(value || '').trim();
            if (!s) return '';
            return s
                .toUpperCase()
                .replace(/_/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        };

        const status = normalizeStatus(event?.status);

        // Mapping requested:
        // - Pending_Approval -> Vendor Confirmation
        // - Approved -> Client Review
        // - Confirmed -> Confirmed
        const activeStageId = (() => {
            if (status === 'PENDING APPROVAL') return 'vendor_confirm';
            if (status === 'APPROVED') return 'client_review';
            if (status === 'CONFIRMED') return 'confirmed';

            // Sensible fallbacks for other known statuses
            if (status === 'DRAFT') return 'draft';
            if (status === 'PLANNING') return 'planning';
            if (status === 'IN REVIEW') return 'vendor_confirm';
            if (status === 'LIVE') return 'live';
            if (status === 'COMPLETED') return 'completed';

            return 'planning';
        })();

        const activeIndex = Math.max(0, pipelineStages.findIndex((s) => s?.id === activeStageId));

        return pipelineStages.map((stage, i) => ({
            ...stage,
            done: i < activeIndex,
            active: i === activeIndex,
        }));
    }, [event?.status]);

    const servicesOpted = useMemo(() => {
        return Array.isArray(event?.servicesOpted) ? event.servicesOpted : [];
    }, [event?.servicesOpted]);

    const client = event?.client || null;
    const clientName = client?.name || client?.fullName || '—';
    const clientEmail = client?.email || '—';
    const clientPhone = client?.phone || '—';
    const initialsFn = typeof getInitials === 'function' ? getInitials : (name) => {
        const n = String(name || '').trim();
        if (!n) return 'NA';
        const parts = n.split(/\s+/).filter(Boolean);
        const first = parts[0]?.[0] || 'N';
        const last = (parts.length > 1 ? parts[parts.length - 1]?.[0] : '') || '';
        return `${first}${last}`.toUpperCase();
    };

    const availableStaff = Array.isArray(event?.availableCoreStaff) ? event.availableCoreStaff : [];
    const selectedTeam = Array.isArray(event?.selectedTeamMembers) ? event.selectedTeamMembers : [];

    const handleConfirmAddTeamMember = async () => {
        if (!pickedStaffKey || savingTeam) return;
        const staffMember = availableStaff.find((s) => String(s?.id || s?._id) === String(pickedStaffKey));
        if (!staffMember) {
            toast.error('Selected staff not available');
            return;
        }
        if (typeof onAddTeamMember === 'function') {
            try {
                setSavingTeam(true);
                await onAddTeamMember(staffMember);
                toast.success('Team member added');
            } catch (err) {
                toast.error(err?.message || 'Failed to add team member');
                return;
            } finally {
                setSavingTeam(false);
            }
        }
        setPickedStaffKey('');
        setAddingTeam(false);
    };

    const handleRemoveMember = async (member) => {
        if (!member || savingTeam) return;
        if (typeof onRemoveTeamMember !== 'function') return;
        try {
            setSavingTeam(true);
            await onRemoveTeamMember(member);
            toast.success('Team member removed');
        } catch (err) {
            toast.error(err?.message || 'Failed to remove team member');
        } finally {
            setSavingTeam(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Event Pipeline */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <CircleDot className="w-5 h-5 text-teal-600" /> Event Pipeline
                </h3>
                <div className="flex items-center gap-0 overflow-x-auto pb-2">
                    {pipeline.map((stage, i) => (
                        <div key={stage.id} className="flex items-center shrink-0">
                            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer
                            ${stage.done ? 'bg-teal-50 border-teal-200 text-teal-700' :
                                    stage.active ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-md shadow-amber-100 ring-2 ring-amber-200' :
                                        'bg-gray-50 border-gray-200 text-gray-400'}`}
                                onClick={() => toast(stage.done ? `${stage.label} completed ✓` : stage.active ? `Currently in ${stage.label}` : `${stage.label} upcoming`)}
                            >
                                {stage.done ? <CheckCircle className="w-4 h-4" /> : stage.active ? <Clock className="w-4 h-4 animate-pulse" /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                                {stage.label}
                            </div>
                            {i < pipeline.length - 1 && (
                                <ChevronRight className={`w-5 h-5 mx-1 shrink-0 ${stage.done ? 'text-teal-400' : 'text-gray-300'}`} />
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Col */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Client Requirements */}
                    <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Star className="w-5 h-5 text-amber-500" /> Client Requirements
                            </h3>
                            <Badge color="amber" icon={ShieldCheck}>From Client Brief</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Event Type</p>
                                    <p className="font-bold text-gray-900">{event?.type === 'promote' ? 'Promote' : 'Planning'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Expected Guests</p>
                                    <p className="font-bold text-gray-900">{Number.isFinite(Number(event?.expectedGuests)) ? Number(event.expectedGuests).toLocaleString() : '—'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Services Opted</p>
                                    {servicesOpted.length ? (
                                        <div className="flex flex-wrap gap-2">
                                            {servicesOpted.map((s) => (
                                                <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white border border-gray-200 text-gray-800">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="font-bold text-gray-900">—</p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Preferred Location</p>
                                    <p className="font-bold text-gray-900">{event?.preferredLocation || event?.location || '—'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Requested Timeline</p>
                                    <p className="font-bold text-gray-900">{event?.date || '—'} – {event?.endDate || '—'}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Event Details */}
                    <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Event Details</h3>
                            <button className="text-teal-600 font-bold text-sm hover:underline flex items-center gap-1">
                                View Public Page <ExternalLink className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="prose prose-gray max-w-none">
                            <p className="text-gray-600 leading-relaxed text-lg">{event.description}</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-100">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Organizer</p>
                                <p className="font-bold text-gray-900">{event?.organizer || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Start Date</p>
                                <p className="font-bold text-gray-900">{event?.date || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">End Date</p>
                                <p className="font-bold text-gray-900">{event?.endDate || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Venue ID</p>
                                <p className="font-bold text-gray-900 font-mono text-sm bg-gray-100 px-2 py-1 rounded-md w-fit">SF-MOS-01</p>
                            </div>
                        </div>
                    </section>

                    {/* Planning Progress */}
                    <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Planning Progress</h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <h4 className="font-bold text-gray-900">Task Completion</h4>
                                        <p className="text-sm text-gray-500">89 of 145 tasks completed</p>
                                    </div>
                                    <span className="text-2xl font-extrabold text-teal-600">61%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3">
                                    <div className="bg-teal-500 h-3 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.4)]" style={{ width: '61%' }}></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><CheckCircle className="w-4 h-4" /></div>
                                        <span className="font-bold text-gray-700">Done</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">89</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg"><Clock className="w-4 h-4" /></div>
                                        <span className="font-bold text-gray-700">In Progress</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">42</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1.5 bg-rose-100 text-rose-600 rounded-lg"><AlertCircle className="w-4 h-4" /></div>
                                        <span className="font-bold text-gray-700">Blocked</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">14</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Col */}
                <div className="space-y-8">
                    {/* Quick Actions */}
                    <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-6 text-white shadow-lg shadow-teal-900/20">
                        <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <button onClick={() => toast.success("Announcement sent to 2,450 attendees!")} className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10 group">
                                <span className="font-bold text-sm">Send Announcement</span>
                                <Mail className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                            </button>
                            <button onClick={() => toast.success("Downloading Attendee CSV...")} className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10 group">
                                <span className="font-bold text-sm">Download Attendee List</span>
                                <Download className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                            </button>
                            <button onClick={() => toast.success("Venue contacted via email.")} className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10 group">
                                <span className="font-bold text-sm">Contact Venue</span>
                                <Phone className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                            </button>
                            <button onClick={() => toast.success("Quote sent to client!")} className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10 group">
                                <span className="font-bold text-sm">Send Quote to Client</span>
                                <Send className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                            </button>
                        </div>
                    </div>

                    {/* Team Members */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900">Team Members</h3>
                            <button onClick={() => setAddingTeam((v) => !v)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"><Plus className="w-5 h-5" /></button>
                        </div>
                        {addingTeam ? (
                            <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Add Core Staff</p>
                                <div className="flex gap-2">
                                    <select
                                        value={pickedStaffKey}
                                        onChange={(e) => setPickedStaffKey(e.target.value)}
                                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-bold text-gray-700 outline-none"
                                    >
                                        <option value="">Select staff...</option>
                                        {availableStaff.map((s) => {
                                            const key = String(s?.id || s?._id || '');
                                            const name = String(s?.name || 'Staff');
                                            const dept = String(s?.department || '').trim();
                                            return (
                                                <option key={key} value={key}>
                                                    {dept ? `${name} • ${dept}` : name}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <button
                                        onClick={handleConfirmAddTeamMember}
                                        disabled={!pickedStaffKey || savingTeam}
                                        className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 disabled:opacity-60"
                                    >
                                        {savingTeam ? 'Saving…' : 'Add'}
                                    </button>
                                </div>
                                {!availableStaff.length ? (
                                    <p className="mt-2 text-xs font-medium text-gray-500">No available core staff right now.</p>
                                ) : null}
                            </div>
                        ) : null}
                        <div className="space-y-4">
                            {selectedTeam.length ? selectedTeam.map((member, i) => (
                                <div key={String(member?.id || member?._id || member?.authId || i)} className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-xs shadow-inner">
                                            {initialsFn(member?.name || '—')}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{member?.name || '—'}</p>
                                        <p className="text-xs text-gray-500 font-medium">{member?.department || 'Core Staff'}</p>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveMember(member)}
                                        disabled={savingTeam}
                                        className="ml-auto text-gray-400 hover:text-teal-600 disabled:opacity-60"
                                        title="Remove"
                                    >
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            )) : (
                                <p className="text-sm font-medium text-gray-500">No team members selected yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Client Info */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4">Client</h3>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700 text-sm">{initialsFn(clientName)}</div>
                            <div>
                                <p className="font-bold text-gray-900">{clientName}</p>
                                <p className="text-xs text-gray-500">{client?.location || '—'}</p>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600"><Mail className="w-3.5 h-3.5 text-gray-400" /> {clientEmail}</div>
                            <div className="flex items-center gap-2 text-gray-600"><Phone className="w-3.5 h-3.5 text-gray-400" /> {clientPhone}</div>
                        </div>
                        <button
                            onClick={() => {
                                if (typeof onMessageClient === 'function') {
                                    onMessageClient();
                                    return;
                                }
                                toast.success('Opening client chat...');
                            }}
                            className="w-full mt-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                        >
                            <MessageSquare className="w-4 h-4" /> Message Client
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
