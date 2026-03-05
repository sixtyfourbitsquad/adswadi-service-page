# Updating your live site (old → new files)

When you push these updated files and your live site (Vercel + Render) redeploys, follow this so nothing breaks.

---

## 1. You don’t need to do anything “special” before pushing

- Push to your repo as usual. Vercel and Render will redeploy from the new code.
- **Environment variables** (e.g. `NEXT_PUBLIC_API_URL`, `ADMIN_PASSWORD`, `BACKEND_PUBLIC_URL`) stay as you set them; they are not overwritten by the deploy.
- No need to clear cache or do a “special” deploy.

---

## 2. After deploy – do this once

### Backend (Render)

- If your backend uses a **persistent disk** for `data/`, the existing `config.json` on the server is **not** replaced by the repo. So your current services and payment settings stay.
- The new code expects optional fields `metaAgencyIndian` and `metaAgencyInternational` in config. If they’re missing, the site still works (Indian/International Meta Agency pages use defaults).
- **Recommended:** Log in to **Admin** → open the **“Meta Agency detail pages”** section → click **“Save Indian”** and **“Save International”** (you can edit prices first if you want). That writes the new structure into your live config so Indian/International options are saved for next time.

### Frontend (Vercel)

- After deploy, the new frontend is live. Users may see the new version immediately; if they see old UI, a hard refresh (Ctrl+F5 / Cmd+Shift+R) fixes it.
- Confirm **Environment Variables** in Vercel still have `NEXT_PUBLIC_API_URL` = your Render backend URL (no trailing slash). If it’s already set, you don’t need to change it.

---

## 3. If your live config was ever missing or broken

- If the live site had “Failed to load services” or “Application error” before (e.g. missing or invalid `config.json`), fix the **backend** config:
  - On Render, if you use a disk at `data`, ensure `data/config.json` exists and is valid **UTF-8** JSON with at least: `title`, `subtitle`, `services` (array), `payment` (object with `upiId`, `upiName`, `whatsappNumber`).
  - If you don’t use a disk, the deploy uses `backend/data/config.json` from the repo, which already has the full structure (including Meta Agency and image paths).

---

## 4. Summary checklist

| Step | Action |
|------|--------|
| 1 | Push your updated repo. Let Vercel and Render redeploy. |
| 2 | Confirm env vars on Vercel and Render are still set (no need to change if already set). |
| 3 | Open your live site → **Admin** → optionally edit and **Save** the “Meta Agency detail pages” section once so the new options are stored. |
| 4 | If something breaks, check that `backend/data/config.json` (or the config on your Render disk) is valid JSON and has `payment.whatsappNumber` and `services` array. |

You do **not** need to redeploy in a special order, clear CDN cache, or run any extra commands. The new code is backward‑friendly with existing config.
