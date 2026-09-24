import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WebsiteConfig } from '../types';

interface ConfigContextType {
  config: WebsiteConfig;
  isLoading: boolean;
  refreshConfig: () => Promise<void>;
  getWhatsAppUrl: (customMessage?: string) => string;
}

const defaultConfig: WebsiteConfig = {
  website_name: 'Rajasthan eMitra Online Services',
  website_name_hi: 'राजस्थान ई-मित्र ऑनलाइन सेवाएं',
  tagline: 'Online Citizen Services at Your Fingertips',
  tagline_hi: 'आपकी उंगलियों पर समस्त सरकारी व डिजिटल सेवाएं',
  contact_number: '+91 98290 12345',
  whatsapp_number: '919829012345',
  support_email: 'support@emitra-rajasthan.online',
  office_address: 'eMitra Central Kendra, Near Tehsil Office, Jaipur, Rajasthan - 302005',
  office_address_hi: 'ई-मित्र केंद्रीय केंद्र, तहसील कार्यालय के पास, जयपुर, राजस्थान - ३०२००५',
  footer_text: '© 2026 Rajasthan eMitra Online Services. All rights reserved. Authorized Digital Kiosk & Citizen Assistance Center.',
  upi_id: 'emitra.rajasthan@upi',
  upi_name: 'Rajasthan eMitra Services',
  upi_qr_enabled: true,
  upi_instructions: 'Scan the QR code using any UPI app (PhonePe, Google Pay, Paytm, BHIM) and enter the exact Service Amount. After payment, enter your 12-digit UTR/UPI Reference Number below to instantly confirm your order.',
  upi_instructions_hi: 'किसी भी यूपीआई ऐप (PhonePe, Google Pay, Paytm, BHIM) से क्यूआर कोड स्कैन करें और निर्धारित राशि का भुगतान करें। भुगतान के बाद नीचे 12 अंकों का UTR/रेफरेंस नंबर दर्ज करें।'
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<WebsiteConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/public/config');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setConfig(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to load website configuration:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshConfig();
  }, [refreshConfig]);

  const getWhatsAppUrl = (customMessage?: string) => {
    const rawNumber = config.whatsapp_number.replace(/\D/g, '');
    const cleanNumber = rawNumber.startsWith('91') ? rawNumber : `91${rawNumber}`;
    const defaultMsg = 'Namaste, I need assistance with Rajasthan eMitra Online Services.';
    const text = encodeURIComponent(customMessage || defaultMsg);
    return `https://wa.me/${cleanNumber}?text=${text}`;
  };

  return (
    <ConfigContext.Provider value={{ config, isLoading, refreshConfig, getWhatsAppUrl }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
