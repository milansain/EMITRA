import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Service, ServiceRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Upload,
  CheckCircle2,
  FileCheck,
  CreditCard,
  AlertCircle,
  File,
  Trash2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface ServiceRequestModalProps {
  service: Service | null;
  onClose: () => void;
  onSuccess: (request: ServiceRequest) => void;
  onProceedToPayment: (request: ServiceRequest) => void;
}

interface UploadedFileState {
  file_name: string;
  file_type: string;
  file_size: number;
  file_data: string;
}

export const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({
  service,
  onClose,
  onSuccess,
  onProceedToPayment
}) => {
  const { user, language, t } = useAuth();

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerMobile, setCustomerMobile] = useState(user?.mobile || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerMessage, setCustomerMessage] = useState('');
  const [documents, setDocuments] = useState<UploadedFileState[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedRequest, setSubmittedRequest] = useState<ServiceRequest | null>(null);

  if (!service) return null;

  const displayName = language === 'hi' ? service.name_hi || service.name : service.name;
  const docsList = language === 'hi' && service.required_documents_hi?.length
    ? service.required_documents_hi
    : service.required_documents;

  // Handle file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMsg(`File ${file.name} exceeds maximum size of 8MB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setDocuments((prev) => [
          ...prev,
          {
            file_name: file.name,
            file_type: file.type || 'application/octet-stream',
            file_size: file.size,
            file_data: base64
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeDoc = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg(language === 'hi' ? 'कृपया अपना नाम दर्ज करें' : 'Please enter your full name');
      return;
    }

    const cleanMobile = customerMobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setErrorMsg(language === 'hi' ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('emitra_token');
      const res = await fetch('/api/customer/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          service_id: service.id,
          customer_name: customerName.trim(),
          customer_mobile: cleanMobile,
          customer_email: customerEmail.trim() || undefined,
          customer_message: customerMessage.trim() || undefined,
          documents
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        // Trigger celebratory confetti!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        setSubmittedRequest(data.data);
        onSuccess(data.data);
      } else {
        setErrorMsg(data.message || 'Failed to submit service request');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred while submitting request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-blue-200 font-semibold">
                {language === 'hi' ? 'ई-मित्र सेवा आवेदन फॉर्म' : 'eMitra Service Request Form'}
              </span>
              <h2 className="text-lg font-bold text-white leading-tight">
                {displayName}
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

        {/* Confirmation Screen View */}
        {submittedRequest ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                {language === 'hi' ? 'आवेदन सफलतापूर्वक दर्ज हुआ!' : 'Request Successfully Submitted!'}
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900">
                {submittedRequest.request_id}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {language === 'hi'
                  ? 'कृपया इस अनुरोध क्रमांक (Request ID) को सुरक्षित रखें। आप कभी भी इससे अपनी सेवा स्थिति ट्रैक कर सकते हैं।'
                  : 'Please save this unique Request ID to track your application status at any time.'}
              </p>
            </div>

            {/* Summary Card */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left max-w-md mx-auto space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">{t.serviceName}:</span>
                <span className="font-bold text-slate-800">{displayName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">{t.name}:</span>
                <span className="font-semibold text-slate-800">{submittedRequest.customer_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">{t.mobile}:</span>
                <span className="font-semibold text-slate-800">{submittedRequest.customer_mobile}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">{t.price}:</span>
                <span className="font-extrabold text-blue-700 text-sm">₹{submittedRequest.price_at_request}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  onProceedToPayment(submittedRequest);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4 text-amber-300" />
                <span>{language === 'hi' ? `₹${submittedRequest.price_at_request} यूपीआई द्वारा भुगतान करें` : `Pay ₹${submittedRequest.price_at_request} via UPI`}</span>
              </button>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all"
              >
                {language === 'hi' ? 'बाद में भुगतान करें / बंद करें' : 'Pay Later / Close'}
              </button>
            </div>
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Service & Price Badge */}
            <div className="flex flex-wrap items-center justify-between p-3.5 bg-blue-50/80 rounded-xl border border-blue-100 gap-3">
              <div>
                <p className="text-xs text-blue-800 font-medium">
                  {language === 'hi' ? 'चयनित सरकारी सेवा:' : 'Selected Government Service:'}
                </p>
                <p className="text-sm font-bold text-blue-950">{displayName}</p>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-500 font-medium">{t.price}:</span>
                <p className="text-lg font-black text-blue-700 leading-none">₹{service.price}</p>
              </div>
            </div>

            {/* Customer Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.name} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'hi' ? 'उदा. राजेश कुमार' : 'e.g. Rajesh Kumar'}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.mobile} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-medium">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9829012345"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.email} <span className="text-slate-400 font-normal">({language === 'hi' ? 'वैकल्पिक' : 'optional'})</span>
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            {/* Required Documents Info List */}
            {docsList && docsList.length > 0 && (
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-xs space-y-1.5">
                <p className="font-bold text-amber-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>{t.requiredDocs}:</span>
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {docsList.map((doc, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-amber-200 text-amber-900 font-medium text-[11px]"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{doc}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Document Upload Dropzone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.uploadDocs}
              </label>
              <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/60">
                <input
                  type="file"
                  id="doc-upload"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="doc-upload" className="cursor-pointer space-y-1.5 block">
                  <Upload className="w-6 h-6 text-blue-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-800">
                    {language === 'hi' ? 'दस्तावेज चुनें (Click to Upload)' : 'Click to select documents (Images or PDF)'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Max size: 8MB each. (Aadhaar, Marksheets, Photo, Signature)
                  </p>
                </label>
              </div>

              {/* Uploaded Files list */}
              {documents.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-blue-50/50 border border-blue-100 text-xs text-slate-700"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <File className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="truncate font-medium">{doc.file_name}</span>
                        <span className="text-[10px] text-slate-400">
                          ({(doc.file_size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDoc(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message/Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.additionalMessage}
              </label>
              <textarea
                rows={2}
                placeholder={
                  language === 'hi'
                    ? 'कोई विशेष निर्देश या अतिरिक्त जानकारी...'
                    : 'Any special instructions or application notes...'
                }
                value={customerMessage}
                onChange={(e) => setCustomerMessage(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>{language === 'hi' ? 'आवेदन जमा हो रहा है...' : 'Submitting Request...'}</span>
                ) : (
                  <>
                    <span>{t.submitRequest}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
