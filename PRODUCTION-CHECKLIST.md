# Production checklist

Summary of what’s in place for production and what you should do before go-live.

---

## Structure

- **Frontend**: Next.js 14 (App Router), single repo with `backend/` for API.
- **Config**: `backend/data/config.json` (and optional `backend/data/admin.json` for password). No DB.
- **Deploy**: Frontend on Vercel, backend on Render; set `NEXT_PUBLIC_API_URL` and `ADMIN_PASSWORD`.

---

## Security (implemented)

### Backend

- **Headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy`.
- **Body limit**: JSON payloads limited to 256KB.
- **Upload**: Only image MIME types (JPEG, PNG, WebP, GIF); max 5MB; filename sanitized.
- **Config PATCH**: Validates shape (title/subtitle strings, services array, payment object); rejects invalid payloads.
- **Login**: Accepts only string password; 401 on invalid.
- **404**: Unknown routes return JSON `{ error: "Not found" }`.

### Frontend

- **Config**: Safe access to `config?.payment` and `config?.services`; no crash if backend returns partial data.
- **Payment amount**: Validates before displaying; invalid `amount` query param does not break the page.

---

## Devices and UX

- **Viewport**: `device-width`, `initialScale: 1`, `maximumScale: 5`, `themeColor` for mobile.
- **Safe area**: Body padding uses `env(safe-area-inset-*)` for notched devices.
- **Min width**: Body `min-w-[280px]` to avoid overflow on very small screens.
- **Images**: Service card images use `loading="lazy"` and `decoding="async"`; placeholder on error or empty URL.
- **Metadata**: OpenGraph title/description for sharing.

---

## Before go-live

1. **Env**
   - Backend (Render): `ADMIN_PASSWORD` (strong), `BACKEND_PUBLIC_URL` (your Render URL).
   - Frontend (Vercel): `NEXT_PUBLIC_API_URL` (your Render backend URL).

2. **Admin**
   - Change default password after first login.
   - Set UPI ID, UPI name, WhatsApp number in Admin.

3. **Optional**
   - Restrict CORS to your frontend origin(s) instead of `origin: true` if you want to lock down the API.
   - Add rate limiting (e.g. `express-rate-limit`) on `/api/admin/login` if you see abuse.

4. **Content**
   - Fill service prices and amounts in Admin.
   - Ensure `backend/data/config.json` exists and is valid JSON (UTF-8).

---

## Run/build

- **Backend**: `cd backend && npm install && npm start` (uses `PORT` from env or 3001).
- **Frontend**: `npm install && npm run build && npm start` (or `npm run dev` for dev).
- **Health**: Backend `GET /health` returns `{ ok: true }` for monitoring.
