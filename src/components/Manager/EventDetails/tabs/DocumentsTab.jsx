import React, { useState } from 'react';
import { Upload, Download, Eye, FileText, MapPin, DollarSign, Calendar, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { documents, documentCategories } from '../../../../data/managerEventDetailsData';

const DocumentsTab = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const filtered = activeCategory === 'All' ? documents : documents.filter(d => d.type === activeCategory);

    const iconMap = {
        FileText: FileText,
        MapPin: MapPin,
        DollarSign: DollarSign,
        Calendar: Calendar,
        ShieldCheck: ShieldCheck,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Event Documents</h3>
                    <p className="text-sm text-gray-500 mt-1">Contracts, invoices, floor plans, and shared files</p>
                </div>
                <button onClick={() => toast.success("Upload dialog opened!")} className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 shadow-lg shadow-teal-900/20 flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Upload File
                </button>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
                {documentCategories.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${activeCategory === cat ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* File List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-50">
                    {filtered.map((doc) => {
                        const Icon = iconMap[doc.iconType] || FileText;
                        return (
                            <div key={doc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors group">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                                    <Icon className="w-5 h-5 text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 text-sm truncate">{doc.name}</p>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                        <span className="bg-gray-100 px-2 py-0.5 rounded font-bold">{doc.type}</span>
                                        <span>{doc.size}</span>
                                        <span>by {doc.uploadedBy}</span>
                                        <span>{doc.date}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <button onClick={() => toast.success(doc.shared ? "Link unshared with client" : "Shared with client!")}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${doc.shared ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-teal-300'}`}>
                                        {doc.shared ? '✓ Shared' : 'Share'}
                                    </button>
                                    <button onClick={() => toast.success(`Downloading ${doc.name}...`)} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => toast.success("Preview opened")} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DocumentsTab;
