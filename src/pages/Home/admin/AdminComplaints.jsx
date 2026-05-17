import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, Eye, Image as ImageIcon, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { fetchWithAuth } from '../../../utils/apiHandler';
import { refreshAccessToken } from '../../../store/slices/authSlice';

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

const AdminComplaints = () => {
  const dispatch = useDispatch();
  const [complaints, setComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState('open');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeComplaintId, setActiveComplaintId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [closingId, setClosingId] = useState('');

  const selectedComplaint = useMemo(
    () => complaints.find((complaint) => complaint.complaintId === activeComplaintId) || complaints[0] || null,
    [complaints, activeComplaintId]
  );

  const loadComplaints = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100', skip: '0' });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchTerm.trim()) params.set('search', searchTerm.trim());

      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/vendor/complaints?${params.toString()}`,
        { method: 'GET' },
        { dispatch, refreshAction: refreshAccessToken }
      );
      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(normalizeError(data, 'Failed to load complaints'));
      }

      const rows = Array.isArray(data?.data?.complaints) ? data.data.complaints : [];
      setComplaints(rows);
      setActiveComplaintId((prev) => (rows.some((row) => row.complaintId === prev) ? prev : rows[0]?.complaintId || ''));
    } catch (error) {
      toast.error(error?.message || 'Failed to load complaints');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(loadComplaints, 250);
    return () => window.clearTimeout(timeout);
  }, [statusFilter, searchTerm]);

  const handleCloseComplaint = async (complaintId) => {
    if (!complaintId) return;
    setClosingId(complaintId);
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/vendor/complaints/${encodeURIComponent(complaintId)}/close`,
        { method: 'PATCH' },
        { dispatch, refreshAction: refreshAccessToken }
      );
      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(normalizeError(data, 'Failed to close complaint'));
      }

      toast.success('Complaint closed');
      setComplaints((prev) => prev.map((row) => (row.complaintId === complaintId ? data.data : row)));
    } catch (error) {
      toast.error(error?.message || 'Failed to close complaint');
    } finally {
      setClosingId('');
    }
  };

  return (
    <div className="min-h-full bg-[#f4f7f8] p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#d7a444]">Vendor Support</p>
            <h1 className="mt-2 text-3xl font-black text-[#0b2d49]">Complaints</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">Review vendor complaints, inspect attached images, and mark resolved items closed.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search complaints..."
                className="w-full sm:w-72 rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-[#0b2d49]"
              />
            </div>
            <div className="inline-flex rounded-lg bg-white p-1 border border-slate-200">
              {['open', 'closed', 'all'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-md text-xs font-black capitalize transition-colors ${statusFilter === status ? 'bg-[#0b2d49] text-white' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)] gap-6">
          <section className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900">Complaint Queue</h2>
              <span className="text-xs font-black text-slate-400">{isLoading ? 'Loading' : `${complaints.length} items`}</span>
            </div>

            <div className="max-h-[calc(100vh-260px)] overflow-y-auto divide-y divide-slate-100">
              {!isLoading && complaints.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  <AlertCircle className="mx-auto mb-3 text-slate-300" size={34} />
                  <p className="font-bold">No complaints found</p>
                </div>
              )}

              {complaints.map((complaint) => {
                const isActive = selectedComplaint?.complaintId === complaint.complaintId;
                return (
                  <button
                    key={complaint.complaintId}
                    type="button"
                    onClick={() => setActiveComplaintId(complaint.complaintId)}
                    className={`w-full text-left p-4 transition-colors ${isActive ? 'bg-[#0b2d49]/5' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 truncate">{complaint.subject}</p>
                        <p className="mt-1 text-sm font-bold text-slate-500 truncate">{complaint.vendorName}</p>
                        {complaint.vendorEmail && (
                          <p className="mt-0.5 text-xs font-bold text-slate-400 truncate">{complaint.vendorEmail}</p>
                        )}
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${complaint.status === 'closed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {complaint.status}
                      </span>
                    </div>
                    <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <Clock size={13} />
                      {formatDateTime(complaint.createdAt)}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden min-h-[520px]">
            {!selectedComplaint ? (
              <div className="h-full min-h-[520px] flex flex-col items-center justify-center text-slate-400">
                <Eye size={44} className="mb-3 opacity-40" />
                <p className="font-bold">Select a complaint to view details</p>
              </div>
            ) : (
              <>
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${selectedComplaint.status === 'closed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {selectedComplaint.status}
                      </span>
                      <span className="text-xs font-black text-slate-400">{selectedComplaint.complaintId}</span>
                    </div>
                    <h2 className="mt-3 text-2xl font-black text-slate-900 break-words">{selectedComplaint.subject}</h2>
                    <p className="mt-2 text-sm font-bold text-slate-500">
                      {selectedComplaint.vendorName}
                      {selectedComplaint.vendorEmail ? ` (${selectedComplaint.vendorEmail})` : ''}
                      {' '} &middot; {formatDateTime(selectedComplaint.createdAt)}
                    </p>
                  </div>

                  {selectedComplaint.status !== 'closed' && (
                    <button
                      type="button"
                      onClick={() => handleCloseComplaint(selectedComplaint.complaintId)}
                      disabled={closingId === selectedComplaint.complaintId}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <CheckCircle2 size={17} />
                      {closingId === selectedComplaint.complaintId ? 'Closing...' : 'Mark as Closed'}
                    </button>
                  )}
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                    <div className="rounded-lg border border-slate-200 p-4">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Vendor Name</p>
                      <p className="mt-2 font-black text-slate-900 break-words">{selectedComplaint.vendorName}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-4">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Email</p>
                      <p className="mt-2 font-black text-slate-900 break-words">{selectedComplaint.vendorEmail || 'Not available'}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-4">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Created</p>
                      <p className="mt-2 font-black text-slate-900">{formatDateTime(selectedComplaint.createdAt)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 p-4">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Closed</p>
                      <p className="mt-2 font-black text-slate-900">{selectedComplaint.closedAt ? formatDateTime(selectedComplaint.closedAt) : 'Still open'}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Complaint Details</p>
                    <p className="mt-3 text-sm font-medium leading-7 text-slate-700 whitespace-pre-wrap break-words">{selectedComplaint.content}</p>
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Images</p>
                    {Array.isArray(selectedComplaint.images) && selectedComplaint.images.length > 0 ? (
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedComplaint.images.map((image, index) => (
                          <a
                            key={`${image.publicId || image.fileUrl}-${index}`}
                            href={image.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="group aspect-video overflow-hidden rounded-lg border border-slate-200 bg-slate-100 relative"
                          >
                            <img src={image.fileUrl} alt={`Complaint image ${index + 1}`} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                            <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-black text-slate-700">
                              Image {index + 1}
                            </span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 rounded-lg border border-dashed border-slate-200 p-6 text-center text-slate-400">
                        <ImageIcon className="mx-auto mb-2" size={28} />
                        <p className="text-sm font-bold">No images attached</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminComplaints;
