"use client";

import React from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  Trash2,
  Calendar,
  Inbox,
  UserCheck,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  ArrowUpDown,
  Mail
} from "lucide-react";
import { leadService } from "@/lib/leadService";
import SendEmailModal from "@/components/SendEmailModal";

export default function LeadsListPage() {
  const [leads, setLeads] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState<any>({
    total: 0,
    newCount: 0,
    contactedCount: 0,
    qualifiedCount: 0,
    convertedCount: 0,
    closedCount: 0,
    spamCount: 0
  });
  const [pagination, setPagination] = React.useState<any>({
    total: 0,
    page: 1,
    page_size: 20,
    total_pages: 1
  });
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Email & Toast states
  const [emailLead, setEmailLead] = React.useState<any>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false);
  const [toast, setToast] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Filters & Search
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [source, setSource] = React.useState("");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [ordering, setOrdering] = React.useState("-created_at");
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    fetchLeads();
  }, [page, status, source, dateFrom, dateTo, ordering]);

  const fetchLeads = async () => {
    setRefreshing(true);
    try {
      const data = await leadService.getLeads({
        page,
        page_size: 20,
        search,
        status,
        source,
        date_from: dateFrom,
        date_to: dateTo,
        ordering
      });
      setLeads(data.leads);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatus("");
    setSource("");
    setDateFrom("");
    setDateTo("");
    setOrdering("-created_at");
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this lead?")) return;
    try {
      await leadService.deleteLead(id);
      fetchLeads();
    } catch (err: any) {
      alert(err.message || "Failed to delete lead");
    }
  };

  const getStatusBadge = (statusStr: string) => {
    const styles: Record<string, string> = {
      new: "bg-cyan-500/10 border-cyan-400/20 text-cyan-400",
      contacted: "bg-blue-500/10 border-blue-400/20 text-blue-400",
      qualified: "bg-indigo-500/10 border-indigo-400/20 text-indigo-400",
      converted: "bg-emerald-500/10 border-emerald-400/20 text-emerald-400",
      closed: "bg-slate-500/10 border-slate-400/20 text-slate-400",
      spam: "bg-rose-500/10 border-rose-400/20 text-rose-400"
    };

    return (
      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${styles[statusStr] || styles.new}`}>
        {statusStr}
      </span>
    );
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-8">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl border backdrop-blur-md shadow-2xl flex items-center gap-3 transition-all duration-300 ${toast.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-wider">{toast.message}</span>
        </div>
      )}
      
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
            Overview
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white mt-1 flex items-center gap-3">
            Lead Management
            {refreshing && (
              <RefreshCw className="h-5 w-5 text-cyan-400 animate-spin" />
            )}
          </h1>
        </div>

        <div className="flex gap-3">
          <a
            href={leadService.exportLeadsUrl({ search, status, source, date_from: dateFrom, date_to: dateTo })}
            download
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-[10px] font-black uppercase tracking-wider hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </a>

          <button
            onClick={fetchLeads}
            className="flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-[10px] font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-300 transition-all cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* STATS SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
        
        {/* TOTAL */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex flex-col justify-between shadow-lg">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Total Leads</span>
          <span className="text-2xl font-black text-white mt-2">{stats.total}</span>
        </div>

        {/* NEW */}
        <div className="rounded-2xl border border-cyan-500/10 bg-cyan-500/[0.02] p-4 flex flex-col justify-between shadow-lg">
          <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">New</span>
          <span className="text-2xl font-black text-cyan-400 mt-2">{stats.newCount}</span>
        </div>

        {/* CONTACTED */}
        <div className="rounded-2xl border border-blue-500/10 bg-blue-500/[0.02] p-4 flex flex-col justify-between shadow-lg">
          <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Contacted</span>
          <span className="text-2xl font-black text-blue-400 mt-2">{stats.contactedCount}</span>
        </div>

        {/* QUALIFIED */}
        <div className="rounded-2xl border border-indigo-500/10 bg-indigo-500/[0.02] p-4 flex flex-col justify-between shadow-lg">
          <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Qualified</span>
          <span className="text-2xl font-black text-indigo-400 mt-2">{stats.qualifiedCount}</span>
        </div>

        {/* CONVERTED */}
        <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.02] p-4 flex flex-col justify-between shadow-lg">
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Converted</span>
          <span className="text-2xl font-black text-emerald-400 mt-2">{stats.convertedCount}</span>
        </div>

        {/* CLOSED */}
        <div className="rounded-2xl border border-slate-500/10 bg-slate-500/[0.02] p-4 flex flex-col justify-between shadow-lg">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Closed</span>
          <span className="text-2xl font-black text-slate-300 mt-2">{stats.closedCount}</span>
        </div>

      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
        
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, email, phone, company, or messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-white/10 bg-[#03131d]/60 pl-11 pr-4 py-3.5 text-xs text-white outline-none focus:border-cyan-400 placeholder:text-white/30"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-cyan-400 px-6 py-3.5 text-[10px] font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-300 transition-all cursor-pointer shrink-0"
          >
            Search
          </button>
        </form>

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-6 items-end pt-2 border-t border-white/5">
          
          {/* STATUS */}
          <div className="space-y-1 text-left">
            <label className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-3 py-2 text-xs text-white/70 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="closed">Closed</option>
              <option value="spam">Spam</option>
            </select>
          </div>

          {/* SOURCE */}
          <div className="space-y-1 text-left">
            <label className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-3 py-2 text-xs text-white/70 outline-none"
            >
              <option value="">All Sources</option>
              <option value="website">Website Form</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="direct">Direct Enquiry</option>
            </select>
          </div>

          {/* DATE FROM */}
          <div className="space-y-1 text-left">
            <label className="text-[8px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-3 py-2 text-xs text-white/70 outline-none"
            />
          </div>

          {/* DATE TO */}
          <div className="space-y-1 text-left">
            <label className="text-[8px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-3 py-2 text-xs text-white/70 outline-none"
            />
          </div>

          {/* SORTING */}
          <div className="space-y-1 text-left">
            <label className="text-[8px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <ArrowUpDown className="h-3 w-3" /> Sorting
            </label>
            <select
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-3 py-2 text-xs text-white/70 outline-none"
            >
              <option value="-created_at">Date: Newest First</option>
              <option value="created_at">Date: Oldest First</option>
              <option value="full_name">Name: A - Z</option>
              <option value="-full_name">Name: Z - A</option>
              <option value="status">Status Order</option>
            </select>
          </div>

          {/* CLEAR */}
          <div>
            <button
              onClick={handleResetFilters}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-[9px] font-black uppercase tracking-wider hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
            >
              Clear Filters
            </button>
          </div>

        </div>

      </div>

      {/* LEADS LISTING CONTAINER */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-32 flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-cyan-400 animate-pulse"></div>
          </div>
        ) : leads.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-slate-500 mx-auto">
              <Inbox className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-slate-300">No Leads Found</p>
              <p className="text-xs text-slate-500 font-light mt-1">
                There are no leads matching your selected criteria.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE VIEW */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="px-6 py-4 font-black uppercase tracking-wider text-slate-400">Lead Info</th>
                    <th className="px-6 py-4 font-black uppercase tracking-wider text-slate-400">Contact details</th>
                    <th className="px-6 py-4 font-black uppercase tracking-wider text-slate-400">Service</th>
                    <th className="px-6 py-4 font-black uppercase tracking-wider text-slate-400">Status</th>
                    <th className="px-6 py-4 font-black uppercase tracking-wider text-slate-400">Source</th>
                    <th className="px-6 py-4 font-black uppercase tracking-wider text-slate-400">Submitted</th>
                    <th className="px-6 py-4 font-black uppercase tracking-wider text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-white/[0.01] transition duration-200">
                      <td className="px-6 py-4 font-bold text-white">
                        <div>
                          <p className="text-sm font-black text-white">{lead.full_name || "N/A"}</p>
                          {lead.company_name && (
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">{lead.company_name}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 space-y-0.5 text-slate-300 font-medium">
                        <p className="truncate max-w-[180px]">{lead.email || "No Email"}</p>
                        <p>{lead.phone || "No Phone"}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-300">
                        {lead.service_interested || "Not Specified"}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(lead.status)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-white/5 px-2 py-0.5 rounded-md">
                          {lead.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-light">
                        {formatDate(lead.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          {lead.email ? (
                            <button
                              onClick={() => {
                                setEmailLead(lead);
                                setIsEmailModalOpen(true);
                              }}
                              className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 hover:bg-cyan-500/25 transition cursor-pointer animate-pulse-once"
                              title="Send Email"
                            >
                              <Mail className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              disabled
                              className="p-2 rounded-lg bg-slate-500/5 border border-slate-500/10 text-slate-500 cursor-not-allowed opacity-40"
                              title="No Email Address"
                            >
                              <Mail className="h-4 w-4" />
                            </button>
                          )}
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 hover:bg-cyan-500/25 transition"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="p-2 rounded-lg bg-rose-500/10 border border-rose-400/20 text-rose-400 hover:bg-rose-500/25 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS VIEW */}
            <div className="md:hidden divide-y divide-white/5">
              {leads.map((lead) => (
                <div key={lead.id} className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-black text-white">{lead.full_name || "N/A"}</h4>
                      {lead.company_name && (
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5">
                          {lead.company_name}
                        </span>
                      )}
                    </div>
                    {getStatusBadge(lead.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-light">
                    <div>
                      <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 block">Email</span>
                      <span className="truncate block">{lead.email || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 block">Phone</span>
                      <span>{lead.phone || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 block">Service</span>
                      <span className="font-bold text-white block">{lead.service_interested || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 block">Submitted</span>
                      <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-white/5 pt-3">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 bg-white/5 px-2 py-0.5 rounded-md">
                      Source: {lead.source}
                    </span>

                    <div className="flex gap-2">
                      {lead.email ? (
                        <button
                          onClick={() => {
                            setEmailLead(lead);
                            setIsEmailModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-[10px] font-bold uppercase tracking-wider hover:bg-cyan-500/25 transition cursor-pointer"
                        >
                          <Mail className="h-3.5 w-3.5" /> Email
                        </button>
                      ) : null}
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-[10px] font-bold uppercase tracking-wider hover:bg-cyan-500/25 transition"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </Link>
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-400/20 text-rose-400 text-[10px] font-bold uppercase tracking-wider hover:bg-rose-500/25 transition cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* PAGINATION CONTROLS */}
      {pagination.total_pages > 1 && (
        <div className="flex justify-between items-center bg-white/[0.01] border border-white/10 rounded-full px-6 py-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Showing Page {pagination.page} of {pagination.total_pages} ({pagination.total} leads)
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-wider hover:bg-white/5 disabled:opacity-30 cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
              disabled={page === pagination.total_pages}
              className="px-4 py-2 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-wider hover:bg-white/5 disabled:opacity-30 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {emailLead && (
        <SendEmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          lead={emailLead}
          onSuccess={() => {
            showToast("success", "Email sent successfully!");
            fetchLeads();
          }}
        />
      )}
    </div>
  );
}
