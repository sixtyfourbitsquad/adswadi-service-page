"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Config, GoogleAgencyOption } from "@/lib/types";
import { apiPath, fetchWithTimeout } from "@/lib/api";

const DEFAULT_OPTIONS = {
  indian: { price: "", amount: "" },
  international: { price: "", amount: "" },
};

function buildPayHref(label: string, option: GoogleAgencyOption) {
  const name = `Google Agency – Weekly – ${label}`;
  const params = new URLSearchParams();
  params.set("service", "google-agency-weekly");
  params.set("name", name);
  if (option.amount && option.amount.trim()) params.set("amount", option.amount.trim());
  return `/payment?${params.toString()}`;
}

export default function GoogleAgencyWeeklyPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithTimeout(apiPath("/api/config"), {}, 25000)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error())))
      .then((data) => { setConfig(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F3FF] via-[#FCE7F3] to-[#DBEAFE]">
        <div className="text-purple-700 font-medium">Loading...</div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F3FF] via-[#FCE7F3] to-[#DBEAFE]">
        <p className="text-red-600">Failed to load.</p>
      </div>
    );
  }

  const weekly = config.googleAgencyWeekly ?? DEFAULT_OPTIONS;
  const indian = weekly.indian ?? DEFAULT_OPTIONS.indian;
  const international = weekly.international ?? DEFAULT_OPTIONS.international;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3FF] via-[#EDE9FE] to-[#DBEAFE]">
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-20">
        <Link href="/" className="link-back mb-8">
          ← Back to services
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-gradient-brand text-center mb-10">
          Google Agency Ads Account – Weekly
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Indian</h2>
            <p className="font-semibold text-gradient-brand mb-4">{indian.price || "—"}</p>
            <Link href={buildPayHref("Indian", indian)} className="btn-outline w-full text-center">
              Pay for Indian
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">International</h2>
            <p className="font-semibold text-gradient-brand mb-4">{international.price || "—"}</p>
            <Link href={buildPayHref("International", international)} className="btn-outline w-full text-center">
              Pay for International
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
