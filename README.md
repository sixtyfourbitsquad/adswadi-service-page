# Adswadi Service Page  jj

A service page for your agency with admin-controlled content: title, service posters, pricing, and manual payment gateway (QR + UPI). Meta Ads has **Weekly** and **Monthly** sub-categories.

## Features

- **Public service page**: Gradient hero (like your reference), service cards with image, rate, “Pay for service” and “WhatsApp now” buttons.
- **Payment page**: Manual gateway with admin-set QR image and UPI ID, plus “Send payment screenshot on WhatsApp – Click here”.
- **Admin panel** (`/admin`): Edit page title/subtitle, service posters (upload or URL), pricing, and for Meta Ads – weekly/monthly prices. Set payment QR, UPI ID/name, and WhatsApp number.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment (optional)**  
   Copy `.env.example` to `.env` and set:
   ```env
   ADMIN_PASSWORD=your-secure-password
   ```
   Default password is `adswadi2024` if not set.

3. **Run**
   ```bash
   npm run dev
   ```
   - Site: [http://localhost:3000](http://localhost:3000)
   - Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

## Services (pre-configured)

1. Meta Ads (Weekly / Monthly)
2. Google Ads
3. Snapchat Ads
4. Website Development
5. Landing Page Design
6. WhatsApp API
7. Meta Agency Ads Account
8. Google Agency Ads Account
9. Social Media Management
10. Ads Creative & Design Services
11. Video Editing Service
12. Thumbnail Design Services

Service images are in `public/Images/`. Change posters and pricing in the admin panel.

## Admin panel

- **Title & subtitle**: Main heading and tagline.
- **Payment gateway**: QR image (upload or URL), UPI ID, UPI name, WhatsApp number (with country code, no +).
- **Services**: For each service – poster image URL (or “Upload new poster”), and either a single price or (Meta Ads only) Weekly and Monthly prices.

## Build

```bash
npm run build
npm start
```

## Deployment (free: Vercel + Render)

The app is set up for **free** hosting: **frontend on Vercel** and **backend on Render**.

- **Backend** (in `backend/`): Express server with config, admin login, change password, uploads, and UPI QR. Deploy to Render with Root Directory = `backend`.
- **Frontend**: Next.js app (this repo root). Deploy to Vercel and set `NEXT_PUBLIC_API_URL` to your Render backend URL.

- **[DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)** – Short step-by-step to deploy for free (Vercel + Render).  
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** – Full reference (disks, single-app, troubleshooting).
