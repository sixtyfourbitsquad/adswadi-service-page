"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Config, ServiceItem } from "@/lib/types";
import { apiPath, getImageUrl, fetchWithTimeout } from "@/lib/api";

export default function ServicePage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = apiPath("/api/config");
    fetchWithTimeout(url, {}, 25000)
      .then((r) => {
        if (!r.ok) throw new Error("Config failed");
        return r.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.services)) {
          setConfig(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F3FF] via-[#FCE7F3] to-[#DBEAFE]">
        <div className="font-semibold text-gradient-brand">Loading...</div>
      </div>
    );
  }

  if (!config || !Array.isArray(config.services)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#F5F3FF] via-[#FCE7F3] to-[#DBEAFE] px-4 gap-4">
        <p className="text-red-600 text-center font-medium">Failed to load services. Check your connection and try again.</p>
        <a href="/" className="btn-outline text-sm py-2 px-4">Retry</a>
      </div>
    );
  }

  const payment = config?.payment;
  const whatsappUrl = payment?.whatsappNumber
    ? `https://wa.me/${payment.whatsappNumber.replace(/\D/g, "")}`
    : "#";

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#F5F3FF] via-[#EDE9FE] to-[#DBEAFE]">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 sm:px-6 pt-10 pb-14 sm:pt-14 sm:pb-18 md:pt-20 md:pb-24">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#F5F3FF_0%,#EDE9FE_25%,#FCE7F3_50%,#DBEAFE_100%)] opacity-90" />
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-block">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-2 px-1">
                {config.title.includes(" from ") ? (
                  <>
                    <span className="text-gradient-brand">
                      {config.title.split(" from ")[0]}
                    </span>
                    {" "}
                    <span className="text-gradient-accent">
                      {config.title.split(" from ")[1]}
                    </span>
                  </>
                ) : (
                  <span className="text-gradient-brand">
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
            <p className="text-gray-600 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 mt-4 sm:mt-6 px-1">
              {config.subtitle}
            </p>
          </div>
        </section>

        {/* Services grid */}
        <section className="relative px-4 sm:px-6 pb-16 sm:pb-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-semibold text-gradient-brand text-center mb-8 sm:mb-10">
              Our Services
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
              {config.services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  payPath="/payment"
                  config={config}
                />
              ))}
            </div>
          </div>
        </section>

        {/* WhatsApp CTA strip */}
        <section className="px-4 sm:px-6 py-6 sm:py-8 bg-white/60 border-t border-purple-100">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-gray-600 mb-4">
              Send your payment screenshot directly on WhatsApp
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp gap-2 w-full sm:w-auto"
            >
              WhatsApp – Click here
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white/80 px-4 sm:px-6 py-8 sm:py-10">
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

const META_AGENCY_SLUG = "meta-agency-ads-account";
const GOOGLE_AGENCY_SLUG = "google-agency-ads-account";

function ServiceCard({
  service,
  payPath,
  config,
}: {
  service: ServiceItem;
  payPath: string;
  config: Config;
}) {
  const isMetaAgency = service.slug === META_AGENCY_SLUG;
  const isGoogleAgency = service.slug === GOOGLE_AGENCY_SLUG;
  const hasSubCategories = !isMetaAgency && !isGoogleAgency && service.subCategories && service.subCategories.length > 0;
  const displayPrice = hasSubCategories
    ? null
    : service.price;

  const buildPayHref = (label: string, amount: string | undefined) => {
    const name = hasSubCategories ? `${service.name} – ${label}` : service.name;
    const params = `service=${encodeURIComponent(service.slug)}&name=${encodeURIComponent(name)}`;
    return amount && amount.trim() ? `${payPath}?${params}&amount=${encodeURIComponent(amount.trim())}` : `${payPath}?${params}`;
  };

  const googleIndian = config?.googleAgencyIndian;
  const googleInternational = config?.googleAgencyInternational;
  const googleIndianPayHref = buildPayHref("Indian Agency Ads Account", googleIndian?.amount);
  const googleInternationalPayHref = buildPayHref("International Agency Ads Account", googleInternational?.amount);

  const imageUrl = getImageUrl(service.image);
  const [imgError, setImgError] = useState(false);
  const showPlaceholder = !imageUrl || imgError;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg overflow-hidden border border-gray-100 hover:shadow-lg sm:hover:shadow-xl transition-shadow">
      <div className="aspect-video bg-gray-100 relative flex items-center justify-center overflow-hidden">
        {showPlaceholder ? (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
            <span className="text-4xl font-bold text-purple-300 select-none" aria-hidden>
              {service.name.charAt(0)}
            </span>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <div className="p-3 sm:p-5">
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg mb-2 line-clamp-2 min-h-[2.5em]">{service.name}</h3>
        {isMetaAgency ? (
          <div className="flex flex-col gap-3">
            <Link href="/service/meta-agency/indian" className="btn-outline w-full text-center">
              Indian Agency Ads Account
            </Link>
            <Link href="/service/meta-agency/international" className="btn-outline w-full text-center">
              International Agency Ads Account
            </Link>
          </div>
        ) : isGoogleAgency ? (
          <div className="flex flex-col gap-3">
            <Link href={googleIndianPayHref} className="btn-outline w-full text-center">
              Indian Agency Ads Account
            </Link>
            <Link href={googleInternationalPayHref} className="btn-outline w-full text-center">
              International Agency Ads Account
            </Link>
          </div>
        ) : hasSubCategories ? (
          <>
            <ul className="space-y-1 mb-3 sm:mb-4">
              {service.subCategories!.map((sub) => (
                <li key={sub.name} className="text-gray-600 text-xs sm:text-sm flex justify-between">
                  <span>{sub.name}</span>
                  <span className="font-semibold text-gradient-brand">{sub.price}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3">
              {service.subCategories!.map((sub) => (
                <Link
                  key={sub.name}
                  href={buildPayHref(sub.name, sub.amount)}
                  className="btn-outline w-full text-center"
                >
                  Pay {sub.name}
                </Link>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="font-semibold text-gradient-brand text-sm sm:text-base mb-3 sm:mb-4">{displayPrice}</p>
            <Link href={buildPayHref(service.name, service.amount)} className="btn-outline w-full text-center">
              Pay for service
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
