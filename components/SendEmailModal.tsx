"use client";

import React, { useState, useEffect } from "react";
import { X, Mail, Loader2, Sparkles } from "lucide-react";

// Predefined templates structure
const TEMPLATES = [
  {
    id: "general",
    name: "General Reply",
    subject: "Regarding your enquiry at Dive Hub",
    body: `Hello {{first_name}},

Thank you for reaching out. We received your request regarding {{service_interested}} and wanted to follow up.

[Type your custom reply here]

Regards,
{{admin_name}}
Dive Hub Marine`
  },
  {
    id: "more_info",
    name: "Request More Information",
    subject: "Additional details requested - Dive Hub Marine",
    body: `Hello {{first_name}},

Thank you for your enquiry.

To help us provide the best assistance regarding {{service_interested}}, could you please share a few more details about your specific requirements and availability?

Regards,
{{admin_name}}
Dive Hub Marine`
  },
  {
    id: "course_details",
    name: "Course Details",
    subject: "Scuba Diving Course Details - Dive Hub",
    body: `Hello {{first_name}},

Thank you for your interest in our Scuba Diving courses.

We offer various training courses from recreational open water to professional commercial levels. Regarding {{service_interested}}, here are the standard details:
- Course: {{service_interested}}
- Duration: [Specify Duration]
- Schedule: [Specify Schedule]
- Next batch starts: [Specify Date]

Let us know if you'd like to book a slot or schedule a call.

Regards,
{{admin_name}}
Dive Hub Marine`
  },
  {
    id: "pricing",
    name: "Pricing Details",
    subject: "Pricing Packages - Dive Hub Marine",
    body: `Hello {{first_name}},

Regarding your enquiry for {{service_interested}}, here are our current pricing packages:

- Package A (Basic): [Details & Price]
- Package B (Premium): [Details & Price]

All rates are inclusive of gear, training materials, and certification fees.

Feel free to ask if you have any questions.

Regards,
{{admin_name}}
Dive Hub Marine`
  },
  {
    id: "follow_up",
    name: "Follow-up",
    subject: "Following up on your enquiry - Dive Hub Marine",
    body: `Hello {{first_name}},

I am just following up on our previous conversation regarding {{service_interested}}.

Let us know if you've had a chance to review the details or if you have any further questions we can answer.

Regards,
{{admin_name}}
Dive Hub Marine`
  },
  {
    id: "appointment",
    name: "Appointment Confirmation",
    subject: "Appointment Confirmed - Dive Hub Marine",
    body: `Hello {{first_name}},

This is to confirm your appointment scheduled on [Date & Time] regarding {{service_interested}}.

Location: Dive Hub Marine Services Headquarters
Address: [Headquarters Address]

If you need to reschedule, please let us know at least 24 hours in advance.

Regards,
{{admin_name}}
Dive Hub Marine`
  },
  {
    id: "thank_you",
    name: "Thank You",
    subject: "Thank you for contacting Dive Hub Marine Services",
    body: `Hello {{first_name}},

Thank you for choosing Dive Hub Marine Services for {{service_interested}}.

We appreciate your interest in our marine services. Our team is working on your request and will follow up shortly.

Regards,
{{admin_name}}
Dive Hub Marine`
  },
  {
    id: "custom",
    name: "Custom Message",
    subject: "",
    body: ""
  }
];

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    service_interested: string;
    company_name: string;
  };
  onSuccess: () => void;
}

export default function SendEmailModal({
  isOpen,
  onClose,
  lead,
  onSuccess
}: SendEmailModalProps) {
  const [adminName, setAdminName] = useState("Admin Team");
  const [selectedTemplate, setSelectedTemplate] = useState("general");
  
  // Form fields
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load current admin details
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await fetch("/api/auth/admin/me");
        if (res.ok) {
          const json = await res.json();
          setAdminName(json.data.name || json.data.email);
        }
      } catch (err) {
        // ignore
      }
    };
    fetchAdmin();
  }, []);

  // Initialize form with defaults on open or lead change
  useEffect(() => {
    if (lead) {
      setTo(lead.email || "");
      setCc("");
      setBcc("");
      setSelectedTemplate("general");
      applyTemplate("general");
    }
  }, [lead]);

  // Client-side template placeholder replacement helper
  const applyTemplate = (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    const firstName = lead.full_name ? lead.full_name.split(" ")[0] : "";
    const placeholders: Record<string, string> = {
      full_name: lead.full_name || "",
      first_name: firstName,
      email: lead.email || "",
      phone: lead.phone || "",
      service_interested: lead.service_interested || "our services",
      company_name: lead.company_name || "",
      lead_id: lead.id || "",
      admin_name: adminName
    };

    let compiledSubject = template.subject;
    let compiledBody = template.body;

    Object.entries(placeholders).forEach(([key, val]) => {
      compiledSubject = compiledSubject.replaceAll(`{{${key}}}`, val);
      compiledBody = compiledBody.replaceAll(`{{${key}}}`, val);
    });

    setSubject(compiledSubject);
    setMessage(compiledBody);
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);
    applyTemplate(templateId);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!to) errs.to = "Recipient email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) errs.to = "Please enter a valid email address.";
    
    if (!subject) errs.subject = "Subject is required.";
    if (!message) errs.message = "Message body is required.";
    
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");
    setValidationErrors({});

    try {
      const token = localStorage.getItem("admin_access_token") || localStorage.getItem("mock_admin_token") || "mock-admin-token";
      const res = await fetch(`/api/admin/leads/${lead.id}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          to,
          cc,
          bcc,
          subject,
          message
        })
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.fields) {
          setValidationErrors(data.fields);
        } else {
          setError(data.error || "Failed to send email. Check SMTP server configuration.");
        }
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError("An unexpected network error occurred while sending.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-white/10 bg-[#041a27] text-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-300">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-cyan-400 block">Lead Communications</span>
              <span className="text-sm font-black uppercase tracking-wider block">Send Email Response</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-left">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Template Selector */}
            <div className="sm:col-span-3 space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                Select Email Template
              </label>
              <select
                value={selectedTemplate}
                onChange={handleTemplateChange}
                className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-4 py-3.5 text-xs text-white outline-none focus:border-cyan-400 appearance-none"
              >
                {TEMPLATES.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Recipient */}
            <div className="sm:col-span-3 space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-0.5">To (Recipient)</label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="customer@example.com"
                className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-4 py-3 text-xs text-white outline-none focus:border-cyan-400"
              />
              {validationErrors.to && (
                <span className="text-[10px] text-rose-400 font-semibold">{validationErrors.to}</span>
              )}
            </div>

            {/* CC */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-0.5">CC (Carbon Copy)</label>
              <input
                type="text"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="manager@example.com, finance@example.com"
                className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-4 py-3 text-xs text-white outline-none focus:border-cyan-400"
              />
              {validationErrors.cc && (
                <span className="text-[10px] text-rose-400 font-semibold">{validationErrors.cc}</span>
              )}
            </div>

            {/* BCC */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-0.5">BCC (Blind Copy)</label>
              <input
                type="text"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                placeholder="archive@example.com"
                className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-4 py-3 text-xs text-white outline-none focus:border-cyan-400"
              />
              {validationErrors.bcc && (
                <span className="text-[10px] text-rose-400 font-semibold">{validationErrors.bcc}</span>
              )}
            </div>

            {/* Subject */}
            <div className="sm:col-span-3 space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-0.5">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
                className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-4 py-3 text-xs text-white outline-none focus:border-cyan-400"
              />
              {validationErrors.subject && (
                <span className="text-[10px] text-rose-400 font-semibold">{validationErrors.subject}</span>
              )}
            </div>

            {/* Message Body */}
            <div className="sm:col-span-3 space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-0.5">Message Body</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                placeholder="Type your message details..."
                className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-4 py-3 text-xs text-white outline-none focus:border-cyan-400 font-sans"
              />
              {validationErrors.message && (
                <span className="text-[10px] text-rose-400 font-semibold">{validationErrors.message}</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 px-6 py-5 border-t border-white/10 bg-black/20 shrink-0">
          <button
            onClick={onClose}
            type="button"
            className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-[10px] font-black uppercase tracking-wider hover:bg-white/10 transition cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSend}
            disabled={loading}
            className="flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-[10px] font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-300 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Email"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
