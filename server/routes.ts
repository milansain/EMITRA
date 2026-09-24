import { Router, Request, Response } from 'express';
import QRCode from 'qrcode';
import { db, User } from './db';
import {
  AuthRequest,
  generateToken,
  hashPassword,
  comparePassword,
  requireAuth,
  requireAdmin,
  authenticateOptional
} from './auth';

const router = Router();

// Helper to get client IP
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

// ==========================================
// 1. PUBLIC ROUTES
// ==========================================

// Public Configuration & Settings
router.get('/public/config', (req: Request, res: Response) => {
  const settings = db.getSettings();
  // Safe subset for public exposure
  res.json({
    success: true,
    data: {
      website_name: settings.website_name || 'Rajasthan eMitra Online Services',
      website_name_hi: settings.website_name_hi || 'राजस्थान ई-मित्र ऑनलाइन सेवाएं',
      tagline: settings.tagline || 'Online Citizen Services at Your Fingertips',
      tagline_hi: settings.tagline_hi || 'आपकी उंगलियों पर समस्त सरकारी व डिजिटल सेवाएं',
      contact_number: settings.contact_number || '+91 98290 12345',
      whatsapp_number: settings.whatsapp_number || '919829012345',
      support_email: settings.support_email || 'support@emitra-rajasthan.online',
      office_address: settings.office_address || 'Jaipur, Rajasthan',
      office_address_hi: settings.office_address_hi || 'जयपुर, राजस्थान',
      footer_text: settings.footer_text || '© 2026 Rajasthan eMitra Online Services.',
      upi_id: settings.upi_id || 'emitra.rajasthan@upi',
      upi_name: settings.upi_name || 'Rajasthan eMitra Services',
      upi_qr_enabled: settings.upi_qr_enabled !== 'false',
      upi_instructions: settings.upi_instructions || '',
      upi_instructions_hi: settings.upi_instructions_hi || ''
    }
  });
});

// Public Categories
router.get('/public/categories', (req: Request, res: Response) => {
  const categories = db.getCategories().filter(c => c.status === 'active');
  res.json({ success: true, data: categories });
});

// Public Services (Active only)
router.get('/public/services', (req: Request, res: Response) => {
  const services = db.getServices(true);
  res.json({ success: true, data: services });
});

// Single Service Details
router.get('/public/services/:id', (req: Request, res: Response) => {
  const service = db.getServiceById(req.params.id);
  if (!service) {
    return res.status(404).json({ success: false, message: 'Service not found' });
  }
  res.json({ success: true, data: service });
});

// Track Request Status by Request ID and optional Mobile
router.get('/public/track/:requestId', (req: Request, res: Response) => {
  const requestId = req.params.requestId.trim();
  const request = db.getRequestById(requestId);

  if (!request) {
    return res.status(404).json({
      success: false,
      message: 'No service request found with this Request ID. Please verify.'
    });
  }

  // Retrieve associated documents and payment status
  const documents = db.getDocumentsByRequestId(request.request_id);
  const payment = db.getPaymentByRequestId(request.request_id);

  res.json({
    success: true,
    data: {
      ...request,
      documents: documents.map(d => ({
        id: d.id,
        file_name: d.file_name,
        file_type: d.file_type,
        file_size: d.file_size,
        uploaded_at: d.uploaded_at
      })),
      payment: payment ? {
        amount: payment.amount,
        upi_id: payment.upi_id,
        utr_number: payment.utr_number,
        payment_status: payment.payment_status,
        created_at: payment.created_at
      } : null
    }
  });
});

// Generate dynamic UPI QR Code Data URL
router.get('/public/upi-qr', async (req: Request, res: Response) => {
  try {
    const settings = db.getSettings();
    const upiId = (req.query.upi_id as string) || settings.upi_id || 'emitra.rajasthan@upi';
    const payeeName = (req.query.name as string) || settings.upi_name || 'Rajasthan eMitra';
    const amount = req.query.amount ? Number(req.query.amount) : undefined;
    const note = (req.query.note as string) || 'eMitra Service Request';

    let upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}`;
    if (amount && !isNaN(amount) && amount > 0) {
      upiString += `&am=${amount.toFixed(2)}&cu=INR`;
    }
    if (note) {
      upiString += `&tn=${encodeURIComponent(note)}`;
    }

    const qrDataUrl = await QRCode.toDataURL(upiString, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 320,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    res.json({
      success: true,
      data: {
        qrDataUrl,
        upiString,
        upiId,
        amount
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to generate QR code', error: err.message });
  }
});

// ==========================================
// 2. AUTHENTICATION (CUSTOMER & ADMIN)
// ==========================================

// Register Customer
router.post('/auth/register', (req: Request, res: Response) => {
  const { name, mobile, email, password } = req.body;

  if (!name || !mobile || !password) {
    return res.status(400).json({ success: false, message: 'Name, Mobile and Password are required.' });
  }

  const cleanMobile = mobile.replace(/\D/g, '');
  if (cleanMobile.length < 10) {
    return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile number.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }

  // Check existing user
  const existingByMobile = db.findUserByEmailOrMobile(cleanMobile);
  if (existingByMobile) {
    return res.status(409).json({ success: false, message: 'An account with this mobile number already exists.' });
  }

  if (email && email.trim()) {
    const existingByEmail = db.findUserByEmailOrMobile(email.trim());
    if (existingByEmail) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }
  }

  const now = new Date().toISOString();
  const newUser: User = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    mobile: cleanMobile,
    email: (email || '').trim().toLowerCase(),
    password_hash: hashPassword(password),
    role: 'customer',
    created_at: now
  };

  db.createUser(newUser);
  const token = generateToken(newUser);

  res.status(201).json({
    success: true,
    message: 'Registration successful! Welcome to Rajasthan eMitra.',
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      mobile: newUser.mobile,
      email: newUser.email,
      role: newUser.role
    }
  });
});

// Login (Customer or Admin)
router.post('/auth/login', (req: Request, res: Response) => {
  const { identifier, password, role_target } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Username/Email/Mobile and Password are required.' });
  }

  const user = db.findUserByEmailOrMobile(identifier);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
  }

  // Role targeted verification if logging in from admin portal
  if (role_target === 'admin' && user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access Denied: This account is not an administrator.' });
  }

  const passwordMatch = comparePassword(password, user.password_hash);
  if (!passwordMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
  }

  // Log admin login activity
  if (user.role === 'admin') {
    db.logAdminAction(
      { id: user.id, name: user.name },
      'Admin Login',
      'Successful login to admin dashboard',
      getClientIp(req)
    );
  }

  const token = generateToken(user);

  res.json({
    success: true,
    message: 'Login successful!',
    token,
    user: {
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      role: user.role
    }
  });
});

// Get Current User Profile
router.get('/auth/me', requireAuth, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      mobile: req.user.mobile,
      email: req.user.email,
      role: req.user.role,
      created_at: req.user.created_at
    }
  });
});

// Update Profile
router.put('/auth/profile', requireAuth, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  const { name, mobile, email } = req.body;
  const updated = db.updateUserProfile(req.user.id, { name, mobile, email });
  res.json({ success: true, message: 'Profile updated successfully', user: updated });
});

// ==========================================
// 3. CUSTOMER SERVICE REQUESTS & ACTIONS
// ==========================================

// Submit Service Request
router.post('/customer/requests', authenticateOptional, (req: AuthRequest, res: Response) => {
  try {
    const {
      service_id,
      customer_name,
      customer_mobile,
      customer_email,
      customer_message,
      additional_details,
      documents
    } = req.body;

    if (!service_id || !customer_name || !customer_mobile) {
      return res.status(400).json({
        success: false,
        message: 'Service, Customer Name, and Mobile Number are required.'
      });
    }

    const userId = req.user?.id;
    const { request, service } = db.createServiceRequest({
      user_id: userId,
      customer_name: customer_name.trim(),
      customer_mobile: customer_mobile.trim(),
      customer_email: customer_email?.trim(),
      service_id,
      customer_message: customer_message?.trim(),
      additional_details
    });

    // Save attached documents if provided
    if (Array.isArray(documents) && documents.length > 0) {
      for (const doc of documents) {
        if (doc.file_name && doc.file_data) {
          db.addDocument({
            request_id: request.request_id,
            file_name: doc.file_name,
            file_type: doc.file_type || 'application/octet-stream',
            file_size: doc.file_size || 0,
            file_data: doc.file_data
          });
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Service request submitted successfully!',
      data: request
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get requests of logged in customer
router.get('/customer/my-requests', requireAuth, (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  // Find requests matching user_id OR user mobile number
  const allRequests = db.getServiceRequests();
  const userRequests = allRequests.filter(
    r => r.user_id === req.user!.id || r.customer_mobile === req.user!.mobile
  );

  res.json({ success: true, data: userRequests });
});

// Submit Payment UTR for a Request
router.post('/customer/payments/submit-utr', (req: Request, res: Response) => {
  const { request_id, utr_number, amount, upi_id } = req.body;

  if (!request_id || !utr_number) {
    return res.status(400).json({
      success: false,
      message: 'Request ID and UTR / Transaction Reference Number are required.'
    });
  }

  const cleanUtr = utr_number.trim();
  if (cleanUtr.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid UTR / Reference Number (min 6 digits/characters).'
    });
  }

  const request = db.getRequestById(request_id);
  if (!request) {
    return res.status(404).json({ success: false, message: 'Service request not found.' });
  }

  const payment = db.submitPaymentRecord({
    request_id: request.request_id,
    amount: amount || request.price_at_request,
    upi_id: upi_id || 'emitra.rajasthan@upi',
    utr_number: cleanUtr
  });

  res.json({
    success: true,
    message: 'Payment reference submitted successfully! Admin will verify your payment shortly.',
    data: payment
  });
});

// Customer Notifications
router.get('/customer/notifications', requireAuth, (req: AuthRequest, res: Response) => {
  const notifs = db.getNotifications('customer', req.user?.id);
  res.json({ success: true, data: notifs });
});

// Mark Notification as read
router.patch('/customer/notifications/:id/read', requireAuth, (req: Request, res: Response) => {
  const ok = db.markNotificationRead(req.params.id);
  res.json({ success: ok });
});

// ==========================================
// 4. ADMIN PANEL MANAGEMENT (REQUIRE ADMIN)
// ==========================================

// Dashboard Statistics & Analytics
router.get('/admin/dashboard-stats', requireAdmin, (req: AuthRequest, res: Response) => {
  const stats = db.getDashboardStatistics();
  res.json({ success: true, data: stats });
});

// All Services Management (Active & Disabled)
router.get('/admin/services', requireAdmin, (req: AuthRequest, res: Response) => {
  const services = db.getServices(false);
  res.json({ success: true, data: services });
});

// Add New Service
router.post('/admin/services', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const {
      category_id,
      name,
      name_hi,
      description,
      description_hi,
      price,
      required_documents,
      required_documents_hi,
      image,
      processing_time,
      processing_time_hi,
      status
    } = req.body;

    if (!name || price === undefined || !category_id) {
      return res.status(400).json({ success: false, message: 'Service name, category, and price are required.' });
    }

    const created = db.createService({
      category_id,
      name: name.trim(),
      name_hi: (name_hi || name).trim(),
      description: (description || '').trim(),
      description_hi: (description_hi || description || '').trim(),
      price: Math.max(0, Number(price)),
      required_documents: Array.isArray(required_documents) ? required_documents : [],
      required_documents_hi: Array.isArray(required_documents_hi) ? required_documents_hi : [],
      image: image || 'file-text',
      processing_time: processing_time || '2 - 5 Days',
      processing_time_hi: processing_time_hi || '2 - 5 दिन',
      status: status === 'disabled' ? 'disabled' : 'active'
    });

    db.logAdminAction(
      { id: req.user!.id, name: req.user!.name },
      'Service Added',
      `Added new service "${created.name}" (₹${created.price})`,
      getClientIp(req)
    );

    res.status(201).json({ success: true, message: 'Service created successfully', data: created });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Edit Existing Service
router.put('/admin/services/:id', requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    const existing = db.getServiceById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    const updates = req.body;
    if (updates.price !== undefined) {
      updates.price = Math.max(0, Number(updates.price));
    }

    const updated = db.updateService(id, updates);

    let details = `Updated service "${updated?.name}"`;
    if (updates.price !== undefined && updates.price !== existing.price) {
      details += ` - Price changed from ₹${existing.price} to ₹${updates.price}`;
    }

    db.logAdminAction(
      { id: req.user!.id, name: req.user!.name },
      'Service Edited',
      details,
      getClientIp(req)
    );

    res.json({ success: true, message: 'Service updated successfully', data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Toggle Service Enable / Disable
router.patch('/admin/services/:id/toggle', requireAdmin, (req: AuthRequest, res: Response) => {
  const id = req.params.id;
  const srv = db.toggleServiceStatus(id);
  if (!srv) {
    return res.status(404).json({ success: false, message: 'Service not found.' });
  }

  db.logAdminAction(
    { id: req.user!.id, name: req.user!.name },
    'Service Status Changed',
    `Toggled service "${srv.name}" to ${srv.status.toUpperCase()}`,
    getClientIp(req)
  );

  res.json({
    success: true,
    message: `Service is now ${srv.status === 'active' ? 'Active & visible to customers' : 'Disabled & hidden from requests'}`,
    data: srv
  });
});

// Delete Service
router.delete('/admin/services/:id', requireAdmin, (req: AuthRequest, res: Response) => {
  const id = req.params.id;
  const existing = db.getServiceById(id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Service not found.' });
  }

  const ok = db.deleteService(id);
  if (ok) {
    db.logAdminAction(
      { id: req.user!.id, name: req.user!.name },
      'Service Deleted',
      `Deleted service "${existing.name}"`,
      getClientIp(req)
    );
  }
  res.json({ success: ok, message: 'Service removed successfully.' });
});

// Manage Categories
router.get('/admin/categories', requireAdmin, (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: db.getCategories() });
});

router.post('/admin/categories', requireAdmin, (req: AuthRequest, res: Response) => {
  const { name, name_hi, status } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Category name is required' });
  }

  const cat = db.createCategory({
    name: name.trim(),
    name_hi: (name_hi || name).trim(),
    status: status === 'disabled' ? 'disabled' : 'active'
  });

  db.logAdminAction(
    { id: req.user!.id, name: req.user!.name },
    'Category Created',
    `Created category "${cat.name}"`,
    getClientIp(req)
  );

  res.status(201).json({ success: true, data: cat });
});

router.put('/admin/categories/:id', requireAdmin, (req: AuthRequest, res: Response) => {
  const cat = db.updateCategory(req.params.id, req.body);
  if (!cat) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  db.logAdminAction(
    { id: req.user!.id, name: req.user!.name },
    'Category Updated',
    `Updated category "${cat.name}"`,
    getClientIp(req)
  );

  res.json({ success: true, data: cat });
});

router.delete('/admin/categories/:id', requireAdmin, (req: AuthRequest, res: Response) => {
  const ok = db.deleteCategory(req.params.id);
  res.json({ success: ok, message: ok ? 'Category deleted' : 'Category not found' });
});

// Service Requests Management with Search and Filters
router.get('/admin/requests', requireAdmin, (req: AuthRequest, res: Response) => {
  const {
    search,
    status,
    payment_status,
    service_id,
    date_from,
    date_to
  } = req.query;

  let requests = db.getServiceRequests();

  // Search filter (Request ID, Customer Name, Mobile Number)
  if (search && typeof search === 'string') {
    const term = search.trim().toLowerCase();
    requests = requests.filter(r =>
      r.request_id.toLowerCase().includes(term) ||
      r.customer_name.toLowerCase().includes(term) ||
      r.customer_mobile.includes(term)
    );
  }

  // Status filter
  if (status && typeof status === 'string' && status !== 'all') {
    requests = requests.filter(r => r.status.toLowerCase() === status.toLowerCase());
  }

  // Payment status filter
  if (payment_status && typeof payment_status === 'string' && payment_status !== 'all') {
    requests = requests.filter(r => r.payment_status.toLowerCase() === payment_status.toLowerCase());
  }

  // Service filter
  if (service_id && typeof service_id === 'string' && service_id !== 'all') {
    requests = requests.filter(r => r.service_id === service_id);
  }

  // Date filters
  if (date_from && typeof date_from === 'string') {
    const fromTime = new Date(date_from).getTime();
    requests = requests.filter(r => new Date(r.created_at).getTime() >= fromTime);
  }
  if (date_to && typeof date_to === 'string') {
    const toTime = new Date(date_to).getTime() + 86400000;
    requests = requests.filter(r => new Date(r.created_at).getTime() <= toTime);
  }

  res.json({ success: true, count: requests.length, data: requests });
});

// Single Request Full Details for Admin
router.get('/admin/requests/:id', requireAdmin, (req: AuthRequest, res: Response) => {
  const request = db.getRequestById(req.params.id);
  if (!request) {
    return res.status(404).json({ success: false, message: 'Service request not found.' });
  }

  const documents = db.getDocumentsByRequestId(request.request_id);
  const payment = db.getPaymentByRequestId(request.request_id);
  const service = db.getServiceById(request.service_id);

  res.json({
    success: true,
    data: {
      ...request,
      documents,
      payment,
      service
    }
  });
});

// Update Request Status (Pending -> Processing -> Completed / Rejected)
router.patch('/admin/requests/:id/status', requireAdmin, (req: AuthRequest, res: Response) => {
  const { status, note, admin_message } = req.body;
  if (!status || !['Pending', 'Processing', 'Completed', 'Rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Valid status is required (Pending, Processing, Completed, Rejected).' });
  }

  const updated = db.updateRequestStatus(
    req.params.id,
    status,
    note,
    req.user?.name,
    admin_message
  );

  if (!updated) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

  db.logAdminAction(
    { id: req.user!.id, name: req.user!.name },
    'Request Status Changed',
    `Updated Request ${updated.request_id} to "${status}". Note: ${note || 'None'}`,
    getClientIp(req)
  );

  res.json({
    success: true,
    message: `Request status updated to ${status}`,
    data: updated
  });
});

// Update Request Payment Status
router.patch('/admin/requests/:id/payment', requireAdmin, (req: AuthRequest, res: Response) => {
  const { payment_status, notes } = req.body;
  if (!payment_status || !['Pending', 'Paid', 'Failed', 'Refunded'].includes(payment_status)) {
    return res.status(400).json({ success: false, message: 'Valid payment status required (Pending, Paid, Failed, Refunded).' });
  }

  const updated = db.updateRequestPaymentStatus(req.params.id, payment_status, notes);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

  db.logAdminAction(
    { id: req.user!.id, name: req.user!.name },
    'Payment Status Changed',
    `Payment status for Request ${updated.request_id} updated to "${payment_status}"`,
    getClientIp(req)
  );

  res.json({
    success: true,
    message: `Payment status updated to ${payment_status}`,
    data: updated
  });
});

// Send Message / Reply to Customer
router.post('/admin/requests/:id/message', requireAdmin, (req: AuthRequest, res: Response) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: 'Message content is required.' });
  }

  const reqObj = db.getRequestById(req.params.id);
  if (!reqObj) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

  reqObj.admin_message = message.trim();
  reqObj.updated_at = new Date().toISOString();
  db.save();

  db.createNotification({
    recipient_type: 'customer',
    user_id: reqObj.user_id,
    request_id: reqObj.request_id,
    title: `New Message for ${reqObj.request_id}`,
    title_hi: `आपके आवेदन ${reqObj.request_id} हेतु संदेश`,
    message: message.trim(),
    message_hi: message.trim()
  });

  db.logAdminAction(
    { id: req.user!.id, name: req.user!.name },
    'Admin Message Sent',
    `Sent remark to customer on request ${reqObj.request_id}`,
    getClientIp(req)
  );

  res.json({ success: true, message: 'Message sent successfully to customer', data: reqObj });
});

// Settings Management
router.get('/admin/settings', requireAdmin, (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: db.getSettings() });
});

router.post('/admin/settings', requireAdmin, (req: AuthRequest, res: Response) => {
  const newSettings = req.body;
  if (!newSettings || typeof newSettings !== 'object') {
    return res.status(400).json({ success: false, message: 'Invalid settings payload' });
  }

  const updated = db.updateSettings(newSettings);

  db.logAdminAction(
    { id: req.user!.id, name: req.user!.name },
    'Settings Updated',
    'Updated system and UPI settings',
    getClientIp(req)
  );

  res.json({ success: true, message: 'Settings saved successfully', data: updated });
});

// Admin Password Change
router.post('/admin/change-password', requireAdmin, (req: AuthRequest, res: Response) => {
  const { current_password, new_password, confirm_new_password } = req.body;

  if (!current_password || !new_password || !confirm_new_password) {
    return res.status(400).json({ success: false, message: 'All password fields are required.' });
  }

  if (new_password !== confirm_new_password) {
    return res.status(400).json({ success: false, message: 'New password and confirm password do not match.' });
  }

  if (new_password.length < 8) {
    return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' });
  }

  const adminUser = db.findUserById(req.user!.id);
  if (!adminUser) {
    return res.status(404).json({ success: false, message: 'Admin account not found.' });
  }

  const isCurrentValid = comparePassword(current_password, adminUser.password_hash);
  if (!isCurrentValid) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
  }

  const newHash = hashPassword(new_password);
  db.updateUserPassword(adminUser.id, newHash);

  db.logAdminAction(
    { id: adminUser.id, name: adminUser.name },
    'Password Changed',
    'Admin changed account password',
    getClientIp(req)
  );

  res.json({ success: true, message: 'Admin password changed successfully!' });
});

// Admin Activity Logs
router.get('/admin/activity-logs', requireAdmin, (req: AuthRequest, res: Response) => {
  const logs = db.getActivityLogs(150);
  res.json({ success: true, data: logs });
});

// Admin Notifications
router.get('/admin/notifications', requireAdmin, (req: AuthRequest, res: Response) => {
  const notifs = db.getNotifications('admin');
  res.json({ success: true, data: notifs });
});

export default router;
