"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Config, ServiceItem } from "@/lib/types";

export default function ServicePage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/config")
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
        <div className="text-red-600">Failed to load services.</div>
      </div>
    );
  }

  const whatsappUrl = config.payment.whatsappNumber
    ? `https://wa.me/${config.payment.whatsappNumber.replace(/\D/g, "")}`
    : "#";

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#F5F3FF] via-[#EDE9FE] to-[#DBEAFE]">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pt-12 pb-16 md:pt-20 md:pb-24">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#F5F3FF_0%,#EDE9FE_25%,#FCE7F3_50%,#DBEAFE_100%)] opacity-90" />
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-block">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-2">
                {config.title.includes(" from ") ? (
                  <>
                    <span className="bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
                      {config.title.split(" from ")[0]}
                    </span>
                    {" "}
                    <span className="text-[#EC4899]">
                      {config.title.split(" from ")[1]}
                    </span>
                  </>
                ) : (
                  <span className="bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
                    {config.title}
                  </span>
                )}
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
            <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto mb-8 mt-6">
              {config.subtitle}
            </p>
          </div>
        </section>

        {/* Services grid */}
        <section className="relative px-4 pb-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-10">
              Our Services
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {config.services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  payPath="/payment"
                />
              ))}
            </div>
          </div>
        </section>

        {/* WhatsApp CTA strip */}
        <section className="px-4 py-8 bg-white/60 border-t border-purple-100">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-gray-600 mb-4">
              Send your payment screenshot directly on WhatsApp
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] text-white font-semibold shadow-lg hover:bg-[#20BD5A] transition"
            >
              WhatsApp – Click here
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white/80 px-4 py-10">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-8 sm:gap-12 justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Company</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="https://adswadi.com/" target="_blank" rel="noopener noreferrer" className="hover:text-purple-600 hover:underline">
                    Home
                  </a>
                </li>
                <li>
                  <a href="https://adswadi.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-purple-600 hover:underline">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="https://adswadi.com/refund-policy" target="_blank" rel="noopener noreferrer" className="hover:text-purple-600 hover:underline">
                    Refund Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="mailto:adswadiofficial@gmail.com" className="hover:text-purple-600 hover:underline">
                    adswadiofficial@gmail.com
                  </a>
                </li>
                <li>
                  <a href="tel:+918678830021" className="hover:text-purple-600 hover:underline">
                    +91 8678830021
                  </a>
                </li>
                <li>Ranchi, India</li>
              </ul>
            </div>
          </div>
        </footer>
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

function ServiceCard({
  service,
  payPath,
}: {
  service: ServiceItem;
  payPath: string;
}) {
  const hasSubCategories = service.subCategories && service.subCategories.length > 0;
  const displayPrice = hasSubCategories
    ? null
    : service.price;

  const buildPayHref = (label: string, amount: string | undefined) => {
    const name = hasSubCategories ? `${service.name} – ${label}` : service.name;
    const params = `service=${encodeURIComponent(service.slug)}&name=${encodeURIComponent(name)}`;
    return amount && amount.trim() ? `${payPath}?${params}&amount=${encodeURIComponent(amount.trim())}` : `${payPath}?${params}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="aspect-video bg-gray-100 relative">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 sm:p-5">
        <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">{service.name}</h3>
        {hasSubCategories ? (
          <>
            <ul className="space-y-1 mb-3 sm:mb-4">
              {service.subCategories!.map((sub) => (
                <li key={sub.name} className="text-gray-600 text-xs sm:text-sm flex justify-between">
                  <span>{sub.name}</span>
                  <span className="font-medium text-purple-700">{sub.price}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2">
              {service.subCategories!.map((sub) => (
                <Link
                  key={sub.name}
                  href={buildPayHref(sub.name, sub.amount)}
                  className="block text-center py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl font-medium border-2 border-purple-500 text-purple-700 hover:bg-purple-50 transition text-sm sm:text-base"
                >
                  Pay {sub.name}
                </Link>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-purple-700 font-medium text-sm sm:text-base mb-3 sm:mb-4">{displayPrice}</p>
            <Link
              href={buildPayHref(service.name, service.amount)}
              className="block text-center py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl font-medium border-2 border-purple-500 text-purple-700 hover:bg-purple-50 transition text-sm sm:text-base"
            >
              Pay for service
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
