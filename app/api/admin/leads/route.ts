import { NextRequest, NextResponse } from "next/server";
import { connectDatabase } from "@/lib/mongodb";
import LeadModel from "@/lib/models/Lead";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const isAuth = await isAdminAuthenticated(request);
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDatabase();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("page_size") || "20", 10);
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
        { message: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (source) {
      filter.source = { $regex: `^${source}$`, $options: "i" };
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const totalCount = await LeadModel.countDocuments(filter);
    const totalAll = await LeadModel.countDocuments({});
    const newCount = await LeadModel.countDocuments({ status: "new" });
    const contactedCount = await LeadModel.countDocuments({ status: "contacted" });
    const qualifiedCount = await LeadModel.countDocuments({ status: "qualified" });
    const convertedCount = await LeadModel.countDocuments({ status: "converted" });
    const closedCount = await LeadModel.countDocuments({ status: "closed" });
    const spamCount = await LeadModel.countDocuments({ status: "spam" });

    const stats = {
      total: totalAll,
      newCount,
      contactedCount,
      qualifiedCount,
      convertedCount,
      closedCount,
      spamCount,
    };

    const leadsDocs = await LeadModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    const leads = leadsDocs.map((doc) => ({
      id: String(doc._id),
      full_name: doc.fullName || "",
      email: doc.email || "",
      phone: doc.phone || "",
      whatsapp_number: doc.whatsappNumber || "",
      company_name: doc.companyName || "",
      location: doc.location || "",
      service_interested: doc.serviceInterested || "",
      message: doc.message || "",
      preferred_contact_method: doc.preferredContactMethod || "",
      form_data: doc.formData || {},
      status: doc.status || "new",
      source: doc.source || "website",
      page_url: doc.pageUrl || "",
      ip_address: doc.ipAddress || "",
      user_agent: doc.userAgent || "",
      admin_notes: doc.adminNotes || "",
      assigned_to: "",
      created_at: doc.createdAt ? doc.createdAt.toISOString() : "",
      updated_at: doc.updatedAt ? doc.updatedAt.toISOString() : "",
    }));

    return NextResponse.json({
      success: true,
      data: {
        leads,
        pagination: {
          total: totalCount,
          page,
          page_size: pageSize,
          total_pages: Math.ceil(totalCount / pageSize),
        },
        stats,
      },
    });
  } catch (error: any) {
    console.error("[Admin Leads GET API] Error:", error);
    return NextResponse.json({ error: "Failed to fetch leads from database" }, { status: 500 });
  }
}
