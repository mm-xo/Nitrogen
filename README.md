# Nitrogen

A campus and community alert app built with React Native (Expo) and Supabase. View and create location-based alerts (safety, food, events, lost & found, and more) on a map and in a feed.

## Features

- **Map view** – See alerts as pins on a map with category-based colors
- **Alerts feed** – Browse, filter, and refresh alerts with pull-to-refresh
- **Create alerts** – Add title, description, category, optional photo, expiry time, and location (with campus boundary check)
- **Categories** – Food, Safety, Social, Academic, Sports, Lost & Found, Events
- **Auth** – Sign up, sign in, and sign out with Supabase Auth
- **Profile & settings** – User profile and app settings
- **Real-time** – Alerts can update in real time via Supabase Realtime

## Tech Stack

- **Frontend:** React Native (Expo SDK 54), React Navigation, NativeWind (Tailwind), React Native Maps
- **Backend / data:** Supabase (Auth, PostgreSQL, Storage, Realtime)
- **Optional backend:** Python (FastAPI, Supabase client) – see `backend/requirements.txt`

## Prerequisites

- Node.js 18+
- npm or yarn
- [Expo Go](https://expo.dev/go) on your phone (or iOS Simulator / Android Emulator)
- A [Supabase](https://supabase.com) project

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd Nitrogen/frontend
npm install
```

### 2. Supabase

1. Create a project at [app.supabase.com](https://app.supabase.com).
2. In the dashboard: **Settings → API**.
3. Copy **Project URL** and the **anon public** key (long JWT).

### 3. Environment variables

In the **frontend** folder, create a `.env` file (it is gitignored):

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace with your Supabase Project URL and anon public key.

### 4. Database and storage (Supabase)

Your Supabase project needs:

- **Tables:** e.g. an `alerts` table with columns such as `id`, `title`, `description`, `category`, `created_at`, `expires_at`, `user_id`, `photo_url`, `latitude`, `longitude`, and Row Level Security (RLS) policies as needed.
- **Storage:** A bucket for alert images (e.g. `alert-photos`) with policies allowing authenticated uploads and public (or signed) read access.

Exact schema should match what the app uses in `CreateAlertScreen.js`, `AlterPins.js`, and related code.

## Running the app

From the **frontend** directory:

```bash
cd frontend
npx expo start
```

Then:

- Press **i** for iOS Simulator or **a** for Android Emulator, or
- Scan the QR code with Expo Go on your device (same Wi‑Fi as your machine).

Restart the dev server after changing `.env`.

## Project structure

```
Nitrogen/
├── frontend/                 # Expo / React Native app
│   ├── App.js
│   ├── lib/
│   │   └── supabase.js       # Supabase client and auth storage
│   ├── src/
│   │   ├── components/
│   │   ├── constants/        # categories, campus, etc.
│   │   ├── context/          # AuthContext, Locationcontext
│   │   ├── map/              # MapView, AlterPins (fetch pins)
│   │   ├── navigation/       # AppNavigator, tabs + stack
│   │   ├── screens/          # Login, Signup, Map, Alerts, CreateAlert, Profile, Settings
│   │   ├── themes/
│   │   └── utils/
│   └── .env                  # EXPO_PUBLIC_SUPABASE_* (create locally, do not commit)
├── backend/                  # Optional Python backend
│   └── requirements.txt
└── README.md
```

## Troubleshooting

- **"supabaseUrl is required"** – Ensure `frontend/.env` exists with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`, then restart Expo (`npx expo start`).
- **"Network request failed"** – Check device/simulator internet; ensure your Supabase project is not paused (Dashboard → Restore if needed); verify you're using the **anon** public key from **Settings → API**.

## License

Private / hackathon project – see repo or your team for terms.
