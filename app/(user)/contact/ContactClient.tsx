"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, Phone, MapPin, Sparkles, Send, CheckCircle } from "lucide-react";
import SideRays from "@/components/ui/SideRays";

const EASE = [0.22, 1, 0.36, 1] as const;

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function ContactClient({ settings }: { settings: any }) {
  const contactEmail = settings?.contactEmail || "hello@growthbridge.live";
  const phoneNumber = settings?.phoneNumber || "+91 62827 59863";
  const officeAddress = settings?.officeAddress || "100 Pine St, San Francisco, CA";


  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    budget: "$10k – $25k",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const budgets = ["<$10k", "$10k – $25k", "$25k – $50k", "$50k+"];

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = "Please enter a valid email address";
    }
    if (!form.message.trim()) errs.message = "Please describe your project scope";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    // Mock form sending delay
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-[#FCFBF8] text-[#111111] relative overflow-hidden pb-24">
      {/* SideRays background effects */}
      <div className="pointer-events-none fixed inset-0 z-10 opacity-[0.35]">
        <SideRays
          speed={0.8}
          rayColor1="#111111"
          rayColor2="#E9E3DA"
          intensity={1.0}
          spread={1.5}
          origin="top-right"
          tilt={0}
          saturation={0.5}
          blend={0.5}
          falloff={1.4}
          opacity={0.3}
        />
        <SideRays
          speed={0.6}
          rayColor1="#E9E3DA"
          rayColor2="#111111"
          intensity={0.8}
          spread={1.2}
          origin="top-left"
          tilt={10}
          saturation={0.5}
          blend={0.5}
          falloff={1.4}
          opacity={0.2}
        />
      </div>

      {/* Top Navbar */}
      <header className="fixed top-0 inset-x-0 z-40 bg-[#FCFBF8]/80 border-b border-[#E9E3DA] backdrop-blur-md">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-[17px] font-bold tracking-tight text-[#111111]">Growth Bridge</span>
          </a>

          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#E9E3DA] bg-white px-5 py-2 text-[13px] font-bold text-[#111111] hover:border-[#111111] transition-all"
          >
            <ArrowLeft size={14} /> Back to Home
          </a>
        </div>
      </header>

      {/* Contact content layout */}
      <div className="mx-auto max-w-[1280px] px-6 md:px-12 pt-36 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-16 items-start">

          {/* Left Column: Direct contact info */}
          <div className="flex flex-col gap-10">
            <Reveal>
              <span className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#6A6A6A]">
                <Sparkles size={13} className="text-[#F4C542]" /> Reach Out
              </span>
              <h1 className="mt-4 text-[48px] md:text-[60px] font-extrabold leading-[1.05] tracking-[-0.03em]">
                Let's talk specs.
              </h1>
              <p className="mt-6 text-[15px] leading-[1.75] text-[#6A6A6A] max-w-[420px]">
                Tell us what you're trying to build, your timeline constraints, and your metrics targets. We'll follow up within 24 hours.
              </p>
            </Reveal>

            {/* Direct Cards */}
            <div className="flex flex-col gap-4 mt-4">
              <Reveal delay={0.1}>
                <div className="flex items-center gap-4 p-5 rounded-[20px] border border-[#E9E3DA] bg-white/60">
                  <div className="h-10 w-10 rounded-full border border-[#E9E3DA] bg-white flex items-center justify-center text-[#111111]">
                    <Mail size={16} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#A8A296]">Email Us</span>
                    <p className="text-[14px] font-bold text-[#111111] mt-0.5">{contactEmail}</p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="flex items-center gap-4 p-5 rounded-[20px] border border-[#E9E3DA] bg-white/60">
                  <div className="h-10 w-10 rounded-full border border-[#E9E3DA] bg-white flex items-center justify-center text-[#111111]">
                    <Phone size={16} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#A8A296]">Call Us</span>
                    <p className="text-[14px] font-bold text-[#111111] mt-0.5">{phoneNumber}</p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <div className="flex items-center gap-4 p-5 rounded-[20px] border border-[#E9E3DA] bg-white/60">
                  <div className="h-10 w-10 rounded-full border border-[#E9E3DA] bg-white flex items-center justify-center text-[#111111]">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#A8A296]">Studio Location</span>
                    <p className="text-[14px] font-bold text-[#111111] mt-0.5">{officeAddress}</p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Right Column: Interaction form */}
          <div className="bg-white border border-[#E9E3DA] p-8 md:p-10 rounded-[32px] shadow-[0_15px_45px_rgba(0,0,0,0.03)] relative overflow-hidden">

            <AnimatePresence mode="wait">
              {!success ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Name input */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-bold uppercase tracking-wider text-[#111111]">
                        What's your name?
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className={`w-full bg-[#FCFBF8] border rounded-[12px] px-4 py-3 text-[14px] text-[#111111] font-semibold focus:outline-none focus:border-[#111111] transition-all ${errors.name ? "border-red-500" : "border-[#E9E3DA]"
                          }`}
                      />
                      {errors.name && <span className="text-red-500 text-[11px] font-bold">{errors.name}</span>}
                    </div>

                    {/* Email input */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-bold uppercase tracking-wider text-[#111111]">
                        Your email address
                      </label>
                      <input
                        type="email"
                        placeholder="john@company.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={`w-full bg-[#FCFBF8] border rounded-[12px] px-4 py-3 text-[14px] text-[#111111] font-semibold focus:outline-none focus:border-[#111111] transition-all ${errors.email ? "border-red-500" : "border-[#E9E3DA]"
                          }`}
                      />
                      {errors.email && <span className="text-red-500 text-[11px] font-bold">{errors.email}</span>}
                    </div>
                  </div>

                  {/* Company Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold uppercase tracking-wider text-[#111111]">
                      Company / Organization (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Acme Corp"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] px-4 py-3 text-[14px] text-[#111111] font-semibold focus:outline-none focus:border-[#111111] transition-all"
                    />
                  </div>

                  {/* Budget Selector */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold uppercase tracking-wider text-[#111111]">
                      Expected Budget Range
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-1">
                      {budgets.map((b) => {
                        const isSelected = form.budget === b;
                        return (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setForm({ ...form, budget: b })}
                            className={`py-2.5 px-2 rounded-full border text-[12px] font-bold text-center transition-all ${isSelected
                              ? "bg-[#111111] border-[#111111] text-white"
                              : "bg-[#FCFBF8] border-[#E9E3DA] text-[#6A6A6A] hover:border-[#111111]"
                              }`}
                          >
                            {b}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold uppercase tracking-wider text-[#111111]">
                      Describe the project scope
                    </label>
                    <textarea
                      rows={4}
                      placeholder="We need to build a converting landing page and a clean Next.js dashboard by the end of Q3..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className={`w-full bg-[#FCFBF8] border rounded-[12px] px-4 py-3 text-[14px] text-[#111111] font-semibold focus:outline-none focus:border-[#111111] transition-all resize-none ${errors.message ? "border-red-500" : "border-[#E9E3DA]"
                        }`}
                    />
                    {errors.message && <span className="text-red-500 text-[11px] font-bold">{errors.message}</span>}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-[#111111] hover:bg-[#F4C542] text-white hover:text-[#111111] font-bold text-[14px] rounded-full transition-all cursor-pointer shadow-md disabled:opacity-60 disabled:cursor-not-allowed group"
                  >
                    {loading ? (
                      <span>Sending inquiry...</span>
                    ) : (
                      <>
                        <span>Submit Project Inquiry</span>
                        <Send size={15} className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="flex flex-col items-center text-center py-12"
                >
                  <div className="h-16 w-16 bg-[#F4C542]/20 border border-[#F4C542]/40 rounded-full flex items-center justify-center text-[#F4C542] mb-6">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-[24px] font-extrabold tracking-tight text-[#111111]">
                    Message Sent Successfully
                  </h3>
                  <p className="mt-4 text-[14px] text-[#6A6A6A] leading-[1.7] max-w-[340px]">
                    Thank you for reaching out to Growth Bridge! Prajwal or a member of the team will follow up directly at <span className="text-[#111111] font-bold">{form.email}</span> within 24 hours.
                  </p>

                  <button
                    onClick={() => {
                      setSuccess(false);
                      setForm({ name: "", email: "", company: "", budget: "$10k – $25k", message: "" });
                    }}
                    className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#E9E3DA] bg-[#FCFBF8] hover:border-[#111111] px-6 py-2.5 text-[13px] font-bold text-[#111111] transition-all"
                  >
                    Send another message
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </main>
  );
}
