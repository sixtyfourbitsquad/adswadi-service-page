"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Config, ServiceItem, SubCategory } from "@/lib/types";

const TOKEN_KEY = "adswadi_admin_token";

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
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

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    setToken(t);
    if (!t) return;
    fetch("/api/admin/config", {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Config) => {
        setConfig(data);
        setTitleDraft(data.title);
        setSubtitleDraft(data.subtitle);
        setPaymentDraft(data.payment);
        setServicesDraft(JSON.parse(JSON.stringify(data.services)));
      })
      .catch(() => setToken(null));
  }, []);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const saveToServer = async (payload: Partial<Config>): Promise<Config | null> => {
    if (!token) return null;
    const res = await fetch("/api/admin/config", {
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

  if (token === null && !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <LoginForm
          onSuccess={(t) => {
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
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
      const res = await fetch("/api/admin/change-password", {
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.token) onSuccess(data.token);
        else setError(data.error || "Invalid");
      })
      .catch(() => setError("Request failed"));
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
        className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition"
      >
        Log in
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
      const res = await fetch("/api/admin/upload", {
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
