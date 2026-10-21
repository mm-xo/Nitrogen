# Nitrogen

A campus alert app for U of M Fort Garry, built with React Native (Expo). See what's happening around campus — free food, safety notices, events, lost & found — on a live map and in a feed, and post your own.

It runs **without a server by default**: an on-device demo backend ships with sample alerts around campus. Point it at Supabase when you want real accounts and shared data.

## Features

- **Map** – full-bleed, muted basemap with colour-coded pins; tap a pin for a preview card, filter by category, jump to your location or the whole campus
- **Feed** – live alerts with category filters and sorting (latest, ending soon, nearest), skeleton loading and pull to refresh
- **Alert detail** – photo, time left, distance, mini map, share, open in Maps; authors can delete
- **New alert** – category chips, title/details with counters, quick durations or a custom end time, optional photo, on-campus check (with a campus pin for simulators/testing)
- **Your alerts** – live and ended lists, swipe left to delete
- **Profile** – stats, editable details, Auto/Light/Dark appearance
- **Auth** – sign up (students use `@myumanitoba.ca`), sign in, sign out

## Design

Minimal and quiet: neutral surfaces, one blue accent, colour reserved for categories. Inter type scale, Feather icons, light and dark themes that follow the system (overridable in Profile). Motion is handled by Reanimated — spring press feedback, sliding tab indicator, animated focus rings, staggered list entrances, layout transitions when filtering or deleting, frosted headers on scroll — with haptics on native.

Tokens live in `src/theme/tokens.js`; reusable primitives in `src/ui/`.

## Tech stack

- Expo SDK 57 (React Native 0.86, React 19.2), React Navigation 7
- Reanimated 4, Gesture Handler, Expo Haptics, Expo Font (Inter)
- Maps: Apple Maps on iOS, Google Maps on Android builds with a key, otherwise MapLibre + OpenFreeMap (see below)
- Data: on-device demo backend (AsyncStorage) or Supabase (Auth, Postgres, Storage, Realtime)

## Getting started

Requires Node.js 20.19.4+ and [Expo Go](https://expo.dev/go) for SDK 57 on a phone, or an iOS Simulator / Android Emulator.

```bash
cd frontend
npm install
npx expo start
```

Then scan the QR code with Expo Go, press **a** / **i** for an emulator/simulator, or press **w** for the web build.

On the sign-in screen, tap **Continue with demo account** (or sign in with `demo@myumanitoba.ca` / `nitrogen`), or create a new local account. Everything is stored on that device; **Profile → Reset demo alerts** restores the samples.

### Maps

Each platform gets the map that works best for it (Profile → App → Maps shows which one is active):

| Where | Map | Why |
|---|---|---|
| iOS (Expo Go and builds) | Apple Maps, muted style | Native, free, no key |
| Android build with `GOOGLE_MAPS_ANDROID_API_KEY` | Google Maps, custom minimal style | Native performance and gestures |
| Android in Expo Go, or without a key | MapLibre + OpenFreeMap in a WebView | Expo Go dropped Google Maps on Android in SDK 53; OpenFreeMap is free with no key or limits |
| Web | MapLibre + OpenFreeMap in an iframe | Same page as the Android fallback |

To use Google Maps on Android, enable "Maps SDK for Android" in Google Cloud, restrict the key to your package name and signing SHA-1, then set `GOOGLE_MAPS_ANDROID_API_KEY` in `frontend/.env` (or as an EAS environment variable) and make a development or store build. `app.config.js` adds the key at build time.

Posting requires being on campus. Off campus (or on a simulator), use **Pin to campus instead** in the location card.

## Using Supabase

Create `frontend/.env` (gitignored):

```env
EXPO_PUBLIC_BACKEND=supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

Without `EXPO_PUBLIC_BACKEND=supabase` the app stays in demo mode, even if the URL and key are set. Restart the dev server after changing `.env`.

The project needs:

- An `alerts` table: `id`, `user_id`, `title`, `message`, `category` (`Food`, `Safety`, `Social`, `Academic`, `Sports`, `LostFound`, `Events`), `latitude`, `longitude`, `expires_at`, `alert_duration_hours`, `photo_url`, `is_future_event`, `created_at`
- A `profiles` table and the policies in `frontend/supabase-*.sql`
- A public `alert-photos` storage bucket that authenticated users can upload to

## Project structure

```
frontend/
├── App.js                    # providers, fonts, theme-aware navigation
├── lib/supabase.js           # Supabase client (loaded only in Supabase mode)
└── src/
    ├── data/                 # backend switch, local demo backend + seed data, Supabase adapter
    ├── theme/                # tokens (colour, type, spacing, motion) and ThemeProvider
    ├── ui/                   # primitives: Text, Button, TextField, Chip, Toast, Section/Row, …
    ├── components/           # AlertCard, CategoryTile, Logo, DateTimeField, map/CampusMap(.web)
    ├── navigation/           # stack + floating TabBar
    ├── screens/              # Login, Signup, Map, Feed, AlertDetail, CreateAlert, MyAlerts, Profile, EditProfile
    ├── context/              # Auth and Location contexts
    ├── hooks/                # useAlerts, useNow
    ├── location/             # distance helpers, location watcher
    ├── constants/            # campus bounds, categories
    └── utils/                # formatting, haptics, dialogs
```
