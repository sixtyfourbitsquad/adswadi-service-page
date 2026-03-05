"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Config, MetaAgencyIndianTier } from "@/lib/types";
import { apiPath } from "@/lib/api";

const DEFAULT_TIERS: MetaAgencyIndianTier[] = [
  { dailyLimit: "5K", weekly: { price: "", amount: "" }, monthly: { price: "", amount: "" } },
  { dailyLimit: "20K", weekly: { price: "", amount: "" }, monthly: { price: "", amount: "" } },
  { dailyLimit: "30K", weekly: { price: "", amount: "" }, monthly: { price: "", amount: "" } },
];

function buildPayHref(label: string, amount: string | undefined) {
  const name = `Indian Meta Agency – ${label}`;
  const params = new URLSearchParams();
  params.set("service", "meta-agency-indian");
  params.set("name", name);
  if (amount && amount.trim()) params.set("amount", amount.trim());
  return `/payment?${params.toString()}`;
}

export default function MetaAgencyIndianPage() {
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

  const indian = config.metaAgencyIndian;
  const tiers = indian?.tiers?.length ? indian.tiers : DEFAULT_TIERS;
  const needMoreLabel = indian?.needMoreLabel ?? "Need more daily limit accounts?";
  const whatsappNumber = config?.payment?.whatsappNumber;
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`
    : "#";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3FF] via-[#EDE9FE] to-[#DBEAFE]">
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-20">
        <Link
          href="/"
          className="inline-flex items-center text-purple-700 hover:text-purple-900 font-medium mb-8"
        >
          ← Back to services
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10 uppercase tracking-tight">
          Indian Meta Agency Ads Account
        </h1>

        <div className="space-y-8">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Daily limit {tier.dailyLimit}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Weekly</p>
                  <p className="font-semibold text-purple-700 mb-3">{tier.weekly.price || "—"}</p>
                  <Link
                    href={buildPayHref(`${tier.dailyLimit} Weekly`, tier.weekly.amount)}
                    className="block text-center py-2.5 px-4 rounded-xl font-medium border-2 border-purple-500 text-purple-700 hover:bg-purple-50 transition"
                  >
                    Pay Weekly
                  </Link>
                </div>
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-1">Monthly</p>
                  <p className="font-semibold text-purple-700 mb-3">{tier.monthly.price || "—"}</p>
                  <Link
                    href={buildPayHref(`${tier.dailyLimit} Monthly`, tier.monthly.amount)}
                    className="block text-center py-2.5 px-4 rounded-xl font-medium border-2 border-purple-500 text-purple-700 hover:bg-purple-50 transition"
                  >
                    Pay Monthly
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <section className="mt-12 text-center">
          <p className="text-gray-700 font-medium mb-4">{needMoreLabel}</p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] text-white font-semibold shadow-lg hover:bg-[#20BD5A] transition"
          >
            Contact on WhatsApp
          </a>
        </section>
      </div>
    </div>
  );
}
