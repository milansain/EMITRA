import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AdminStats,
  Service,
  Category,
  ServiceRequest,
  AdminActivityLog,
  NotificationItem,
  WebsiteConfig
} from '../types';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import {
  LayoutDashboard,
  Layers,
  FileText,
  DollarSign,
  Tag,
  CreditCard,
  Settings,
  Activity,
  Bell,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  LogOut,
  X,
  ExternalLink,
  ChevronDown,
  Filter,
  RefreshCw,
  Eye,
  MessageSquare,
  ShieldCheck,
  Check,
  Lock,
  ArrowRight
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToHome: () => void;
}

type TabType =
  | 'overview'
  | 'requests'
  | 'services'
  | 'pricing'
  | 'categories'
  | 'payments'
  | 'settings'
  | 'logs'
  | 'notifications';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToHome }) => {
  const { user, logout, language } = useAuth();
  const { config, refreshConfig } = useConfig();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Request Filters & Search
  const [reqSearch, setReqSearch] = useState('');
  const [reqStatusFilter, setReqStatusFilter] = useState('all');
  const [reqPaymentFilter, setReqPaymentFilter] = useState('all');
  const [reqServiceFilter, setReqServiceFilter] = useState('all');

  // Service Filters
  const [srvSearch, setSrvSearch] = useState('');
  const [srvCategoryFilter, setSrvCategoryFilter] = useState('all');
  const [srvStatusFilter, setSrvStatusFilter] = useState('all');

  // Modals & Active Edit States
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [serviceModalMode, setServiceModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const [docsInput, setDocsInput] = useState('');
  const [docsHiInput, setDocsHiInput] = useState('');

  // Category Modal
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ id: '', name: '', name_hi: '', status: 'active' });

  // Quick Price Edit in state
  const [priceEditingId, setPriceEditingId] = useState<string | null>(null);
  const [newPriceValue, setNewPriceValue] = useState<number>(0);

  // Request Action Modal State
  const [reqNewStatus, setReqNewStatus] = useState<'Pending' | 'Processing' | 'Completed' | 'Rejected'>('Pending');
  const [reqStatusNote, setReqStatusNote] = useState('');
  const [reqAdminMessage, setReqAdminMessage] = useState('');
  const [reqNewPaymentStatus, setReqNewPaymentStatus] = useState<'Pending' | 'Paid' | 'Failed' | 'Refunded'>('Pending');

  // Settings Forms
  const [settingsForm, setSettingsForm] = useState<WebsiteConfig>(config);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');

  // Password Change Form
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_new_password: ''
  });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('emitra_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  }, []);

  // Fetch all admin data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const headers = getHeaders();
    try {
      const [statsRes, srvRes, catRes, reqRes, logsRes, notifRes] = await Promise.all([
        fetch('/api/admin/dashboard-stats', { headers }),
        fetch('/api/admin/services', { headers }),
        fetch('/api/admin/categories', { headers }),
        fetch('/api/admin/requests', { headers }),
        fetch('/api/admin/activity-logs', { headers }),
        fetch('/api/admin/notifications', { headers })
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        if (d.success) setStats(d.data);
      }
      if (srvRes.ok) {
        const d = await srvRes.json();
        if (d.success) setServices(d.data);
      }
      if (catRes.ok) {
        const d = await catRes.json();
        if (d.success) setCategories(d.data);
      }
      if (reqRes.ok) {
        const d = await reqRes.json();
        if (d.success) setRequests(d.data);
      }
      if (logsRes.ok) {
        const d = await logsRes.json();
        if (d.success) setLogs(d.data);
      }
      if (notifRes.ok) {
        const d = await notifRes.json();
        if (d.success) setNotifications(d.data);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setSettingsForm(config);
  }, [config]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const term = reqSearch.trim().toLowerCase();
      const matchesSearch =
        !term ||
        r.request_id.toLowerCase().includes(term) ||
        r.customer_name.toLowerCase().includes(term) ||
        r.customer_mobile.includes(term);

      const matchesStatus =
        reqStatusFilter === 'all' || r.status.toLowerCase() === reqStatusFilter.toLowerCase();
      const matchesPayment =
        reqPaymentFilter === 'all' || r.payment_status.toLowerCase() === reqPaymentFilter.toLowerCase();
      const matchesService =
        reqServiceFilter === 'all' || r.service_id === reqServiceFilter;

      return matchesSearch && matchesStatus && matchesPayment && matchesService;
    });
  }, [requests, reqSearch, reqStatusFilter, reqPaymentFilter, reqServiceFilter]);

  // Filter services
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const term = srvSearch.trim().toLowerCase();
      const matchesSearch =
        !term ||
        s.name.toLowerCase().includes(term) ||
        s.name_hi.toLowerCase().includes(term) ||
        s.description.toLowerCase().includes(term);

      const matchesCat =
        srvCategoryFilter === 'all' || s.category_id === srvCategoryFilter;
      const matchesStatus =
        srvStatusFilter === 'all' || s.status === srvStatusFilter;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [services, srvSearch, srvCategoryFilter, srvStatusFilter]);

  // Toggle Service Active/Disabled
  const handleToggleService = async (serviceId: string) => {
    try {
      const res = await fetch(`/api/admin/services/${serviceId}/toggle`, {
        method: 'PATCH',
        headers: getHeaders()
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to toggle service:', err);
    }
  };

  // Delete Service
  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this service?')) return;
    try {
      const res = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to delete service:', err);
    }
  };

  // Quick Price Save
  const handleSavePrice = async (serviceId: string) => {
    try {
      const res = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ price: Number(newPriceValue) })
      });
      if (res.ok) {
        setPriceEditingId(null);
        fetchData();
      }
    } catch (err) {
      console.error('Price update failed:', err);
    }
  };

  // Save Service (Create or Edit)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.name || !editingService?.category_id || editingService?.price === undefined) {
      alert('Please enter Name, Category and Price.');
      return;
    }

    const payload = {
      ...editingService,
      price: Number(editingService.price),
      required_documents: docsInput
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      required_documents_hi: docsHiInput
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    };

    try {
      if (serviceModalMode === 'create') {
        const res = await fetch('/api/admin/services', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setServiceModalMode(null);
          setEditingService(null);
          fetchData();
        }
      } else if (serviceModalMode === 'edit' && editingService.id) {
        const res = await fetch(`/api/admin/services/${editingService.id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setServiceModalMode(null);
          setEditingService(null);
          fetchData();
        }
      }
    } catch (err) {
      console.error('Service save failed:', err);
    }
  };

  // Open Service Modal
  const openServiceModal = (mode: 'create' | 'edit', srv?: Service) => {
    setServiceModalMode(mode);
    if (mode === 'create') {
      setEditingService({
        name: '',
        name_hi: '',
        category_id: categories[0]?.id || 'cat-other',
        description: '',
        description_hi: '',
        price: 100,
        image: 'file-text',
        processing_time: '2 - 5 Days',
        processing_time_hi: '2 - 5 दिन',
        status: 'active'
      });
      setDocsInput('Aadhaar Card\nPassport Photograph');
      setDocsHiInput('आधार कार्ड\nपासपोर्ट फोटो');
    } else if (srv) {
      setEditingService(srv);
      setDocsInput((srv.required_documents || []).join('\n'));
      setDocsHiInput((srv.required_documents_hi || []).join('\n'));
    }
  };

  // Open Request Detail modal
  const openRequestDetail = async (req: ServiceRequest) => {
    setSelectedRequest(req);
    setReqNewStatus(req.status);
    setReqStatusNote('');
    setReqAdminMessage(req.admin_message || '');
    setReqNewPaymentStatus(req.payment_status);

    // Fetch full request details (with documents)
    try {
      const res = await fetch(`/api/admin/requests/${req.id}`, { headers: getHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSelectedRequest(json.data);
        }
      }
    } catch (e) {
      console.error('Failed to load request details:', e);
    }
  };

  // Update Request Status & Message
  const handleUpdateRequestStatus = async () => {
    if (!selectedRequest) return;

    try {
      // Status update
      const res = await fetch(`/api/admin/requests/${selectedRequest.id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          status: reqNewStatus,
          note: reqStatusNote.trim() || undefined,
          admin_message: reqAdminMessage.trim() || undefined
        })
      });

      // Payment status update if changed
      if (reqNewPaymentStatus !== selectedRequest.payment_status) {
        await fetch(`/api/admin/requests/${selectedRequest.id}/payment`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({
            payment_status: reqNewPaymentStatus,
            notes: 'Updated by Admin via Control Panel'
          })
        });
      }

      if (res.ok) {
        setSelectedRequest(null);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update request:', err);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSavedMsg('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(settingsForm)
      });
      if (res.ok) {
        setSettingsSavedMsg('Settings saved and synchronized with website successfully!');
        refreshConfig();
        fetchData();
        setTimeout(() => setSettingsSavedMsg(''), 4000);
      }
    } catch (err) {
      console.error('Settings update failed:', err);
    }
  };

  // Change Admin Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (passwordForm.new_password !== passwordForm.confirm_new_password) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(passwordForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordMsg({ type: 'success', text: data.message });
        setPasswordForm({ current_password: '', new_password: '', confirm_new_password: '' });
      } else {
        setPasswordMsg({ type: 'error', text: data.message || 'Password update failed' });
      }
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message });
    }
  };

  // Save Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name) return;

    try {
      if (categoryForm.id) {
        await fetch(`/api/admin/categories/${categoryForm.id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(categoryForm)
        });
      } else {
        await fetch('/api/admin/categories', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(categoryForm)
        });
      }
      setCategoryModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Category save failed:', err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Delete category?')) return;
    try {
      await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row text-slate-800">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col justify-between border-r border-slate-800">
        <div>
          {/* Admin Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                ई-मित्र
              </div>
              <div>
                <h2 className="text-sm font-black text-white leading-tight">Admin Portal</h2>
                <p className="text-[10px] text-amber-400 font-medium">Govt of Rajasthan</p>
              </div>
            </div>

            <button
              onClick={fetchData}
              title="Refresh Data"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/40'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'requests'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/40'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>Service Requests</span>
              </div>
              {stats?.pendingRequests ? (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500 text-slate-950">
                  {stats.pendingRequests}
                </span>
              ) : null}
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'services'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/40'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Service Management</span>
            </button>

            <button
              onClick={() => setActiveTab('pricing')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'pricing'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/40'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Price Management</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'categories'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/40'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Categories</span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'payments'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/40'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>UPI & Payments</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'logs'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/40'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Activity Audit Logs</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'notifications'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/40'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/40'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Website & Settings</span>
            </button>
          </nav>
        </div>

        {/* Bottom Profile Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-amber-400 capitalize">Master Administrator</p>
            </div>
            <button
              onClick={() => {
                logout();
                onBackToHome();
              }}
              title="Logout"
              className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onBackToHome}
            className="mt-3 w-full py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3 h-3 text-blue-400" />
            <span>View Citizen Site</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* ============================================================== */}
        {/* TAB 1: OVERVIEW & STATS */}
        {/* ============================================================== */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Admin Dashboard Overview</h1>
                <p className="text-xs text-slate-500">Live operational statistics & citizen service activity</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openServiceModal('create')}
                  className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Service</span>
                </button>
              </div>
            </div>

            {/* 9 Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Services</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalServices}</p>
                <span className="text-[10px] text-blue-600 font-bold">{stats.activeServices} Active on portal</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[11px] font-semibold text-emerald-600 uppercase">Active Services</span>
                <p className="text-2xl font-black text-emerald-700 mt-1">{stats.activeServices}</p>
                <span className="text-[10px] text-slate-400">Available to citizens</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[11px] font-semibold text-rose-600 uppercase">Disabled Services</span>
                <p className="text-2xl font-black text-rose-700 mt-1">{stats.disabledServices}</p>
                <span className="text-[10px] text-slate-400">Hidden from requests</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Requests</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalRequests}</p>
                <span className="text-[10px] text-slate-400">All-time applications</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-xs">
                <span className="text-[11px] font-bold text-amber-800 uppercase">Pending Requests</span>
                <p className="text-2xl font-black text-amber-700 mt-1">{stats.pendingRequests}</p>
                <span className="text-[10px] text-amber-700 font-semibold">Action needed</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/40 shadow-xs">
                <span className="text-[11px] font-bold text-blue-800 uppercase">Processing</span>
                <p className="text-2xl font-black text-blue-700 mt-1">{stats.processingRequests}</p>
                <span className="text-[10px] text-blue-700 font-semibold">With Department</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-xs">
                <span className="text-[11px] font-bold text-emerald-800 uppercase">Completed</span>
                <p className="text-2xl font-black text-emerald-700 mt-1">{stats.completedRequests}</p>
                <span className="text-[10px] text-emerald-700 font-semibold">Issued successfully</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[11px] font-semibold text-rose-600 uppercase">Rejected</span>
                <p className="text-2xl font-black text-rose-700 mt-1">{stats.rejectedRequests}</p>
                <span className="text-[10px] text-slate-400">Document discrepancies</span>
              </div>

              <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white p-4 rounded-2xl shadow-md col-span-2 sm:col-span-1">
                <span className="text-[11px] font-bold text-blue-200 uppercase">Total Revenue (₹)</span>
                <p className="text-2xl font-black text-amber-300 mt-1">₹{stats.totalRevenue.toLocaleString()}</p>
                <span className="text-[10px] text-blue-100">From verified paid orders</span>
              </div>
            </div>

            {/* Recent Requests Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Recent Service Applications</h3>
                  <p className="text-xs text-slate-500">Latest requests submitted by citizens</p>
                </div>
                <button
                  onClick={() => setActiveTab('requests')}
                  className="text-xs text-blue-700 font-bold hover:underline"
                >
                  View All Requests →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Request ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Service</th>
                      <th className="p-3">Fee</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {stats.recentRequests && stats.recentRequests.length > 0 ? (
                      stats.recentRequests.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3 font-mono font-bold text-blue-900">{r.request_id}</td>
                          <td className="p-3">
                            <p className="font-bold text-slate-800">{r.customer_name}</p>
                            <p className="text-[11px] text-slate-400">{r.customer_mobile}</p>
                          </td>
                          <td className="p-3 font-semibold text-slate-700 truncate max-w-[180px]">
                            {r.service_name}
                          </td>
                          <td className="p-3 font-bold text-slate-900">₹{r.price_at_request}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                r.payment_status === 'Paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {r.payment_status}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                r.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : r.status === 'Processing'
                                  ? 'bg-blue-100 text-blue-800'
                                  : r.status === 'Rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => openRequestDetail(r)}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px]"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          No requests submitted yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: REQUESTS MANAGEMENT */}
        {/* ============================================================== */}
        {activeTab === 'requests' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Service Request Management</h1>
                <p className="text-xs text-slate-500">
                  Search, review customer documents, update processing status & verify payments
                </p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Text Search */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Request ID, Name, Mobile..."
                    value={reqSearch}
                    onChange={(e) => setReqSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={reqStatusFilter}
                  onChange={(e) => setReqStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                >
                  <option value="all">All Request Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>

                {/* Payment Status Filter */}
                <select
                  value={reqPaymentFilter}
                  onChange={(e) => setReqPaymentFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                >
                  <option value="all">All Payment Statuses</option>
                  <option value="Pending">Pending Payment</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>

                {/* Service Filter */}
                <select
                  value={reqServiceFilter}
                  onChange={(e) => setReqServiceFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                >
                  <option value="all">All Services ({services.length})</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                <span>Showing {filteredRequests.length} of {requests.length} total requests</span>
                {(reqSearch || reqStatusFilter !== 'all' || reqPaymentFilter !== 'all' || reqServiceFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setReqSearch('');
                      setReqStatusFilter('all');
                      setReqPaymentFilter('all');
                      setReqServiceFilter('all');
                    }}
                    className="text-blue-700 font-bold hover:underline"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Request ID</th>
                      <th className="p-3.5">Customer Details</th>
                      <th className="p-3.5">Service Requested</th>
                      <th className="p-3.5">Price</th>
                      <th className="p-3.5">Payment</th>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-blue-900">{r.request_id}</td>
                          <td className="p-3.5">
                            <p className="font-bold text-slate-800">{r.customer_name}</p>
                            <p className="text-[11px] text-slate-500">{r.customer_mobile}</p>
                          </td>
                          <td className="p-3.5 font-semibold text-slate-700">{r.service_name}</td>
                          <td className="p-3.5 font-extrabold text-slate-900">₹{r.price_at_request}</td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                r.payment_status === 'Paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {r.payment_status}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-500">
                            {new Date(r.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                r.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : r.status === 'Processing'
                                  ? 'bg-blue-100 text-blue-800'
                                  : r.status === 'Rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => openRequestDetail(r)}
                              className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-[11px] shadow-xs"
                            >
                              Manage Request
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">
                          No requests found matching criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: SERVICES MANAGEMENT */}
        {/* ============================================================== */}
        {activeTab === 'services' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Service Catalog Management</h1>
                <p className="text-xs text-slate-500">
                  Add new eMitra services, edit descriptions, toggle availability, and configure required documents
                </p>
              </div>

              <button
                onClick={() => openServiceModal('create')}
                className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Service</span>
              </button>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
              <input
                type="text"
                placeholder="Search services..."
                value={srvSearch}
                onChange={(e) => setSrvSearch(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              <select
                value={srvCategoryFilter}
                onChange={(e) => setSrvCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={srvStatusFilter}
                onChange={(e) => setSrvStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active (Visible)</option>
                <option value="disabled">Disabled (Hidden)</option>
              </select>
            </div>

            {/* Services Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Service Name</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Current Price</th>
                      <th className="p-3.5">Turnaround Time</th>
                      <th className="p-3.5">Status (Toggle)</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredServices.map((srv) => {
                      const cat = categories.find((c) => c.id === srv.category_id);
                      return (
                        <tr key={srv.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3.5">
                            <p className="font-bold text-slate-900">{srv.name}</p>
                            <p className="text-[11px] text-slate-500 font-normal">{srv.name_hi}</p>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                              {cat?.name || srv.category_id}
                            </span>
                          </td>
                          <td className="p-3.5 font-extrabold text-blue-700 text-sm">₹{srv.price}</td>
                          <td className="p-3.5 text-slate-600">{srv.processing_time}</td>
                          <td className="p-3.5">
                            <button
                              onClick={() => handleToggleService(srv.id)}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                                srv.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  srv.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                              />
                              <span>{srv.status === 'active' ? 'Active' : 'Disabled'}</span>
                            </button>
                          </td>
                          <td className="p-3.5 text-right space-x-2">
                            <button
                              onClick={() => openServiceModal('edit', srv)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteService(srv.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: PRICE MANAGEMENT */}
        {/* ============================================================== */}
        {activeTab === 'pricing' && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Real-Time Price Management</h1>
              <p className="text-xs text-slate-500">
                Instantly adjust service fees. Updates appear immediately on the customer portal while historical requests preserve their original price!
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-blue-50/50">
                <p className="text-xs text-blue-900 font-semibold">
                  💡 Tip: Click &quot;Update Price&quot; on any service to change fee. Changes take effect instantly for all new citizen requests.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Service Name</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Active Fee (₹)</th>
                      <th className="p-3.5">Quick Edit</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {services.map((srv) => (
                      <tr key={srv.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5">
                          <p className="font-bold text-slate-900">{srv.name}</p>
                          <p className="text-[11px] text-slate-500">{srv.name_hi}</p>
                        </td>
                        <td className="p-3.5 text-slate-600">
                          {categories.find((c) => c.id === srv.category_id)?.name || srv.category_id}
                        </td>
                        <td className="p-3.5">
                          <span className="font-black text-base text-blue-700">₹{srv.price}</span>
                        </td>
                        <td className="p-3.5">
                          {priceEditingId === srv.id ? (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-500">₹</span>
                              <input
                                type="number"
                                min={0}
                                value={newPriceValue}
                                onChange={(e) => setNewPriceValue(Number(e.target.value))}
                                className="w-24 px-2 py-1 border border-blue-500 rounded-lg text-sm font-bold focus:outline-none"
                              />
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">Click Edit to modify</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          {priceEditingId === srv.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleSavePrice(srv.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setPriceEditingId(null)}
                                className="px-2 py-1.5 text-slate-500 hover:text-slate-700 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setPriceEditingId(srv.id);
                                setNewPriceValue(srv.price);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs"
                            >
                              Update Price
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: CATEGORIES */}
        {/* ============================================================== */}
        {activeTab === 'categories' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Service Categories</h1>
                <p className="text-xs text-slate-500">Manage categories grouping online citizen services</p>
              </div>

              <button
                onClick={() => {
                  setCategoryForm({ id: '', name: '', name_hi: '', status: 'active' });
                  setCategoryModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((c) => {
                const srvCount = services.filter((s) => s.category_id === c.id).length;
                return (
                  <div key={c.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{c.name}</h3>
                        <p className="text-xs text-slate-500">{c.name_hi}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                        {srvCount} Services
                      </span>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                      <span className={`font-bold ${c.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {c.status.toUpperCase()}
                      </span>
                      <div className="space-x-2">
                        <button
                          onClick={() => {
                            setCategoryForm({ id: c.id, name: c.name, name_hi: c.name_hi, status: c.status });
                            setCategoryModalOpen(true);
                          }}
                          className="text-blue-700 hover:underline font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(c.id)}
                          className="text-rose-600 hover:underline font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: PAYMENTS & UPI SETTINGS */}
        {/* ============================================================== */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900">UPI Payment Gateway & Settings</h1>
              <p className="text-xs text-slate-500">Configure receiving UPI address, QR scanner, and view verified payments</p>
            </div>

            {/* Quick UPI Config Card */}
            <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 max-w-xl">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-700" />
                <span>UPI Configuration</span>
              </h3>

              {settingsSavedMsg && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold">
                  {settingsSavedMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Active UPI ID (VPA)
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.upi_id}
                  onChange={(e) => setSettingsForm({ ...settingsForm, upi_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payee / Business Name
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.upi_name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, upi_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Instructions (English)
                </label>
                <textarea
                  rows={2}
                  value={settingsForm.upi_instructions}
                  onChange={(e) => setSettingsForm({ ...settingsForm, upi_instructions: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Instructions (Hindi)
                </label>
                <textarea
                  rows={2}
                  value={settingsForm.upi_instructions_hi}
                  onChange={(e) => setSettingsForm({ ...settingsForm, upi_instructions_hi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs"
              >
                Save UPI Gateway Settings
              </button>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 7: ACTIVITY AUDIT LOGS */}
        {/* ============================================================== */}
        {activeTab === 'logs' && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Administrator Activity Audit Trail</h1>
              <p className="text-xs text-slate-500">Immutable chronological record of administrative actions, pricing edits, and logins</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Administrator</th>
                      <th className="p-3.5">Action</th>
                      <th className="p-3.5">Details</th>
                      <th className="p-3.5">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 text-slate-500 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 font-bold text-slate-800">{log.admin_name}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[10px]">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-700 max-w-xs">{log.details}</td>
                        <td className="p-3.5 font-mono text-slate-400 text-[11px]">{log.ip_address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 8: NOTIFICATIONS */}
        {/* ============================================================== */}
        {activeTab === 'notifications' && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-black text-slate-900">System Notifications</h1>
              <p className="text-xs text-slate-500">Real-time alerts for incoming requests and payments</p>
            </div>

            <div className="space-y-3 max-w-2xl">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div key={n.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-blue-900">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{new Date(n.created_at).toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-xs text-slate-600">{n.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-center py-12 text-xs text-slate-400">No new notifications</p>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 9: WEBSITE SETTINGS & PASSWORD */}
        {/* ============================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-8 max-w-3xl">
            <div>
              <h1 className="text-2xl font-black text-slate-900">System & Website Settings</h1>
              <p className="text-xs text-slate-500">Manage branding, contact helpline, WhatsApp integration, and administrator security</p>
            </div>

            {/* Website Settings Form */}
            <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                Website Branding & Contact Information
              </h3>

              {settingsSavedMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
                  {settingsSavedMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Website Name (English)</label>
                  <input
                    type="text"
                    value={settingsForm.website_name}
                    onChange={(e) => setSettingsForm({ ...settingsForm, website_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Website Name (Hindi)</label>
                  <input
                    type="text"
                    value={settingsForm.website_name_hi}
                    onChange={(e) => setSettingsForm({ ...settingsForm, website_name_hi: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Helpline Phone Number</label>
                  <input
                    type="text"
                    value={settingsForm.contact_number}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contact_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number (e.g. 919829012345)</label>
                  <input
                    type="text"
                    value={settingsForm.whatsapp_number}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Support Email</label>
                <input
                  type="email"
                  value={settingsForm.support_email}
                  onChange={(e) => setSettingsForm({ ...settingsForm, support_email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Office Address</label>
                <input
                  type="text"
                  value={settingsForm.office_address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, office_address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Footer Copyright Text</label>
                <input
                  type="text"
                  value={settingsForm.footer_text}
                  onChange={(e) => setSettingsForm({ ...settingsForm, footer_text: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs"
              >
                Save All Website Settings
              </button>
            </form>

            {/* Change Admin Password */}
            <form onSubmit={handleChangePassword} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-700" />
                <span>Change Administrator Password</span>
              </h3>

              {passwordMsg.text && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    passwordMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'bg-rose-50 text-rose-800'
                  }`}
                >
                  {passwordMsg.text}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password (min 8 chars)</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirm_new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_new_password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs"
              >
                Change Admin Password
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL 1: REQUEST ACTION & DETAIL MODAL */}
      {/* ============================================================== */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 my-8 overflow-hidden animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  Request Management
                </span>
                <h3 className="text-lg font-black">{selectedRequest.request_id}</h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Customer & Service Summary */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500">Customer Name:</span>
                  <p className="font-bold text-slate-900 text-sm">{selectedRequest.customer_name}</p>
                </div>
                <div>
                  <span className="text-slate-500">Mobile Number:</span>
                  <p className="font-bold text-slate-900 text-sm">
                    <a href={`tel:${selectedRequest.customer_mobile}`} className="text-blue-700 underline">
                      {selectedRequest.customer_mobile}
                    </a>
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Service:</span>
                  <p className="font-bold text-slate-900">{selectedRequest.service_name}</p>
                </div>
                <div>
                  <span className="text-slate-500">Price at Request:</span>
                  <p className="font-extrabold text-blue-700 text-sm">₹{selectedRequest.price_at_request}</p>
                </div>
              </div>

              {/* Customer message */}
              {selectedRequest.customer_message && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs">
                  <span className="font-bold text-amber-900 block mb-0.5">Customer Message / Note:</span>
                  <p className="text-amber-950">{selectedRequest.customer_message}</p>
                </div>
              )}

              {/* Uploaded Documents */}
              <div>
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">
                  Uploaded Citizen Documents ({selectedRequest.documents?.length || 0})
                </h4>
                {selectedRequest.documents && selectedRequest.documents.length > 0 ? (
                  <div className="space-y-2">
                    {selectedRequest.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="font-bold text-slate-800 truncate">{doc.file_name}</span>
                          <span className="text-[10px] text-slate-400">
                            ({(doc.file_size / 1024).toFixed(0)} KB)
                          </span>
                        </div>
                        {doc.file_data && (
                          <a
                            href={doc.file_data}
                            download={doc.file_name}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-bold text-xs"
                          >
                            Download
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    No documents attached with this request.
                  </p>
                )}
              </div>

              {/* Payment Info */}
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900">Payment Verification Status:</span>
                  <select
                    value={reqNewPaymentStatus}
                    onChange={(e) => setReqNewPaymentStatus(e.target.value as any)}
                    className="px-2 py-1 rounded border border-blue-300 font-bold bg-white text-xs"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Failed">Failed</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
                {selectedRequest.payment?.utr_number && (
                  <p className="text-slate-600">
                    Customer Submitted UTR:{' '}
                    <strong className="font-mono text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {selectedRequest.payment.utr_number}
                    </strong>
                  </p>
                )}
              </div>

              {/* Update Request Status Form */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Update Processing Status
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                    <select
                      value={reqNewStatus}
                      onChange={(e) => setReqNewStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Status Change Note (Internal)</label>
                    <input
                      type="text"
                      placeholder="e.g. Forwarded to Jaipur Tehsildar"
                      value={reqStatusNote}
                      onChange={(e) => setReqStatusNote(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Send Message to Citizen (Visible in their dashboard & tracking)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter message for applicant..."
                    value={reqAdminMessage}
                    onChange={(e) => setReqAdminMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateRequestStatus}
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs"
                >
                  Save & Notify Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: ADD / EDIT SERVICE MODAL */}
      {/* ============================================================== */}
      {serviceModalMode && editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 my-8 overflow-hidden animate-in fade-in duration-200">
            <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold">
                {serviceModalMode === 'create' ? 'Add New eMitra Service' : 'Edit Service Details'}
              </h3>
              <button
                onClick={() => setServiceModalMode(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Service Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={editingService.name || ''}
                    onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Service Name (Hindi) *</label>
                  <input
                    type="text"
                    required
                    value={editingService.name_hi || ''}
                    onChange={(e) => setEditingService({ ...editingService, name_hi: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={editingService.category_id || ''}
                    onChange={(e) => setEditingService({ ...editingService, category_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Service Price (₹) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={editingService.price || 0}
                    onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingService.status || 'active'}
                    onChange={(e) => setEditingService({ ...editingService, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="disabled">Disabled (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Turnaround Time (English)</label>
                  <input
                    type="text"
                    value={editingService.processing_time || ''}
                    onChange={(e) => setEditingService({ ...editingService, processing_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Turnaround Time (Hindi)</label>
                  <input
                    type="text"
                    value={editingService.processing_time_hi || ''}
                    onChange={(e) => setEditingService({ ...editingService, processing_time_hi: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description (English)</label>
                <textarea
                  rows={2}
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description (Hindi)</label>
                <textarea
                  rows={2}
                  value={editingService.description_hi || ''}
                  onChange={(e) => setEditingService({ ...editingService, description_hi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Required Documents (English, one per line)</label>
                  <textarea
                    rows={3}
                    value={docsInput}
                    onChange={(e) => setDocsInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Required Documents (Hindi, one per line)</label>
                  <textarea
                    rows={3}
                    value={docsHiInput}
                    onChange={(e) => setDocsHiInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setServiceModalMode(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs"
                >
                  {serviceModalMode === 'create' ? 'Create Service' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: CATEGORY CREATE / EDIT */}
      {/* ============================================================== */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {categoryForm.id ? 'Edit Category' : 'Add New Category'}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category Name (English)</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category Name (Hindi)</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name_hi}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name_hi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={categoryForm.status}
                  onChange={(e) => setCategoryForm({ ...categoryForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                >
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-800"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
