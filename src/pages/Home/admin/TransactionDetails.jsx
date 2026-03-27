import React, { useEffect, useMemo, useState } from "react";
import { 
  ArrowLeft, 
  Download, 
  CreditCard, 
  Building2, 
  AlertCircle,
  FileText,
  User,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  History
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchWithAuth } from "../../../utils/apiHandler";
import { refreshAccessToken } from "../../../store/slices/authSlice";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const formatRupeeFromPaise = (value) => {
  const amount = (Number(value || 0) || 0) / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDateTime = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) {
    return '—';
  }

  return `${date.toISOString().slice(0, 10)} ${date.toISOString().slice(11, 19)}`;
};

const prettyStatus = (status) => {
  const normalized = String(status || '').trim().toUpperCase();
  if (!normalized) return 'UNKNOWN';
  if (normalized === 'PAID') return 'COMPLETED';
  return normalized;
};

const TransactionDetails = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetchWithAuth(
          `${API_BASE_URL}/api/orders/admin/ledger/${encodeURIComponent(String(id || '').replace(/^#/, ''))}/details`,
          { method: 'GET' },
          { dispatch, refreshAction: refreshAccessToken }
        );

        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(body.message || 'Failed to load transaction details');
        }

        setPayload(body.data || null);
      } catch (fetchError) {
        setError(fetchError.message || 'Failed to load transaction details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetails();
    }
  }, [API_BASE_URL, dispatch, id]);

  const transaction = payload?.transaction || null;
  const eventTransactions = useMemo(
    () => (Array.isArray(payload?.eventTransactions) ? payload.eventTransactions : []),
    [payload?.eventTransactions]
  );

  const getStatusStyle = (status) => {
    switch (prettyStatus(status)) {
      case "COMPLETED": return "bg-emerald-50 text-emerald-600 border border-emerald-100";
      case "PENDING": return "bg-amber-50 text-amber-600 border border-amber-100";
      case "CREATED": return "bg-amber-50 text-amber-600 border border-amber-100";
      case "FAILED": return "bg-rose-50 text-rose-600 border border-rose-100";
      case "REFUNDED": return "bg-slate-50 text-slate-600 border border-slate-100";
      default: return "bg-slate-50 text-slate-600 border border-slate-100";
    }
  };

  const handleDownloadReceipt = async () => {
    if (!transaction?.transactionId) {
      return;
    }

    try {
      setDownloadingReceipt(true);
      setError('');

      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/orders/admin/ledger/${encodeURIComponent(transaction.transactionId)}/receipt/pdf`,
        { method: 'GET' },
        { dispatch, refreshAction: refreshAccessToken }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || 'Failed to download receipt');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Preview in browser and also trigger a file download.
      window.open(url, '_blank', 'noopener,noreferrer');

      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${transaction.transactionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (_error) {
      setError('Failed to download receipt');
    } finally {
      setDownloadingReceipt(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#fcfdfe] overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border-b border-[#f0f2f5] shrink-0">
        <div className="flex flex-col gap-1">
          <Link to="/admin/ledger" className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-[#0b2d49] transition-colors mb-2">
            <ArrowLeft size={16} />
            Back to Ledger
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-[#1a1c1e] tracking-tight">Transaction #{transaction?.transactionId || String(id || '').replace(/^#/, '')}</h1>
            <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${getStatusStyle(transaction?.status)}`}>
              {prettyStatus(transaction?.status)}
            </span>
          </div>
          <p className="text-sm text-[#64748b] font-medium">Recorded on {formatDateTime(transaction?.createdAt)}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadReceipt}
            disabled={downloadingReceipt}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#f0f2f5] text-[#1a1c1e] rounded-xl text-sm font-bold hover:bg-[#f8fafc] transition-all shadow-sm disabled:opacity-60"
          >
            <Download size={18} />
            {downloadingReceipt ? 'Preparing Receipt...' : 'Receipt'}
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#0b2d49] text-white rounded-xl text-sm font-bold hover:bg-[#1a4b70] transition-all shadow-lg shadow-[#0b2d49]/10">
            <ShieldCheck size={18} />
            Verify Settlement
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        {loading && (
          <div className="px-4 py-3 rounded-lg bg-[#f8fafc] text-[#64748b] text-sm font-semibold border border-[#f0f2f5]">
            Loading transaction details...
          </div>
        )}

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 text-[#ef4444] text-sm font-semibold border border-red-100">
            {error}
          </div>
        )}

        {/* Main Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Amount Summary */}
          <div className="lg:col-span-1 bg-white p-7 rounded-3xl border border-[#f0f2f5] shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#0b2d49]/5 flex items-center justify-center text-[#0b2d49] mb-6">
                <CreditCard size={24} />
              </div>
              <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-1">Transaction Amount</p>
              <h2 className="text-4xl font-black text-[#1a1c1e] tracking-tighter mb-4">{formatRupeeFromPaise(transaction?.grossAmount)}</h2>
              <div className="flex items-center gap-2 text-xs font-bold text-[#28a785] bg-emerald-50 w-fit px-2 py-1 rounded-lg border border-emerald-100">
                <TrendingUp size={12} />
                Settlement Ready
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-[#f0f2f5] grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Method</p>
                <p className="text-sm font-black text-[#1a1c1e]">Razorpay ({transaction?.type || 'Payment'})</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Fee (2.5%)</p>
                <p className="text-sm font-black text-[#64748b]">{formatRupeeFromPaise(transaction?.platformFee)}</p>
              </div>
            </div>

            {/* Deco */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#0b2d49]/5 rounded-full blur-2xl group-hover:bg-[#d7a444]/5 transition-colors"></div>
          </div>

          {/* Parties involved */}
          <div className="lg:col-span-2 bg-white p-7 rounded-3xl border border-[#f0f2f5] shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 relative overflow-hidden">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-[#d7a444]">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#1a1c1e]">Vendor Details</h3>
                  <p className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Receiver</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-[#94a3b8] mb-0.5">Firm Name</p>
                  <p className="text-sm font-black text-[#1a1c1e] flex items-center gap-2">
                    {transaction?.vendor?.name || 'System Auto'}
                    <ExternalLink size={12} className="text-[#94a3b8]" />
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#94a3b8] mb-0.5">Vendor ID</p>
                  <p className="text-sm font-medium text-[#1a1c1e]">{transaction?.vendor?.id || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="md:border-l md:border-[#f0f2f5] md:pl-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#1a1c1e]">Customer Details</h3>
                  <p className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider">Payer</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-[#94a3b8] mb-0.5">Name</p>
                  <p className="text-sm font-black text-[#1a1c1e]">{transaction?.payer?.name || transaction?.payer?.authId || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#94a3b8] mb-0.5">Contact</p>
                  <p className="text-sm font-medium text-[#1a1c1e]">{transaction?.payer?.email || transaction?.payer?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
          {/* Related Items & References */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-7 rounded-3xl border border-[#f0f2f5] shadow-sm">
              <h3 className="text-lg font-black text-[#1a1c1e] mb-6 flex items-center gap-2">
                <FileText size={20} className="text-[#0b2d49]" />
                Transaction References
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-[#f8fafc] border border-[#f0f2f5]">
                  <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">System Reference</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-[#1a1c1e]">{transaction?.references?.systemReference || 'N/A'}</span>
                    <button className="text-[10px] font-black text-[#0b2d49] hover:underline uppercase">Copy</button>
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-[#f8fafc] border border-[#f0f2f5]">
                  <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Related Event</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-black text-[#1a1c1e] block">{transaction?.event?.title || 'Event'}</span>
                      <span className="text-[10px] font-medium text-[#64748b]">{transaction?.event?.eventId || transaction?.eventId || 'N/A'}</span>
                    </div>
                    <Link to={`/admin/events/${transaction?.event?.eventId || transaction?.eventId || ''}`} className="p-2 bg-white rounded-lg text-[#0b2d49] hover:bg-[#0b2d49] hover:text-white transition-all shadow-sm">
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-[#f0f2f5] shadow-sm">
              <h3 className="text-lg font-black text-[#1a1c1e] mb-6">Transactions for This Event</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest border-b border-[#f1f5f9]">
                      <th className="pb-3">Transaction</th>
                      <th className="pb-3">Payer</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {eventTransactions.map((row) => (
                      <tr key={row.transactionId} className="cursor-pointer hover:bg-[#f8fafc]" onClick={() => navigate(`/admin/ledger/${encodeURIComponent(row.transactionId)}`)}>
                        <td className="py-3 text-sm font-semibold text-[#1a1c1e]">#{row.transactionId}</td>
                        <td className="py-3 text-sm text-[#64748b]">{row?.payer?.name || row?.authId || 'Unknown'}</td>
                        <td className="py-3 text-sm text-[#64748b]">{prettyStatus(row.status)}</td>
                        <td className="py-3 text-right text-sm font-bold text-[#1a1c1e]">{formatRupeeFromPaise(Math.abs(row.amount || 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit Log */}
            <div className="bg-white p-7 rounded-3xl border border-[#f0f2f5] shadow-sm">
              <h3 className="text-lg font-black text-[#1a1c1e] mb-8 flex items-center gap-2">
                <History size={20} className="text-[#0b2d49]" />
                Audit Trail
              </h3>
              <div className="space-y-8 relative">
                {/* Vertical Line */}
                <div className="absolute left-1.75 top-2 bottom-2 w-0.5 bg-[#28a785]"></div>
                
                {(Array.isArray(transaction?.history) ? transaction.history : []).map((item, idx) => (
                  <div key={idx} className="relative pl-8 group">
                    <div className="absolute left-0 top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 transition-transform group-hover:scale-125 bg-[#28a785]"></div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-black text-[#1a1c1e]">{prettyStatus(item.status)}</p>
                        <p className="text-xs text-[#64748b] font-medium">{item.desc}</p>
                      </div>
                      <span className="text-[10px] font-bold text-[#94a3b8] whitespace-nowrap">{formatDateTime(item.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions / Summary Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#0b2d49] p-7 rounded-3xl text-white shadow-xl shadow-[#0b2d49]/10 relative overflow-hidden">
              <h4 className="text-sm font-black text-[#28a785] tracking-widest uppercase mb-4">Summary</h4>
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center text-sm border-b border-white/10 pb-3">
                  <span className="text-white/60">Subtotal</span>
                  <span className="font-bold">{formatRupeeFromPaise(transaction?.grossAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-white/10 pb-3">
                  <span className="text-white/60">Platform Fee</span>
                  <span className="font-bold">{formatRupeeFromPaise(transaction?.platformFee)}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-white/10 pb-3">
                  <span className="text-white/60">Tax (GST 18%)</span>
                  <span className="font-bold">{formatRupeeFromPaise(transaction?.tax)}</span>
                </div>
                <div className="flex justify-between items-end pt-2">
                  <span className="text-base font-medium text-[#d7a444]">Total Settlement</span>
                  <span className="text-2xl font-black">{formatRupeeFromPaise(transaction?.settlementAmount)}</span>
                </div>
              </div>
              {/* Deco */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#f0f2f5] shadow-sm">
              <h4 className="text-xs font-black text-[#94a3b8] uppercase tracking-widest mb-4">Merchant Help</h4>
              <p className="text-xs text-[#64748b] leading-relaxed mb-6 font-medium">
                If you encounter any issues with this transaction or the merchant, please flag it for review by the compliance team.
              </p>
              <button className="w-full py-3 px-4 bg-rose-50 text-rose-600 rounded-xl text-xs font-black hover:bg-rose-100 transition-colors flex items-center justify-center gap-2 group">
                <AlertCircle size={16} className="group-hover:animate-pulse" />
                Report Discrepancy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetails;
