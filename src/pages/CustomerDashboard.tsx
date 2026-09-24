import React, { useState, useEffect } from 'react';
import { ServiceRequest, NotificationItem } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  FileText,
  User,
  Bell,
  Search,
  ArrowRight,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

interface CustomerDashboardProps {
  onPayRequest: (request: ServiceRequest) => void;
  onOpenTrackModalWithId: (requestId: string) => void;
  onNavigateHome: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onPayRequest,
  onOpenTrackModalWithId,
  onNavigateHome
}) => {
  const { user, language, t, refreshUser } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'notifications' | 'profile'>('requests');
  const [selectedReqForDetail, setSelectedReqForDetail] = useState<ServiceRequest | null>(null);

  // Profile edit states
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchCustomerData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('emitra_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const [reqRes, notifRes] = await Promise.all([
        fetch('/api/customer/my-requests', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/customer/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (reqRes.ok) {
        const reqJson = await reqRes.json();
        if (reqJson.success) setRequests(reqJson.data || []);
      }

      if (notifRes.ok) {
        const notifJson = await notifRes.json();
        if (notifJson.success) setNotifications(notifJson.data || []);
      }
    } catch (err) {
      console.error('Error fetching customer data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileLoading(true);

    const token = localStorage.getItem('emitra_token');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: profileName, email: profileEmail })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfileSuccess(language === 'hi' ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई' : 'Profile updated successfully');
        refreshUser();
      }
    } catch (err) {
      console.error('Profile update failed:', err);
    } finally {
      setProfileLoading(false);
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
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
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

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {t.paid}
          </span>
        );
      case 'Failed':
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            {t.failed}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            {t.pending}
          </span>
        );
    }
  };

  // Stats
  const total = requests.length;
  const pending = requests.filter((r) => r.status === 'Pending').length;
  const processing = requests.filter((r) => r.status === 'Processing').length;
  const completed = requests.filter((r) => r.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white font-black text-xl flex items-center justify-center shadow-md">
              {user?.name?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-blue-700 font-bold">
                {language === 'hi' ? 'नागरिक सेवा डैशबोर्ड' : 'Citizen Service Dashboard'}
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {user?.name}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {user?.mobile} • {user?.email || 'No email registered'}
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateHome}
            className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <span>{language === 'hi' ? 'नया सेवा आवेदन करें' : '+ Apply for New Service'}</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs text-slate-500 font-medium">{language === 'hi' ? 'कुल आवेदन' : 'Total Requests'}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{total}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs text-amber-600 font-medium">{language === 'hi' ? 'लंबित' : 'Pending'}</p>
            <p className="text-2xl font-black text-amber-700 mt-1">{pending}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs text-blue-600 font-medium">{language === 'hi' ? 'प्रक्रियाधीन' : 'In Process'}</p>
            <p className="text-2xl font-black text-blue-700 mt-1">{processing}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs text-emerald-600 font-medium">{language === 'hi' ? 'पूर्ण / स्वीकृत' : 'Completed'}</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">{completed}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-4 text-xs font-bold text-slate-600 shadow-xs">
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-3 px-2 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t.myRequests} ({requests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-3 px-2 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'notifications'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>{language === 'hi' ? 'सूचनाएं' : 'Notifications'} ({notifications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-2 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{language === 'hi' ? 'प्रोफ़ाइल सेटिंग्स' : 'Profile Settings'}</span>
          </button>
        </div>

        {/* Content based on Active Tab */}
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 shadow-xs min-h-[300px]">
          {activeTab === 'requests' && (
            <div>
              {isLoading ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Loading your requests...
                </div>
              ) : requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-black text-sm text-blue-900 bg-blue-100/60 px-2 py-0.5 rounded">
                            {req.request_id}
                          </span>
                          {getStatusBadge(req.status)}
                          {getPaymentBadge(req.payment_status)}
                        </div>

                        <h3 className="font-bold text-base text-slate-900">
                          {language === 'hi' ? req.service_name_hi || req.service_name : req.service_name}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span>
                            {t.date}:{' '}
                            {new Date(req.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <span>•</span>
                          <span>
                            {t.price}: <strong className="text-slate-900">₹{req.price_at_request}</strong>
                          </span>
                        </div>

                        {req.admin_message && (
                          <div className="mt-2 text-xs bg-blue-50 text-blue-900 p-2.5 rounded-lg border border-blue-100 flex items-start gap-2">
                            <MessageSquare className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <strong className="block text-[11px] text-blue-800">
                                {language === 'hi' ? 'ई-मित्र केंद्र संदेश:' : 'eMitra Desk Response:'}
                              </strong>
                              <span>{req.admin_message}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0">
                        {req.payment_status === 'Pending' && (
                          <button
                            onClick={() => onPayRequest(req)}
                            className="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>{t.payNow}</span>
                          </button>
                        )}

                        <button
                          onClick={() => onOpenTrackModalWithId(req.request_id)}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
                        >
                          <Search className="w-3.5 h-3.5" />
                          <span>{t.viewDetails}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 space-y-3">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="text-base font-bold text-slate-700">{t.noRequests}</h3>
                  <button
                    onClick={onNavigateHome}
                    className="px-4 py-2 bg-blue-700 text-white text-xs font-bold rounded-xl hover:bg-blue-800 transition-colors"
                  >
                    {language === 'hi' ? 'अभी सेवा के लिए आवेदन करें' : 'Apply for a Service Now'}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3 text-xs"
                  >
                    <Bell className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900">
                          {language === 'hi' ? notif.title_hi || notif.title : notif.title}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {new Date(notif.created_at).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <p className="text-slate-600">
                        {language === 'hi' ? notif.message_hi || notif.message : notif.message}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-12 text-xs text-slate-400">
                  {language === 'hi' ? 'कोई नई सूचना नहीं है' : 'No notifications'}
                </p>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="max-w-md space-y-4">
              {profileSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                  {profileSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.name}</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.mobile}</label>
                <input
                  type="text"
                  disabled
                  value={user?.mobile}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-100 text-sm text-slate-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400">Registered mobile number cannot be altered online.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.email}</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="py-2.5 px-5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs"
              >
                {profileLoading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
