# Raak Editz — Vercel-ready portfolio

A responsive black + electric-blue portfolio built with Next.js, Framer Motion and a browser-based admin dashboard.

## What is included

- Animated, mobile-responsive public portfolio.
- Video Editing, Graphic Design and Branding categories.
- Private `/admin` login.
- Browser dashboard to add, edit, publish, unpublish and delete projects.
- Direct poster / thumbnail uploads.
- Direct MP4, WebM and MOV video uploads (50 MB maximum per file on the configured Supabase Free bucket).
- Supabase database, authentication and file storage integration.
- No coding or software installation needed for routine project updates after the one-time deployment.

## Important plan restrictions and limits

- Supabase Free currently includes 1 GB file storage and a 50 MB maximum file size per file. The free project may pause after a week of inactivity. Check current limits before launch: https://supabase.com/pricing and https://supabase.com/docs/guides/storage/uploads/file-limits
- This portfolio is intended to promote Raak Editz services. Vercel's Hobby plan is restricted to personal, non-commercial use. A portfolio used to attract paid clients is commercial use; use Vercel Pro or choose a host whose free plan permits commercial projects. See https://vercel.com/legal/terms and https://vercel.com/docs/plans/hobby.
- Keep videos compressed. For large videos, a video platform embed is more efficient than direct storage.

## One-time setup

### A. Create the Supabase backend

1. Create an account at https://supabase.com/ and create a project.
2. Open **SQL Editor** in your Supabase project.
3. Open `supabase-setup.sql` from this folder, copy all its contents, paste into SQL Editor, and run it.
4. Go to **Project Settings → API** (or API Keys). Copy the Project URL and the `anon` / publishable key.
5. Go to **Authentication → Users** and create your admin user with your email and a strong password. Do not enable public sign-ups.

### B. Connect the project to Supabase

1. In the project root, make a copy of `.env.example` and name it `.env.local`.
2. Put your Supabase details in it:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
   ```

3. Do not use the Supabase `service_role` / secret key in browser code or `NEXT_PUBLIC_` variables.

### C. Deploy to Vercel

1. Create a GitHub account at https://github.com/ if you do not already have one.
2. Create a new repository and upload the contents of this project folder.
3. Sign in at https://vercel.com/ and import the GitHub repository.
4. Choose the Next.js framework preset.
5. In Vercel **Project → Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Deploy (or redeploy if you added environment variables after the first deployment).
7. Vercel will assign a `*.vercel.app` address.

### D. Set up the administrator

1. Open `https://YOUR-SITE.vercel.app/admin`.
2. Sign in with the email and password you created in Supabase Authentication.
3. Add a title, category and description.
4. Select a poster image and/or video file from your computer.
5. Keep **Publish this project** checked to show it on the public portfolio, or uncheck it to save as a draft.
6. Use the project list to edit, unpublish or delete items.

## Routine use — no coding

After deployment, all regular content management is done in Chrome:

- Open `/admin`.
- Sign in.
- Upload new posters and videos using the form.
- Publish the project.

You do not need VS Code, Node.js or GitHub for normal content uploads. Those are only involved in the initial deployment or later website code changes.

## Update contact details before launch

Open `app/page.tsx` and replace:
- Instagram link `https://www.instagram.com/raak_editz/`
- WhatsApp link `https://wa.me/91XXXXXXXXXX`
- Email `hello@raakeditz.com`

These are currently placeholders. Replace them with your actual contact details before publishing.

## Local development (optional)

If you want to preview the source locally, install Node.js LTS, then run:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Website branding controls in the admin dashboard

The admin dashboard now includes a **Brand & text settings** section for the logo, brand name, hero headline and introduction, About copy, service descriptions, contact headline, Instagram URL, WhatsApp number, and email address.

If you already deployed an earlier version, run the updated `supabase-setup.sql` again in **Supabase → SQL Editor**. It adds the `site_settings` table and policies without deleting your existing portfolio projects. Then upload the updated project files to the same GitHub repository (keep the `app`, `lib`, and root configuration files in their existing locations) and wait for Vercel to redeploy. Open `/admin`, sign in, and use **Brand & text settings**. Logo files are stored in the existing public `portfolio` Storage bucket and must be within the configured 50 MB file limit.
