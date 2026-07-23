import { NextRequest, NextResponse } from "next/server";
import { leadsDB } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const status = searchParams.get("status") || "";
    const source = searchParams.get("source") || "";
    const dateFrom = searchParams.get("date_from") || "";
    const dateTo = searchParams.get("date_to") || "";

    let leads = leadsDB.getAll();

    // Filter by search query
    if (search) {
      leads = leads.filter(
        l =>
          l.full_name.toLowerCase().includes(search) ||
          l.email.toLowerCase().includes(search) ||
          l.phone.toLowerCase().includes(search) ||
          l.company_name.toLowerCase().includes(search)
      );
    }

    // Filter by status
    if (status) {
      leads = leads.filter(l => l.status === status);
    }

    // Filter by source
    if (source) {
      leads = leads.filter(l => l.source.toLowerCase() === source.toLowerCase());
    }

    // Filter by date range
    if (dateFrom) {
      const fromTime = new Date(dateFrom).getTime();
      leads = leads.filter(l => new Date(l.created_at).getTime() >= fromTime);
    }
    if (dateTo) {
      const toTime = new Date(dateTo).getTime();
      leads = leads.filter(l => new Date(l.created_at).getTime() <= toTime);
    }

    // Generate CSV
    const headers = [
      "ID",
      "Full Name",
      "Email",
      "Phone",
      "WhatsApp Number",
      "Company Name",
      "Location",
      "Service Interested",
      "Status",
      "Source",
      "Preferred Contact",
      "Created At",
      "Notes"
    ];

    const csvRows = [headers.join(",")];

    for (const lead of leads) {
      const row = [
        lead.id,
        `"${(lead.full_name || "").replace(/"/g, '""')}"`,
        `"${(lead.email || "").replace(/"/g, '""')}"`,
        `"${(lead.phone || "").replace(/"/g, '""')}"`,
        `"${(lead.whatsapp_number || "").replace(/"/g, '""')}"`,
        `"${(lead.company_name || "").replace(/"/g, '""')}"`,
        `"${(lead.location || "").replace(/"/g, '""')}"`,
        `"${(lead.service_interested || "").replace(/"/g, '""')}"`,
        lead.status,
        lead.source,
        `"${(lead.preferred_contact_method || "").replace(/"/g, '""')}"`,
        lead.created_at,
        `"${(lead.admin_notes || "").replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(","));
    }

    const csvContent = csvRows.join("\n");

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="leads_export_${new Date().toISOString().slice(0,10)}.csv"`,
      },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
