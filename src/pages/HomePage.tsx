import React, { useState, useEffect, useMemo } from 'react';
import { Service, Category, ServiceRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { ServiceCard } from '../components/ServiceCard';
import {
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileCheck,
  CreditCard,
  Download,
  PhoneCall,
  Sparkles,
  HelpCircle,
  ChevronDown,
  Layers,
  ArrowRight
} from 'lucide-react';

interface HomePageProps {
  onSelectService: (service: Service) => void;
  onOpenTrackModal: () => void;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectService,
  onOpenTrackModal,
  onOpenAuthModal
}) => {
  const { language, t } = useAuth();
  const { config, getWhatsAppUrl } = useConfig();

  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Load active services and categories from backend
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [srvRes, catRes] = await Promise.all([
        fetch('/api/public/services'),
        fetch('/api/public/categories')
      ]);

      if (srvRes.ok) {
        const srvJson = await srvRes.json();
        if (srvJson.success) setServices(srvJson.data || []);
      }

      if (catRes.ok) {
        const catJson = await catRes.json();
        if (catJson.success) setCategories(catJson.data || []);
      }
    } catch (err) {
      console.error('Failed to load services or categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      const matchesCategory =
        selectedCategory === 'all' || srv.category_id === selectedCategory;

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        srv.name.toLowerCase().includes(query) ||
        srv.name_hi.toLowerCase().includes(query) ||
        srv.description.toLowerCase().includes(query) ||
        srv.description_hi.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  const faqs = [
    {
      qEn: 'How can I apply for a service on Rajasthan eMitra?',
      qHi: 'राजस्थान ई-मित्र पर सेवा के लिए कैसे आवेदन करें?',
      aEn: 'Select any service from the list, click "Request Service", fill your basic details, upload the required document photos, and pay the nominal service fee via UPI QR code.',
      aHi: 'सूची में से अपनी आवश्यक सेवा चुनें, "सेवा के लिए आवेदन करें" पर क्लिक करें, बुनियादी जानकारी भरें, जरूरी दस्तावेज अपलोड करें और यूपीआई क्यूआर कोड से शुल्क का भुगतान करें।'
    },
    {
      qEn: 'How do I track my submitted application status?',
      qHi: 'मैं अपने जमा किए गए आवेदन की स्थिति कैसे ट्रैक कर सकता हूँ?',
      aEn: 'Click on "Track Request Status" on the top navigation bar, enter your unique Request ID (e.g. EM-2026-1001), and you can see live department processing notes and timeline.',
      aHi: 'ऊपर नेविगेशन बार में "आवेदन स्थिति जांचें" पर क्लिक करें, अपना अनुरोध क्रमांक (Request ID) दर्ज करें और विभागीय प्रोसेसिंग की ताजा स्थिति देखें।'
    },
    {
      qEn: 'Are certificates provided digitally signed by the Government?',
      qHi: 'क्या जारी किए गए प्रमाण पत्र सरकार द्वारा डिजिटल हस्ताक्षरित होते हैं?',
      aEn: 'Yes! All certificates (Bonafide, Caste, Police Clearance, etc.) are official Rajasthan Government digital signature approved documents with QR verification.',
      aHi: 'हाँ! सभी प्रमाण पत्र (मूल निवास, जाति, पुलिस चरित्र आदि) राजस्थान सरकार के अधिकृत डिजिटल हस्ताक्षर एवं क्यूआर कोड युक्त होते हैं।'
    },
    {
      qEn: 'What payment modes are accepted?',
      qHi: 'भुगतान के कौन-कौन से तरीके उपलब्ध हैं?',
      aEn: 'We support all UPI applications including PhonePe, Google Pay, Paytm, BHIM, and net banking with instant QR code scanning.',
      aHi: 'आप PhonePe, Google Pay, Paytm, BHIM आदि किसी भी यूपीआई ऐप से त्वरित क्यूआर कोड स्कैन करके भुगतान कर सकते हैं।'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-blue-900 to-indigo-950 text-white pt-14 pb-20 px-4 sm:px-8 border-b border-blue-900">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          {/* Official badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-amber-300 backdrop-blur-md shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              {language === 'hi'
                ? 'राजस्थान अधिकृत ई-मित्र नागरिक सहायता केंद्र'
                : 'Rajasthan Authorized eMitra Citizen Assistance Portal'}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {language === 'hi' ? config.website_name_hi : config.website_name}
          </h1>

          <p className="text-lg sm:text-2xl font-bold text-amber-400">
            {language === 'hi' ? config.tagline_hi : config.tagline}
          </p>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal">
            {t.heroSubtext}
          </p>

          {/* Search Box in Hero */}
          <div className="max-w-2xl mx-auto pt-4">
            <div className="relative flex items-center bg-white rounded-2xl shadow-xl shadow-blue-950/40 p-2 border border-blue-200">
              <Search className="w-5 h-5 text-slate-400 ml-3 flex-shrink-0" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600 font-semibold"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => {
                  const element = document.getElementById('services-catalog');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hidden sm:flex items-center gap-1.5 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                <span>{language === 'hi' ? 'खोजें' : 'Search'}</span>
              </button>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={() => {
                const element = document.getElementById('services-catalog');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <span>{t.requestServiceBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenTrackModal}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-amber-300" />
              <span>{t.trackStatusBtn}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Highlights Bar */}
      <section className="bg-white border-b border-slate-200/80 shadow-xs py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex items-center justify-center gap-2.5 p-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">100% Authorized</p>
              <p className="text-[11px] text-slate-500">Government Standards</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2.5 p-2">
            <Clock className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">Fast Processing</p>
              <p className="text-[11px] text-slate-500">Direct Department Sync</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2.5 p-2">
            <CreditCard className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">UPI Payments</p>
              <p className="text-[11px] text-slate-500">Instant QR & Transparent</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2.5 p-2">
            <PhoneCall className="w-6 h-6 text-indigo-600 flex-shrink-0" />
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">Citizen Helpline</p>
              <p className="text-[11px] text-slate-500">{config.contact_number}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Catalog Section */}
      <section id="services-catalog" className="max-w-7xl mx-auto px-4 sm:px-8 pt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4" />
              <span>{t.allServices}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {language === 'hi' ? 'उपलब्ध ई-मित्र सेवाएं एवं शुल्क' : 'Available Online Services & Fees'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {language === 'hi'
                ? 'अपनी आवश्यकतानुसार सेवा चुनें और ऑनलाइन आवेदन भेजें।'
                : 'Choose your desired service and submit your application in under 2 minutes.'}
            </p>
          </div>

          <div className="text-xs text-slate-500 font-semibold bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs self-start md:self-auto">
            {language === 'hi'
              ? `कुल ${filteredServices.length} सेवाएं प्रदर्शित`
              : `Showing ${filteredServices.length} Services`}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
              selectedCategory === 'all'
                ? 'bg-blue-700 text-white shadow-blue-700/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {language === 'hi' ? 'सभी सेवाएं' : 'All Categories'} ({services.length})
          </button>

          {categories.map((cat) => {
            const count = services.filter((s) => s.category_id === cat.id).length;
            const catName = language === 'hi' ? cat.name_hi || cat.name : cat.name;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-xs flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-blue-700 text-white shadow-blue-700/20'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{catName}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                    selectedCategory === cat.id
                      ? 'bg-blue-800 text-blue-100'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl bg-white border border-slate-200 p-6 animate-pulse space-y-4"
              >
                <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-10 bg-slate-100 rounded-xl mt-6" />
              </div>
            ))}
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onRequest={onSelectService}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <FileCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-base text-slate-800">
              {language === 'hi' ? 'कोई सेवा नहीं मिली' : 'No Services Found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {language === 'hi'
                ? 'आपके खोज शब्द अथवा चयनित श्रेणी में कोई सेवा उपलब्ध नहीं है। कृपया दूसरा शब्द खोजें।'
                : 'No services match your search term or category filter. Try clearing filters.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* How it Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            {t.howItWorks}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {language === 'hi' ? 'मात्र ३ आसान चरणों में सेवा प्राप्त करें' : 'Get Your Service in 3 Easy Steps'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {language === 'hi'
              ? 'बिना किसी कतार या परेशानी के घर बैठे डिजिटल ई-मित्र का लाभ उठाएं।'
              : 'Seamless, paperless processing without standing in long queues.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative hover:border-blue-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-lg">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900">{t.step1Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.step1Desc}</p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative hover:border-blue-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-extrabold text-lg">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900">{t.step2Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.step2Desc}</p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative hover:border-blue-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-lg">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900">{t.step3Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.step3Desc}</p>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 mt-20">
        <div className="text-center mb-8 space-y-2">
          <HelpCircle className="w-8 h-8 text-blue-700 mx-auto" />
          <h2 className="text-2xl font-extrabold text-slate-900">
            {language === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न (FAQ)' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'hi'
              ? 'नागरिकों द्वारा पूछे गए सामान्य सवाल और उनके उत्तर'
              : 'Clear answers to common questions about eMitra online requests.'}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-4 font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
              >
                <span>{language === 'hi' ? faq.qHi : faq.qEn}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  {language === 'hi' ? faq.aHi : faq.aEn}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Floating WhatsApp Action Button */}
      <a
        href={getWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-2xl shadow-emerald-700/40 hover:scale-105 transition-all text-xs font-bold"
        title="Chat on WhatsApp"
      >
        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
        <span>WhatsApp Help</span>
      </a>
    </div>
  );
};
