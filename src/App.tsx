import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConfigProvider, useConfig } from './context/ConfigContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ServiceRequestModal } from './components/ServiceRequestModal';
import { PaymentModal } from './components/PaymentModal';
import { TrackStatusModal } from './components/TrackStatusModal';
import { AuthModal } from './components/AuthModal';
import { Service, ServiceRequest } from './types';

type ViewMode = 'home' | 'dashboard' | 'admin-login' | 'admin-dashboard';

const MainLayout: React.FC = () => {
  const { user, isAdmin, language } = useAuth();
  const { config } = useConfig();

  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<ServiceRequest | null>(null);
  const [trackModalOpen, setTrackModalOpen] = useState<boolean>(false);
  const [trackInitialId, setTrackInitialId] = useState<string>('');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Sync document title with language
  useEffect(() => {
    document.title =
      language === 'hi'
        ? `${config.website_name_hi} - ${config.tagline_hi}`
        : `${config.website_name} - ${config.tagline}`;
  }, [language, config]);

  // Handle service request click
  const handleSelectService = (service: Service) => {
    setSelectedService(service);
  };

  // Open track modal directly with a request ID
  const handleOpenTrackWithId = (reqId: string) => {
    setTrackInitialId(reqId);
    setTrackModalOpen(true);
  };

  // Route protection
  const navigateTo = (view: ViewMode) => {
    if (view === 'dashboard' && !user) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }
    if (view === 'admin-dashboard' && !isAdmin) {
      setCurrentView('admin-login');
      return;
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Hide standard navbar on Admin pages for clean dedicated dashboard UI */}
      {currentView !== 'admin-dashboard' && currentView !== 'admin-login' && (
        <Navbar
          onOpenAuthModal={(mode) => {
            setAuthModalMode(mode || 'login');
            setAuthModalOpen(true);
          }}
          onOpenTrackModal={() => {
            setTrackInitialId('');
            setTrackModalOpen(true);
          }}
          onNavigate={(view) => navigateTo(view as ViewMode)}
          currentView={currentView}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            onSelectService={handleSelectService}
            onOpenTrackModal={() => {
              setTrackInitialId('');
              setTrackModalOpen(true);
            }}
            onOpenAuthModal={(mode) => {
              setAuthModalMode(mode || 'login');
              setAuthModalOpen(true);
            }}
          />
        )}

        {currentView === 'dashboard' && (
          <CustomerDashboard
            onPayRequest={(req) => setPaymentRequest(req)}
            onOpenTrackModalWithId={handleOpenTrackWithId}
            onNavigateHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'admin-login' && (
          <AdminLoginPage
            onLoginSuccess={() => setCurrentView('admin-dashboard')}
            onBackToHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'admin-dashboard' && (
          <AdminDashboard onBackToHome={() => setCurrentView('home')} />
        )}
      </main>

      {/* Footer */}
      {currentView !== 'admin-dashboard' && currentView !== 'admin-login' && (
        <Footer
          onOpenTrackModal={() => {
            setTrackInitialId('');
            setTrackModalOpen(true);
          }}
          onNavigate={(view) => navigateTo(view as ViewMode)}
        />
      )}

      {/* Service Request Form Modal */}
      {selectedService && (
        <ServiceRequestModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onSuccess={(req) => {
            // Success handler
          }}
          onProceedToPayment={(req) => {
            setSelectedService(null);
            setPaymentRequest(req);
          }}
        />
      )}

      {/* UPI Payment Modal */}
      {paymentRequest && (
        <PaymentModal
          request={paymentRequest}
          onClose={() => setPaymentRequest(null)}
          onPaymentSubmitted={() => {
            setPaymentRequest(null);
            if (user) {
              setCurrentView('dashboard');
            } else {
              setTrackInitialId(paymentRequest.request_id);
              setTrackModalOpen(true);
            }
          }}
        />
      )}

      {/* Application Status Tracking Modal */}
      <TrackStatusModal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
        initialRequestId={trackInitialId}
        onPayRequest={(req) => {
          setTrackModalOpen(false);
          setPaymentRequest(req);
        }}
      />

      {/* Auth Modal (Citizen Login & Registration) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={() => {
          if (currentView === 'home') {
            setCurrentView('dashboard');
          }
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <ConfigProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ConfigProvider>
  );
}
