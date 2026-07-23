"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Globe, 
  FileText, 
  User, 
  Calendar, 
  Trash2, 
  Copy, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Sparkles,
  RefreshCw,
  X,
  Loader2
} from "lucide-react";
import { leadService } from "@/lib/leadService";
import SendEmailModal from "@/components/SendEmailModal";

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.leadId as string;

  const [lead, setLead] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [notes, setNotes] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [assignedTo, setAssignedTo] = React.useState("");
  const [technicalOpen, setTechnicalOpen] = React.useState(false);
  const [updating, setUpdating] = React.useState(false);
  const [copiedText, setCopiedText] = React.useState<string | null>(null);

  // Email & History states
  const [emails, setEmails] = React.useState<any[]>([]);
  const [loadingEmails, setLoadingEmails] = React.useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false);
  const [viewingEmail, setViewingEmail] = React.useState<any>(null);
  const [retryingEmailId, setRetryingEmailId] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchLeadDetails();
    fetchLeadEmails();
  }, [leadId]);

  const fetchLeadEmails = async () => {
    setLoadingEmails(true);
    try {
      const token = localStorage.getItem("admin_access_token") || localStorage.getItem("mock_admin_token") || "mock-admin-token";
      const res = await fetch(`/api/admin/leads/${leadId}/emails`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEmails(data.data);
      }
    } catch (err) {
      console.error("Error loading email logs:", err);
    } finally {
      setLoadingEmails(false);
    }
  };

  const handleRetryEmail = async (emailId: string) => {
    setRetryingEmailId(emailId);
    try {
      const token = localStorage.getItem("admin_access_token") || localStorage.getItem("mock_admin_token") || "mock-admin-token";
      const res = await fetch(`/api/admin/leads/${leadId}/emails/${emailId}/retry`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert("Email resent successfully!");
        fetchLeadEmails();
        fetchLeadDetails(); // refresh last contacted tracking
      } else {
        alert(data.error || "Failed to retry sending email.");
      }
    } catch (err) {
      alert("Network error occurred during retry.");
    } finally {
      setRetryingEmailId(null);
    }
  };

  const fetchLeadDetails = async () => {
    setLoading(true);
    try {
      const data = await leadService.getLeadById(leadId);
      setLead(data);
      setNotes(data.admin_notes || "");
      setStatus(data.status);
      setAssignedTo(data.assigned_to || "");
    } catch (err) {
      console.error(err);
      alert("Failed to load lead details.");
      router.push("/admin/leads");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await leadService.updateLead(leadId, {
        status,
        assigned_to: assignedTo,
        admin_notes: notes
      });
      alert("Lead updated successfully!");
      fetchLeadDetails();
    } catch (err: any) {
      alert(err.message || "Failed to update lead");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this lead?")) return;
    try {
      await leadService.deleteLead(leadId);
      router.push("/admin/leads");
    } catch (err: any) {
      alert(err.message || "Failed to delete lead");
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Convert keys like "diving_license" to "Diving License"
  const formatLabel = (key: string) => {
    return key
      .split(/[_-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!lead) return null;

  return (
    <div className="space-y-8">
      
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-cyan-400 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Leads
          </Link>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white">
            Lead Details
          </h1>
        </div>

        <button
          onClick={handleDelete}
          className="flex items-center gap-2 rounded-full bg-rose-500/10 border border-rose-500/20 px-5 py-3 text-[10px] font-black uppercase tracking-wider text-rose-400 hover:bg-rose-500/25 transition cursor-pointer"
        >
          <Trash2 className="h-4 w-4" /> Delete Lead
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* LEFT COLUMN: DETAILS & FORM VALUES (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* CONTACT CARD */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider border-b border-white/5 pb-2 text-cyan-300">
              Contact Details
            </h3>

            <div className="grid gap-6 sm:grid-cols-2">
              
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Full Name</span>
                <p className="text-sm font-black text-white">{lead.full_name || "N/A"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Company Name</span>
                <p className="text-sm font-black text-white">{lead.company_name || "N/A"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Email Address</span>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-black text-white">{lead.email || "N/A"}</p>
                  {lead.email && (
                    <button
                      onClick={() => handleCopy(lead.email, "email")}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 transition text-slate-400 hover:text-white"
                      title="Copy Email"
                    >
                      {copiedText === "email" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Phone Number</span>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-black text-white">{lead.phone || "N/A"}</p>
                  {lead.phone && (
                    <button
                      onClick={() => handleCopy(lead.phone, "phone")}
                      className="p-1 rounded bg-white/5 hover:bg-white/10 transition text-slate-400 hover:text-white"
                      title="Copy Phone"
                    >
                      {copiedText === "phone" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Location</span>
                <p className="text-sm font-black text-white flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-cyan-400" />
                  {lead.location || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Preferred Contact Method</span>
                <p className="text-sm font-black text-white">{lead.preferred_contact_method || "N/A"}</p>
              </div>

            </div>

            {/* DIRECT ACTION BUTTONS */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-white/5">
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 transition"
                >
                  <Phone className="h-3.5 w-3.5" /> Call Client
                </a>
              )}
              {lead.phone && (
                <a
                  href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 px-4 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-500/10 transition"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> WhatsApp Chat
                </a>
              )}
              {lead.email ? (
                <button
                  onClick={() => setIsEmailModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-300 px-4 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-cyan-500/10 transition cursor-pointer"
                >
                  <Mail className="h-3.5 w-3.5" /> Send Email
                </button>
              ) : (
                <button
                  disabled
                  className="flex items-center gap-1.5 rounded-full border border-slate-500/10 bg-slate-500/5 text-slate-500 px-4 py-2 text-[10px] font-bold uppercase tracking-wider cursor-not-allowed opacity-40"
                >
                  <Mail className="h-3.5 w-3.5" /> Send Email (No email)
                </button>
              )}
            </div>
          </div>

          {/* DYNAMIC FORM DATA VALUES */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider border-b border-white/5 pb-2 text-cyan-300">
              Form Data / dynamic Fields
            </h3>

            {Object.keys(lead.form_data || {}).length === 0 ? (
              <p className="text-xs text-slate-500 font-light">No additional form data submitted.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {Object.entries(lead.form_data).map(([key, value]) => (
                  <div key={key} className="p-3.5 rounded-xl border border-white/5 bg-[#0a2b40]/10 text-left">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 block">
                      {formatLabel(key)}
                    </span>
                    <span className="text-xs font-black text-white mt-1 block">
                      {typeof value === "boolean" ? (value ? "Checked / Yes" : "Unchecked / No") : String(value || "N/A")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ENQUIRY CARD */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider border-b border-white/5 pb-2 text-cyan-300">
              Enquiry content
            </h3>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Interested Service</span>
                  <p className="text-sm font-black text-white">{lead.service_interested || "N/A"}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Source</span>
                  <p className="text-sm font-black text-white capitalize">{lead.source || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Message</span>
                <div className="p-4 rounded-2xl border border-white/5 bg-[#03131d]/60 text-xs font-light text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {lead.message || "No message content."}
                </div>
              </div>

              {lead.page_url && (
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Submitted From Page</span>
                  <a
                    href={lead.page_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <Globe className="h-3 w-3" />
                    {lead.page_url}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* EMAIL HISTORY SECTION */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-cyan-300">
                Email History Logs
              </h3>
              <button
                onClick={fetchLeadEmails}
                disabled={loadingEmails}
                className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-white transition"
                title="Refresh Logs"
              >
                <RefreshCw className={`h-4 w-4 ${loadingEmails ? "animate-spin" : ""}`} />
              </button>
            </div>

            {loadingEmails && emails.length === 0 ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
              </div>
            ) : emails.length === 0 ? (
              <p className="text-xs text-slate-500 font-light">No emails sent yet for this lead.</p>
            ) : (
              <div className="space-y-3">
                {emails.map((email: any) => {
                  const getStatusBadge = (status: string) => {
                    if (status === "sent") return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
                    if (status === "failed") return "bg-rose-500/10 border-rose-500/20 text-rose-400";
                    return "bg-amber-500/10 border-amber-500/20 text-amber-400"; // pending
                  };

                  const getEmailTypeLabel = (type: string) => {
                    switch (type) {
                      case "admin_notification": return "Admin Alert";
                      case "lead_confirmation": return "Confirmation";
                      case "admin_reply": return "Manual Reply";
                      default: return type.replace("_", " ");
                    }
                  };

                  return (
                    <div key={email.id} className="p-4 rounded-2xl border border-white/5 bg-[#03131d]/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                            {getEmailTypeLabel(email.email_type)}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${getStatusBadge(email.status)}`}>
                            {email.status}
                          </span>
                          <span className="text-[10px] text-slate-500 font-light">
                            {new Date(email.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-white font-bold truncate">Subject: {email.subject}</p>
                        <p className="text-slate-400 font-light">To: {email.recipient} {email.sent_by ? `• Sent by ${email.sent_by}` : ""}</p>
                      </div>

                      <div className="flex gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => setViewingEmail(email)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold transition text-[10px] uppercase tracking-wider cursor-pointer"
                        >
                          View
                        </button>

                        {email.status === "failed" && (
                          <button
                            onClick={() => handleRetryEmail(email.id)}
                            disabled={retryingEmailId === email.id}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 font-bold transition text-[10px] uppercase tracking-wider disabled:opacity-40 cursor-pointer"
                          >
                            {retryingEmailId === email.id ? "Retrying..." : "Retry"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: LEAD MANAGEMENT PANEL (1/3) */}
        <div className="space-y-6">
          
          {/* CONTROL BOX */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider border-b border-white/5 pb-2 text-cyan-300">
              Lead Actions & Notes
            </h3>

            <div className="space-y-4">
              
              {/* STATUS CHANGE */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Lead Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-3.5 py-3 text-xs text-white outline-none focus:border-cyan-400"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                  <option value="closed">Closed</option>
                  <option value="spam">Spam</option>
                </select>
              </div>

              {/* STAFF ASSIGNMENT */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Assign Staff Member
                </label>
                <input
                  type="text"
                  placeholder="Staff member name..."
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-3.5 py-3 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              {/* ADMIN NOTES */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Admin Internal Notes
                </label>
                <textarea
                  placeholder="Add notes about conversations, quotes, next steps..."
                  rows={6}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-3.5 py-3 text-xs text-white outline-none focus:border-cyan-400 placeholder:text-white/20 font-light"
                />
              </div>

              <button
                onClick={handleUpdate}
                disabled={updating}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-[#03131d] hover:bg-cyan-300 transition cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                {updating ? "Saving Changes..." : "Save Manager Changes"}
              </button>

            </div>
          </div>

          {/* TECHNICAL COLLAPSIBLE SECTION */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <button
              onClick={() => setTechnicalOpen(!technicalOpen)}
              className="w-full flex items-center justify-between px-6 py-4 bg-white/[0.01] hover:bg-white/[0.03] transition"
            >
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Technical Details</span>
              {technicalOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
            </button>

            {technicalOpen && (
              <div className="px-6 py-4 border-t border-white/5 space-y-4 text-left text-xs text-slate-400 font-light">
                <div className="space-y-0.5">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 block">Lead ID</span>
                  <span className="font-mono text-[10px] text-white block break-all">{lead.id}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 block">IP Address</span>
                  <span className="font-mono text-[10px] text-white block">{lead.ip_address}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 block">User Agent</span>
                  <span className="text-[10px] text-white block break-all leading-normal">{lead.user_agent}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 block">Creation Time</span>
                  <span>{new Date(lead.created_at).toLocaleString()}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 block">Last Updated</span>
                  <span>{new Date(lead.updated_at).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* SEND EMAIL MODAL */}
      {lead && (
        <SendEmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          lead={lead}
          onSuccess={() => {
            alert("Email sent successfully!");
            fetchLeadEmails();
            fetchLeadDetails(); // refresh last contacted details
          }}
        />
      )}

      {/* VIEW EMAIL MESSAGE DETAIL MODAL */}
      {viewingEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setViewingEmail(null)} />
          <div className="relative z-10 w-full max-w-xl rounded-3xl border border-white/10 bg-[#041a27] text-white p-6 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center border-b border-white/10 pb-4 shrink-0">
              <h3 className="text-sm font-black uppercase tracking-wider text-cyan-300">
                Sent Message Detail
              </h3>
              <button onClick={() => setViewingEmail(null)} className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="py-4 space-y-4 overflow-y-auto flex-1 text-left text-xs">
              <div className="grid gap-2 grid-cols-2">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Recipient</span>
                  <span className="text-white font-semibold">{viewingEmail.recipient}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Sender</span>
                  <span className="text-white font-semibold">{viewingEmail.sent_by || "System Automated"}</span>
                </div>
                {viewingEmail.cc && (
                  <div className="col-span-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">CC</span>
                    <span className="text-white font-semibold">{viewingEmail.cc}</span>
                  </div>
                )}
                {viewingEmail.bcc && (
                  <div className="col-span-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">BCC</span>
                    <span className="text-white font-semibold">{viewingEmail.bcc}</span>
                  </div>
                )}
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Subject</span>
                <span className="text-white font-semibold">{viewingEmail.subject}</span>
              </div>
              <div className="border-t border-white/5 pt-3">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-2">Message Body</span>
                <div 
                  className="p-4 rounded-xl border border-white/5 bg-[#03131d]/60 font-sans text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap text-slate-300"
                  dangerouslySetInnerHTML={{ 
                    __html: viewingEmail.message.includes("<div") || viewingEmail.message.includes("<p") || viewingEmail.message.includes("<html")
                      ? viewingEmail.message 
                      : viewingEmail.message.replace(/\n/g, "<br/>") 
                  }}
                />
              </div>
              {viewingEmail.error_message && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-[10px]">
                  <strong>Internal Delivery Error:</strong><br/>
                  {viewingEmail.error_message}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
