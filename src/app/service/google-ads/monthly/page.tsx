"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Config, GoogleAdsOption } from "@/lib/types";
import { apiPath } from "@/lib/api";

function buildPayHref(label: string, option: GoogleAdsOption) {
  const name = `Google Ads – Monthly – ${label}`;
  const params = new URLSearchParams();
  params.set("service", "google-ads-monthly");
  params.set("name", name);
  if (option?.amount?.trim()) params.set("amount", option.amount.trim());
  return `/payment?${params.toString()}`;
}

export default function GoogleAdsMonthlyPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiPath("/api/config"))
      .then((r) => r.json())
      .then((data) => {
        setConfig(data);
        setLoading(false);
      })
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
        <div className="text-red-600">Failed to load.</div>
      </div>
    );
  }

  const detail = config.googleAdsDetail;
  const indian = detail?.monthly?.indian ?? { price: "", amount: "" };
  const international = detail?.monthly?.international ?? { price: "", amount: "" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3FF] via-[#EDE9FE] to-[#DBEAFE]">
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-20">
        <Link
          href="/"
          className="inline-flex items-center text-purple-700 hover:text-purple-900 font-medium mb-8"
        >
          ← Back to services
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10">
          Google Ads – Monthly
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Indian</h2>
            <p className="font-semibold text-purple-700 mb-4">{indian.price || "—"}</p>
            <Link
              href={buildPayHref("Indian", indian)}
              className="block text-center py-2.5 px-4 rounded-xl font-medium border-2 border-purple-500 text-purple-700 hover:bg-purple-50 transition"
            >
              Pay for Indian
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">International</h2>
            <p className="font-semibold text-purple-700 mb-4">{international.price || "—"}</p>
            <Link
              href={buildPayHref("International", international)}
              className="block text-center py-2.5 px-4 rounded-xl font-medium border-2 border-purple-500 text-purple-700 hover:bg-purple-50 transition"
            >
              Pay for International
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
