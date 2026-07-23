"use client";

import React from "react";
import { 
  Save, 
  RotateCcw, 
  Eye, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  X,
  AlertCircle
} from "lucide-react";

export default function LeadFormSettingsPage() {
  const [config, setConfig] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [toast, setToast] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  // Custom Field inputs
  const [newFieldKey, setNewFieldKey] = React.useState("");
  const [newFieldLabel, setNewFieldLabel] = React.useState("");
  const [newFieldPlaceholder, setNewFieldPlaceholder] = React.useState("");
  const [newFieldType, setNewFieldType] = React.useState<string>("text");
  const [newFieldRequired, setNewFieldRequired] = React.useState(false);

  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_access_token") || localStorage.getItem("mock_admin_token") || "mock-admin-token";
      const res = await fetch("/api/admin/lead-form-settings", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
      } else {
        showToast("error", data.error || "Failed to load settings");
      }
    } catch (err) {
      showToast("error", "Error loading settings.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("admin_access_token") || localStorage.getItem("mock_admin_token") || "mock-admin-token";
      const res = await fetch("/api/admin/lead-form-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          settings: config.settings,
          is_active: config.is_active
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Settings saved successfully.");
        setConfig(data.data);
      } else {
        showToast("error", data.error || "Failed to save settings");
      }
    } catch (err) {
      showToast("error", "Network error. Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset all configurations to defaults?")) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("admin_access_token") || localStorage.getItem("mock_admin_token") || "mock-admin-token";
      const res = await fetch("/api/admin/lead-form-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ reset: true })
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Settings reset to defaults.");
        setConfig(data.data);
      } else {
        showToast("error", data.error || "Failed to reset settings");
      }
    } catch (err) {
      showToast("error", "Network error. Failed to reset.");
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (key: string, property: string, value: any) => {
    const updatedFields = config.settings.fields.map((f: any) => {
      if (f.key === key) {
        return { ...f, [property]: value };
      }
      return f;
    });

    setConfig({
      ...config,
      settings: {
        ...config.settings,
        fields: updatedFields
      }
    });
  };

  const moveField = (index: number, direction: "up" | "down") => {
    const fields = [...config.settings.fields];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= fields.length) return;

    // Swap order property
    const tempOrder = fields[index].order;
    fields[index].order = fields[targetIndex].order;
    fields[targetIndex].order = tempOrder;

    // Sort to reflect visual swap
    fields.sort((a, b) => a.order - b.order);

    // Re-index order explicitly to guarantee consecutive numbers
    fields.forEach((f, idx) => {
      f.order = idx + 1;
    });

    setConfig({
      ...config,
      settings: {
        ...config.settings,
        fields
      }
    });
  };

  const handleAddCustomField = () => {
    const cleanedKey = newFieldKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!cleanedKey) {
      alert("Field key is required and must contain alphanumeric characters and underscores only.");
      return;
    }
    if (config.settings.fields.some((f: any) => f.key === cleanedKey)) {
      alert("A field with this key already exists.");
      return;
    }
    if (!newFieldLabel.trim()) {
      alert("Field label is required.");
      return;
    }

    const nextOrder = config.settings.fields.length > 0 
      ? Math.max(...config.settings.fields.map((f: any) => f.order)) + 1
      : 1;

    const newField = {
      key: cleanedKey,
      label: newFieldLabel.trim(),
      placeholder: newFieldPlaceholder.trim() || newFieldLabel.trim(),
      type: newFieldType,
      required: newFieldRequired,
      enabled: true,
      order: nextOrder,
      is_custom: true
    };

    setConfig({
      ...config,
      settings: {
        ...config.settings,
        fields: [...config.settings.fields, newField]
      }
    });

    // Reset inputs
    setNewFieldKey("");
    setNewFieldLabel("");
    setNewFieldPlaceholder("");
    setNewFieldType("text");
    setNewFieldRequired(false);
  };

  const handleDeleteField = (key: string) => {
    const updatedFields = config.settings.fields.filter((f: any) => f.key !== key);
    // Re-index orders
    updatedFields.forEach((f: any, idx: number) => {
      f.order = idx + 1;
    });

    setConfig({
      ...config,
      settings: {
        ...config.settings,
        fields: updatedFields
      }
    });
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400"></div>
      </div>
    );
  }

  const sortedFields = [...(config?.settings?.fields || [])].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-8 relative">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl border backdrop-blur-md shadow-2xl flex items-center gap-3 transition-all duration-300 ${toast.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>
          <AlertCircle className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-wider">{toast.message}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
            Form Customization
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white mt-1">
            Lead Form Settings
          </h1>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleReset}
            disabled={saving}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-[10px] font-black uppercase tracking-wider hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Default
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-[10px] font-black uppercase tracking-wider text-slate-950 hover:bg-cyan-300 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        
        {/* LEFT COLUMN: SETTINGS CONTROLS (3/5) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* GENERAL OPTIONS */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider border-b border-white/5 pb-2 text-cyan-300">
              General Configuration
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Form Title
                </label>
                <input
                  type="text"
                  value={config.settings.title || ""}
                  onChange={(e) => setConfig({ ...config, settings: { ...config.settings, title: e.target.value } })}
                  className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-4 py-3 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Submit Button Text
                </label>
                <input
                  type="text"
                  value={config.settings.submit_text || ""}
                  onChange={(e) => setConfig({ ...config, settings: { ...config.settings, submit_text: e.target.value } })}
                  className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-4 py-3 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Form Subtitle / Description
                </label>
                <textarea
                  value={config.settings.subtitle || ""}
                  rows={2}
                  onChange={(e) => setConfig({ ...config, settings: { ...config.settings, subtitle: e.target.value } })}
                  className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-4 py-3 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Success Confirmation Message
                </label>
                <textarea
                  value={config.settings.success_message || ""}
                  rows={2}
                  onChange={(e) => setConfig({ ...config, settings: { ...config.settings, success_message: e.target.value } })}
                  className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-4 py-3 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Alert Email
                </label>
                <input
                  type="email"
                  value={config.settings.notification_email || ""}
                  onChange={(e) => setConfig({ ...config, settings: { ...config.settings, notification_email: e.target.value } })}
                  className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-4 py-3 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Alert WhatsApp Number
                </label>
                <input
                  type="text"
                  value={config.settings.whatsapp_number || ""}
                  onChange={(e) => setConfig({ ...config, settings: { ...config.settings, whatsapp_number: e.target.value } })}
                  className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-4 py-3 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Consent / Privacy Disclaimer Text
                </label>
                <input
                  type="text"
                  value={config.settings.privacy_consent_text || ""}
                  onChange={(e) => setConfig({ ...config, settings: { ...config.settings, privacy_consent_text: e.target.value } })}
                  className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-4 py-3 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="is_active_check"
                  checked={config.is_active}
                  onChange={(e) => setConfig({ ...config, is_active: e.target.checked })}
                  className="h-4.5 w-4.5 rounded border-white/10 bg-[#03131d]/60 text-cyan-400 accent-cyan-400 cursor-pointer"
                />
                <label htmlFor="is_active_check" className="text-xs font-bold uppercase tracking-wider text-slate-300 cursor-pointer select-none">
                  Form Status: {config.is_active ? "Active" : "Inactive"}
                </label>
              </div>

              {/* Lead Confirmation Email */}
              <div className="sm:col-span-2 border-t border-white/5 pt-4 mt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300 mb-4">Lead Confirmation Email</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="send_lead_confirmation_email"
                      checked={config.settings.send_lead_confirmation_email ?? false}
                      onChange={(e) => setConfig({
                        ...config,
                        settings: {
                          ...config.settings,
                          send_lead_confirmation_email: e.target.checked
                        }
                      })}
                      className="h-4.5 w-4.5 rounded border-white/10 bg-[#03131d]/60 text-cyan-400 accent-cyan-400 cursor-pointer"
                    />
                    <label htmlFor="send_lead_confirmation_email" className="text-xs font-bold uppercase tracking-wider text-slate-300 cursor-pointer select-none">
                      Send Confirmation Email to Lead Upon Submission
                    </label>
                  </div>

                  {config.settings.send_lead_confirmation_email && (
                    <div className="grid gap-4 sm:grid-cols-2 mt-2">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Confirmation Email Subject
                        </label>
                        <input
                          type="text"
                          value={config.settings.confirmation_email_subject || ""}
                          onChange={(e) => setConfig({
                            ...config,
                            settings: {
                              ...config.settings,
                              confirmation_email_subject: e.target.value
                            }
                          })}
                          className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-4 py-3 text-xs text-white outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">
                          Confirmation Email Message (Supports placeholders like {"{{full_name}}"}, {"{{service_interested}}"}, {"{{lead_id}}"}, etc.)
                        </label>
                        <textarea
                          value={config.settings.confirmation_email_message || ""}
                          rows={4}
                          onChange={(e) => setConfig({
                            ...config,
                            settings: {
                              ...config.settings,
                              confirmation_email_message: e.target.value
                            }
                          })}
                          className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-4 py-3 text-xs text-white outline-none focus:border-cyan-400 font-sans"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC FIELDS MANAGEMENT */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider border-b border-white/5 pb-2 text-cyan-300">
              Form Fields Management
            </h3>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {sortedFields.map((field: any, index: number) => (
                <div key={field.key} className="p-4 rounded-2xl border border-white/5 bg-[#0a2b40]/20 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-white/5 px-2 py-0.5 rounded-md">
                        #{field.order}
                      </span>
                      <span className="text-xs font-black text-white">
                        {field.key}
                      </span>
                      <span className="text-[8px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                        {field.type}
                      </span>
                      {field.is_custom && (
                        <span className="text-[8px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          custom
                        </span>
                      )}
                    </div>

                    <div className="grid gap-2 grid-cols-2">
                      <div className="space-y-0.5">
                        <span className="text-[8px] uppercase tracking-widest text-slate-500 pl-0.5">Label</span>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => handleFieldChange(field.key, "label", e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-[#03131d]/60 px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] uppercase tracking-widest text-slate-500 pl-0.5">Placeholder</span>
                        <input
                          type="text"
                          value={field.placeholder}
                          onChange={(e) => handleFieldChange(field.key, "placeholder", e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-[#03131d]/60 px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.enabled}
                          onChange={(e) => handleFieldChange(field.key, "enabled", e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-white/10 bg-[#03131d]/60 text-cyan-400 accent-cyan-400"
                        />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300">Enabled</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => handleFieldChange(field.key, "required", e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-white/10 bg-[#03131d]/60 text-cyan-400 accent-cyan-400"
                        />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300">Required</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center gap-1.5 shrink-0 self-end sm:self-center border-t sm:border-t-0 sm:border-l border-white/5 pt-3 sm:pt-0 sm:pl-3 w-full sm:w-auto justify-end">
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveField(index, "up")}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 text-slate-400 hover:text-white transition"
                      >
                        <ArrowUp className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => moveField(index, "down")}
                        disabled={index === sortedFields.length - 1}
                        className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 text-slate-400 hover:text-white transition"
                      >
                        <ArrowDown className="h-4.5 w-4.5" />
                      </button>
                    </div>

                    {field.is_custom && (
                      <button
                        onClick={() => handleDeleteField(field.key)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ADD CUSTOM FIELD PANEL */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider border-b border-white/5 pb-2 text-cyan-300">
              Add Custom Field
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Field Unique Key (e.g. diving_license)
                </label>
                <input
                  type="text"
                  placeholder="diving_license"
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-4 py-3 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Field Type
                </label>
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-4 py-3 text-xs text-white/70 outline-none focus:border-cyan-400"
                >
                  <option value="text">Short Text (text)</option>
                  <option value="email">Email address</option>
                  <option value="textarea">Long Text (textarea)</option>
                  <option value="checkbox">Checkbox</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Label Text
                </label>
                <input
                  type="text"
                  placeholder="Diving Certification Body"
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-4 py-3 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Placeholder / Checkbox Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. PADI, SSI, NAUI, CMAS"
                  value={newFieldPlaceholder}
                  onChange={(e) => setNewFieldPlaceholder(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-4 py-3 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="new_field_req"
                  checked={newFieldRequired}
                  onChange={(e) => setNewFieldRequired(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-white/10 bg-[#03131d]/60 text-cyan-400 accent-cyan-400 cursor-pointer"
                />
                <label htmlFor="new_field_req" className="text-xs font-bold uppercase tracking-wider text-slate-300 cursor-pointer select-none">
                  Required Field
                </label>
              </div>

              <div className="flex justify-end items-center sm:col-span-2 mt-2">
                <button
                  onClick={handleAddCustomField}
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-5 py-3 text-[10px] font-black uppercase tracking-wider text-cyan-300 hover:bg-cyan-500/25 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Add Custom Field
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE FORM PREVIEW (2/5) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="sticky top-6">
            <div className="rounded-3xl border border-cyan-400/20 bg-[#062232]/40 shadow-2xl p-6 relative overflow-hidden backdrop-blur-md">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.04)_0%,transparent_70%)] pointer-events-none" />

              <div className="relative z-10 space-y-6">
                
                {/* PREVIEW BANNER */}
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <Eye className="h-4.5 w-4.5 text-cyan-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                    Live Form Preview
                  </span>
                </div>

                <div className="text-left">
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white leading-none">
                    {config.settings.title || "Get In Touch"}
                  </h2>
                  <p className="mt-2 text-xs text-slate-400 font-light leading-relaxed">
                    {config.settings.subtitle}
                  </p>
                </div>

                {!config.is_active ? (
                  <div className="p-8 rounded-3xl border border-rose-500/20 bg-rose-500/5 text-center text-rose-300">
                    <p className="text-xs font-bold uppercase tracking-wider">Form Inactive</p>
                    <p className="mt-2 text-[10px] font-light leading-relaxed">
                      Submissions are temporarily disabled. Please contact us via phone or email directly.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedFields
                      .filter((f: any) => f.enabled)
                      .map((field: any) => {
                        const isRequired = field.required;
                        const labelText = field.label + (isRequired ? " *" : "");

                        return (
                          <div key={field.key} className="space-y-1 text-left">
                            <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block pl-0.5">
                              {labelText}
                            </label>

                            {field.type === "textarea" ? (
                              <textarea
                                readOnly
                                placeholder={field.placeholder}
                                rows={3}
                                className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-4 py-3 text-xs text-white outline-none cursor-default"
                              />
                            ) : field.type === "select" ? (
                              <div className="relative w-full">
                                <select
                                  disabled
                                  className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-4 py-3 text-xs text-white/40 outline-none appearance-none cursor-default"
                                >
                                  <option value="">{field.placeholder || "Select service..."}</option>
                                  {(field.options || []).map((o: string) => (
                                    <option key={o} value={o}>{o}</option>
                                  ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-cyan-400/40">
                                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                  </svg>
                                </div>
                              </div>
                            ) : field.type === "checkbox" ? (
                              <label className="flex items-start gap-2.5 cursor-default py-1 select-none">
                                <input
                                  type="checkbox"
                                  disabled
                                  className="mt-0.5 h-4 w-4 rounded border-white/10 bg-[#03131d]/60 text-cyan-400"
                                />
                                <span className="text-[11px] text-slate-300 font-light">
                                  {field.placeholder || field.label}
                                </span>
                              </label>
                            ) : (
                              <input
                                type={field.type}
                                readOnly
                                placeholder={field.placeholder}
                                className="w-full rounded-xl border border-white/10 bg-[#03131d]/60 px-4 py-3 text-xs text-white outline-none cursor-default"
                              />
                            )}
                          </div>
                        );
                      })}

                    {config.settings.privacy_consent_text && (
                      <label className="flex items-start gap-2.5 cursor-default py-1 select-none text-left">
                        <input
                          type="checkbox"
                          disabled
                          className="mt-0.5 h-4 w-4 rounded border-white/10 bg-[#03131d]/60 text-cyan-400"
                        />
                        <span className="text-[10px] text-slate-400 font-light">
                          {config.settings.privacy_consent_text}
                        </span>
                      </label>
                    )}

                    <button
                      disabled
                      type="button"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-cyan-500/20 border border-cyan-400/20 px-5 py-3 text-[10px] font-black uppercase tracking-wider text-cyan-300"
                    >
                      {config.settings.submit_text || "Send Message"}
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
