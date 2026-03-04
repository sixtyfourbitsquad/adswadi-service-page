# Deployment Guide: Vercel & Render

You can run this app in two ways:

1. **Free split (recommended)** – **Frontend on Vercel** (free) + **Backend on Render** (free). The repo is set up for this: `backend/` is the API server; the root Next.js app is the frontend and calls the backend via `NEXT_PUBLIC_API_URL`.
2. **Single app** – Deploy the whole Next.js app (with API routes) to one host. The codebase no longer includes API routes in the frontend; use the `backend/` on Render and the root app can also be deployed to Render as a single app if you add the API routes back. For **free** hosting without paying, use the **split** setup below.

---

## Free hosting: Frontend (Vercel) + Backend (Render)

This keeps you on **free tiers** on both platforms: the Next.js frontend runs on Vercel, and the Express backend (config, admin, uploads, UPI QR) runs on Render with a persistent disk.

### 1. Deploy the backend on Render

1. Push the repo to GitHub (it already has a `backend/` folder with the API server).
2. On [Render](https://render.com): **New +** → **Web Service**.
3. Connect the repo. Set **Root Directory** to **`backend`** (so Render only builds/runs the backend).
4. **Build Command**: `npm install`  
   **Start Command**: `npm start`
5. **Environment** (in Render dashboard):
   - `ADMIN_PASSWORD` = your admin password
   - `BACKEND_PUBLIC_URL` = your Render service URL (e.g. `https://adswadi-api.onrender.com`) — set this **after** the first deploy so you can copy the URL.
6. **Disks** (optional but recommended so config and uploads persist):
   - Add a disk with **Mount Path** `data` → maps to `backend/data` (config and admin password).
   - Add a disk with **Mount Path** `public/uploaded` → for uploaded images.  
   (On Render, when Root Directory is `backend`, the app’s `process.cwd()` is the `backend` folder, so `data` and `public/uploaded` are under `backend/`.)
7. Deploy. Copy the service URL (e.g. `https://adswadi-api.onrender.com`) and, if you didn’t set it yet, add **Environment** → `BACKEND_PUBLIC_URL` = that URL, then redeploy.

The backend serves: `/api/config`, `/api/admin/config`, `/api/admin/login`, `/api/admin/change-password`, `/api/admin/upload`, `/api/upi-qr`, and static files at `/uploaded/*`.

### 2. Deploy the frontend on Vercel

1. On [Vercel](https://vercel.com): **Add New** → **Project** → import the **same** GitHub repo.
2. **Root Directory**: leave as **.** (repo root) or set to the root so Vercel builds the **Next.js app**, not the backend.
3. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = your Render backend URL, e.g. `https://adswadi-api.onrender.com` (no trailing slash).
4. **Build Command**: `npm run build` (default). Do **not** set Root to `backend`.
5. Deploy. Your site will be at `https://your-project.vercel.app`. The frontend will call the backend for all data and images from `/uploaded/`.

### 3. Summary

| What | Where |
|------|--------|
| Frontend (pages, UI) | Vercel (free) |
| Backend (APIs, config, uploads, UPI QR) | Render (free), Root Directory = `backend` |
| `NEXT_PUBLIC_API_URL` (Vercel) | Your Render backend URL |
| `BACKEND_PUBLIC_URL` (Render) | Same URL (for upload URLs and CORS) |
| `ADMIN_PASSWORD` | Set only on Render (backend) |

Local development (split): run `node backend/server.js` from the `backend/` folder (or `cd backend && npm start`) on port 3001, and run the Next.js app with `NEXT_PUBLIC_API_URL=http://localhost:3001` in `.env.local`.

---

## How admin data is fetched (single Next.js app)

There is no separate backend URL. Everything runs in one deployment:

1. **User opens the admin page**  
   e.g. `https://your-app.vercel.app/admin` → the browser loads the admin UI (React) from the same app.

2. **The admin UI calls APIs on the same origin**  
   From the admin page, the code uses relative URLs, for example:
   - `fetch("/api/admin/config")` → loads or saves title, services, payment (reads/writes `data/config.json` on the server).
   - `fetch("/api/admin/login", { body: { password } })` → checks password (env or `data/admin.json`).
   - `fetch("/api/admin/change-password", ...)` → updates password (writes `data/admin.json`).
   - `fetch("/api/admin/upload", ...)` → uploads images (writes `public/uploaded/`).

3. **Those requests go to the same host**  
   So `fetch("/api/admin/config")` becomes `https://your-app.vercel.app/api/admin/config`. Next.js runs the **API route handler** for that path on the server (or in a serverless function on Vercel). The handler reads/writes files (`data/config.json`, `data/admin.json`) and returns JSON. The admin UI in the browser receives that JSON and updates the screen.

So **admin data is fetched by the browser calling your own app’s `/api/admin/*` routes**. There is no separate backend to configure; the “backend” is just those API routes inside the same Next.js app.

---

## Where data is saved (on the server)

All saved data lives **on the server** (the same machine/container that runs your Next.js app), in these paths **relative to the project root**:

| What is saved | File or folder | Used when |
|---------------|----------------|-----------|
| **Page title, subtitle, services, payment (UPI, WhatsApp)** | `data/config.json` | You click “Save” in admin for title, payment, or any service. |
| **Admin password** (after you change it in admin) | `data/admin.json` | You use “Change password” in the admin panel. |
| **Uploaded poster images** | `public/uploaded/` (e.g. `public/uploaded/meta-ads-1234567890.png`) | You use “Upload new poster” for a service in admin. |

- **Full paths** (on the server):  
  - Config & password: `<project-root>/data/config.json`, `<project-root>/data/admin.json`  
  - Uploads: `<project-root>/public/uploaded/<filename>`

So: **data is saved on the server’s disk** in the `data/` and `public/uploaded/` folders of your deployed app. On **Vercel** that disk is read-only (writes don’t persist). On **Render** you can attach a persistent disk so these folders persist across deploys and restarts.

---

## Important: How your app stores data (persistence by platform)

| What | Where | Persists on… |
|------|--------|----------------|
| Title, subtitle, services, payment (UPI, WhatsApp) | `data/config.json` | **Render** (with disk); **Vercel** = no (read-only filesystem) |
| Admin password (after you change it) | `data/admin.json` | **Render** (with disk); **Vercel** = no |
| Uploaded posters | `public/uploaded/` | **Render** (with disk); **Vercel** = no |

- **Vercel**: Serverless. Writes to `data/` and `public/uploaded/` do **not** persist. Use **Render** if you need the admin panel to save config, password changes, and uploads.
- **Render**: With a persistent disk, `data/` and uploads persist. Best choice if you use the admin panel to edit content and change password.

---

## Option A: Deploy on Vercel (frontend + API, no persistent storage)

Good for: quick demo, or if you keep config in the repo and only use `ADMIN_PASSWORD` from env (no admin edits to config/password).

### 1. Push your code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Import the project on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
2. Click **Add New…** → **Project**.
3. Import your GitHub repo. Leave **Framework Preset** as **Next.js**.
4. **Root Directory**: leave as `.` (or set if your app is in a subfolder).
5. **Build and Output Settings**:  
   - Build Command: `npm run build` (default)  
   - Output Directory: leave default  
   - Install Command: `npm install` (default)

### 3. Environment variables

In the project on Vercel: **Settings** → **Environment Variables**.

Add:

| Name | Value | Notes |
|------|--------|--------|
| `ADMIN_PASSWORD` | your-secure-password | Required for admin login. Use a strong password. |

Then redeploy (Deployments → … on latest → Redeploy).

### 4. Deploy

Click **Deploy**. Vercel will build and host the app. Your site will be at `https://your-project.vercel.app`.

### 5. Vercel limitations (this project)

- **Config**: `data/config.json` is read at runtime. On Vercel the filesystem is read-only, so any changes made in the admin panel **will not be saved**. Either commit a `data/config.json` in the repo so it’s deployed with the app, or use another config source (e.g. database) with code changes.
- **Admin password**: Only the value in `ADMIN_PASSWORD` is used. Changing the password in the admin panel won’t persist.
- **Uploads**: Files saved to `public/uploaded/` won’t persist. Use image URLs in admin instead of “Upload new poster”, or use external storage (e.g. Vercel Blob) with code changes.

For full admin editing and password change, use **Render** (Option B).

---

## Option B: Deploy on Render (frontend + API with persistent disk)

Good for: production use with admin panel, editable config, change password, and uploads.

### 1. Push your code to GitHub

Same as in Option A (see above).

### 2. Create a Web Service on Render

1. Go to [render.com](https://render.com) and sign in (e.g. with GitHub).
2. **Dashboard** → **New +** → **Web Service**.
3. Connect your GitHub repo and select it.
4. Configure:
   - **Name**: e.g. `adswadi-service-page`
   - **Region**: choose the closest to your users
   - **Runtime**: **Node**
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for no spin-down)

### 3. Environment variables

In the Render service: **Environment** tab.

Add:

| Key | Value |
|-----|--------|
| `ADMIN_PASSWORD` | your-secure-password |

Save. Render will redeploy if needed.

### 4. Add a persistent disk (so config and password changes persist)

Without a disk, `data/` and `public/uploaded/` are wiped on each deploy or restart. On Render, the Node app runs from **`/opt/render/project/src`** (repo root = working directory).

1. In your Web Service, open **Disks** (or **Storage**).
2. **Add Disk** (for config and admin password):
   - **Name**: e.g. `data`
   - **Mount Path**: `/opt/render/project/src/data`
   - **Size**: 1 GB is enough to start
3. Add a second disk for uploads (optional but recommended):
   - **Name**: e.g. `uploads`
   - **Mount Path**: `/opt/render/project/src/public/uploaded`
   - **Size**: 1 GB

Only files under these mount paths persist across deploys and restarts. Your app writes `data/config.json`, `data/admin.json`, and uploads to `public/uploaded/`, so these paths match.

### 5. First-time setup: create `data/config.json`

If your repo doesn’t include `data/config.json` (e.g. it’s gitignored), the app will fail on first request until the file exists. Two options:

- **Commit an initial `data/config.json`** (with default title, empty services, etc.) so it’s in the repo and present on deploy, then edit via admin.
- Or add a **build step** that creates a default `data/config.json` if missing (e.g. a small script run in **Build Command**).

After the first successful deploy, you can edit everything from the admin panel; with the disk mounted, changes will persist.

### 6. Deploy and open the app

Click **Create Web Service**. Render will build and run the app. Your site will be at `https://your-service-name.onrender.com`.

- **Free tier**: The service may spin down after inactivity; the first request after that can be slow.
- Use **Admin** → **Change password** to set a new password; it will be stored in `data/admin.json` on the disk.

---

## Option C: Frontend on Vercel, backend on Render (advanced)

If you want the UI on Vercel and the API on Render, you would:

1. **Split the app** into:
   - A Next.js frontend that calls an API (e.g. `https://your-api.onrender.com`) for config and admin actions.
   - A separate backend (e.g. Node/Express or a second Next.js app with only API routes) deployed on Render, with access to `data/` and disk.
2. **CORS**: Configure the Render backend to allow requests from your Vercel frontend origin.
3. **Env on Vercel**: Set `NEXT_PUBLIC_API_URL` (or similar) to your Render API URL.

This requires refactoring (e.g. moving API routes to the Render app and pointing the Vercel app at that URL). For this project, **deploying the full Next.js app on either Vercel or Render (Option A or B) is the simplest approach.**

---

## Checklist

### Vercel

- [ ] Repo connected, build command `npm run build`, start not needed (serverless).
- [ ] `ADMIN_PASSWORD` set in Environment Variables.
- [ ] Understand that config/password changes and uploads in admin won’t persist unless you add external storage.

### Render

- [ ] Web Service created with **Build**: `npm install && npm run build`, **Start**: `npm start`.
- [ ] `ADMIN_PASSWORD` set in Environment.
- [ ] Persistent disk(s) added for `data` (and optionally `public/uploaded`) so admin changes and uploads persist.
- [ ] Initial `data/config.json` present (committed or created at build).

---

## Custom domain (both platforms)

- **Vercel**: Project → **Settings** → **Domains** → add your domain and follow DNS instructions.
- **Render**: Web Service → **Settings** → **Custom Domains** → add domain and update DNS as shown.

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| 500 or “Failed to load config” | `data/config.json` must exist and be valid JSON. On Render, ensure the disk is mounted and the app can read that path. |
| Admin login fails | Verify `ADMIN_PASSWORD` in the hosting dashboard and that you’re using the same value. On Render, if you changed password in admin, the app uses `data/admin.json` (on disk); env is only the initial value. |
| Uploads disappear | On Vercel they never persist. On Render, mount a disk at `public/uploaded` (or your upload path). |
| Build fails | Ensure Node version is supported (e.g. 18.x). On Render you can set **Environment** → `NODE_VERSION=18`. |

If you tell me which platform you prefer (Vercel vs Render) and whether you need the admin panel to save config and password, I can suggest the exact env and disk setup for your repo layout.
