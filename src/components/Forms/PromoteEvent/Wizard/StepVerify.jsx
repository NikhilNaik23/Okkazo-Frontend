import React, { useRef } from 'react';
import { toast } from 'react-hot-toast';
import { BsCloudUpload, BsX, BsShieldCheck, BsFileEarmarkPdf } from "react-icons/bs";

const StepVerify = ({ formData, setFormData }) => {
    const fileInputRef = useRef(null);

    const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
    const MIN_FILE_SIZE_KB = 5;
    const MAX_FILE_SIZE_MB = 50;

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const validFiles = [];
        const invalidTypeFiles = [];
        const tooSmallFiles = [];
        const tooLargeFiles = [];

        for (const file of files) {
            const mime = String(file.type || '').toLowerCase();
            const sizeBytes = Number(file.size || 0);

            const typeOk = ALLOWED_IMAGE_TYPES.has(mime);
            const tooSmall = sizeBytes < MIN_FILE_SIZE_KB * 1024;
            const tooLarge = sizeBytes > MAX_FILE_SIZE_MB * 1024 * 1024;

            if (!typeOk) {
                invalidTypeFiles.push(file.name);
                continue;
            }

            if (tooSmall) {
                tooSmallFiles.push(file.name);
                continue;
            }

            if (tooLarge) {
                tooLargeFiles.push(file.name);
                continue;
            }

            validFiles.push(file);
        }

        if (invalidTypeFiles.length > 0 || tooSmallFiles.length > 0 || tooLargeFiles.length > 0) {
            const reasons = [];
            if (invalidTypeFiles.length > 0) reasons.push(`${invalidTypeFiles.length} invalid type`);
            if (tooSmallFiles.length > 0) reasons.push(`${tooSmallFiles.length} below 5KB`);
            if (tooLargeFiles.length > 0) reasons.push(`${tooLargeFiles.length} above 50MB`);

            toast.error(`Some files were skipped (${reasons.join(', ')}). Allowed: JPG, PNG, WEBP, 5KB to 50MB each.`, {
                id: 'promote-proof-file-validation',
                duration: 4500,
                style: {
                    background: '#09637E',
                    color: '#EBF4F6',
                    fontSize: '11px',
                    fontWeight: 'bold',
                },
            });
        }

        if (validFiles.length === 0) {
            e.target.value = '';
            return;
        }

        const newDocs = validFiles.map(file => ({
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + " MB",
            type: file.type,
            file: file, // Store actual file object for backend
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        }));

        setFormData((prev) => ({
            ...prev,
            authDocuments: [...(prev.authDocuments || []), ...newDocs]
        }));

        e.target.value = '';
    };

    const removeDoc = (idx) => {
        const newDocs = [...(formData.authDocuments || [])];
        newDocs.splice(idx, 1);
        setFormData({ ...formData, authDocuments: newDocs });
    };

    return (
        <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12">
            <h1 className="font-serif-premium text-6xl md:text-8xl italic text-[#7AB2B2] opacity-10 mb-8 absolute -top-20 -left-20 pointer-events-none select-none">Legitimacy</h1>

            <div className="mb-12 relative">
                <p className="text-[#088395] font-black uppercase tracking-[0.3em] text-[10px] mb-4">Step 07 — Verification</p>
                <h2 className="text-4xl md:text-5xl font-serif-premium text-[#09637E] italic leading-tight">Authenticity Proofs.</h2>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 border border-[#09637E]/10 shadow-xl relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-64 h-64 bg-[#088395]/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-[#088395]/10 transition-all duration-700" />

                <div className="relative z-10 space-y-8">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4 text-[#088395]">
                            <div className="w-12 h-12 rounded-2xl bg-[#088395]/10 flex items-center justify-center">
                                <BsShieldCheck size={24} />
                            </div>
                            <h3 className="font-serif-premium italic text-3xl text-[#09637E]">Permits & Identity</h3>
                        </div>
                        <p className="text-[#09637E]/70 text-sm max-w-2xl leading-relaxed">
                            To ensure the safety and authenticity of events on Okkazo, we require proof of venue permission or organizer identity. These documents are kept private and only used for verification.
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#088395]">
                            Required: upload at least one authenticity proof to continue.
                        </p>
                    </div>

                    {/* Upload Area */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        multiple
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                    />

                    <div
                        onClick={() => fileInputRef.current.click()}
                        className="border-2 border-dashed border-[#09637E]/20 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#088395] hover:bg-[#088395]/5 transition-all group/upload"
                    >
                        <div className="w-16 h-16 bg-[#EBF4F6] rounded-full flex items-center justify-center mb-4 group-hover/upload:scale-110 transition-transform">
                            <BsCloudUpload size={24} className="text-[#088395]" />
                        </div>
                        <p className="font-serif-premium italic text-2xl text-[#09637E] mb-2">Click to Upload Documents</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/40">Supports JPG, PNG, WEBP (Min 5KB, Max 50MB each)</p>
                    </div>

                    {(formData.authDocuments || []).length === 0 && (
                        <p className="text-[10px] font-black uppercase tracking-widest text-red-500">
                            No proofs uploaded yet. This step is mandatory.
                        </p>
                    )}

                    {/* File List */}
                    {(formData.authDocuments || []).length > 0 && (
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#09637E]/40 border-b border-[#09637E]/10 pb-2">Attached Documents ({formData.authDocuments.length})</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {formData.authDocuments.map((doc, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-[#EBF4F6] rounded-xl border border-[#09637E]/5">
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0">
                                                {String(doc.type || '').includes('image') ? (
                                                    <img src={doc.preview} className="w-full h-full object-cover rounded-lg" alt="preview" />
                                                ) : (
                                                    <BsFileEarmarkPdf className="text-red-500" size={20} />
                                                )}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-bold text-[#09637E] truncate">{doc.name}</p>
                                                <p className="text-[10px] text-[#09637E]/60">{doc.size}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeDoc(idx)}
                                            className="w-8 h-8 rounded-full hover:bg-red-100 text-[#09637E]/40 hover:text-red-500 flex items-center justify-center transition-all"
                                        >
                                            <BsX size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StepVerify;
