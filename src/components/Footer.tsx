import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Clock,
  ExternalLink,
  ChevronRight,
  MessageCircle,
  Award
} from 'lucide-react';

interface FooterProps {
  onOpenTrackModal: () => void;
  onNavigate: (view: 'home' | 'dashboard' | 'admin-login' | 'admin-dashboard') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTrackModal, onNavigate }) => {
  const { language, t } = useAuth();
  const { config, getWhatsAppUrl } = useConfig();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand & About */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 p-1 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                ई-मित्र
              </div>
              <div>
                <h3 className="text-white font-bold text-base leading-tight">
                  {language === 'hi' ? config.website_name_hi : config.website_name}
                </h3>
                <p className="text-xs text-amber-400 font-medium">Digital Citizen Services</p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-400">
              {language === 'hi'
                ? 'राजस्थान के नागरिकों के लिए पैन कार्ड, मूल निवास, जाति प्रमाण पत्र, जन आधार, राशन कार्ड आदि डिजिटल सेवाओं की सुगम ऑनलाइन व्यवस्था।'
                : 'Dedicated one-stop online eMitra portal assisting Rajasthan citizens with transparent and prompt processing of certificates, documents, and cards.'}
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded-lg p-2.5">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>100% Authorized & Verified Digital Assistance Center</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">
              {language === 'hi' ? 'महत्वपूर्ण लिंक्स' : 'Important Links'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                  <span>{t.allServices}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTrackModal}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                  <span>{t.trackStatusBtn}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                  <span>{t.customerDashboard}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin-login')}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5 text-amber-300 font-semibold"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.adminLogin}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">
              {t.contactUs}
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400">{t.helpline}</p>
                  <a href={`tel:${config.contact_number}`} className="text-white font-semibold hover:text-blue-400">
                    {config.contact_number}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400">WhatsApp Helpdesk</p>
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-semibold hover:text-emerald-400"
                  >
                    Click for Live Chat
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400">Support Email</p>
                  <a href={`mailto:${config.support_email}`} className="text-white font-semibold hover:text-indigo-400">
                    {config.support_email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400">{language === 'hi' ? 'कार्यालय पता' : 'Office Address'}</p>
                  <p className="text-slate-300 leading-tight">
                    {language === 'hi' ? config.office_address_hi : config.office_address}
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Operating Hours & Security */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">
              {language === 'hi' ? 'कार्य समय व सुरक्षा' : 'Operating Hours & Trust'}
            </h4>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <Clock className="w-4 h-4" />
                <span>Mon - Sat: 8:00 AM - 8:00 PM</span>
              </div>
              <p className="text-slate-400">
                {language === 'hi'
                  ? 'रविवार को ऑनलाइन अनुरोध स्वीकार्य, प्रोसेसिंग सोमवार प्रातः शुरू।'
                  : 'Requests accepted 24x7 online; processing begins early morning next business day.'}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Rajasthan Citizen Services Standard Compliant</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{config.footer_text}</p>
          <div className="flex items-center gap-4">
            <span>Powered by eMitra Digital Engine</span>
            <span>•</span>
            <span>Secure 256-Bit SSL Protected</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
