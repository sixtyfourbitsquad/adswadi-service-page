# Adswadi Service Page – Full Site Review (for ChatGPT)

Use this document to understand the project: what it does, how it works, tech stack, and usage. Paste it into ChatGPT when you need context or help with this codebase.

---

## 1. What This Site Does

**Adswadi Service Page** is a **digital marketing agency service catalog and payment landing page**. It lets a business (Adswadi) show its services (Meta Ads, Google Ads, Snapchat Ads, Website Development, etc.) with prices, and collect payments via **UPI** (India) with a **manual confirmation flow**: customer pays → sends screenshot on WhatsApp.

- **Public visitors** see a hero, list of services with images and prices, and buttons to “Pay” or contact on WhatsApp.
- **Paying customers** go to a payment page with UPI QR, amount, “PAY NOW” (opens UPI app), and a WhatsApp button to send the payment screenshot.
- **Admins** log in at `/admin` to edit title/subtitle, service names, images, prices, UPI ID, WhatsApp number, and to change the admin password. No database: config is stored in JSON files on the server.

So: **marketing site + service catalog + UPI payment page + admin panel**, all in one app.

---

## 2. Main User Flows

| User | Flow |
|------|------|
| **Visitor** | Opens site → sees title, subtitle, grid of services (image + price + “Pay …” or “Pay for service”) → clicks Pay → goes to `/payment?name=...&amount=...` → sees QR, PAY NOW, copy UPI ID, “Send payment screenshot on WhatsApp” → pays via UPI and sends screenshot on WhatsApp. |
| **Admin** | Goes to `/admin` → enters password → edits title/subtitle, payment (UPI ID, name, WhatsApp), each service (image URL or upload, price, amount for QR; for some services: sub-options e.g. Weekly/Monthly or Indian/International with separate Pay buttons) → can change password in admin. |

There is no user accounts, cart, or automated payment verification. Payment is “pay via UPI and confirm via WhatsApp.”

---

## 3. Tech Stack

### Frontend (Vercel)

| Tech | Role |
|------|------|
| **Next.js 14** (App Router) | React framework, `src/app/` pages and layout. |
| **React 18** | UI components, hooks. |
| **TypeScript** | Typing; types in `src/lib/types.ts`. |
| **Tailwind CSS** | Styling (gradients, cards, buttons). |
| **Client-side data** | All config and admin actions go through `fetch()` to the backend API (no server-side API routes in the frontend repo). |

### Backend (Render)

| Tech | Role |
|------|------|
| **Node.js** | Runtime. |
| **Express** | HTTP server, routes, CORS, JSON body, static files. |
| **File system** | Config in `data/config.json`, admin password in `data/admin.json`, uploads in `public/uploaded/`. |
| **qrcode** | UPI QR code generation. |
| **multer** | File upload for service poster images. |
| **dotenv** | Env vars (e.g. `ADMIN_PASSWORD`, `BACKEND_PUBLIC_URL`). |

### Deployment (free tier)

- **Frontend**: Next.js app (repo root) → **Vercel** (build: `npm run build`, no API routes).
- **Backend**: Express app in **`backend/`** → **Render** Web Service (Root Directory: `backend`, start: `npm start`).
- **Connection**: Frontend calls backend via `NEXT_PUBLIC_API_URL` (e.g. `https://your-backend.onrender.com`). All API requests and uploaded image URLs point to that origin.

---

## 4. Architecture (Split Frontend + Backend)

- **Single repo**: root = Next.js frontend, `backend/` = Express API.
- **Frontend** uses `src/lib/api.ts`: `apiPath("/api/...")` builds full backend URL; `getImageUrl(img)` resolves `/uploaded/*` to backend URL.
- **Backend** exposes:
  - `GET /api/config` – public config (title, subtitle, services, payment).
  - `GET /api/upi-qr?pa=...&pn=...&am=...` – returns PNG UPI QR.
  - `GET /api/admin/config`, `PATCH /api/admin/config` – read/update config (Bearer token = admin password).
  - `POST /api/admin/login` – body `{ password }`, returns `{ token }`.
  - `POST /api/admin/change-password` – body `{ currentPassword, newPassword }`, auth by Bearer.
  - `POST /api/admin/upload` – multipart image upload, auth by Bearer; returns `{ url }` (full URL to `/uploaded/...`).
  - `GET /uploaded/*` – static files (uploaded posters).

Config and password are read/written under `backend/data/` and `backend/public/uploaded/`. For persistence on Render, these paths can be backed by a persistent disk.

---

## 5. Data Model (Config)

Everything the site shows (except static assets) comes from **config**:

- **`title`**, **`subtitle`** – Hero text.
- **`services[]`** – Array of:
  - `id`, `name`, `slug`, `image` (URL or path),
  - Either **single price**: `price` (display, e.g. "₹9,999/month"), `amount` (number for UPI QR),
  - Or **subCategories[]**: e.g. `{ name: "Weekly", price: "₹4,999", amount: "4999" }`, `{ name: "Monthly", ... }` (or "Indian" / "International" for agency accounts). Each sub has its own “Pay …” button and amount.
- **`payment`** – `upiId`, `upiName`, `whatsappNumber` (no +), optional `qrImageUrl`.

Admin edits are saved to `data/config.json` by the backend. Admin password is in `data/admin.json` (or env `ADMIN_PASSWORD`).

---

## 6. Key Routes and Files

| Route / path | Purpose |
|--------------|--------|
| **`/`** | Home: hero + services grid. Data from `GET /api/config`. |
| **`/payment`** | Payment page: service name + amount from query; UPI QR, PAY NOW link, copy UPI ID, WhatsApp CTA. Uses same config. |
| **`/admin`** | Admin panel: login, then edit title/subtitle, payment, each service (incl. sub-options), change password. All via backend APIs. |

| File / folder | Purpose |
|----------------|--------|
| **`src/app/page.tsx`** | Home page and `ServiceCard` (single vs subCategories, Pay links). |
| **`src/app/payment/page.tsx`** | Payment UI, UPI QR img src, PAY NOW (`upi://pay?...`), WhatsApp link. |
| **`src/app/admin/page.tsx`** | Admin UI: login, config forms, change password, upload poster. |
| **`src/app/layout.tsx`** | Root layout, metadata, global CSS. |
| **`src/lib/api.ts`** | `getApiUrl()`, `apiPath()`, `getImageUrl()`, `fetchWithTimeout()`. |
| **`src/lib/types.ts`** | `Config`, `ServiceItem`, `SubCategory`, `PaymentGateway`. |
| **`backend/server.js`** | Express app: CORS, config CRUD, login, change-password, upload, UPI QR, static `/uploaded`. |
| **`backend/lib/config.js`** | `getConfig()`, `saveConfig()` (read/write `data/config.json`). |
| **`backend/lib/admin.js`** | `getAdminPassword()`, `setAdminPassword()` (env or `data/admin.json`). |
| **`data/config.json`** | Not used in production split deploy; **`backend/data/config.json`** is the one the backend reads. |

---

## 7. Usage Summary

- **Run locally (split)**: Backend: `cd backend && npm install && npm start` (e.g. port 3001). Frontend: set `NEXT_PUBLIC_API_URL=http://localhost:3001` in `.env.local`, then `npm run dev` (e.g. port 3000). Open `http://localhost:3000` and `http://localhost:3000/admin`.
- **Deploy**: Backend on Render (Root: `backend`), frontend on Vercel; set `NEXT_PUBLIC_API_URL` and `ADMIN_PASSWORD` (and optionally `BACKEND_PUBLIC_URL`) as in DEPLOYMENT-GUIDE.md.
- **Content**: Edit everything from `/admin` (title, subtitle, services, payment, password). Ensure `backend/data/config.json` exists and is valid JSON (UTF-8); if missing or invalid, `GET /api/config` returns 500 and the site can show “Application error” and `whatsappNumber` undefined errors.

---

## 8. Security and Auth

- Admin auth is **password-only**: login returns a token that is the same as the current password; frontend stores it in `localStorage` and sends `Authorization: Bearer <token>` for admin APIs. No JWT or sessions.
- Change-password updates `data/admin.json` (or env on first use). CORS is permissive (`origin: true`) so the frontend (any domain) can call the backend.

---

## 9. Summary for ChatGPT

When you paste this into ChatGPT, you can say:

- **“This is a full site review of the Adswadi Service Page project.”**
- **“It’s a Next.js frontend (Vercel) + Express backend (Render) app: service catalog, UPI payment page with QR and PAY NOW, and an admin panel. Config is in JSON files; no database.”**
- **“Use SITE-REVIEW.md for context on what the site does, usage, tech stack, and architecture.”**

That gives ChatGPT enough context to help with code, deployment, or content changes.
