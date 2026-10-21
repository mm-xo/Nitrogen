// Picks the data backend at startup.
//   EXPO_PUBLIC_BACKEND=supabase  -> hosted Supabase (needs EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY)
//   anything else (default)       -> on-device demo backend with seeded campus alerts
const wantsSupabase =
  process.env.EXPO_PUBLIC_BACKEND === "supabase" &&
  !!process.env.EXPO_PUBLIC_SUPABASE_URL &&
  !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// require() keeps the Supabase client out of the local build path entirely.
export const backend = wantsSupabase
  ? require("./supabaseBackend").supabaseBackend
  : require("./localBackend").localBackend;

export const isLocalBackend = backend.mode === "local";

export { BackendError, ALERT_LIMITS } from "./errors";
export { DEMO_USER } from "./seed";
