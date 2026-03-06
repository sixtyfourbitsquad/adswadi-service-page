"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Config, MetaAgencyInternationalCategory } from "@/lib/types";
import { apiPath, fetchWithTimeout } from "@/lib/api";

const DEFAULT_CATEGORIES: MetaAgencyInternationalCategory[] = [
  { name: "White Hat", price: "", amount: "" },
  { name: "Grey Hat", price: "", amount: "" },
  { name: "Black Hat", price: "", amount: "" },
];

function buildPayHref(cat: MetaAgencyInternationalCategory) {
  const name = `International Meta Agency – ${cat.name}`;
  const params = new URLSearchParams();
  params.set("service", "meta-agency-international");
  params.set("name", name);
  if (cat.amount && cat.amount.trim()) params.set("amount", cat.amount.trim());
  return `/payment?${params.toString()}`;
}

export default function MetaAgencyInternationalPage() {
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#F5F3FF] via-[#FCE7F3] to-[#DBEAFE] px-4 gap-4">
        <p className="text-red-600 text-center font-medium">Failed to load. Check your connection.</p>
        <Link href="/" className="btn-outline text-sm">Back to services</Link>
      </div>
    );
  }

  const intl = config.metaAgencyInternational;
  const categories = intl?.categories?.length ? intl.categories : DEFAULT_CATEGORIES;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3FF] via-[#EDE9FE] to-[#DBEAFE]">
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-20">
        <Link href="/" className="link-back mb-8">
          ← Back to services
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-gradient-brand text-center mb-10 uppercase tracking-tight">
          International Meta Agency Ads Account
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{cat.name}</h2>
              <p className="font-semibold text-gradient-brand mb-4">{cat.price || "—"}</p>
              <Link href={buildPayHref(cat)} className="btn-outline w-full text-center">
                Pay for {cat.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
