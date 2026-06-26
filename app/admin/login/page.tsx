"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/actions/auth";
import { Lock, Mail, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await login(formData);
      if (res.success) {
        router.push("/admin");
      } else {
        setError(res.error || "Login failed");
      }
    });
  };

  return (
    <main className="min-h-screen bg-[#FCFBF8] text-[#111111] flex items-center justify-center p-6 relative overflow-hidden">
      {/* background vignette decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_60%,_rgba(233,227,218,0.15)_100%)] pointer-events-none" />

      <div className="w-full max-w-[420px] z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#111111] text-[20px] font-extrabold text-[#F4C542] shadow-md">
            G
          </div>
          <h1 className="mt-4 text-[24px] font-extrabold tracking-tight text-[#111111]">
            Growth Bridge CMS
          </h1>
          <p className="mt-1 text-[13px] text-[#6A6A6A] font-medium">
            Sign in to manage your digital agency website
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E9E3DA] rounded-[24px] p-8 shadow-[0_15px_45px_rgba(0,0,0,0.03)]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-[13px] font-medium p-3.5 rounded-[12px] border border-red-100">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6A6A6A]">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  disabled={isPending}
                  placeholder="admin@growthbridge.studio"
                  className="w-full bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] py-3.5 pl-11 pr-4 text-[14px] text-[#111111] placeholder:text-[#A8A296] focus:outline-none focus:border-[#111111] transition-colors disabled:opacity-60"
                />
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8A296]" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6A6A6A]">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  disabled={isPending}
                  placeholder="••••••••"
                  className="w-full bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] py-3.5 pl-11 pr-4 text-[14px] text-[#111111] placeholder:text-[#A8A296] focus:outline-none focus:border-[#111111] transition-colors disabled:opacity-60"
                />
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8A296]" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-full bg-[#111111] py-4 text-[14px] font-semibold text-white transition-all hover:bg-[#2a2a2a] disabled:opacity-60 cursor-pointer"
            >
              {isPending ? "Signing in..." : "Sign in to Admin"}
              {!isPending && <ArrowRight size={15} />}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-[12px] text-[#6A6A6A]">
          <p>© {new Date().getFullYear()} Growth Bridge Studio. All rights reserved.</p>
        </div>
      </div>
    </main>
  );
}
