// Helper to get authentication token on the frontend
function getAuthHeader(): Record<string, string> {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("mock_admin_token") || "mock-admin-token";
    return {
      "Authorization": `Bearer ${token}`
    };
  }
  return {};
}

export const leadService = {
  // Public APIs
  getLeadFormSettings: async () => {
    const res = await fetch("/api/public/lead-form-settings");
    if (!res.ok) {
      throw new Error("Failed to load form settings");
    }
    const data = await res.json();
    return data.data;
  },

  submitLead: async (leadData: Record<string, any>) => {
    const res = await fetch("/api/public/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leadData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to submit form");
    }
    return data;
  },

  // Admin APIs
  getAdminFormSettings: async () => {
    const res = await fetch("/api/admin/lead-form-settings", {
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      throw new Error("Unauthorized or failed to load settings");
    }
    const data = await res.json();
    return data.data;
  },

  saveLeadFormSettings: async (settingsData: Record<string, any>) => {
    const res = await fetch("/api/admin/lead-form-settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(settingsData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to save settings");
    }
    return data.data;
  },

  getLeads: async (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, String(val));
      }
    });

    const res = await fetch(`/api/admin/leads?${query.toString()}`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      throw new Error("Unauthorized or failed to load leads");
    }
    const data = await res.json();
    return data.data;
  },

  getLeadById: async (id: string) => {
    const res = await fetch(`/api/admin/leads/${id}`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      throw new Error("Lead not found");
    }
    const data = await res.json();
    return data.data;
  },

  updateLead: async (id: string, updateData: Record<string, any>) => {
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(updateData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to update lead");
    }
    return data.data;
  },

  deleteLead: async (id: string) => {
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to delete lead");
    }
    return true;
  },

  exportLeadsUrl: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, String(val));
      }
    });
    // Add token query parameter so browser direct download works seamlessly
    const token = typeof window !== "undefined" ? (localStorage.getItem("mock_admin_token") || "mock-admin-token") : "mock-admin-token";
    query.append("token", token);
    return `/api/admin/leads/export?${query.toString()}`;
  }
};
