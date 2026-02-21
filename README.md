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
ash
git clone <your-repo-url>
cd Nitrogen/frontend
npm install
