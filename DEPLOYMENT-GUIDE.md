# Deployment Guide – Free (Vercel + Render)

Deploy the **frontend** on Vercel and the **backend** on Render so both run on free tiers.

---

## Prerequisites

- GitHub account
- [Vercel](https://vercel.com) account (sign in with GitHub)
- [Render](https://render.com) account (sign in with GitHub)
- This repo pushed to GitHub (e.g. `https://github.com/sixtyfourbitsquad/adswadi-service-page`)

---

## Step 1: Deploy backend on Render

1. Go to [Render Dashboard](https://dashboard.render.com) → **New +** → **Web Service**.
2. Connect your GitHub account if needed, then select the repo **adswadi-service-page**.
3. Configure:
   - **Name**: e.g. `adswadi-api`
   - **Region**: choose closest to your users
   - **Root Directory**: type **`backend`**
   - **Runtime**: **Node**
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free**
4. Click **Advanced** and add **Environment Variables**:
   - **Key**: `ADMIN_PASSWORD` → **Value**: choose a strong password (you’ll use this to log in to `/admin`).
   - Leave `BACKEND_PUBLIC_URL` for after first deploy.
5. Click **Create Web Service**. Wait for the first deploy to finish.
6. Copy the service URL (e.g. `https://adswadi-api.onrender.com`). In the same service go to **Environment** → **Add Environment Variable**:
   - **Key**: `BACKEND_PUBLIC_URL` → **Value**: `https://adswadi-api.onrender.com` (your URL, no trailing slash).
7. Save. Render will redeploy once.

**Optional – persistent data:**  
In the service go to **Disks** → **Add Disk**:
- Name: `data`, Mount Path: `data`, Size: 1 GB (for config and admin password).  
Add another if you want uploads to persist: Mount Path `public/uploaded`, 1 GB.

---

## Step 2: Deploy frontend on Vercel

1. Go to [Vercel](https://vercel.com) → **Add New…** → **Project**.
2. Import the **same** repo: **adswadi-service-page**.
3. Configure:
   - **Root Directory**: leave as **.** (root). Do **not** set to `backend`.
   - **Framework Preset**: Next.js (auto-detected).
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: default
4. Under **Environment Variables** add:
   - **Name**: `NEXT_PUBLIC_API_URL`  
   - **Value**: your Render backend URL, e.g. `https://adswadi-api.onrender.com` (no trailing slash).  
   Apply to Production (and Preview if you use preview URLs).
5. Click **Deploy**. Wait for the build to finish.

Your site will be live at `https://your-project.vercel.app`.

---

## Step 3: Verify

1. Open your Vercel URL (e.g. `https://adswadi-service-page.vercel.app`). You should see the service page and data from the backend.
2. Open `https://your-vercel-url.vercel.app/admin` and log in with `ADMIN_PASSWORD` you set on Render.
3. Change the admin password (optional) under **Change admin password**; it will be stored on the backend (Render).

---

## Checklist

| Item | Where |
|------|--------|
| Backend repo | Same GitHub repo, **Root Directory** = `backend` on Render |
| Frontend repo | Same GitHub repo, **Root Directory** = `.` on Vercel |
| `ADMIN_PASSWORD` | Render → Environment |
| `BACKEND_PUBLIC_URL` | Render → Environment (your Render service URL) |
| `NEXT_PUBLIC_API_URL` | Vercel → Environment Variables (same Render URL) |

---

## Local development (split)

- **Backend:**  
  `cd backend` → `npm install` → `npm start` (runs on port 3001).
- **Frontend:**  
  In repo root create `.env.local` with:
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:3001
  ```
  Then `npm run dev`. Open http://localhost:3000.

---

For more detail (single-app deploy, disks, troubleshooting), see [DEPLOYMENT.md](./DEPLOYMENT.md).
