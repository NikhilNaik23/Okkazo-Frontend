import React from 'react';
import { 
    CheckCircle, Clock, ChevronRight, Star, ExternalLink, 
    AlertCircle, Mail, Phone, Download, Send, Plus, MessageSquare, MoreHorizontal
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Badge } from '../ui';
import { pipelineStages, teamMembers, clientInfo } from '../../../../data/managerEventDetailsData';
import { CircleDot, ShieldCheck } from 'lucide-react';

const OverviewTab = ({ event }) => {
    return (
        <div className="space-y-8">
            {/* Event Pipeline */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <CircleDot className="w-5 h-5 text-teal-600" /> Event Pipeline
                </h3>
                <div className="flex items-center gap-0 overflow-x-auto pb-2">
                    {pipelineStages.map((stage, i) => (
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
                            {i < pipelineStages.length - 1 && (
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
                                    <p className="font-bold text-gray-900">Technology Conference</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Budget Range</p>
                                    <p className="font-bold text-gray-900">₹10L – ₹15L</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Expected Guests</p>
                                    <p className="font-bold text-gray-900">2,500 – 3,000</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Preferred Location</p>
                                    <p className="font-bold text-gray-900">San Francisco or Bay Area</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Catering Preference</p>
                                    <p className="font-bold text-gray-900">Vegan + Non-Veg options, Premium Buffet</p>
                                </div>
                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">Special Notes</p>
                                    <p className="font-bold text-amber-800">Client wants live DJ + photo booth. Priority on AV quality for keynote.</p>
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
                                <p className="font-bold text-gray-900">{event.organizer}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Start Date</p>
                                <p className="font-bold text-gray-900">{event.date}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">End Date</p>
                                <p className="font-bold text-gray-900">{event.endDate}</p>
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
                            <button onClick={() => toast("Invite feature coming soon!")} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"><Plus className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            {teamMembers.map((member, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-xs shadow-inner">
                                            {member.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        {member.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{member.name}</p>
                                        <p className="text-xs text-gray-500 font-medium">{member.role}</p>
                                    </div>
                                    <button className="ml-auto text-gray-400 hover:text-teal-600"><MoreHorizontal className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Client Info */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4">Client</h3>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700 text-sm">{clientInfo.initials}</div>
                            <div>
                                <p className="font-bold text-gray-900">{clientInfo.name}</p>
                                <p className="text-xs text-gray-500">{clientInfo.company} • {clientInfo.title}</p>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600"><Mail className="w-3.5 h-3.5 text-gray-400" /> {clientInfo.email}</div>
                            <div className="flex items-center gap-2 text-gray-600"><Phone className="w-3.5 h-3.5 text-gray-400" /> {clientInfo.phone}</div>
                        </div>
                        <button onClick={() => toast.success("Opening client chat...")} className="w-full mt-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                            <MessageSquare className="w-4 h-4" /> Message Client
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
