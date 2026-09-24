import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import {
  Globe,
  Search,
  MessageCircle,
  User as UserIcon,
  Shield,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  FileCheck,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  onOpenTrackModal: () => void;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onNavigate: (view: 'home' | 'dashboard' | 'admin-login' | 'admin-dashboard') => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTrackModal,
  onOpenAuthModal,
  onNavigate,
  currentView
}) => {
  const { user, logout, language, setLanguage, t } = useAuth();
  const { config, getWhatsAppUrl } = useConfig();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'hi' ? 'en' : 'hi');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-sm">
      {/* Top Govt Bar with Rajasthan Emblem style banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white text-xs py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-wide">
              {language === 'hi'
                ? 'राजस्थान सरकार अधिकृत डिजिटल ई-मित्र पोर्टल'
                : 'Govt. of Rajasthan Authorized Digital eMitra Portal'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-blue-200">
            <div className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors">
              <span className="text-amber-400 font-semibold">{language === 'hi' ? 'हेल्पलाइन:' : 'Helpline:'}</span>
              <a href={`tel:${config.contact_number}`}>{config.contact_number}</a>
            </div>

            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/10"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'hi' ? 'English' : 'हिंदी'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        {/* Logo & Brand Title */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          {/* Logo Crest */}
          <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-blue-700 via-blue-800 to-amber-700 p-0.5 shadow-md shadow-blue-900/10 group-hover:scale-105 transition-transform flex-shrink-0">
            <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center p-1.5 text-center">
              <div className="font-extrabold text-[15px] leading-tight text-blue-900 flex flex-col items-center">
                <span className="text-amber-600 font-black text-xs tracking-tighter">ई-मित्र</span>
                <span className="text-[9px] font-bold text-blue-800 tracking-wider">ONLINE</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight group-hover:text-blue-700 transition-colors">
              {language === 'hi' ? config.website_name_hi : config.website_name}
            </h1>
            <p className="text-xs text-slate-500 font-medium line-clamp-1">
              {language === 'hi' ? config.tagline_hi : config.tagline}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-700">
          <button
            onClick={() => onNavigate('home')}
            className={`transition-colors hover:text-blue-700 py-1 ${
              currentView === 'home' ? 'text-blue-700 border-b-2 border-blue-700' : ''
            }`}
          >
            {t.allServices}
          </button>

          <button
            onClick={onOpenTrackModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 hover:text-blue-900 transition-all border border-blue-200/60"
          >
            <Search className="w-4 h-4 text-blue-600" />
            <span>{t.trackStatusBtn}</span>
          </button>

          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900 transition-all border border-emerald-200/60"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Action Controls & User Auth */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-sm transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden md:block max-w-[130px]">
                  <p className="text-xs font-bold truncate leading-tight">{user.name}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {profileDropdownOpen && (
                <div
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-400 font-medium">Logged in as</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.mobile}</p>
                  </div>

                  {user.role === 'admin' ? (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onNavigate('admin-dashboard');
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-blue-700 hover:bg-blue-50 font-semibold flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span>Admin Dashboard</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onNavigate('dashboard');
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-600" />
                      <span>{t.customerDashboard}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                      onNavigate('home');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-2 border-t border-slate-100 mt-1"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>{t.logout}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuthModal('login')}
                className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {t.login}
              </button>
              <button
                onClick={() => onOpenAuthModal('register')}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-sm hover:shadow transition-all"
              >
                {t.register}
              </button>
            </div>
          )}

          {/* Admin shortcut button */}
          <button
            onClick={() => {
              if (user?.role === 'admin') {
                onNavigate('admin-dashboard');
              } else {
                onNavigate('admin-login');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 hover:text-blue-900 bg-slate-100 hover:bg-blue-50 rounded-xl transition-all border border-slate-200"
            title="Administrator Access"
          >
            <Shield className="w-3.5 h-3.5 text-blue-700" />
            <span className="hidden xl:inline">{t.adminLogin}</span>
          </button>
        </div>

        {/* Mobile Menu Hamburger */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold"
          >
            {language === 'hi' ? 'EN' : 'हिन्दी'}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            {t.allServices}
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenTrackModal();
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-blue-700 bg-blue-50 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>{t.trackStatusBtn}</span>
          </button>

          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-emerald-700 bg-emerald-50 flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t.whatsappChat}</span>
          </a>

          <div className="pt-2 border-t border-slate-100">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-1">
                  <p className="text-xs text-slate-500">{user.mobile}</p>
                  <p className="text-sm font-bold text-slate-900">{user.name}</p>
                </div>

                {user.role === 'admin' ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('admin-dashboard');
                    }}
                    className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-blue-700 bg-blue-50 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Dashboard</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('dashboard');
                    }}
                    className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-blue-700 bg-blue-50 flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{t.customerDashboard}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    onNavigate('home');
                  }}
                  className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t.logout}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal('login');
                  }}
                  className="w-full py-2 px-3 text-center text-sm font-semibold text-slate-800 bg-slate-100 rounded-lg"
                >
                  {t.login}
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal('register');
                  }}
                  className="w-full py-2 px-3 text-center text-sm font-semibold text-white bg-blue-700 rounded-lg"
                >
                  {t.register}
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('admin-login');
              }}
              className="mt-3 w-full py-2 px-3 text-center text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-blue-700" />
              <span>{t.adminLogin}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
