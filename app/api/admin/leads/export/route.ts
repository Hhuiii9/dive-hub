import { NextRequest, NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import LeadModel from "@/lib/models/Lead";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const isAuth = await isAdminAuthenticated(request);
  if (!isAuth) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    await connectDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "";
    const source = searchParams.get("source") || "";
    const dateFrom = searchParams.get("date_from") || "";
    const dateTo = searchParams.get("date_to") || "";

    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
      ];
    }

    if (status) filter.status = status;
    if (source) filter.source = { $regex: `^${source}$`, $options: "i" };
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const leads = await LeadModel.find(filter).sort({ createdAt: -1 });

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
      "Notes",
    ];

    const csvRows = [headers.join(",")];

    for (const lead of leads) {
      const row = [
        String(lead._id),
        `"${(lead.fullName || "").replace(/"/g, '""')}"`,
        `"${(lead.email || "").replace(/"/g, '""')}"`,
        `"${(lead.phone || "").replace(/"/g, '""')}"`,
        `"${(lead.whatsappNumber || "").replace(/"/g, '""')}"`,
        `"${(lead.companyName || "").replace(/"/g, '""')}"`,
        `"${(lead.location || "").replace(/"/g, '""')}"`,
        `"${(lead.serviceInterested || "").replace(/"/g, '""')}"`,
        lead.status || "new",
        lead.source || "website",
        `"${(lead.preferredContactMethod || "").replace(/"/g, '""')}"`,
        lead.createdAt ? lead.createdAt.toISOString() : "",
        `"${(lead.adminNotes || "").replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(","));
    }

    const csvContent = csvRows.join("\n");

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="leads_export_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("[Admin Export Leads API] Error:", error);
    return new Response(JSON.stringify({ error: "Failed to export leads" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
