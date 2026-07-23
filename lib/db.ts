import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const EMAILS_FILE = path.join(DATA_DIR, "emails.json");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");
const RESET_TOKENS_FILE = path.join(DATA_DIR, "reset_tokens.json");

export function hashPassword(password: string): string {
  const salt = "divehub_salt_123_abc";
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

// Ensure data directory and files exist
function initDB() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(LEADS_FILE)) {
    fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2), "utf8");
  }
  if (!fs.existsSync(EMAILS_FILE)) {
    fs.writeFileSync(EMAILS_FILE, JSON.stringify([], null, 2), "utf8");
  }
  if (!fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify([], null, 2), "utf8");
  }
  if (!fs.existsSync(RESET_TOKENS_FILE)) {
    fs.writeFileSync(RESET_TOKENS_FILE, JSON.stringify([], null, 2), "utf8");
  }
  if (!fs.existsSync(USERS_FILE)) {
    const defaultUsers = [
      {
        id: "usr_super_admin",
        username: "admin",
        email: "admin@example.com",
        name: "Super Admin",
        password_hash: hashPassword("Admin@123"),
        role: "super_admin",
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "usr_admin",
        username: "manager",
        email: "manager@example.com",
        name: "Admin User",
        password_hash: hashPassword("Manager@123"),
        role: "admin",
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "usr_staff",
        username: "staff",
        email: "staff@example.com",
        name: "Staff User",
        password_hash: hashPassword("Staff@123"),
        role: "staff",
        is_active: true,
        created_at: new Date().toISOString(),
      }
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2), "utf8");
  }
  if (!fs.existsSync(SETTINGS_FILE)) {
    const defaultSettings = {
      name: "default",
      is_active: true,
      settings: {
        title: "Get In Touch",
        subtitle: "Start your diving journey today. Send us a message and our team will get back to you shortly.",
        submit_text: "Send Message",
        success_message: "Thank you. We have received your query and will contact you shortly.",
        whatsapp_number: "916235107072",
        notification_email: "divehub@divehubmarineservices.com",
        redirect_url: "",
        privacy_consent_text: "I agree to the privacy policy and terms of service.",
        send_lead_confirmation_email: true,
        confirmation_email_subject: "Thank you for contacting us",
        confirmation_email_message: "We received your enquiry and will contact you shortly.",
        fields: [
          { key: "full_name", label: "Full Name", placeholder: "Your Name", type: "text", required: true, enabled: true, order: 1 },
          { key: "email", label: "Email Address", placeholder: "Email Address", type: "email", required: true, enabled: true, order: 2 },
          { key: "phone", label: "Phone Number", placeholder: "Phone Number", type: "text", required: true, enabled: true, order: 3 },
          { key: "service_interested", label: "Service Interested In", placeholder: "Select Service", type: "select", required: false, enabled: true, order: 4, options: ["Scuba Diving Courses", "Commercial Diver Training", "Industrial Marine Operations", "Other"] },
          { key: "message", label: "Your Message", placeholder: "Your Message", type: "textarea", required: true, enabled: true, order: 5 }
        ]
      },
      updated_at: new Date().toISOString(),
      updated_by: "system"
    };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2), "utf8");
  }
}

// Interfaces
export interface FormField {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "email" | "textarea" | "select" | "checkbox";
  required: boolean;
  enabled: boolean;
  order: number;
  options?: string[]; // for select dropdowns
  is_custom?: boolean;
}

export interface LeadFormSettingsData {
  title: string;
  subtitle: string;
  submit_text: string;
  success_message: string;
  whatsapp_number: string;
  notification_email: string;
  redirect_url?: string;
  privacy_consent_text?: string;
  send_lead_confirmation_email?: boolean;
  confirmation_email_subject?: string;
  confirmation_email_message?: string;
  fields: FormField[];
}

export interface LeadFormSetting {
  name: string;
  is_active: boolean;
  settings: LeadFormSettingsData;
  created_at?: string;
  updated_at: string;
  updated_by?: string;
}

export interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  whatsapp_number: string;
  company_name: string;
  location: string;
  service_interested: string;
  message: string;
  preferred_contact_method: string;
  form_data: Record<string, any>;
  status: "new" | "contacted" | "qualified" | "converted" | "closed" | "spam";
  source: string;
  page_url: string;
  ip_address: string;
  user_agent: string;
  admin_notes: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
  last_contacted_at?: string | null;
  last_contacted_by?: string | null;
}

export interface LeadEmail {
  id: string;
  lead_id: string;
  sent_by?: string | null; // User name or ID
  email_type: string; // e.g. "admin_notification", "lead_confirmation", "admin_reply"
  recipient: string;
  cc: string;
  bcc: string;
  subject: string;
  message: string;
  status: "pending" | "sent" | "failed";
  error_message: string;
  sent_at?: string | null;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  password_hash: string;
  role: "super_admin" | "admin" | "staff";
  is_active: boolean;
  created_at: string;
  last_login_at?: string;
  last_login_ip?: string;
}

export interface Session {
  token: string;
  refresh_token: string;
  user_id: string;
  expires_at: string;
  refresh_expires_at: string;
  created_at: string;
}

export interface ResetToken {
  token: string;
  email: string;
  expires_at: string;
  used: boolean;
}

// Safe read helper
function safeRead(filePath: string): any {
  initDB();
  const content = fs.readFileSync(filePath, "utf8");
  return JSON.parse(content);
}

// Safe write helper
function safeWrite(filePath: string, data: any) {
  initDB();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

// Settings DB queries
export const settingsDB = {
  get: (): LeadFormSetting => {
    return safeRead(SETTINGS_FILE);
  },
  save: (settings: LeadFormSettingsData, is_active: boolean = true, updated_by: string = "admin"): LeadFormSetting => {
    const existing = settingsDB.get();
    const updated: LeadFormSetting = {
      name: "default",
      is_active,
      settings,
      created_at: existing.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updated_by
    };
    safeWrite(SETTINGS_FILE, updated);
    return updated;
  },
  resetToDefault: (): LeadFormSetting => {
    if (fs.existsSync(SETTINGS_FILE)) {
      fs.unlinkSync(SETTINGS_FILE);
    }
    initDB();
    return settingsDB.get();
  }
};

// Leads DB queries
export const leadsDB = {
  getAll: (): Lead[] => {
    return safeRead(LEADS_FILE);
  },
  getById: (id: string): Lead | undefined => {
    const leads = leadsDB.getAll();
    return leads.find(l => l.id === id);
  },
  create: (leadData: Partial<Lead>): Lead => {
    const leads = leadsDB.getAll();
    const newLead: Lead = {
      id: "lead_" + Math.random().toString(36).substr(2, 9),
      full_name: leadData.full_name || "",
      email: leadData.email || "",
      phone: leadData.phone || "",
      whatsapp_number: leadData.whatsapp_number || "",
      company_name: leadData.company_name || "",
      location: leadData.location || "",
      service_interested: leadData.service_interested || "",
      message: leadData.message || "",
      preferred_contact_method: leadData.preferred_contact_method || "",
      form_data: leadData.form_data || {},
      status: "new",
      source: leadData.source || "website",
      page_url: leadData.page_url || "",
      ip_address: leadData.ip_address || "127.0.0.1",
      user_agent: leadData.user_agent || "",
      admin_notes: "",
      assigned_to: leadData.assigned_to || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_contacted_at: null,
      last_contacted_by: null,
    };
    leads.push(newLead);
    safeWrite(LEADS_FILE, leads);
    return newLead;
  },
  update: (id: string, updates: Partial<Lead>): Lead | undefined => {
    const leads = leadsDB.getAll();
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) return undefined;
    
    const updated = {
      ...leads[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    leads[index] = updated;
    safeWrite(LEADS_FILE, leads);
    return updated;
  },
  delete: (id: string): boolean => {
    const leads = leadsDB.getAll();
    const filtered = leads.filter(l => l.id !== id);
    if (filtered.length === leads.length) return false;
    safeWrite(LEADS_FILE, filtered);
    return true;
  }
};

// Emails DB queries
export const emailsDB = {
  getAll: (): LeadEmail[] => {
    return safeRead(EMAILS_FILE);
  },
  getByLeadId: (leadId: string): LeadEmail[] => {
    const emails = emailsDB.getAll();
    return emails
      .filter(e => e.lead_id === leadId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  getById: (id: string): LeadEmail | undefined => {
    const emails = emailsDB.getAll();
    return emails.find(e => e.id === id);
  },
  create: (emailData: Partial<LeadEmail> & { lead_id: string; recipient: string; subject: string; message: string; email_type: string }): LeadEmail => {
    const emails = emailsDB.getAll();
    const newEmail: LeadEmail = {
      id: "email_" + Math.random().toString(36).substr(2, 9),
      lead_id: emailData.lead_id,
      sent_by: emailData.sent_by || null,
      email_type: emailData.email_type,
      recipient: emailData.recipient,
      cc: emailData.cc || "",
      bcc: emailData.bcc || "",
      subject: emailData.subject,
      message: emailData.message,
      status: emailData.status || "pending",
      error_message: emailData.error_message || "",
      sent_at: emailData.sent_at || null,
      created_at: new Date().toISOString(),
    };
    emails.push(newEmail);
    safeWrite(EMAILS_FILE, emails);
    return newEmail;
  },
  update: (id: string, updates: Partial<LeadEmail>): LeadEmail | undefined => {
    const emails = emailsDB.getAll();
    const index = emails.findIndex(e => e.id === id);
    if (index === -1) return undefined;
    const updated = {
      ...emails[index],
      ...updates
    };
    emails[index] = updated;
    safeWrite(EMAILS_FILE, emails);
    return updated;
  }
};

// Users DB queries
export const usersDB = {
  getAll: (): User[] => {
    return safeRead(USERS_FILE);
  },
  getById: (id: string): User | undefined => {
    const users = usersDB.getAll();
    return users.find(u => u.id === id);
  },
  getByEmail: (email: string): User | undefined => {
    const users = usersDB.getAll();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === email.toLowerCase());
  },
  update: (id: string, updates: Partial<User>): User | undefined => {
    const users = usersDB.getAll();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    const updated = {
      ...users[index],
      ...updates
    };
    users[index] = updated;
    safeWrite(USERS_FILE, users);
    return updated;
  }
};

// Sessions DB queries
export const sessionsDB = {
  getAll: (): Session[] => {
    return safeRead(SESSIONS_FILE);
  },
  getByToken: (token: string): Session | undefined => {
    const sessions = sessionsDB.getAll();
    return sessions.find(s => s.token === token);
  },
  getByRefreshToken: (refreshToken: string): Session | undefined => {
    const sessions = sessionsDB.getAll();
    return sessions.find(s => s.refresh_token === refreshToken);
  },
  create: (userId: string): Session => {
    const sessions = sessionsDB.getAll();
    // Invalidate old sessions for this user to be clean
    const filtered = sessions.filter(s => s.user_id !== userId);
    
    const newSession: Session = {
      token: "act_" + crypto.randomBytes(32).toString("hex"),
      refresh_token: "ref_" + crypto.randomBytes(32).toString("hex"),
      user_id: userId,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour access
      refresh_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days refresh
      created_at: new Date().toISOString()
    };
    
    filtered.push(newSession);
    safeWrite(SESSIONS_FILE, filtered);
    return newSession;
  },
  deleteByToken: (token: string): boolean => {
    const sessions = sessionsDB.getAll();
    const filtered = sessions.filter(s => s.token !== token);
    if (filtered.length === sessions.length) return false;
    safeWrite(SESSIONS_FILE, filtered);
    return true;
  },
  cleanup: () => {
    const sessions = sessionsDB.getAll();
    const now = new Date().getTime();
    const filtered = sessions.filter(s => new Date(s.refresh_expires_at).getTime() > now);
    safeWrite(SESSIONS_FILE, filtered);
  }
};

// Reset Tokens DB queries
export const resetTokensDB = {
  getAll: (): ResetToken[] => {
    return safeRead(RESET_TOKENS_FILE);
  },
  create: (email: string): ResetToken => {
    const tokens = resetTokensDB.getAll();
    // Invalidate previous tokens for this email
    const filtered = tokens.filter(t => t.email.toLowerCase() !== email.toLowerCase());
    
    const newToken: ResetToken = {
      token: "rst_" + crypto.randomBytes(24).toString("hex"),
      email: email,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 mins expiry
      used: false
    };
    filtered.push(newToken);
    safeWrite(RESET_TOKENS_FILE, filtered);
    return newToken;
  },
  getByToken: (token: string): ResetToken | undefined => {
    const tokens = resetTokensDB.getAll();
    return tokens.find(t => t.token === token);
  },
  use: (token: string): boolean => {
    const tokens = resetTokensDB.getAll();
    const index = tokens.findIndex(t => t.token === token);
    if (index === -1) return false;
    tokens[index].used = true;
    safeWrite(RESET_TOKENS_FILE, tokens);
    return true;
  }
};

