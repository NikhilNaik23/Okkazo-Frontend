import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Clock, ImagePlus, Paperclip, Send, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWithAuth } from '../../utils/apiHandler';
import { refreshAccessToken, selectVendorApplication } from '../../store/slices/authSlice';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const formatDateTime = (value) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const normalizeError = (data, fallback) => (
  data?.error?.message || data?.message || fallback
);

const ManagerChat = () => {
  const dispatch = useDispatch();
  const vendorApplication = useSelector(selectVendorApplication);
  const fileInputRef = useRef(null);

  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const imagePreviews = useMemo(
    () => images.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [images]
  );

  useEffect(() => {
    return () => {
      imagePreviews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [imagePreviews]);

  const loadComplaints = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50', skip: '0' });
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/vendor/complaints/me?${params.toString()}`,
        { method: 'GET' },
        { dispatch, refreshAction: refreshAccessToken }
      );
      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(normalizeError(data, 'Failed to load complaints'));
      }

      setComplaints(Array.isArray(data?.data?.complaints) ? data.data.complaints : []);
    } catch (error) {
      toast.error(error?.message || 'Failed to load complaints');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [statusFilter]);

  const handleFiles = (fileList) => {
    const nextFiles = Array.from(fileList || []);
    const validImages = nextFiles.filter((file) => file.type === 'image/jpeg' || file.type === 'image/png');

    if (validImages.length !== nextFiles.length) {
      toast.error('Only JPEG and PNG images are allowed');
    }

    setImages((prev) => {
      const combined = [...prev, ...validImages].slice(0, 5);
      if (prev.length + validImages.length > 5) toast.error('Maximum 5 images are allowed');
      return combined;
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const resetForm = () => {
    setSubject('');
    setContent('');
    setImages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const safeSubject = subject.trim();
    const safeContent = content.trim();

    if (safeSubject.length < 3) {
      toast.error('Subject must be at least 3 characters');
      return;
    }

    if (safeContent.length < 10) {
      toast.error('Content must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('subject', safeSubject);
      formData.append('content', safeContent);
      images.forEach((file) => formData.append('images', file));

      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/vendor/complaints`,
        {
          method: 'POST',
          body: formData,
        },
        { dispatch, refreshAction: refreshAccessToken }
      );
      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(normalizeError(data, 'Failed to raise complaint'));
      }

      toast.success('Complaint raised');
      resetForm();
      await loadComplaints();
    } catch (error) {
      toast.error(error?.message || 'Failed to raise complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-5 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-xs font-black tracking-widest uppercase text-[#d7a444]">Vendor Support</p>
            <h1 className="mt-2 text-3xl font-black text-[#0b2d49]">Raise a Complaint</h1>
            <p className="mt-2 text-sm font-medium text-slate-500 max-w-2xl">
              Submit complaint details to the admin team. You will be notified when it is received and when it is closed.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm">
            <p className="font-black text-slate-900">{vendorApplication?.businessName || 'Vendor'}</p>
            <p className="text-slate-500">{vendorApplication?.email || 'Signed in vendor'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-6 items-start">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">Complaint Details</h2>
            </div>

            <div className="p-5 space-y-5">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Subject</span>
                <input
                  type="text"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  maxLength={180}
                  placeholder="Short title for the issue"
                  className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-[#0b2d49] focus:ring-2 focus:ring-[#0b2d49]/10"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">Content</span>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={8}
                  maxLength={5000}
                  placeholder="Describe what happened, where it happened, and what help you need."
                  className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-[#0b2d49] focus:ring-2 focus:ring-[#0b2d49]/10"
                />
              </label>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-slate-700">Images</span>
                  <span className="text-xs font-bold text-slate-400">{images.length}/5</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  className="hidden"
                  onChange={(event) => handleFiles(event.target.files)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 w-full min-h-28 rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors flex flex-col items-center justify-center gap-2"
                >
                  <ImagePlus size={24} />
                  <span className="text-sm font-bold">Attach complaint images</span>
                </button>

                {imagePreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {imagePreviews.map((item, index) => (
                      <div key={`${item.file.name}-${index}`} className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                        <img src={item.url} alt={item.file.name} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm hover:bg-white"
                          title="Remove image"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#0b2d49] px-5 py-3 text-sm font-black text-white hover:bg-[#143b5b] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Send size={17} />
                {isSubmitting ? 'Submitting...' : 'Raise Complaint'}
              </button>
            </div>
          </form>

          <section className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">My Complaints</h2>
                <p className="text-xs font-bold text-slate-400 mt-1">{isLoading ? 'Loading...' : `${complaints.length} shown`}</p>
              </div>
              <div className="inline-flex rounded-lg bg-slate-100 p-1">
                {['all', 'open', 'closed'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-md text-xs font-black capitalize transition-colors ${statusFilter === status ? 'bg-white text-[#0b2d49] shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {!isLoading && complaints.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  <AlertCircle className="mx-auto mb-3 text-slate-300" size={34} />
                  <p className="font-bold">No complaints found</p>
                </div>
              )}

              {complaints.map((complaint) => (
                <article key={complaint.complaintId} className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-black text-slate-900 break-words">{complaint.subject}</h3>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-slate-400">
                        <Clock size={13} />
                        {formatDateTime(complaint.createdAt)}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black uppercase ${complaint.status === 'closed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {complaint.status}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-600 whitespace-pre-wrap break-words">{complaint.content}</p>

                  {Array.isArray(complaint.images) && complaint.images.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {complaint.images.map((image, index) => (
                        <a
                          key={`${image.publicId || image.fileUrl}-${index}`}
                          href={image.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-[#0b2d49]/30 hover:text-[#0b2d49]"
                        >
                          <Paperclip size={13} />
                          Image {index + 1}
                        </a>
                      ))}
                    </div>
                  )}

                  {complaint.closedAt && (
                    <p className="text-xs font-bold text-emerald-700">Closed on {formatDateTime(complaint.closedAt)}</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ManagerChat;
