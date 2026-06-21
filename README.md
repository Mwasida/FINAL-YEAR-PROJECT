# AgriSage — AI-Based Agriculture Advisory System

An intelligent web platform that helps farmers diagnose crop diseases, chat with an AI agronomist, and find the right agricultural products and nearby shops.

---

## What It Does

- **AI Chat Advisor** — Ask questions about crops, soil, pests, or fertilizers and get instant expert guidance via multiple chat threads.
- **Photo Disease Detection** — Upload a photo of an affected plant; the AI identifies the disease, provides confidence scores, and suggests treatments.
- **Voice Input** — Speak your question directly in the browser using the Web Speech API.
- **Product Recommendations** — After diagnosis, the system matches recommended fungicides, pesticides, or fertilizers.
- **Shop Directory** — See which local shops carry the recommended products, with addresses and contact details.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TanStack Start (file-based routing) + Tailwind CSS v4 + shadcn/ui |
| Backend | TanStack Start server functions (`createServerFn`) + Supabase (Postgres) |
| AI | Lovable AI Gateway (Google Gemini 2.5 Flash) for chat and image diagnosis |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Database | PostgreSQL via Supabase with Row Level Security (RLS) |

> **Note:** The original request mentioned Node.js/Express + MySQL. This implementation uses TanStack Start + Supabase, which provides the same functionality (REST API, auth, database) with less boilerplate and full type safety.

---

## Project Structure

```
src/
  routes/                 # File-based routes (TanStack Start)
    index.tsx               # Landing page
    about.tsx               # About / How it works
    contact.tsx             # Contact form
    auth.tsx                # Sign up / Log in
    api/chat.ts             # Streaming AI chat endpoint
    _authenticated/         # Protected routes (require login)
      route.tsx             # Auth gate layout
      dashboard.tsx         # Farmer dashboard
      chat.index.tsx        # Chat thread list
      chat.$threadId.tsx    # Active chat conversation
      diagnose.tsx          # Photo disease detection
      products.tsx          # Product catalog & shop finder
  components/
    app/app-shell.tsx       # Dashboard sidebar layout
    site/site-chrome.tsx    # Landing page header/footer
  lib/
    threads.functions.ts    # Server functions: chat threads
    diagnose.functions.ts   # Server functions: AI image diagnosis
    catalog.functions.ts    # Server functions: products & shops
    ai-gateway.server.ts  # Lovable AI Gateway provider
  integrations/
    supabase/               # Auto-generated Supabase clients
    lovable/                # Lovable Cloud auth broker
  styles.css                # Tailwind theme (agricultural green palette)
supabase/
  migrations/               # Database schema + seed data
```

---

## How to Run on Your Local Machine

### Prerequisites

- **Bun** (recommended; the project uses `bun.lock`) — [Install Bun](https://bun.sh/docs/installation)
  - Alternatively, **Node.js 20+** with `npm` works too.
- A **Supabase project** (free tier is fine) — [supabase.com](https://supabase.com)
- A **Lovable account** with API key for AI features — the `.env` file in this repo already contains a working project configuration.

### Step 1: Clone & Install

```bash
git clone <repository-url>
cd <project-folder>
bun install
# OR: npm install
```

### Step 2: Environment Variables

The `.env` file is already present and configured with a working Supabase project and Lovable AI Gateway credentials.

If you want to use your own Supabase project, update these values in `.env`:

```env
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
```

> **Important:** If you switch Supabase projects, you must run the migrations in `supabase/migrations/` against your new database.

### Step 3: Apply Database Migrations

If using a new Supabase project, run the SQL migration files in the Supabase SQL Editor (in order):

1. `supabase/migrations/20260607105359_186834c9-ec16-4d9a-b55e-8b0419adf383.sql` — Creates tables, RLS policies, triggers, and seed data.

### Step 4: Start Development Server

```bash
bun run dev
# OR: npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in your terminal).

### Build for Production

```bash
bun run build
# OR: npm run build
```

---

## Default Login Credentials

Two default accounts are provided for quick testing — one **admin** and one **farmer**.

| Role   | Email                     | Password       |
|--------|---------------------------|----------------|
| Admin  | `admin@agrisage.local`    | `Admin@1235`  |
| Farmer | `farmer@agrisage.local`   | `Farmer@1235` |

> ⚠️ **Change these passwords before deploying to production.** They exist only for local devcelopment and demos.

### One-time seed step

The two accounts are created by hitting a small seeding endpoint **once** after you start the app. It is idempotent — calling it again does nothing.

```bash
# With the dev server running on http://localhost:5173
curl -X POST http://localhost:5173/api/public/seed-defaults
```

You should get back a JSON response listing the two created users. After that, you can sign in at `/auth` with either credential set.

### How to Log In

1. Open the app and click **"Sign in"** (or go to `/auth`).
2. Enter one of the credentials above, **or** create your own account with email/password or **Continue with Google**.
3. After sign-in you are redirected to the **Farmer Dashboard** (`/dashboard`).

### Dashboard Features (Farmer)

| Page      | URL          | What you can do                                      |
|-----------|--------------|------------------------------------------------------|
| Dashboard | `/dashboard` | View recent diagnosis history and stats              |
| AI Chat   | `/chat`      | Start new conversations or continue existing threads |
| Diagnose  | `/diagnose`  | Upload a crop photo for AI disease detection         |
| Products  | `/products`  | Browse recommended products and find nearby shops    |

### Admin Account

The admin account (`admin@agrisage.local`) is assigned the `admin` role in the `user_roles` table and is used by upcoming admin-only features (user management, product/shop CRUD, analytics).

> **Current Status:** The full **Admin Panel UI** is planned for a follow-up release. The role system, default admin user, and `has_role()` security function are already in place, so admin features can be added without further schema changes.

---

## Default Seed Data

The migration automatically inserts:

- **5 diseases** (Tomato Leaf Blight, Wheat Rust, Rice Blast, Powdery Mildew, Maize Fall Armyworm)
- **8 products** (Mancozeb, Copper Oxychloride, Ridomil Gold, Propiconazole, Tricyclazole, Sulfur, Emamectin Benzoate, Neem Oil)
- **3 shops** (Green Valley Agro, Kisan Krishi Kendra, FarmFresh Supplies)
- Pre-linked product-disease and product-shop relationships

---

## API Endpoints (Server Routes)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Streaming AI chat response (text generation) |

All other business logic is handled via **TanStack Start server functions** (`createServerFn`), which are called directly from React components with full type safety.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Missing Supabase environment variable` | Ensure `.env` exists and contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` |
| `Unauthorized` on protected pages | You are not logged in. Navigate to `/auth` and sign in. |
| AI chat or diagnosis fails | Check that `LOVABLE_API_KEY` is set. The default `.env` should already have it. |
| Database tables missing | Run the Supabase migration SQL in your project's SQL Editor. |
| Build fails with `Failed to resolve import` | Make sure you ran `bun install` / `npm install` before building. |

---

## License

MIT
