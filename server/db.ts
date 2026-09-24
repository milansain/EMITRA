import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  name: string;
  mobile: string;
  email: string;
  password_hash: string;
  role: 'customer' | 'admin';
  created_at: string;
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
  file_data: string; // Base64 or storage url
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

export interface ServiceRequest {
  id: string;
  request_id: string; // e.g. EM-2026-1001
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
  status_history: {
    status: 'Pending' | 'Processing' | 'Completed' | 'Rejected';
    timestamp: string;
    note?: string;
    updated_by?: string;
  }[];
}

export interface Setting {
  id: string;
  setting_key: string;
  setting_value: string;
  updated_at: string;
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

export interface DatabaseSchema {
  users: User[];
  categories: Category[];
  services: Service[];
  service_requests: ServiceRequest[];
  documents: DocumentRecord[];
  payments: PaymentRecord[];
  settings: Record<string, string>;
  admin_activity_logs: AdminActivityLog[];
  notifications: NotificationItem[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'emitra_database.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class RelationalDatabase {
  private data: DatabaseSchema;
  private isSaving = false;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Error reading database file, reinitializing default:', err);
      }
    }
    const initial = this.getInitialSeed();
    this.persistSync(initial);
    return initial;
  }

  private persistSync(dataToSave: DatabaseSchema) {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (e) {
      console.error('Failed to write database file:', e);
    }
  }

  public save() {
    if (this.isSaving) return;
    this.isSaving = true;
    setTimeout(() => {
      this.persistSync(this.data);
      this.isSaving = false;
    }, 50);
  }

  private getInitialSeed(): DatabaseSchema {
    const now = new Date().toISOString();
    // Default admin password hash for "Admin@Emitra2026!"
    const adminPasswordHash = bcrypt.hashSync('Admin@Emitra2026!', 10);
    // Demo customer password hash for "Customer@123"
    const customerPasswordHash = bcrypt.hashSync('Customer@123', 10);

    const categories: Category[] = [
      { id: 'cat-aadhaar', name: 'Aadhaar Services', name_hi: 'आधार सेवाएं', status: 'active', created_at: now },
      { id: 'cat-pan', name: 'PAN Card Services', name_hi: 'पैन कार्ड सेवाएं', status: 'active', created_at: now },
      { id: 'cat-voter', name: 'Voter ID Services', name_hi: 'मतदाता पहचान पत्र (वोटर आईडी)', status: 'active', created_at: now },
      { id: 'cat-ration', name: 'Ration Card Services', name_hi: 'राशन कार्ड सेवाएं', status: 'active', created_at: now },
      { id: 'cat-janaadhaar', name: 'Jan Aadhaar Services', name_hi: 'जन आधार सेवाएं', status: 'active', created_at: now },
      { id: 'cat-eshram', name: 'eShram Services', name_hi: 'ई-श्रम कार्ड सेवाएं', status: 'active', created_at: now },
      { id: 'cat-farmer', name: 'Farmer Services', name_hi: 'किसान सेवाएं (PM-Kisan/KCC)', status: 'active', created_at: now },
      { id: 'cat-dl', name: 'Driving Licence Services', name_hi: 'ड्राइविंग लाइसेंस सेवाएं', status: 'active', created_at: now },
      { id: 'cat-rc', name: 'Vehicle & RC Services', name_hi: 'वाहन एवं आरसी सेवाएं', status: 'active', created_at: now },
      { id: 'cat-forms', name: 'Online Form Services', name_hi: 'ऑनलाइन फॉर्म / भर्ती आवेदन', status: 'active', created_at: now },
      { id: 'cat-certificates', name: 'Certificate Services', name_hi: 'प्रमाण पत्र (मूल निवास / जाति)', status: 'active', created_at: now },
      { id: 'cat-other', name: 'Other eMitra Services', name_hi: 'अन्य ई-मित्र सेवाएं', status: 'active', created_at: now },
    ];

    const services: Service[] = [
      {
        id: 'srv-pan-new',
        category_id: 'cat-pan',
        name: 'New PAN Card Application',
        name_hi: 'नया पैन कार्ड आवेदन',
        description: 'Apply for a fresh NSDL/UTI PAN card with instant e-PAN and physical PVC card delivery.',
        description_hi: 'नए एनएसडीएल/यूटीआई पैन कार्ड के लिए आवेदन करें। ई-पैन और फिजिकल पीवीसी कार्ड डाक से पाएं।',
        price: 200,
        required_documents: ['Aadhaar Card (Front & Back)', 'Passport Size Photograph', 'Applicant Signature'],
        required_documents_hi: ['आधार कार्ड (दोनों तरफ)', 'पासपोर्ट साइज फोटो', 'हस्ताक्षर (सिग्नेचर)'],
        image: 'credit-card',
        processing_time: '3 - 7 Working Days',
        processing_time_hi: '3 - 7 कार्य दिवस',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        id: 'srv-pan-correction',
        category_id: 'cat-pan',
        name: 'PAN Card Correction / Update',
        name_hi: 'पैन कार्ड संशोधन / सुधार',
        description: 'Name, Date of Birth, Father Name or address correction in existing PAN card.',
        description_hi: 'पैन कार्ड में नाम, जन्मतिथि, पिता का नाम अथवा फोटो व पता सुधार करवाएं।',
        price: 220,
        required_documents: ['Existing PAN Copy', 'Aadhaar Card', 'Valid Proof of Correction', 'Signature'],
        required_documents_hi: ['पुराना पैन कार्ड', 'आधार कार्ड', 'सुधार हेतु वैध दस्तावेज', 'हस्ताक्षर'],
        image: 'file-check',
        processing_time: '5 - 10 Working Days',
        processing_time_hi: '5 - 10 कार्य दिवस',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        id: 'srv-voter-id',
        category_id: 'cat-voter',
        name: 'Voter ID Card Apply / e-EPIC',
        name_hi: 'मतदाता पहचान पत्र (वोटर कार्ड) नया / डाउनलोड',
        description: 'New Voter Registration (Form 6), correction (Form 8) and high quality color e-EPIC download.',
        description_hi: 'नया वोटर आईडी कार्ड आवेदन (प्रारूप 6), संशोधन एवं डिजिटल रंगीन पहचान पत्र डाउनलोड।',
        price: 100,
        required_documents: ['Aadhaar Card', 'Age Proof (10th/Birth Cert)', 'Passport Photo', 'Address Proof'],
        required_documents_hi: ['आधार कार्ड', 'आयु प्रमाण पत्र', 'पासपोर्ट फोटो', 'निवास प्रमाण'],
        image: 'vote',
        processing_time: '7 - 15 Working Days',
        processing_time_hi: '7 - 15 कार्य दिवस',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        id: 'srv-ration-pdf',
        category_id: 'cat-ration',
        name: 'Ration Card Print / Member Add',
        name_hi: 'राशन कार्ड प्रतिलिपि / सदस्य जोड़ना',
        description: 'Download verified digital Rajasthan Ration Card PDF or submit request for member addition/deletion.',
        description_hi: 'डिजिटल राशन कार्ड प्रतिलिपि डाउनलोड अथवा नए पारिवारिक सदस्य जोड़ने का आवेदन।',
        price: 50,
        required_documents: ['Ration Card Number / Copy', 'Jan Aadhaar Card', 'Member Aadhaar Card'],
        required_documents_hi: ['राशन कार्ड नंबर / प्रति', 'जन आधार कार्ड', 'सदस्य का आधार कार्ड'],
        image: 'layers',
        processing_time: '1 - 3 Working Days',
        processing_time_hi: '1 - 3 कार्य दिवस',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        id: 'srv-mool-niwas',
        category_id: 'cat-certificates',
        name: 'Bonafide / Domicile Certificate (Mool Niwas)',
        name_hi: 'मूल निवास प्रमाण पत्र (डिजिटल हस्ताक्षरित)',
        description: 'Rajasthan official Digital Signature Bonafide Resident Certificate approved by Tehsildar.',
        description_hi: 'राजस्थान सरकार अधिकृत डिजिटल हस्ताक्षरित मूल निवास प्रमाण पत्र।',
        price: 150,
        required_documents: ['Jan Aadhaar Card', 'Aadhaar Card', 'Ration Card / 10 Yr Proof', 'Passport Photo', 'Self Declaration'],
        required_documents_hi: ['जन आधार कार्ड', 'आधार कार्ड', 'राशन कार्ड / 10 वर्ष पुराना दस्तावेज', 'फोटो', 'स्वप्रमाणित घोषणा'],
        image: 'award',
        processing_time: '4 - 7 Working Days',
        processing_time_hi: '4 - 7 कार्य दिवस',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        id: 'srv-caste-cert',
        category_id: 'cat-certificates',
        name: 'Caste Certificate (SC / ST / OBC / EWS)',
        name_hi: 'जाति प्रमाण पत्र (SC/ST/OBC/MBC/EWS)',
        description: 'Rajasthan state and Central format digitally signed caste certificate.',
        description_hi: 'राजस्थान राज्य एवं केंद्र स्तर का डिजिटल जाति प्रमाण पत्र।',
        price: 150,
        required_documents: ['Jan Aadhaar Card', 'Aadhaar Card', 'Father Land / Old Proof for Caste', 'Self Declaration'],
        required_documents_hi: ['जन आधार कार्ड', 'आधार कार्ड', 'पिता का जाति संबंध दस्तावेज/जमाबंदी', 'घोषणा पत्र'],
        image: 'file-text',
        processing_time: '4 - 7 Working Days',
        processing_time_hi: '4 - 7 कार्य दिवस',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        id: 'srv-janaadhaar-update',
        category_id: 'cat-janaadhaar',
        name: 'Jan Aadhaar Family Update / Correction',
        name_hi: 'जन आधार कार्ड संशोधन / सदस्य ई-केवाईसी',
        description: 'Add new member, update bank account, mobile number or annual income verification in Jan Aadhaar.',
        description_hi: 'जन आधार में नया सदस्य जोड़ना, बैंक खाता, मोबाइल नंबर अथवा ईकेवाईसी अपडेशन।',
        price: 120,
        required_documents: ['Jan Aadhaar Receipt/Card', 'Aadhaar Cards of All Members', 'Bank Passbook', 'Mobile OTP'],
        required_documents_hi: ['जन आधार रसीद/कार्ड', 'सभी सदस्यों के आधार कार्ड', 'बैंक पासबुक', 'मोबाइल ओटीपी'],
        image: 'users',
        processing_time: '3 - 7 Working Days',
        processing_time_hi: '3 - 7 कार्य दिवस',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        id: 'srv-eshram-card',
        category_id: 'cat-eshram',
        name: 'eShram Card Registration / Download',
        name_hi: 'ई-श्रम कार्ड पंजीयन / डाउनलोड',
        description: 'National Database of Unorganized Workers (NDUW) eShram card registration with ₹2 Lakh accident cover.',
        description_hi: 'असंगठित कामगारों हेतु भारत सरकार का आधिकारिक ई-श्रम कार्ड। 2 लाख का दुर्घटना बीमा कवर।',
        price: 80,
        required_documents: ['Aadhaar Card linked with Mobile', 'Bank Account Passbook/Details'],
        required_documents_hi: ['आधार कार्ड (मोबाइल लिंक)', 'बैंक खाता विवरण / पासबुक'],
        image: 'briefcase',
        processing_time: 'Same Day (2 - 4 Hours)',
        processing_time_hi: 'उसी दिन (2 - 4 घंटे)',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        id: 'srv-pmkisan-ekyc',
        category_id: 'cat-farmer',
        name: 'PM-Kisan Samman Nidhi eKYC & Correction',
        name_hi: 'पीएम किसान सम्मान निधि ई-केवाईसी एवं सुधार',
        description: 'Biometric / OTP based e-KYC, land seeding update, and bank account resolution for farmers.',
        description_hi: 'पीएम किसान सम्मान निधि किस्त हेतु अनिवार्य ईकेवाईसी एवं बैंक/जमीन सीडिंग समाधान।',
        price: 60,
        required_documents: ['Aadhaar Card', 'Farmer Registration / Mobile Number', 'Jamabandi/Land Document'],
        required_documents_hi: ['आधार कार्ड', 'किसान रजिस्ट्रेशन नंबर / मोबाइल', 'जमाबंदी / नकल'],
        image: 'sprout',
        processing_time: 'Same Day',
        processing_time_hi: 'उसी दिन',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        id: 'srv-dl-learning',
        category_id: 'cat-dl',
        name: 'Learning Licence Online Application',
        name_hi: 'लर्निंग ड्राइविंग लाइसेंस ऑनलाइन आवेदन',
        description: 'Parivahan Sarathi online learning licence application slot booking and test preparation support.',
        description_hi: 'परिवहन सारथी पोर्टल पर नया लर्निंग लाइसेंस आवेदन एवं ऑनलाइन टेस्ट प्रक्रिया।',
        price: 350,
        required_documents: ['Aadhaar Card', 'Age Proof (10th Marksheet)', 'Blood Group Report', 'Photo & Signature'],
        required_documents_hi: ['आधार कार्ड', '10वीं अंकतालिका', 'ब्लड ग्रुप रिपोर्ट', 'फोटो एवं हस्ताक्षर'],
        image: 'car',
        processing_time: '2 - 5 Working Days',
        processing_time_hi: '2 - 5 कार्य दिवस',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        id: 'srv-police-verification',
        category_id: 'cat-certificates',
        name: 'Police Character Verification Certificate',
        name_hi: 'राजस्थान पुलिस चरित्र प्रमाण पत्र (Police Clearance)',
        description: 'Rajasthan Police official character verification certificate for jobs, tenders, and license.',
        description_hi: 'सरकारी/निजी नौकरियों एवं संविदा हेतु राजस्थान पुलिस अधिकृत चरित्र प्रमाण पत्र।',
        price: 250,
        required_documents: ['Aadhaar Card', 'Jan Aadhaar Card', 'Passport Photo', 'Gawaha (2 Witness IDs)'],
        required_documents_hi: ['आधार कार्ड', 'जन आधार', 'पासपोर्ट फोटो', '2 गवाहों के आधार कार्ड'],
        image: 'shield-check',
        processing_time: '7 - 14 Working Days',
        processing_time_hi: '7 - 14 कार्य दिवस',
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        id: 'srv-online-form',
        category_id: 'cat-forms',
        name: 'Govt Job / Exam Online Form Filling',
        name_hi: 'सरकारी भर्ती / परीक्षा ऑनलाइन फॉर्म',
        description: 'Professional error-free application form filling for RPSC, RSSB, SSC, Railway, UPSC, CET exams.',
        description_hi: 'आरपीएससी, आरएसएसबी, सीईटी, एसएससी एवं रेलवे सभी सरकारी भर्तियों के फॉर्म बिना गलती भरवाएं।',
        price: 100,
        required_documents: ['Educational Marksheets', 'Aadhaar / Jan Aadhaar', 'Photo & Signature', 'Caste/Category Certificate'],
        required_documents_hi: ['शैक्षणिक अंकतालिकाएं', 'आधार / जन आधार', 'फोटो व हस्ताक्षर', 'जाति प्रमाण पत्र'],
        image: 'file-edit',
        processing_time: '1 - 2 Working Days',
        processing_time_hi: '1 - 2 कार्य दिवस',
        status: 'active',
        created_at: now,
        updated_at: now
      }
    ];

    const users: User[] = [
      {
        id: 'usr-admin-1',
        name: 'Rajesh Sharma (Admin)',
        mobile: '9829012345',
        email: 'admin@emitra.rajasthan.gov.in',
        password_hash: adminPasswordHash,
        role: 'admin',
        created_at: now
      },
      {
        id: 'usr-customer-1',
        name: 'Vikram Singh Shekhawat',
        mobile: '9414012345',
        email: 'vikram.singh@gmail.com',
        password_hash: customerPasswordHash,
        role: 'customer',
        created_at: now
      }
    ];

    const settings: Record<string, string> = {
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
      upi_qr_enabled: 'true',
      upi_instructions: 'Scan the QR code using any UPI app (PhonePe, Google Pay, Paytm, BHIM) and enter the exact Service Amount. After payment, enter your 12-digit UTR/UPI Reference Number below to instantly confirm your order.',
      upi_instructions_hi: 'किसी भी यूपीआई ऐप (PhonePe, Google Pay, Paytm, BHIM) से क्यूआर कोड स्कैन करें और निर्धारित राशि का भुगतान करें। भुगतान के बाद नीचे 12 अंकों का UTR/रेफरेंस नंबर दर्ज करें।'
    };

    // Prepopulate 2 realistic service requests
    const initialRequests: ServiceRequest[] = [
      {
        id: 'req-1001',
        request_id: 'EM-2026-1001',
        user_id: 'usr-customer-1',
        customer_name: 'Vikram Singh Shekhawat',
        customer_mobile: '9414012345',
        customer_email: 'vikram.singh@gmail.com',
        service_id: 'srv-pan-new',
        service_name: 'New PAN Card Application',
        service_name_hi: 'नया पैन कार्ड आवेदन',
        price_at_request: 200,
        customer_message: 'Please process urgently for bank loan requirement. All clear Aadhaar copy attached.',
        status: 'Processing',
        payment_status: 'Paid',
        admin_message: 'Application submitted to NSDL portal. Acknowledgment receipt will be generated shortly.',
        created_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
        updated_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
        status_history: [
          { status: 'Pending', timestamp: new Date(Date.now() - 3600 * 1000 * 24).toISOString(), note: 'Request submitted online' },
          { status: 'Processing', timestamp: new Date(Date.now() - 3600 * 1000 * 12).toISOString(), note: 'Payment verified & documents verified', updated_by: 'Rajesh Sharma (Admin)' }
        ]
      },
      {
        id: 'req-1002',
        request_id: 'EM-2026-1002',
        customer_name: 'Sunita Sharma',
        customer_mobile: '9828112233',
        customer_email: 'sunita.sharma@yahoo.com',
        service_id: 'srv-mool-niwas',
        service_name: 'Bonafide / Domicile Certificate (Mool Niwas)',
        service_name_hi: 'मूल निवास प्रमाण पत्र (डिजिटल हस्ताक्षरित)',
        price_at_request: 150,
        customer_message: 'Attached 10th marksheet and Jan Aadhaar.',
        status: 'Completed',
        payment_status: 'Paid',
        admin_message: 'Your Bonafide Certificate has been approved by Tehsildar. PDF attached with digital signature.',
        created_at: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
        updated_at: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
        status_history: [
          { status: 'Pending', timestamp: new Date(Date.now() - 3600 * 1000 * 72).toISOString(), note: 'Request submitted online' },
          { status: 'Processing', timestamp: new Date(Date.now() - 3600 * 1000 * 48).toISOString(), note: 'Forwarded to Revenue Tehsildar Jaipur' },
          { status: 'Completed', timestamp: new Date(Date.now() - 3600 * 1000 * 6).toISOString(), note: 'Digital certificate issued & ready to download' }
        ]
      }
    ];

    const initialPayments: PaymentRecord[] = [
      {
        id: 'pay-1001',
        request_id: 'EM-2026-1001',
        amount: 200,
        upi_id: 'emitra.rajasthan@upi',
        utr_number: '426819283719',
        payment_method: 'UPI',
        payment_status: 'Paid',
        notes: 'Verified via PhonePe UTR',
        created_at: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
        verified_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString()
      },
      {
        id: 'pay-1002',
        request_id: 'EM-2026-1002',
        amount: 150,
        upi_id: 'emitra.rajasthan@upi',
        utr_number: '426710293812',
        payment_method: 'UPI',
        payment_status: 'Paid',
        notes: 'Verified via GPay UTR',
        created_at: new Date(Date.now() - 3600 * 1000 * 70).toISOString(),
        verified_at: new Date(Date.now() - 3600 * 1000 * 48).toISOString()
      }
    ];

    const initialLogs: AdminActivityLog[] = [
      {
        id: 'log-1',
        admin_id: 'usr-admin-1',
        admin_name: 'Rajesh Sharma (Admin)',
        action: 'System Initialized',
        details: 'eMitra database and default service catalog loaded',
        ip_address: '127.0.0.1',
        created_at: now
      },
      {
        id: 'log-2',
        admin_id: 'usr-admin-1',
        admin_name: 'Rajesh Sharma (Admin)',
        action: 'Payment Verified',
        details: 'Verified UTR 426819283719 for Request EM-2026-1001',
        ip_address: '127.0.0.1',
        created_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString()
      }
    ];

    const initialNotifications: NotificationItem[] = [
      {
        id: 'notif-1',
        recipient_type: 'customer',
        user_id: 'usr-customer-1',
        request_id: 'EM-2026-1001',
        title: 'Application Under Processing',
        title_hi: 'आवेदन प्रक्रियाधीन है',
        message: 'Your New PAN Card Application (EM-2026-1001) has been approved for processing.',
        message_hi: 'आपका नया पैन कार्ड आवेदन (EM-2026-1001) प्रसंस्करण के लिए स्वीकृत कर लिया गया है।',
        is_read: false,
        created_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString()
      },
      {
        id: 'notif-2',
        recipient_type: 'admin',
        request_id: 'EM-2026-1001',
        title: 'New Service Request Received',
        title_hi: 'नया सेवा अनुरोध प्राप्त हुआ',
        message: 'Vikram Singh Shekhawat requested New PAN Card Application (EM-2026-1001).',
        message_hi: 'विक्रम सिंह शेखावत ने नया पैन कार्ड (EM-2026-1001) हेतु आवेदन किया।',
        is_read: true,
        created_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString()
      }
    ];

    return {
      users,
      categories,
      services,
      service_requests: initialRequests,
      documents: [],
      payments: initialPayments,
      settings,
      admin_activity_logs: initialLogs,
      notifications: initialNotifications
    };
  }

  // --- Users CRUD ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public findUserByEmailOrMobile(identifier: string): User | undefined {
    const clean = identifier.trim().toLowerCase();
    return this.data.users.find(u => 
      u.email.toLowerCase() === clean || u.mobile.replace(/\D/g, '') === clean.replace(/\D/g, '')
    );
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUserPassword(userId: string, newHash: string): boolean {
    const user = this.findUserById(userId);
    if (!user) return false;
    user.password_hash = newHash;
    this.save();
    return true;
  }

  public updateUserProfile(userId: string, updates: Partial<User>): User | null {
    const user = this.findUserById(userId);
    if (!user) return null;
    if (updates.name) user.name = updates.name;
    if (updates.mobile) user.mobile = updates.mobile;
    if (updates.email) user.email = updates.email;
    this.save();
    return user;
  }

  // --- Categories CRUD ---
  public getCategories(): Category[] {
    return this.data.categories;
  }

  public getCategoryById(id: string): Category | undefined {
    return this.data.categories.find(c => c.id === id);
  }

  public createCategory(cat: Omit<Category, 'id' | 'created_at'>): Category {
    const newCat: Category = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...cat,
      created_at: new Date().toISOString()
    };
    this.data.categories.push(newCat);
    this.save();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const cat = this.getCategoryById(id);
    if (!cat) return null;
    Object.assign(cat, updates);
    this.save();
    return cat;
  }

  public deleteCategory(id: string): boolean {
    const index = this.data.categories.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.data.categories.splice(index, 1);
    this.save();
    return true;
  }

  // --- Services CRUD ---
  public getServices(onlyActive = false): Service[] {
    if (onlyActive) {
      return this.data.services.filter(s => s.status === 'active');
    }
    return this.data.services;
  }

  public getServiceById(id: string): Service | undefined {
    return this.data.services.find(s => s.id === id);
  }

  public createService(serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Service {
    const now = new Date().toISOString();
    const newService: Service = {
      id: `srv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...serviceData,
      created_at: now,
      updated_at: now
    };
    this.data.services.push(newService);
    this.save();
    return newService;
  }

  public updateService(id: string, updates: Partial<Service>): Service | null {
    const srv = this.getServiceById(id);
    if (!srv) return null;
    Object.assign(srv, updates, { updated_at: new Date().toISOString() });
    this.save();
    return srv;
  }

  public toggleServiceStatus(id: string): Service | null {
    const srv = this.getServiceById(id);
    if (!srv) return null;
    srv.status = srv.status === 'active' ? 'disabled' : 'active';
    srv.updated_at = new Date().toISOString();
    this.save();
    return srv;
  }

  public deleteService(id: string): boolean {
    const index = this.data.services.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.data.services.splice(index, 1);
    this.save();
    return true;
  }

  // --- Requests CRUD ---
  public getServiceRequests(): ServiceRequest[] {
    return this.data.service_requests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getRequestById(idOrRequestId: string): ServiceRequest | undefined {
    return this.data.service_requests.find(
      r => r.id === idOrRequestId || r.request_id.toUpperCase() === idOrRequestId.toUpperCase().trim()
    );
  }

  public getRequestsByUserId(userId: string): ServiceRequest[] {
    return this.data.service_requests
      .filter(r => r.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createServiceRequest(params: {
    user_id?: string;
    customer_name: string;
    customer_mobile: string;
    customer_email?: string;
    service_id: string;
    customer_message?: string;
    additional_details?: Record<string, any>;
  }): { request: ServiceRequest; service: Service } {
    const service = this.getServiceById(params.service_id);
    if (!service) {
      throw new Error('Selected service not found');
    }
    if (service.status === 'disabled') {
      throw new Error('This service is currently disabled by administrator');
    }

    const year = new Date().getFullYear();
    const count = this.data.service_requests.length + 1001;
    const request_id = `EM-${year}-${count}`;
    const now = new Date().toISOString();

    const request: ServiceRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      request_id,
      user_id: params.user_id,
      customer_name: params.customer_name,
      customer_mobile: params.customer_mobile,
      customer_email: params.customer_email,
      service_id: service.id,
      service_name: service.name,
      service_name_hi: service.name_hi,
      price_at_request: service.price, // PRESERVES PRICE AT MOMENT OF ORDER
      customer_message: params.customer_message,
      additional_details: params.additional_details || {},
      status: 'Pending',
      payment_status: 'Pending',
      created_at: now,
      updated_at: now,
      status_history: [
        {
          status: 'Pending',
          timestamp: now,
          note: 'Request successfully submitted by customer'
        }
      ]
    };

    this.data.service_requests.push(request);

    // Create Admin notification
    this.createNotification({
      recipient_type: 'admin',
      request_id: request.request_id,
      title: `New Request: ${service.name}`,
      title_hi: `नया आवेदन: ${service.name_hi}`,
      message: `${params.customer_name} (${params.customer_mobile}) submitted a request for ${service.name}.`,
      message_hi: `${params.customer_name} ने ${service.name_hi} के लिए नया आवेदन भेजा है।`
    });

    this.save();
    return { request, service };
  }

  public updateRequestStatus(
    requestId: string,
    newStatus: 'Pending' | 'Processing' | 'Completed' | 'Rejected',
    note?: string,
    adminName?: string,
    adminMessage?: string
  ): ServiceRequest | null {
    const req = this.getRequestById(requestId);
    if (!req) return null;

    const now = new Date().toISOString();
    req.status = newStatus;
    req.updated_at = now;
    if (adminMessage !== undefined) {
      req.admin_message = adminMessage;
    }

    req.status_history.push({
      status: newStatus,
      timestamp: now,
      note: note || `Status updated to ${newStatus}`,
      updated_by: adminName || 'Admin'
    });

    // Notify customer
    this.createNotification({
      recipient_type: 'customer',
      user_id: req.user_id,
      request_id: req.request_id,
      title: `Status Updated: ${newStatus}`,
      title_hi: `स्थिति अपडेट: ${newStatus === 'Processing' ? 'प्रक्रिया में' : newStatus === 'Completed' ? 'पूर्ण' : newStatus === 'Rejected' ? 'अस्वीकृत' : 'लंबित'}`,
      message: `Your request ${req.request_id} for ${req.service_name} is now ${newStatus}. ${note || ''}`,
      message_hi: `आपके अनुरोध ${req.request_id} की स्थिति बदलकर ${newStatus} कर दी गई है।`
    });

    this.save();
    return req;
  }

  public updateRequestPaymentStatus(
    requestId: string,
    newPaymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded',
    notes?: string
  ): ServiceRequest | null {
    const req = this.getRequestById(requestId);
    if (!req) return null;

    req.payment_status = newPaymentStatus;
    req.updated_at = new Date().toISOString();

    const payment = this.data.payments.find(p => p.request_id === req.request_id);
    if (payment) {
      payment.payment_status = newPaymentStatus;
      if (notes) payment.notes = notes;
      if (newPaymentStatus === 'Paid') {
        payment.verified_at = new Date().toISOString();
      }
    }

    this.save();
    return req;
  }

  // --- Documents CRUD ---
  public addDocument(doc: Omit<DocumentRecord, 'id' | 'uploaded_at'>): DocumentRecord {
    const newDoc: DocumentRecord = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...doc,
      uploaded_at: new Date().toISOString()
    };
    this.data.documents.push(newDoc);
    this.save();
    return newDoc;
  }

  public getDocumentsByRequestId(requestId: string): DocumentRecord[] {
    return this.data.documents.filter(d => d.request_id === requestId);
  }

  // --- Payments CRUD ---
  public getPayments(): PaymentRecord[] {
    return this.data.payments;
  }

  public getPaymentByRequestId(requestId: string): PaymentRecord | undefined {
    return this.data.payments.find(p => p.request_id === requestId);
  }

  public submitPaymentRecord(paymentData: {
    request_id: string;
    amount: number;
    upi_id: string;
    utr_number: string;
    payment_method?: string;
  }): PaymentRecord {
    const existing = this.getPaymentByRequestId(paymentData.request_id);
    const now = new Date().toISOString();

    if (existing) {
      existing.utr_number = paymentData.utr_number;
      existing.amount = paymentData.amount;
      existing.upi_id = paymentData.upi_id;
      existing.created_at = now;
      this.save();
      return existing;
    }

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      request_id: paymentData.request_id,
      amount: paymentData.amount,
      upi_id: paymentData.upi_id,
      utr_number: paymentData.utr_number,
      payment_method: paymentData.payment_method || 'UPI',
      payment_status: 'Pending',
      created_at: now
    };

    this.data.payments.push(newPayment);

    // Notify admin
    this.createNotification({
      recipient_type: 'admin',
      request_id: paymentData.request_id,
      title: `Payment UTR Submitted: ${paymentData.utr_number}`,
      title_hi: `भुगतान UTR दर्ज: ${paymentData.utr_number}`,
      message: `UTR ${paymentData.utr_number} submitted for request ${paymentData.request_id} (₹${paymentData.amount}). Verify now.`,
      message_hi: `अनुरोध ${paymentData.request_id} के लिए ₹${paymentData.amount} का UTR ${paymentData.utr_number} सबमिट किया गया है।`
    });

    this.save();
    return newPayment;
  }

  // --- Settings CRUD ---
  public getSettings(): Record<string, string> {
    return { ...this.data.settings };
  }

  public updateSettings(newSettings: Record<string, string>): Record<string, string> {
    this.data.settings = { ...this.data.settings, ...newSettings };
    this.save();
    return this.data.settings;
  }

  // --- Activity Logs ---
  public logAdminAction(admin: { id: string; name: string }, action: string, details: string, ip = '127.0.0.1'): AdminActivityLog {
    const log: AdminActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      admin_id: admin.id,
      admin_name: admin.name,
      action,
      details,
      ip_address: ip,
      created_at: new Date().toISOString()
    };
    this.data.admin_activity_logs.unshift(log);
    // Keep last 300 logs
    if (this.data.admin_activity_logs.length > 300) {
      this.data.admin_activity_logs.pop();
    }
    this.save();
    return log;
  }

  public getActivityLogs(limit = 100): AdminActivityLog[] {
    return this.data.admin_activity_logs.slice(0, limit);
  }

  // --- Notifications ---
  public createNotification(item: Omit<NotificationItem, 'id' | 'is_read' | 'created_at'>): NotificationItem {
    const notif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...item,
      is_read: false,
      created_at: new Date().toISOString()
    };
    this.data.notifications.unshift(notif);
    if (this.data.notifications.length > 200) {
      this.data.notifications.pop();
    }
    this.save();
    return notif;
  }

  public getNotifications(type: 'admin' | 'customer', userId?: string): NotificationItem[] {
    return this.data.notifications.filter(n => {
      if (type === 'admin') return n.recipient_type === 'admin';
      return n.recipient_type === 'customer' && (!userId || n.user_id === userId);
    });
  }

  public markNotificationRead(id: string): boolean {
    const n = this.data.notifications.find(item => item.id === id);
    if (n) {
      n.is_read = true;
      this.save();
      return true;
    }
    return false;
  }

  // --- Statistics helper ---
  public getDashboardStatistics() {
    const totalServices = this.data.services.length;
    const activeServices = this.data.services.filter(s => s.status === 'active').length;
    const disabledServices = totalServices - activeServices;

    const totalRequests = this.data.service_requests.length;
    const pendingRequests = this.data.service_requests.filter(r => r.status === 'Pending').length;
    const processingRequests = this.data.service_requests.filter(r => r.status === 'Processing').length;
    const completedRequests = this.data.service_requests.filter(r => r.status === 'Completed').length;
    const rejectedRequests = this.data.service_requests.filter(r => r.status === 'Rejected').length;

    // Calculate revenue from paid requests
    const totalRevenue = this.data.service_requests
      .filter(r => r.payment_status === 'Paid')
      .reduce((acc, curr) => acc + (curr.price_at_request || 0), 0);

    const pendingRevenue = this.data.service_requests
      .filter(r => r.payment_status === 'Pending')
      .reduce((acc, curr) => acc + (curr.price_at_request || 0), 0);

    return {
      totalServices,
      activeServices,
      disabledServices,
      totalRequests,
      pendingRequests,
      processingRequests,
      completedRequests,
      rejectedRequests,
      totalRevenue,
      pendingRevenue,
      recentRequests: this.getServiceRequests().slice(0, 8)
    };
  }
}

export const db = new RelationalDatabase();
