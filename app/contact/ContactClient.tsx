"use client";

import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Clock3,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// Animation Presets
const pageTransition = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut" as const, staggerChildren: 0.08 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -50, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 50, scale: 0.96, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function ContactClient() {
  const [config, setConfig] = React.useState<any>(null);
  const [loadingConfig, setLoadingConfig] = React.useState(true);
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [formValues, setFormValues] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch("/api/public/lead-form-settings");
        const resData = await response.json();
        if (resData.success && resData.data) {
          setConfig(resData.data);
          // Initialize form values
          const initialValues: Record<string, any> = {};
          resData.data.settings.fields.forEach((f: any) => {
            if (f.enabled) {
              initialValues[f.key] = f.type === "checkbox" ? false : "";
            }
          });
          setFormValues(initialValues);
        }
      } catch (err) {
        console.error("Failed to load contact settings:", err);
      } finally {
        setLoadingConfig(false);
      }
    }
    loadConfig();
  }, []);

  const handleInputChange = (key: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const response = await fetch("/api/public/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formValues,
          source: "website",
          page_url: window.location.href,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        // Clear inputs
        const clearedValues: Record<string, any> = {};
        Object.keys(formValues).forEach((k) => {
          clearedValues[k] = typeof formValues[k] === "boolean" ? false : "";
        });
        setFormValues(clearedValues);
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg("Failed to send message. Please check your internet connection.");
    }
  };

  const enabledFields = config?.settings?.fields
    ? config.settings.fields
        .filter((f: any) => f.enabled)
        .sort((a: any, b: any) => a.order - b.order)
    : [];

  const isFormActive = config ? config.is_active : true;
  const formTitle = config?.settings?.title || "Get In Touch";
  const formSubtitle = config?.settings?.subtitle || "Start your diving journey today.";
  const submitText = config?.settings?.submit_text || "Send Message";
  const successMessage = config?.settings?.success_message || "Message sent successfully!";

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={pageTransition}
      className="bg-[#03131d] text-white min-h-screen overflow-hidden relative"
    >
      {/* Luxury layout depth and very subtle ocean glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.03)_0%,transparent_60%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(34,211,238,0.02)_0%,transparent_50%)] pointer-events-none z-0" />

      {/* HERO */}
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24 md:py-28 z-10">
        <div className="mx-auto max-w-7xl text-center">
          <motion.p
            variants={fadeInUp}
            className="text-[10px] font-black uppercase tracking-[0.28em] text-[#67e8f9] sm:text-xs flex items-center justify-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Contact Dive Hub & Marine Services
          </motion.p>

          <motion.h1
            variants={fadeInUp}
            className="mx-auto mt-4 max-w-5xl text-[32px] font-black leading-[1.08] text-white sm:text-5xl md:text-6xl tracking-tight"
          >
            Let’s Start Your
            <span className="text-[#67e8f9]"> Diving Journey</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-5 max-w-3xl text-[14px] leading-7 text-white/72 font-light sm:mt-7 sm:text-[16px] sm:leading-8"
          >
            Contact Dive Hub & Marine Services for scuba diving
            courses, commercial diving training, marine solutions,
            underwater operations, and professional certifications.
          </motion.p>
        </div>
      </section>

      {/* CONTACT CARDS */}
      <section className="px-4 pb-16 sm:px-6 sm:pb-24 relative z-10">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            
            {/* PHONE */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group rounded-2xl bg-white/[0.06] border border-white/10 hover:border-cyan-500/30 p-4 shadow-[0_15px_35px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_rgba(6,182,212,0.12)] cursor-pointer flex flex-col justify-between h-full transition-all duration-500 sm:rounded-[2rem] sm:p-7"
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0a2b40]/60 border border-[#123b57]/80 text-[#67e8f9] sm:h-16 sm:w-16 sm:rounded-2xl transition-all duration-300 group-hover:scale-105 group-hover:bg-[#123b57] group-hover:text-white">
                  <Phone className="h-5 w-5 sm:h-7 w-7 transition-transform duration-700 group-hover:rotate-6" />
                </div>

                <h3 className="mt-4 text-[13px] font-black text-white sm:mt-6 sm:text-2xl tracking-tight uppercase group-hover:text-[#67e8f9] transition-colors duration-300">
                  Phone
                </h3>

                <div className="mt-2 text-[11px] leading-5 text-white/72 font-light sm:mt-4 sm:text-[14px] sm:leading-7 flex flex-col space-y-1 sm:space-y-1.5">
                  <a href="tel:04842989390" className="hover:text-[#67e8f9] transition-colors flex items-center gap-1">
                    <span className="opacity-60">Landline:</span> 0484 2989390
                  </a>
                  <a href="tel:+916235107072" className="hover:text-[#67e8f9] transition-colors flex items-center gap-1">
                    <span className="opacity-60">Mobile:</span> +91 6235107072
                  </a>
                  <a href="tel:+916235106062" className="hover:text-[#67e8f9] transition-colors flex items-center gap-1">
                    <span className="opacity-60">Mobile:</span> +91 6235106062
                  </a>
                </div>
              </div>
            </motion.div>

            {/* EMAIL */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group rounded-2xl bg-white/[0.06] border border-white/10 hover:border-cyan-500/30 p-4 shadow-[0_15px_35px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_rgba(6,182,212,0.12)] cursor-pointer flex flex-col justify-between h-full transition-all duration-500 sm:rounded-[2rem] sm:p-7"
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0a2b40]/60 border border-[#123b57]/80 text-[#67e8f9] sm:h-16 sm:w-16 sm:rounded-2xl transition-all duration-300 group-hover:scale-105 group-hover:bg-[#123b57] group-hover:text-white">
                  <Mail className="h-5 w-5 sm:h-7 w-7 transition-transform duration-700 group-hover:rotate-6" />
                </div>

                <h3 className="mt-4 text-[13px] font-black text-white sm:mt-6 sm:text-2xl tracking-tight uppercase group-hover:text-[#67e8f9] transition-colors duration-300">
                  Email
                </h3>

                <p className="mt-2 break-all text-[11px] leading-5 text-white/72 font-light sm:mt-4 sm:text-[15px] sm:leading-7">
                  {config?.settings?.notification_email || "divehub@divehubmarineservices.com"}
                </p>
              </div>
            </motion.div>

            {/* LOCATION */}
            <a
              href={process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL || "https://www.google.com/maps/place/Dive+Hub+%26+Marine+Services/@10.1926394,76.3869289,17z/data=!3m1!4b1!4m6!3m5!1s0x3b0807c7ec9c75e9:0xbc174757022bb9ee!8m2!3d10.1926394!4d76.3869289!16s%2Fg%2F11z9rfxttv?entry=ttu&g_ep=EgoyMDI2MDYwMy4xIKXMDSoASAFQAw%3D%3D"}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full"
            >
              <motion.div
                variants={fadeInUp}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group rounded-2xl bg-white/[0.06] border border-white/10 hover:border-cyan-500/30 p-4 shadow-[0_15px_35px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_rgba(6,182,212,0.12)] cursor-pointer flex flex-col justify-between h-full transition-all duration-500 sm:rounded-[2rem] sm:p-7"
              >
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0a2b40]/60 border border-[#123b57]/80 text-[#67e8f9] sm:h-16 sm:w-16 sm:rounded-2xl transition-all duration-300 group-hover:scale-105 group-hover:bg-[#123b57] group-hover:text-white">
                    <MapPin className="h-5 w-5 sm:h-7 w-7 transition-transform duration-700 group-hover:rotate-6" />
                  </div>

                  <h3 className="mt-4 text-[13px] font-black text-white sm:mt-6 sm:text-2xl tracking-tight uppercase group-hover:text-[#67e8f9] transition-colors duration-300">
                    Location
                  </h3>

                  <p className="mt-2 text-[11px] leading-5 text-white/72 font-light sm:mt-4 sm:text-[15px] sm:leading-7">
                    Near Angamaly Railway Station<br />
                    Angamaly, Kerala
                  </p>
                </div>
              </motion.div>
            </a>

            {/* HOURS */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group rounded-2xl bg-white/[0.06] border border-white/10 hover:border-cyan-500/30 p-4 shadow-[0_15px_35px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_rgba(6,182,212,0.12)] cursor-pointer flex flex-col justify-between h-full transition-all duration-500 sm:rounded-[2rem] sm:p-7"
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0a2b40]/60 border border-[#123b57]/80 text-[#67e8f9] sm:h-16 sm:w-16 sm:rounded-2xl transition-all duration-300 group-hover:scale-105 group-hover:bg-[#123b57] group-hover:text-white">
                  <Clock3 className="h-5 w-5 sm:h-7 w-7 transition-transform duration-700 group-hover:rotate-6" />
                </div>

                <h3 className="mt-4 text-[13px] font-black text-white sm:mt-6 sm:text-2xl tracking-tight uppercase group-hover:text-[#67e8f9] transition-colors duration-300">
                  Working Hours
                </h3>

                <p className="mt-2 text-[11px] leading-5 text-white/72 font-light sm:mt-4 sm:text-[15px] sm:leading-7">
                  Mon - Sat : 9AM - 7PM
                </p>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* CONTACT FORM + MAP */}
      <section className="px-4 pb-16 sm:px-6 sm:pb-24 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            
            {/* CONTACT FORM */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInLeft}
              className="rounded-[2rem] bg-[#062232]/30 border border-white/10 p-5 text-white sm:p-10 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
            >
              {/* Atmospheric slow background glow */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.4, 0.6, 0.4],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.06)_0%,transparent_80%)] pointer-events-none"
              />

              <div className="relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.28em] text-[#67e8f9] sm:text-xs">
                  Send Message
                </span>

                <h2 className="mt-4 text-[30px] font-black leading-[1.08] sm:text-5xl text-white tracking-tight uppercase">
                  {formTitle}
                </h2>

                <p className="mt-2 text-xs sm:text-sm text-slate-400 font-light mb-6">
                  {formSubtitle}
                </p>

                {loadingConfig ? (
                  <div className="py-20 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400"></div>
                  </div>
                ) : !isFormActive ? (
                  <div className="p-8 rounded-3xl border border-rose-500/20 bg-rose-500/5 text-center text-rose-300">
                    <p className="text-sm font-bold uppercase tracking-wider">Form Disabled</p>
                    <p className="mt-2 text-xs font-light">
                      Submissions are temporarily disabled. Please contact us via phone or email directly.
                    </p>
                  </div>
                ) : (
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    {enabledFields.map((field: any) => {
                      const isRequired = field.required;
                      const labelText = field.label + (isRequired ? " *" : "");

                      return (
                        <div key={field.key} className="space-y-1 text-left">
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block pl-1">
                            {labelText}
                          </label>

                          {field.type === "textarea" ? (
                            <textarea
                              required={isRequired}
                              placeholder={field.placeholder}
                              rows={4}
                              value={formValues[field.key] || ""}
                              onChange={(e) => handleInputChange(field.key, e.target.value)}
                              className="w-full rounded-2xl border border-white/10 bg-[#03131d]/60 px-5 py-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all duration-300"
                            />
                          ) : field.type === "select" ? (
                            <div className="relative w-full">
                              <select
                                required={isRequired}
                                value={formValues[field.key] || ""}
                                onChange={(e) => handleInputChange(field.key, e.target.value)}
                                className="w-full rounded-2xl border border-white/10 bg-[#03131d]/60 px-5 py-4 text-sm text-white/70 outline-none focus:border-cyan-400 focus:text-white focus:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all duration-300 appearance-none cursor-pointer"
                              >
                                <option value="" className="bg-[#03131d] text-white/30">
                                  {field.placeholder || "Select an option"}
                                </option>
                                {(field.options || []).map((opt: string) => (
                                  <option key={opt} value={opt} className="bg-[#03131d] text-white">
                                    {opt}
                                  </option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-cyan-400">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                              </div>
                            </div>
                          ) : field.type === "checkbox" ? (
                            <label className="flex items-start gap-3 cursor-pointer py-2">
                              <input
                                type="checkbox"
                                required={isRequired}
                                checked={!!formValues[field.key]}
                                onChange={(e) => handleInputChange(field.key, e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-white/10 bg-[#03131d]/60 text-cyan-400 focus:ring-cyan-400 accent-cyan-400 cursor-pointer"
                              />
                              <span className="text-xs text-slate-300 font-light select-none">
                                {field.placeholder || field.label}
                              </span>
                            </label>
                          ) : (
                            <input
                              type={field.type}
                              required={isRequired}
                              placeholder={field.placeholder}
                              value={formValues[field.key] || ""}
                              onChange={(e) => handleInputChange(field.key, e.target.value)}
                              className="w-full rounded-2xl border border-white/10 bg-[#03131d]/60 px-5 py-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all duration-300"
                            />
                          )}
                        </div>
                      );
                    })}

                    {config?.settings?.privacy_consent_text && (
                      <label className="flex items-start gap-3 cursor-pointer py-1 text-left">
                        <input
                          type="checkbox"
                          required
                          className="mt-0.5 h-4 w-4 rounded border-white/10 bg-[#03131d]/60 text-cyan-400 focus:ring-cyan-400 accent-cyan-400 cursor-pointer"
                        />
                        <span className="text-[11px] text-slate-400 font-light select-none">
                          {config.settings.privacy_consent_text}
                        </span>
                      </label>
                    )}

                    {status === "success" && (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium text-left">
                        {successMessage}
                      </div>
                    )}

                    {status === "error" && (
                      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium text-left">
                        {errorMsg}
                      </div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      type="submit"
                      disabled={status === "submitting"}
                      className="inline-flex items-center gap-2 rounded-full bg-[#67e8f9] hover:bg-cyan-300 px-6 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-950 transition-all duration-300 hover:scale-103 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] sm:text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {status === "submitting" ? "Sending..." : submitText}
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </motion.button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* MAP */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInRight}
              className="overflow-hidden rounded-[2rem] bg-[#062232]/30 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
            >
              <div className="flex items-center gap-2 bg-[#0a2b40]/60 border-b border-white/10 px-5 py-4">
                <MapPin className="h-5 w-5 text-[#67e8f9]" />

                <p className="text-sm font-black uppercase tracking-wide text-white">
                  Our Location
                </p>
              </div>

              <iframe
                src="https://maps.google.com/maps?q=Dive%20Hub%20%26%20Marine%20Services,%20Angamaly,%20Kerala,%20India&z=17&hl=en&output=embed"
                className="h-[350px] w-full sm:h-[620px] opacity-80"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>

          </div>
        </div>
      </section>
    </motion.main>
  );
}
