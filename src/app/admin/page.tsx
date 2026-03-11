"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type {
  Config,
  HeroBanner,
  ServiceItem,
  SubCategory,
  MetaAgencyIndian,
  MetaAgencyInternational,
  MetaAgencyIndianTier,
  MetaAgencyInternationalCategory,
  GoogleAgencyWeekly,
  GoogleAgencyMonthly,
  GoogleAgencyOption,
} from "@/lib/types";
import { apiPath, fetchWithTimeout } from "@/lib/api";

const TOKEN_KEY = "adswadi_admin_token";
const CONFIG_FETCH_TIMEOUT_MS = 25000;

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Draft state – only sent to server when user clicks Save
  const [titleDraft, setTitleDraft] = useState("");
  const [subtitleDraft, setSubtitleDraft] = useState("");
  const [paymentDraft, setPaymentDraft] = useState<Config["payment"]>({
    qrImageUrl: "",
    upiId: "",
    upiName: "",
    whatsappNumber: "",
  });
  const [servicesDraft, setServicesDraft] = useState<ServiceItem[]>([]);

  const defaultMetaAgencyIndian = (): MetaAgencyIndian => ({
    tiers: [
      { dailyLimit: "5K", weekly: { price: "", amount: "" }, monthly: { price: "", amount: "" } },
      { dailyLimit: "20K", weekly: { price: "", amount: "" }, monthly: { price: "", amount: "" } },
      { dailyLimit: "30K", weekly: { price: "", amount: "" }, monthly: { price: "", amount: "" } },
    ],
    needMoreLabel: "Need more daily limit accounts?",
  });
  const defaultMetaAgencyInternational = (): MetaAgencyInternational => ({
    categories: [
      { name: "White Hat", price: "", amount: "" },
      { name: "Grey Hat", price: "", amount: "" },
      { name: "Black Hat", price: "", amount: "" },
    ],
  });
  const [metaAgencyIndianDraft, setMetaAgencyIndianDraft] = useState<MetaAgencyIndian>(defaultMetaAgencyIndian);
  const [metaAgencyInternationalDraft, setMetaAgencyInternationalDraft] = useState<MetaAgencyInternational>(defaultMetaAgencyInternational);

  const defaultGoogleAgencyWeekly = (): GoogleAgencyWeekly => ({
    indian: { price: "", amount: "" },
    international: { price: "", amount: "" },
  });
  const defaultGoogleAgencyMonthly = (): GoogleAgencyMonthly => ({
    indian: { price: "", amount: "" },
    international: { price: "", amount: "" },
  });
  const [googleAgencyWeeklyDraft, setGoogleAgencyWeeklyDraft] = useState<GoogleAgencyWeekly>(defaultGoogleAgencyWeekly);
  const [googleAgencyMonthlyDraft, setGoogleAgencyMonthlyDraft] = useState<GoogleAgencyMonthly>(defaultGoogleAgencyMonthly);

  const defaultGoogleAgencyOption = (): GoogleAgencyOption => ({ price: "", amount: "" });
  const [googleAgencyIndianDraft, setGoogleAgencyIndianDraft] = useState<GoogleAgencyOption>(defaultGoogleAgencyOption);
  const [googleAgencyInternationalDraft, setGoogleAgencyInternationalDraft] = useState<GoogleAgencyOption>(defaultGoogleAgencyOption);

  const defaultHeroBanner = (): HeroBanner => ({
    enabled: false,
    imageUrl: "",
    buttonText: "Pay Now",
    serviceName: "",
    amount: "",
  });
  const [heroBannerDraft, setHeroBannerDraft] = useState<HeroBanner>(defaultHeroBanner);
  const [heroBannerFeedback, setHeroBannerFeedback] = useState<string | null>(null);

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    setToken(t);
    setBackendError(null);
    if (!t) return;
    const url = apiPath("/api/admin/config");
    fetchWithTimeout(
      url,
      { headers: { Authorization: `Bearer ${t}` } },
      CONFIG_FETCH_TIMEOUT_MS
    )
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Unauthorized"))))
      .then((data: Config) => {
        setConfig(data);
        setTitleDraft(data.title);
        setSubtitleDraft(data.subtitle);
        setPaymentDraft(data.payment);
        setServicesDraft(JSON.parse(JSON.stringify(data.services)));
        setMetaAgencyIndianDraft(
          data.metaAgencyIndian?.tiers?.length
            ? JSON.parse(JSON.stringify(data.metaAgencyIndian))
            : defaultMetaAgencyIndian()
        );
        setMetaAgencyInternationalDraft(
          data.metaAgencyInternational?.categories?.length
            ? JSON.parse(JSON.stringify(data.metaAgencyInternational))
            : defaultMetaAgencyInternational()
        );
        setGoogleAgencyWeeklyDraft(
          data.googleAgencyWeekly
            ? JSON.parse(JSON.stringify(data.googleAgencyWeekly))
            : defaultGoogleAgencyWeekly()
        );
        setGoogleAgencyMonthlyDraft(
          data.googleAgencyMonthly
            ? JSON.parse(JSON.stringify(data.googleAgencyMonthly))
            : defaultGoogleAgencyMonthly()
        );
        setGoogleAgencyIndianDraft(
          data.googleAgencyIndian
            ? JSON.parse(JSON.stringify(data.googleAgencyIndian))
            : defaultGoogleAgencyOption()
        );
        setGoogleAgencyInternationalDraft(
          data.googleAgencyInternational
            ? JSON.parse(JSON.stringify(data.googleAgencyInternational))
            : defaultGoogleAgencyOption()
        );
        setHeroBannerDraft(
          data.heroBanner?.enabled
            ? JSON.parse(JSON.stringify(data.heroBanner))
            : {
                enabled: false,
                imageUrl: data.heroBanner?.imageUrl ?? "",
                buttonText: data.heroBanner?.buttonText ?? "Pay Now",
                serviceName: data.heroBanner?.serviceName ?? "",
                amount: data.heroBanner?.amount ?? "",
              }
        );
      })
      .catch((err) => {
        setToken(null);
        localStorage.removeItem(TOKEN_KEY);
        const isTimeout = err?.name === "AbortError";
        setBackendError(
          isTimeout
            ? "Backend took too long (Render may be waking up — wait 1 min and try again)."
            : "Could not reach backend. Set NEXT_PUBLIC_API_URL on Vercel to your Render URL (e.g. https://your-app.onrender.com)."
        );
      });
  }, []);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const saveToServer = async (payload: Partial<Config>): Promise<Config | null> => {
    if (!token) return null;
    const res = await fetch(apiPath("/api/admin/config"), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Save failed");
    return res.json();
  };

  const handleSaveTitle = async () => {
    try {
      const data = await saveToServer({ title: titleDraft, subtitle: subtitleDraft });
      if (data) {
        setConfig(data);
        showMessage("success", "Title & subtitle saved.");
      }
    } catch {
      showMessage("error", "Failed to save.");
    }
  };

  const handleSavePayment = async () => {
    if (!config) return;
    try {
      const data = await saveToServer({ payment: paymentDraft });
      if (data) {
        setConfig(data);
        setPaymentDraft(data.payment);
        showMessage("success", "Payment settings saved.");
      }
    } catch {
      showMessage("error", "Failed to save.");
    }
  };

  const handleSaveService = async (index: number) => {
    const next = [...servicesDraft];
    try {
      const data = await saveToServer({ services: next });
      if (data) {
        setConfig(data);
        setServicesDraft(JSON.parse(JSON.stringify(data.services)));
        showMessage("success", `${next[index].name} saved.`);
      }
    } catch {
      showMessage("error", "Failed to save.");
    }
  };

  const updateServiceDraft = (index: number, updates: Partial<ServiceItem>) => {
    const next = [...servicesDraft];
    next[index] = { ...next[index], ...updates };
    setServicesDraft(next);
  };

  const updateSubCategoryDraft = (
    serviceIndex: number,
    subIndex: number,
    field: keyof SubCategory,
    value: string
  ) => {
    const next = [...servicesDraft];
    const svc = { ...next[serviceIndex] };
    const subs = [...(svc.subCategories || [])];
    subs[subIndex] = { ...subs[subIndex], [field]: value };
    svc.subCategories = subs;
    next[serviceIndex] = svc;
    setServicesDraft(next);
  };

  const handleSaveMetaAgencyIndian = async () => {
    try {
      const data = await saveToServer({ metaAgencyIndian: metaAgencyIndianDraft });
      if (data) {
        setConfig(data);
        if (data.metaAgencyIndian) setMetaAgencyIndianDraft(JSON.parse(JSON.stringify(data.metaAgencyIndian)));
        showMessage("success", "Meta Agency Indian saved.");
      }
    } catch {
      showMessage("error", "Failed to save.");
    }
  };

  const handleSaveMetaAgencyInternational = async () => {
    try {
      const data = await saveToServer({ metaAgencyInternational: metaAgencyInternationalDraft });
      if (data) {
        setConfig(data);
        if (data.metaAgencyInternational) setMetaAgencyInternationalDraft(JSON.parse(JSON.stringify(data.metaAgencyInternational)));
        showMessage("success", "Meta Agency International saved.");
      }
    } catch {
      showMessage("error", "Failed to save.");
    }
  };

  const updateMetaAgencyIndianTier = (tierIndex: number, field: "dailyLimit" | "weekly" | "monthly", subField: string, value: string) => {
    const next = JSON.parse(JSON.stringify(metaAgencyIndianDraft));
    const tier = next.tiers[tierIndex] as MetaAgencyIndianTier;
    if (field === "dailyLimit") tier.dailyLimit = value;
    else if (field === "weekly") (tier.weekly as Record<string, string>)[subField] = value;
    else if (field === "monthly") (tier.monthly as Record<string, string>)[subField] = value;
    setMetaAgencyIndianDraft(next);
  };

  const updateMetaAgencyInternationalCategory = (catIndex: number, field: keyof MetaAgencyInternationalCategory, value: string) => {
    const next = JSON.parse(JSON.stringify(metaAgencyInternationalDraft));
    next.categories[catIndex] = { ...next.categories[catIndex], [field]: value };
    setMetaAgencyInternationalDraft(next);
  };

  const handleSaveGoogleAgencyWeekly = async () => {
    try {
      const data = await saveToServer({ googleAgencyWeekly: googleAgencyWeeklyDraft });
      if (data) {
        setConfig(data);
        if (data.googleAgencyWeekly) setGoogleAgencyWeeklyDraft(JSON.parse(JSON.stringify(data.googleAgencyWeekly)));
        showMessage("success", "Google Agency Weekly saved.");
      }
    } catch {
      showMessage("error", "Failed to save.");
    }
  };

  const handleSaveGoogleAgencyMonthly = async () => {
    try {
      const data = await saveToServer({ googleAgencyMonthly: googleAgencyMonthlyDraft });
      if (data) {
        setConfig(data);
        if (data.googleAgencyMonthly) setGoogleAgencyMonthlyDraft(JSON.parse(JSON.stringify(data.googleAgencyMonthly)));
        showMessage("success", "Google Agency Monthly saved.");
      }
    } catch {
      showMessage("error", "Failed to save.");
    }
  };

  const handleAddHeroBanner = async () => {
    try {
      const payload: HeroBanner = {
        enabled: true,
        imageUrl: "",
        buttonText: "Pay Now",
        serviceName: "",
        amount: "",
      };
      const data = await saveToServer({ heroBanner: payload });
      if (data) {
        setConfig(data);
        setHeroBannerDraft({ ...payload });
        showMessage("success", "Banner added. Add an image and save to show it.");
      }
    } catch {
      showMessage("error", "Failed to add banner.");
    }
  };

  const handleSaveHeroBanner = async () => {
    setHeroBannerFeedback(null);
    try {
      const payload: HeroBanner = {
        enabled: true,
        imageUrl: heroBannerDraft.imageUrl,
        buttonText: heroBannerDraft.buttonText || "Pay Now",
        serviceName: heroBannerDraft.serviceName || "",
        amount: heroBannerDraft.amount || "",
      };
      const data = await saveToServer({ heroBanner: payload });
      if (data) {
        setConfig(data);
        setHeroBannerDraft(JSON.parse(JSON.stringify(data.heroBanner || payload)));
        setHeroBannerFeedback("Banner saved successfully.");
        setTimeout(() => setHeroBannerFeedback(null), 4000);
      }
    } catch {
      setHeroBannerFeedback("Failed to save banner.");
      setTimeout(() => setHeroBannerFeedback(null), 4000);
    }
  };

  const handleDeleteHeroBanner = async () => {
    try {
      const payload: HeroBanner = {
        enabled: false,
        imageUrl: "",
        buttonText: "Pay Now",
        serviceName: "",
        amount: "",
      };
      const data = await saveToServer({ heroBanner: payload });
      if (data) {
        setConfig(data);
        setHeroBannerDraft(defaultHeroBanner());
        showMessage("success", "Banner removed.");
      }
    } catch {
      showMessage("error", "Failed to remove banner.");
    }
  };

  const handleSaveGoogleAgencyDirect = async () => {
    try {
      const data = await saveToServer({
        googleAgencyIndian: googleAgencyIndianDraft,
        googleAgencyInternational: googleAgencyInternationalDraft,
      });
      if (data) {
        setConfig(data);
        if (data.googleAgencyIndian) setGoogleAgencyIndianDraft(JSON.parse(JSON.stringify(data.googleAgencyIndian)));
        if (data.googleAgencyInternational) setGoogleAgencyInternationalDraft(JSON.parse(JSON.stringify(data.googleAgencyInternational)));
        showMessage("success", "Google Agency (Indian & International) saved.");
      }
    } catch {
      showMessage("error", "Failed to save.");
    }
  };

  const updateGoogleAgencyOption = (
    which: "weekly" | "monthly",
    region: "indian" | "international",
    field: "price" | "amount",
    value: string
  ) => {
    if (which === "weekly") {
      setGoogleAgencyWeeklyDraft((d) => ({
        ...d,
        [region]: { ...d[region], [field]: value },
      }));
    } else {
      setGoogleAgencyMonthlyDraft((d) => ({
        ...d,
        [region]: { ...d[region], [field]: value },
      }));
    }
  };

  if (token === null && !config) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 py-8">
        {backendError && (
          <div className="mb-6 max-w-md rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {backendError}
            <p className="mt-2 text-amber-700">
              After fixing, click below to try again.
            </p>
            <button
              type="button"
              onClick={() => setBackendError(null)}
              className="mt-3 text-sm font-medium text-amber-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}
        <LoginForm
          onSuccess={(t) => {
            setBackendError(null);
            localStorage.setItem(TOKEN_KEY, t);
            setToken(t);
            router.refresh();
          }}
        />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 sm:py-8 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-6 sm:mb-8 flex-wrap gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Panel</h1>
          <div className="flex items-center gap-4 flex-wrap">
            {message && (
              <span
                className={`text-sm font-medium ${message.type === "success" ? "text-green-600" : "text-red-600"}`}
              >
                {message.text}
              </span>
            )}
            <a href="/" className="text-purple-600 hover:underline font-medium">
              View site
            </a>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(TOKEN_KEY);
                setToken(null);
                setConfig(null);
              }}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Title & Subtitle */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Page title & subtitle</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Title</label>
              <input
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Subtitle</label>
              <input
                type="text"
                value={subtitleDraft}
                onChange={(e) => setSubtitleDraft(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <SaveButton onClick={handleSaveTitle} label="Save title & subtitle" />
          </div>
        </section>

        {/* Payment gateway */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-1">Payment gateway (UPI)</h2>
          <p className="text-sm text-gray-500 mb-4">QR is generated from UPI ID and service amount. No upload needed.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">UPI ID</label>
              <input
                type="text"
                placeholder="name@upi"
                value={paymentDraft.upiId}
                onChange={(e) => setPaymentDraft((p) => ({ ...p, upiId: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">UPI name</label>
              <input
                type="text"
                value={paymentDraft.upiName}
                onChange={(e) => setPaymentDraft((p) => ({ ...p, upiName: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">WhatsApp number (country code, no +)</label>
              <input
                type="text"
                placeholder="919876543210"
                value={paymentDraft.whatsappNumber}
                onChange={(e) => setPaymentDraft((p) => ({ ...p, whatsappNumber: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <SaveButton onClick={handleSavePayment} label="Save payment settings" />
          </div>
        </section>

        {/* Hero Banner & Pay Now */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-1">Hero Banner & Pay Now Button</h2>
          <p className="text-sm text-gray-500 mb-4">
            Optional banner and &quot;Pay Now&quot; button between the subtitle and Our Services. Toggle on/off or remove completely.
          </p>
          {config.heroBanner?.enabled ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Banner image URL</label>
                <input
                  type="text"
                  placeholder="https://... or /uploaded/filename.png"
                  value={heroBannerDraft.imageUrl}
                  onChange={(e) => setHeroBannerDraft((d) => ({ ...d, imageUrl: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <UploadPoster
                  serviceName="hero-banner"
                  onUploaded={(url) => setHeroBannerDraft((d) => ({ ...d, imageUrl: url }))}
                  token={token}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Button text</label>
                <input
                  type="text"
                  placeholder="Pay Now"
                  value={heroBannerDraft.buttonText}
                  onChange={(e) => setHeroBannerDraft((d) => ({ ...d, buttonText: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Service/Product name (shows on payment page)</label>
                <input
                  type="text"
                  placeholder="e.g. Banner Special Offer"
                  value={heroBannerDraft.serviceName}
                  onChange={(e) => setHeroBannerDraft((d) => ({ ...d, serviceName: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Amount for payment QR (e.g. 9999)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Amount in rupees"
                  value={heroBannerDraft.amount}
                  onChange={(e) => setHeroBannerDraft((d) => ({ ...d, amount: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <SaveButton onClick={handleSaveHeroBanner} label="Save banner" />
                <button
                  type="button"
                  onClick={handleDeleteHeroBanner}
                  className="px-4 py-2 rounded-lg border border-red-300 bg-red-50 text-red-700 font-medium hover:bg-red-100 transition"
                >
                  Remove banner
                </button>
                {heroBannerFeedback && (
                  <span
                    className={`text-sm font-medium ${heroBannerFeedback.startsWith("Banner saved") ? "text-green-600" : "text-red-600"}`}
                  >
                    {heroBannerFeedback}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={handleAddHeroBanner}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition"
              >
                Add Banner & Pay Now Button
              </button>
              <p className="mt-2 text-sm text-gray-500">Banner will appear between the subtitle and Our Services.</p>
            </div>
          )}
        </section>

        {/* Change password */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <ChangePasswordForm
            token={token}
            onSuccess={(newToken) => {
              localStorage.setItem(TOKEN_KEY, newToken);
              setToken(newToken);
              showMessage("success", "Password changed. You are still logged in.");
            }}
            onError={(text) => showMessage("error", text)}
          />
        </section>

        {/* Meta Agency detail pages */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Meta Agency detail pages</h2>
          <p className="text-sm text-gray-500 mb-6">
            When visitors click &quot;Meta Agency Ads Account&quot; on the home page, they choose Indian or International. Edit prices and amounts for each page below.
          </p>

          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="font-medium text-gray-800">Indian Meta Agency (Daily limit 5K / 20K / 30K)</h3>
                <SaveButton onClick={handleSaveMetaAgencyIndian} label="Save Indian" />
              </div>
              <div className="mb-3">
                <label className="block text-sm text-gray-600 mb-1">Text above WhatsApp button</label>
                <input
                  type="text"
                  value={metaAgencyIndianDraft.needMoreLabel ?? ""}
                  onChange={(e) => setMetaAgencyIndianDraft((d) => ({ ...d, needMoreLabel: e.target.value }))}
                  placeholder="Need more daily limit accounts?"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-4">
                {metaAgencyIndianDraft.tiers.map((tier, tierIdx) => (
                  <div key={tierIdx} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                    <div className="mb-3">
                      <span className="text-xs text-gray-500 block">Daily limit label</span>
                      <input
                        type="text"
                        value={tier.dailyLimit}
                        onChange={(e) => updateMetaAgencyIndianTier(tierIdx, "dailyLimit", "", e.target.value)}
                        placeholder="5K"
                        className="w-20 border border-gray-300 rounded px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Weekly – display price</span>
                        <input
                          type="text"
                          value={tier.weekly.price}
                          onChange={(e) => updateMetaAgencyIndianTier(tierIdx, "weekly", "price", e.target.value)}
                          placeholder="₹X,XXX"
                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                        />
                        <span className="text-xs text-gray-500 block mt-1">Amount for QR</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={tier.weekly.amount ?? ""}
                          onChange={(e) => updateMetaAgencyIndianTier(tierIdx, "weekly", "amount", e.target.value)}
                          placeholder="4999"
                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Monthly – display price</span>
                        <input
                          type="text"
                          value={tier.monthly.price}
                          onChange={(e) => updateMetaAgencyIndianTier(tierIdx, "monthly", "price", e.target.value)}
                          placeholder="₹X,XXX"
                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                        />
                        <span className="text-xs text-gray-500 block mt-1">Amount for QR</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={tier.monthly.amount ?? ""}
                          onChange={(e) => updateMetaAgencyIndianTier(tierIdx, "monthly", "amount", e.target.value)}
                          placeholder="9999"
                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="font-medium text-gray-800">International Meta Agency (White Hat / Grey Hat / Black Hat)</h3>
                <SaveButton onClick={handleSaveMetaAgencyInternational} label="Save International" />
              </div>
              <div className="space-y-3">
                {metaAgencyInternationalDraft.categories.map((cat, catIdx) => (
                  <div key={catIdx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-gray-50/50 rounded-lg border border-gray-200">
                    <div>
                      <span className="text-xs text-gray-500 block">Name</span>
                      <input
                        type="text"
                        value={cat.name}
                        onChange={(e) => updateMetaAgencyInternationalCategory(catIdx, "name", e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">Display price</span>
                      <input
                        type="text"
                        value={cat.price}
                        onChange={(e) => updateMetaAgencyInternationalCategory(catIdx, "price", e.target.value)}
                        placeholder="₹X,XXX"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">Amount for QR</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cat.amount ?? ""}
                        onChange={(e) => updateMetaAgencyInternationalCategory(catIdx, "amount", e.target.value)}
                        placeholder="9999"
                        className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Google Agency Ads Account – Indian & International (direct to payment) */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Google Agency Ads Account</h2>
          <p className="text-sm text-gray-500 mb-6">
            Two buttons on the card: &quot;Indian Agency Ads Account&quot; and &quot;International Agency Ads Account&quot;. Each goes directly to the payment page with the amount you set below.
          </p>
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="font-medium text-gray-800">Set price and amount for each option</span>
            <SaveButton onClick={handleSaveGoogleAgencyDirect} label="Save" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
              <span className="text-sm font-medium text-gray-700 block mb-2">Indian Agency Ads Account</span>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Display price (e.g. ₹X,XXX)"
                  value={googleAgencyIndianDraft.price}
                  onChange={(e) => setGoogleAgencyIndianDraft((d) => ({ ...d, price: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Amount for payment QR"
                  value={googleAgencyIndianDraft.amount ?? ""}
                  onChange={(e) => setGoogleAgencyIndianDraft((d) => ({ ...d, amount: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                />
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
              <span className="text-sm font-medium text-gray-700 block mb-2">International Agency Ads Account</span>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Display price (e.g. ₹X,XXX)"
                  value={googleAgencyInternationalDraft.price}
                  onChange={(e) => setGoogleAgencyInternationalDraft((d) => ({ ...d, price: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Amount for payment QR"
                  value={googleAgencyInternationalDraft.amount ?? ""}
                  onChange={(e) => setGoogleAgencyInternationalDraft((d) => ({ ...d, amount: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Services (poster, price & amount for QR)</h2>
          <div className="space-y-6">
            {servicesDraft.map((svc, idx) => (
              <ServiceCard
                key={svc.id}
                service={svc}
                index={idx}
                token={token}
                onUpdate={(updates) => updateServiceDraft(idx, updates)}
                onUpdateSub={(subIdx, field, value) => updateSubCategoryDraft(idx, subIdx, field, value)}
                onSave={() => handleSaveService(idx)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SaveButton({ onClick, label }: { onClick: () => void | Promise<void>; label: string }) {
  const [saving, setSaving] = useState(false);
  const handleClick = async () => {
    setSaving(true);
    try {
      await Promise.resolve(onClick());
    } finally {
      setSaving(false);
    }
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={saving}
      className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
    >
      {saving ? "Saving..." : label}
    </button>
  );
}

function ServiceCard({
  service,
  index,
  token,
  onUpdate,
  onUpdateSub,
  onSave,
}: {
  service: ServiceItem;
  index: number;
  token: string | null;
  onUpdate: (u: Partial<ServiceItem>) => void;
  onUpdateSub: (subIdx: number, field: keyof SubCategory, value: string) => void;
  onSave: () => void;
}) {
  const hasSubCategories = service.subCategories && service.subCategories.length > 0;
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="font-medium text-gray-800">{service.name}</h3>
        <SaveButton onClick={onSave} label="Save" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Poster image URL</label>
          <input
            type="text"
            value={service.image}
            onChange={(e) => onUpdate({ image: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <UploadPoster
            serviceName={service.slug}
            onUploaded={(url) => onUpdate({ image: url })}
            token={token}
          />
        </div>
        {hasSubCategories ? (
          <div className="space-y-3">
            <span className="block text-sm text-gray-600 mb-2">Weekly / Monthly</span>
            {service.subCategories!.map((sub, subIdx) => (
              <div key={sub.name} className="grid grid-cols-2 gap-2 p-2 bg-white rounded border border-gray-200">
                <span className="text-sm font-medium col-span-2">{sub.name}</span>
                <div>
                  <span className="text-xs text-gray-500 block">Display price</span>
                  <input
                    type="text"
                    value={sub.price}
                    onChange={(e) => onUpdateSub(subIdx, "price", e.target.value)}
                    placeholder="₹4,999"
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Amount for QR</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={sub.amount ?? ""}
                    onChange={(e) => onUpdateSub(subIdx, "amount", e.target.value)}
                    placeholder="4999"
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Display price</label>
              <input
                type="text"
                value={service.price || ""}
                onChange={(e) => onUpdate({ price: e.target.value })}
                placeholder="₹9,999/month"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Amount for payment QR</label>
              <input
                type="text"
                inputMode="numeric"
                value={service.amount ?? ""}
                onChange={(e) => onUpdate({ amount: e.target.value })}
                placeholder="9999"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChangePasswordForm({
  token,
  onSuccess,
  onError,
}: {
  token: string | null;
  onSuccess: (newToken: string) => void;
  onError: (message: string) => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (newPassword.length < 4) {
      onError("New password must be at least 4 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      onError("New password and confirmation do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(apiPath("/api/admin/change-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error || "Failed to change password.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onSuccess(newPassword);
    } catch {
      onError("Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="font-semibold text-gray-900 mb-1">Change admin password</h2>
      <p className="text-sm text-gray-500 mb-4">
        Set a new password to log in to the admin panel. Minimum 4 characters.
      </p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Current password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            minLength={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Confirm new password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            minLength={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {loading ? "Updating..." : "Change password"}
        </button>
      </div>
    </form>
  );
}

function LoginForm({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const url = apiPath("/api/admin/login");
    if (!url.startsWith("http") && !url.startsWith("//")) {
      setError("NEXT_PUBLIC_API_URL is not set on Vercel. Set it to your Render backend URL (e.g. https://your-app.onrender.com).");
      setLoading(false);
      return;
    }
    fetchWithTimeout(
      url,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      },
      20000
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.token) onSuccess(data.token);
        else setError(data.error || "Invalid password");
      })
      .catch((err) => {
        setError(
          err?.name === "AbortError"
            ? "Backend took too long. Render may be waking up — try again in 30 seconds."
            : "Cannot reach backend. Check NEXT_PUBLIC_API_URL on Vercel (your Render URL)."
        );
      })
      .finally(() => setLoading(false));
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Admin login</h2>
      <p className="text-gray-500 text-sm mb-4">Enter password to edit services and payment.</p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-purple-500"
        autoFocus
      />
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-60"
      >
        {loading ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}

function UploadPoster({
  serviceName,
  onUploaded,
  token,
}: {
  serviceName: string;
  onUploaded: (url: string) => void;
  token: string | null;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("name", serviceName);
    try {
      const res = await fetch(apiPath("/api/admin/upload"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (data.url) onUploaded(data.url);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="mt-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={upload}
        disabled={uploading}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-xs text-purple-600 hover:underline font-medium"
      >
        {uploading ? "Uploading..." : "Upload new poster"}
      </button>
    </div>
  );
}
