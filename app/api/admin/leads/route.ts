import { NextRequest, NextResponse } from "next/server";
import { leadsDB, Lead } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("page_size") || "20");
    const search = searchParams.get("search")?.toLowerCase() || "";
    const status = searchParams.get("status") || "";
    const source = searchParams.get("source") || "";
    const assignedTo = searchParams.get("assigned_to") || "";
    const dateFrom = searchParams.get("date_from") || "";
    const dateTo = searchParams.get("date_to") || "";
    const ordering = searchParams.get("ordering") || "-created_at";

    let leads = leadsDB.getAll();

    // Calculate Summary Stats BEFORE filtering
    const stats = {
      total: leads.length,
      newCount: leads.filter(l => l.status === "new").length,
      contactedCount: leads.filter(l => l.status === "contacted").length,
      qualifiedCount: leads.filter(l => l.status === "qualified").length,
      convertedCount: leads.filter(l => l.status === "converted").length,
      closedCount: leads.filter(l => l.status === "closed").length,
      spamCount: leads.filter(l => l.status === "spam").length,
    };

    // Filter by search query
    if (search) {
      leads = leads.filter(
        l =>
          l.full_name.toLowerCase().includes(search) ||
          l.email.toLowerCase().includes(search) ||
          l.phone.toLowerCase().includes(search) ||
          l.company_name.toLowerCase().includes(search) ||
          l.message.toLowerCase().includes(search)
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

    // Filter by assigned staff
    if (assignedTo) {
      leads = leads.filter(l => l.assigned_to === assignedTo);
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

    // Sort/ordering
    leads.sort((a, b) => {
      let isDesc = ordering.startsWith("-");
      let key = isDesc ? ordering.substring(1) : ordering;

      let valA = (a as any)[key] || "";
      let valB = (b as any)[key] || "";

      if (key === "created_at" || key === "updated_at") {
        const timeA = new Date(valA).getTime();
        const timeB = new Date(valB).getTime();
        return isDesc ? timeB - timeA : timeA - timeB;
      }

      if (typeof valA === "string") {
        return isDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
      }

      return isDesc ? valB - valA : valA - valB;
    });

    // Pagination
    const totalCount = leads.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedLeads = leads.slice(startIndex, startIndex + pageSize);

    return NextResponse.json({
      success: true,
      data: {
        leads: paginatedLeads,
        pagination: {
          total: totalCount,
          page,
          page_size: pageSize,
          total_pages: Math.ceil(totalCount / pageSize),
        },
        stats
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch leads" }, { status: 500 });
  }
}
