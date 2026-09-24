import React, { useState } from 'react';
import { ServiceRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  CreditCard,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface TrackStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayRequest: (request: ServiceRequest) => void;
  initialRequestId?: string;
}

export const TrackStatusModal: React.FC<TrackStatusModalProps> = ({
  isOpen,
  onClose,
  onPayRequest,
  initialRequestId = ''
}) => {
  const { language, t } = useAuth();
  const [requestIdInput, setRequestIdInput] = useState(initialRequestId);
  const [isLoading, setIsLoading] = useState(false);
  const [requestData, setRequestData] = useState<ServiceRequest | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestIdInput.trim()) return;

    setIsLoading(true);
    setErrorMsg('');
    setRequestData(null);

    try {
      const res = await fetch(`/api/public/track/${encodeURIComponent(requestIdInput.trim())}`);
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setRequestData(json.data);
      } else {
        setErrorMsg(
          json.message ||
            (language === 'hi'
              ? 'इस रिक्वेस्ट आईडी का कोई रिकॉर्ड नहीं मिला। कृपया जांच कर पुनः प्रयास करें।'
              : 'No service request found with this ID.')
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error tracking request');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            {t.completed}
          </span>
        );
      case 'Processing':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 animate-pulse">
            {t.processing}
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            {t.rejected}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            {t.pending}
          </span>
        );
    }
  };

  const getPaymentBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'Paid':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {t.paid}
          </span>
        );
      case 'Failed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            {t.failed}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            {t.pending}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Search className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-blue-200 font-semibold">
                {language === 'hi' ? 'राजस्थान ई-मित्र' : 'Rajasthan eMitra'}
              </span>
              <h2 className="text-base font-bold text-white">
                {language === 'hi' ? 'ऑनलाइन आवेदन स्थिति ट्रैकिंग' : 'Track Application Status'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              {language === 'hi'
                ? 'अपना अनुरोध क्रमांक (Request ID) दर्ज करें:'
                : 'Enter your Service Request ID (e.g. EM-2026-1001):'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="EM-2026-XXXX"
                value={requestIdInput}
                onChange={(e) => setRequestIdInput(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-sm uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2"
              >
                {isLoading ? <span>Searching...</span> : <span>Track</span>}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              {language === 'hi'
                ? 'उदा. EM-2026-1001 या EM-2026-1002'
                : 'Try sample ID: EM-2026-1001 or EM-2026-1002'}
            </p>
          </form>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Details Card if found */}
          {requestData && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Top Overview */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {t.requestId}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 font-mono">
                      {requestData.request_id}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(requestData.status)}
                    {getPaymentBadge(requestData.payment_status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">{t.serviceName}:</span>
                    <p className="font-bold text-slate-800">
                      {language === 'hi' ? requestData.service_name_hi || requestData.service_name : requestData.service_name}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">{t.name}:</span>
                    <p className="font-bold text-slate-800">{requestData.customer_name}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">{t.date}:</span>
                    <p className="font-medium text-slate-700">
                      {new Date(requestData.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">{t.price}:</span>
                    <p className="font-extrabold text-blue-700">₹{requestData.price_at_request}</p>
                  </div>
                </div>

                {/* If payment is pending, show pay now button */}
                {requestData.payment_status === 'Pending' && (
                  <div className="pt-2 flex items-center justify-between bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <div className="text-xs text-amber-800 font-medium">
                      {language === 'hi'
                        ? 'इस आवेदन का शुल्क भुगतान अभी लंबित है।'
                        : 'Payment for this application is pending.'}
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onPayRequest(requestData);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{t.payNow}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Admin Note if available */}
              {requestData.admin_message && (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900">
                    <MessageSquare className="w-4 h-4 text-blue-700" />
                    <span>{t.adminMessage}:</span>
                  </div>
                  <p className="text-blue-950 pl-5 leading-relaxed">
                    {requestData.admin_message}
                  </p>
                </div>
              )}

              {/* Status History Timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  {language === 'hi' ? 'आवेदन प्रगति विवरण (Timeline)' : 'Application Timeline'}
                </h4>
                <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {requestData.status_history &&
                    requestData.status_history.map((step, idx) => (
                      <div key={idx} className="relative flex items-start gap-3 pl-7">
                        <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-100" />
                        <div className="flex-1 bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 capitalize">
                              {step.status}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(step.timestamp).toLocaleString('en-IN', {
                                dateStyle: 'short',
                                timeStyle: 'short'
                              })}
                            </span>
                          </div>
                          {step.note && <p className="text-slate-600 mt-1">{step.note}</p>}
                          {step.updated_by && (
                            <p className="text-[10px] text-slate-400 mt-0.5">By {step.updated_by}</p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
