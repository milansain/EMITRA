export interface User {
  id: string;
  name: string;
  mobile: string;
  email: string;
  role: 'customer' | 'admin';
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  name_hi: string;
  status: 'active' | 'disabled';
  created_at: string;
}

export interface Service {
  id: string;
  category_id: string;
  name: string;
  name_hi: string;
  description: string;
  description_hi: string;
  price: number;
  required_documents: string[];
  required_documents_hi: string[];
  image: string;
  processing_time: string;
  processing_time_hi: string;
  status: 'active' | 'disabled';
  created_at: string;
  updated_at: string;
}

export interface DocumentRecord {
  id: string;
  request_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_data?: string;
  uploaded_at: string;
}

export interface PaymentRecord {
  id: string;
  request_id: string;
  amount: number;
  upi_id: string;
  utr_number: string;
  payment_method: string;
  payment_status: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  notes?: string;
  created_at: string;
  verified_at?: string;
}

export interface StatusHistoryItem {
  status: 'Pending' | 'Processing' | 'Completed' | 'Rejected';
  timestamp: string;
  note?: string;
  updated_by?: string;
}

export interface ServiceRequest {
  id: string;
  request_id: string;
  user_id?: string;
  customer_name: string;
  customer_mobile: string;
  customer_email?: string;
  service_id: string;
  service_name: string;
  service_name_hi: string;
  price_at_request: number;
  customer_message?: string;
  additional_details?: Record<string, any>;
  status: 'Pending' | 'Processing' | 'Completed' | 'Rejected';
  payment_status: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  admin_message?: string;
  created_at: string;
  updated_at: string;
  status_history: StatusHistoryItem[];
  documents?: DocumentRecord[];
  payment?: PaymentRecord | null;
  service?: Service;
}

export interface WebsiteConfig {
  website_name: string;
  website_name_hi: string;
  tagline: string;
  tagline_hi: string;
  contact_number: string;
  whatsapp_number: string;
  support_email: string;
  office_address: string;
  office_address_hi: string;
  footer_text: string;
  upi_id: string;
  upi_name: string;
  upi_qr_enabled: boolean;
  upi_instructions: string;
  upi_instructions_hi: string;
}

export interface AdminStats {
  totalServices: number;
  activeServices: number;
  disabledServices: number;
  totalRequests: number;
  pendingRequests: number;
  processingRequests: number;
  completedRequests: number;
  rejectedRequests: number;
  totalRevenue: number;
  pendingRevenue: number;
  recentRequests: ServiceRequest[];
}

export interface AdminActivityLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  recipient_type: 'customer' | 'admin';
  user_id?: string;
  request_id?: string;
  title: string;
  title_hi: string;
  message: string;
  message_hi: string;
  is_read: boolean;
  created_at: string;
}
