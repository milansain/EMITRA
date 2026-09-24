import React from 'react';
import { Service } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  CreditCard,
  Vote,
  Layers,
  Award,
  Users,
  Briefcase,
  Sprout,
  Car,
  ShieldCheck,
  FileEdit
} from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onRequest: (service: Service) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onRequest }) => {
  const { language, t } = useAuth();

  const isAvailable = service.status === 'active';

  // Map icon string to Lucide icon
  const getIcon = () => {
    switch (service.image) {
      case 'credit-card':
        return <CreditCard className="w-5 h-5 text-blue-700" />;
      case 'vote':
        return <Vote className="w-5 h-5 text-indigo-700" />;
      case 'layers':
        return <Layers className="w-5 h-5 text-amber-700" />;
      case 'award':
        return <Award className="w-5 h-5 text-emerald-700" />;
      case 'users':
        return <Users className="w-5 h-5 text-teal-700" />;
      case 'briefcase':
        return <Briefcase className="w-5 h-5 text-cyan-700" />;
      case 'sprout':
        return <Sprout className="w-5 h-5 text-lime-700" />;
      case 'car':
        return <Car className="w-5 h-5 text-orange-700" />;
      case 'shield-check':
        return <ShieldCheck className="w-5 h-5 text-blue-700" />;
      case 'file-edit':
        return <FileEdit className="w-5 h-5 text-violet-700" />;
      default:
        return <FileText className="w-5 h-5 text-blue-700" />;
    }
  };

  const displayName = language === 'hi' ? service.name_hi || service.name : service.name;
  const displaySecondary = language === 'hi' ? service.name : service.name_hi;
  const displayDesc = language === 'hi' ? service.description_hi || service.description : service.description;
  const displayTime = language === 'hi' ? service.processing_time_hi || service.processing_time : service.processing_time;
  const docsList = language === 'hi' && service.required_documents_hi?.length
    ? service.required_documents_hi
    : service.required_documents;

  return (
    <div
      className={`group relative flex flex-col justify-between bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
        isAvailable
          ? 'border-slate-200/80 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-900/5'
          : 'border-slate-200 bg-slate-50/70 opacity-80'
      }`}
    >
      {/* Top Banner & Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform flex-shrink-0">
            {getIcon()}
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              <span className="text-slate-500 font-normal">{t.price}:</span>
              <span className="text-blue-700 text-sm font-extrabold">₹{service.price}</span>
            </div>

            {isAvailable ? (
              <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {t.active}
              </span>
            ) : (
              <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                {t.disabled}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
          {displayName}
        </h3>
        {displaySecondary && displaySecondary !== displayName && (
          <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
            {displaySecondary}
          </p>
        )}

        {/* Description */}
        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
          {displayDesc}
        </p>

        {/* Turnaround Time */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
          <Clock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span>{displayTime}</span>
        </div>

        {/* Required Documents Checklist Preview */}
        {docsList && docsList.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              {t.requiredDocs}:
            </p>
            <ul className="space-y-1">
              {docsList.slice(0, 3).map((doc, idx) => (
                <li key={idx} className="flex items-center gap-1.5 text-xs text-slate-600 truncate">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                  <span className="truncate">{doc}</span>
                </li>
              ))}
              {docsList.length > 3 && (
                <li className="text-[10px] text-blue-600 font-semibold pl-4">
                  +{docsList.length - 3} {language === 'hi' ? 'अन्य दस्तावेज' : 'more documents'}
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-100">
        {isAvailable ? (
          <button
            onClick={() => onRequest(service)}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 group/btn"
          >
            <span>{t.requestServiceBtn}</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        ) : (
          <button
            disabled
            className="w-full py-2.5 px-4 rounded-xl bg-slate-200 text-slate-400 font-semibold text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{t.disabled}</span>
          </button>
        )}
      </div>
    </div>
  );
};
