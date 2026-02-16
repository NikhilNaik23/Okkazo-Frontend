import React from 'react';
import { BsCloudUpload, BsFileEarmarkText, BsTrash } from 'react-icons/bs';
import { toast } from 'react-hot-toast';
import { fileUploadConfig } from '../../../data/vendorRegistrationData';

const FileUploadField = ({ label, file, onFileChange, onRemove, inputRef }) => {
    const handleFileUpload = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (selectedFile.size > fileUploadConfig.maxFileSize) {
            toast.error("File size must be less than 5MB.");
            return;
        }

        if (!fileUploadConfig.allowedTypes.includes(selectedFile.type)) {
            toast.error("Only PDF, JPG, and PNG files are allowed");
            return;
        }

        onFileChange(selectedFile);
        toast.success(`${label} uploaded`);
    };

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-[#09637E] uppercase tracking-widest ml-1">{label} *</label>
            <input
                type="file"
                ref={inputRef}
                onChange={handleFileUpload}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
            />
            {!file ? (
                <div
                    onClick={() => inputRef.current?.click()}
                    className="w-full bg-[#EBF4F6]/50 rounded-2xl p-5 border-2 border-dashed border-[#7AB2B2]/30 hover:border-[#7AB2B2] hover:bg-white transition-all duration-300 cursor-pointer group text-center"
                >
                    <BsCloudUpload size={24} className="mx-auto mb-2 text-[#7AB2B2] group-hover:scale-110 transition-transform" />
                    <p className="text-[#09637E] font-bold text-xs">Tap to upload</p>
                </div>
            ) : (
                <div className="w-full bg-white rounded-2xl p-4 border border-[#7AB2B2]/20 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <BsFileEarmarkText className="text-[#09637E] shrink-0" />
                        <p className="text-[#09637E] font-bold text-xs truncate">{file.name}</p>
                    </div>
                    <button type="button" onClick={onRemove} className="text-red-500 hover:scale-110 transition-transform">
                        <BsTrash size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

const MultiFileUpload = ({ files, onAddFile, onRemoveFile, inputRef, maxFiles = 3 }) => {
    const handleFileUpload = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (files.length >= maxFiles) {
            toast.error(`Maximum ${maxFiles} additional documents allowed`);
            return;
        }

        if (selectedFile.size > fileUploadConfig.maxFileSize) {
            toast.error("File size must be less than 5MB.");
            return;
        }

        if (!fileUploadConfig.allowedTypes.includes(selectedFile.type)) {
            toast.error("Only PDF, JPG, and PNG files are allowed");
            return;
        }

        onAddFile(selectedFile);
        toast.success("Document uploaded");
    };

    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black text-[#09637E] uppercase tracking-widest ml-1">Additional Proofs (Optional)</label>
            <input
                type="file"
                ref={inputRef}
                onChange={handleFileUpload}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.map((file, index) => (
                    <div key={index} className="w-full bg-white rounded-2xl p-4 border border-[#7AB2B2]/20 flex items-center justify-between shadow-sm animate-[fadeInUp_0.3s_ease-out]">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <BsFileEarmarkText className="text-[#09637E] shrink-0" />
                            <p className="text-[#09637E] font-bold text-xs truncate">{file.name}</p>
                        </div>
                        <button type="button" onClick={() => onRemoveFile(index)} className="text-red-500 hover:scale-110 transition-transform">
                            <BsTrash size={14} />
                        </button>
                    </div>
                ))}

                {files.length < maxFiles && (
                    <div
                        onClick={() => inputRef.current?.click()}
                        className="w-full bg-[#EBF4F6]/50 rounded-2xl p-4 border-2 border-dashed border-[#7AB2B2]/30 hover:border-[#7AB2B2] hover:bg-white transition-all duration-300 cursor-pointer group flex items-center justify-center gap-3"
                    >
                        <BsCloudUpload size={18} className="text-[#7AB2B2] group-hover:scale-110 transition-transform" />
                        <p className="text-[#09637E] font-bold text-xs">Add Document ({files.length}/{maxFiles})</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export { FileUploadField, MultiFileUpload };
