"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Config } from "@/lib/types";
import { apiPath } from "@/lib/api";

function PaymentContent() {
  const searchParams = useSearchParams();
  const serviceName = searchParams.get("name") || "Service";
  const amountParam = searchParams.get("amount"); // optional: for UPI QR with specific value
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const copyUpiId = () => {
    if (!config?.payment.upiId) return;
    navigator.clipboard.writeText(config.payment.upiId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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
        <div className="text-red-600">Failed to load payment details.</div>
      </div>
    );
  }

  const { payment } = config;
  const whatsappUrl = payment.whatsappNumber
    ? `https://wa.me/${payment.whatsappNumber.replace(/\D/g, "")}`
    : "#";

  // QR is always generated from UPI ID and amount (no upload needed)
  const qrSrc = payment.upiId
    ? apiPath(`/api/upi-qr?pa=${encodeURIComponent(payment.upiId)}&pn=${encodeURIComponent(payment.upiName || "Pay")}${amountParam ? `&am=${encodeURIComponent(amountParam)}` : ""}`)
    : null;

  // UPI deep link: opens UPI app with payee and amount (when set)
  const upiPayUrl = payment.upiId
    ? (() => {
        const params = new URLSearchParams();
        params.set("pa", payment.upiId);
        params.set("pn", (payment.upiName || "Pay").slice(0, 50));
        params.set("cu", "INR");
        if (amountParam && amountParam.trim() !== "") {
          const am = parseFloat(String(amountParam).replace(/,/g, ""));
          if (!Number.isNaN(am) && am > 0) params.set("am", am.toFixed(2));
        }
        return `upi://pay?${params.toString()}`;
      })()
    : null;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#F5F3FF] via-[#EDE9FE] to-[#DBEAFE] py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <Link
            href="/"
            className="text-purple-700 font-semibold hover:underline mb-6 inline-block"
          >
            ← Back to services
          </Link>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="inline-block text-left mx-auto mb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Pay for {serviceName}
              </h1>
              <svg
                className="w-full h-4 mt-1"
                viewBox="0 0 200 20"
                preserveAspectRatio="none"
              >
                <path
                  d="M5 15 Q 50 0 100 12 T 195 10"
                  className="curvy-underline-path"
                />
              </svg>
            </div>
            <p className="text-gray-600 font-semibold text-sm mb-6">
              Complete payment via UPI or scan QR below
            </p>

          {qrSrc ? (
            <div className="mb-6 flex flex-col items-center">
              <img
                src={qrSrc}
                alt="Payment QR Code"
                className="w-56 h-56 object-contain border border-gray-200 rounded-xl mx-auto"
              />
              {amountParam && (
                <p className="text-center font-bold text-gray-700 text-base mt-3">
                  Amount: ₹{Number(amountParam).toLocaleString("en-IN")}
                </p>
              )}
            </div>
          ) : (
            <div className="mb-6 flex justify-center items-center w-56 h-56 mx-auto border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-semibold text-sm text-center px-4">
              Set UPI ID in admin to generate QR
            </div>
          )}

          {upiPayUrl && (
            <a
              href={upiPayUrl}
              className="mb-6 flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-purple-600 text-white font-bold text-lg shadow-lg hover:bg-purple-700 transition"
            >
              PAY NOW
            </a>
          )}

          {(payment.upiId || payment.upiName) && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-gray-700 font-bold text-sm uppercase tracking-wide mb-2">
                UPI ID
              </p>
              <p className="font-mono font-bold text-gray-900 break-all text-base">
                {payment.upiId || "—"}
              </p>
              {payment.upiName && (
                <p className="text-gray-600 font-semibold text-sm mt-1">{payment.upiName}</p>
              )}
              <button
                type="button"
                onClick={copyUpiId}
                className="mt-3 text-sm font-bold text-purple-600 hover:text-purple-700 hover:underline"
              >
                {copied ? "Copied!" : "Copy UPI ID"}
              </button>
            </div>
          )}

            <div className="pt-6 border-t border-gray-200">
              <div className="mb-4 rounded-lg bg-red-600 px-4 py-3 text-center animate-blink">
                <p className="font-bold text-white text-sm uppercase tracking-wide">
                  SEND YOUR PAYMENT SCREENSHOT ON WHATSAPP
                </p>
              </div>
              <p className="text-gray-700 font-bold text-sm mb-2">
                Click on WhatsApp button below
              </p>
              <p className="text-2xl text-gray-400 mb-4" aria-hidden>
                ↓ ↓
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#25D366] text-white font-bold shadow-lg hover:bg-[#20BD5A] transition"
              >
                WhatsApp – Click here
              </a>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .curvy-underline-path {
          stroke: #7c3aed; /* purple-600 */
          stroke-width: 3;
          fill: none;
          stroke-linecap: round;
          stroke-dasharray: 220;
          stroke-dashoffset: 220;
          animation: drawUnderline 1.2s ease-out forwards;
        }

        @keyframes drawUnderline {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F3FF] via-[#FCE7F3] to-[#DBEAFE]">
          <div className="text-purple-700 font-medium">Loading...</div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
