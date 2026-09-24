import React, { useState, useEffect } from 'react';
import { ServiceRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import {
  X,
  CreditCard,
  QrCode,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

interface PaymentModalProps {
  request: ServiceRequest | null;
  onClose: () => void;
  onPaymentSubmitted: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  request,
  onClose,
  onPaymentSubmitted
}) => {
  const { language, t } = useAuth();
  const { config } = useConfig();

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [upiString, setUpiString] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!request) return;

    // Fetch dynamic UPI QR code from server
    const fetchQR = async () => {
      try {
        const query = new URLSearchParams({
          amount: request.price_at_request.toString(),
          name: config.upi_name || 'Rajasthan eMitra Services',
          note: `eMitra_${request.request_id}`,
          upi_id: config.upi_id
        });
        const res = await fetch(`/api/public/upi-qr?${query.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setQrDataUrl(json.data.qrDataUrl);
            setUpiString(json.data.upiString);
          }
        }
      } catch (err) {
        console.error('Failed to generate payment QR code:', err);
      }
    };

    fetchQR();
  }, [request, config.upi_id, config.upi_name]);

  if (!request) return null;

  const copyUpiId = () => {
    navigator.clipboard.writeText(config.upi_id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleUtrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanUtr = utrNumber.trim();
    if (cleanUtr.length < 6) {
      setErrorMsg(
        language === 'hi'
          ? 'कृपया वैध 12 अंकों का UTR/रेफरेंस नंबर दर्ज करें'
          : 'Please enter a valid UTR / transaction reference number (min 6 characters)'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/customer/payments/submit-utr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: request.request_id,
          amount: request.price_at_request,
          upi_id: config.upi_id,
          utr_number: cleanUtr
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(data.message || 'Payment reference submitted successfully!');
        setTimeout(() => {
          onPaymentSubmitted();
        }, 2000);
      } else {
        setErrorMsg(data.message || 'Failed to submit payment reference');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <QrCode className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-blue-200 font-semibold">
                {language === 'hi' ? 'सुरक्षित यूपीआई भुगतान' : 'Secure UPI Payment'}
              </span>
              <h2 className="text-base font-bold text-white">
                {request.request_id}
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

        <div className="p-6 space-y-5">
          {/* Service & Amount Header */}
          <div className="flex items-center justify-between p-3.5 bg-blue-50/80 rounded-xl border border-blue-100">
            <div>
              <p className="text-xs text-blue-800 font-medium">
                {language === 'hi' ? 'सेवा:' : 'Service:'}
              </p>
              <p className="text-sm font-bold text-blue-950 truncate max-w-[220px]">
                {language === 'hi' ? request.service_name_hi || request.service_name : request.service_name}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-500 font-medium">{t.price}:</span>
              <p className="text-xl font-black text-blue-700 leading-none">
                ₹{request.price_at_request}
              </p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="text-center space-y-3">
            <div className="inline-block p-3 rounded-2xl bg-white border-2 border-slate-200 shadow-md">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="UPI Payment QR Code"
                  className="w-48 h-48 mx-auto rounded-lg object-contain"
                />
              ) : (
                <div className="w-48 h-48 bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-xs text-slate-400">
                  Generating QR...
                </div>
              )}
            </div>

            {/* UPI ID with Copy Button */}
            <div className="max-w-xs mx-auto flex items-center justify-between px-3 py-2 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              <span className="font-mono font-bold text-slate-800 select-all truncate">
                {config.upi_id}
              </span>
              <button
                type="button"
                onClick={copyUpiId}
                className="flex items-center gap-1 text-blue-700 hover:text-blue-900 font-semibold px-2 py-1 rounded bg-white shadow-xs ml-2 flex-shrink-0"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Mobile Pay Link */}
            {upiString && (
              <a
                href={upiString}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-full transition-colors border border-blue-200"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'फोन में सीधे UPI ऐप से खोलें' : 'Pay Directly in UPI App'}</span>
              </a>
            )}

            {/* Instruction text */}
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              {language === 'hi' ? config.upi_instructions_hi : config.upi_instructions}
            </p>
          </div>

          {/* UTR Submission Form */}
          <form onSubmit={handleUtrSubmit} className="pt-2 border-t border-slate-100 space-y-3">
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'hi'
                  ? 'भुगतान के बाद 12 अंकों का UTR / UPI Reference No. दर्ज करें:'
                  : 'Enter 12-digit UTR / UPI Reference No. after payment:'}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 426819283719"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent uppercase tracking-wider"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !!successMsg}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.submitUtr}</span>
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official Rajasthan eMitra Direct Verification System</span>
          </div>
        </div>
      </div>
    </div>
  );
};
