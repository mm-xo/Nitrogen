// Offline backend persisted in AsyncStorage (localStorage on web). It mirrors the subset of
// Supabase the app uses so every screen works without a hosted project.
// Local demo only: credentials are stored on-device and are not a security boundary.
import AsyncStorage from "@react-native-async-storage/async-storage";

import { DEMO_PROFILE, DEMO_USER, SEED_ALERTS } from "./seed";
import { BackendError, validateAlertInput } from "./errors";
import { isWithinCampus } from "../location/Distance";

const STORAGE_KEY = "@nitrogen/local-db/v1";
const LATENCY_MS = 220;

const authListeners = new Set();
const alertListeners = new Set();
let dbPromise = null;

const wait = (ms = LATENCY_MS) => new Promise((r) => setTimeout(r, ms));

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    return (ch === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

function seededAlerts() {
  const now = Date.now();
  return SEED_ALERTS.map(({ ago, lasts, ...a }) => {
    const created = now - ago * 60_000;
    return {
      ...a,
      photo_url: null,
      seed: true,
      created_at: new Date(created).toISOString(),
      expires_at: new Date(created + lasts * 60_000).toISOString(),
    };
  });
}

function freshDb() {
  return {
    users: [{ id: DEMO_USER.id, email: DEMO_USER.email, password: hash(DEMO_USER.password) }],
    profiles: { [DEMO_USER.id]: DEMO_PROFILE },
    alerts: seededAlerts(),
    sessionUserId: null,
  };
}

async function load() {
  if (!dbPromise) {
    dbPromise = (async () => {
      let db;
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        db = raw ? JSON.parse(raw) : null;
      } catch {
        db = null;
      }
      if (!db) return freshDb();
      // Re-anchor demo alerts to "now" so they never all go stale between launches.
      const removedSeeds = new Set(db.removedSeedIds ?? []);
      db.alerts = [
        ...seededAlerts().filter((a) => !removedSeeds.has(a.id)),
        ...db.alerts.filter((a) => !a.seed),
      ];
      return db;
    })();
  }
  return dbPromise;
}

async function save(db) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.warn("Local backend: could not persist", e?.message);
  }
}

function sessionFor(db, userId) {
  const user = db.users.find((u) => u.id === userId);
  return user ? { user: { id: user.id, email: user.email } } : null;
}

function emitAuth(session) {
  authListeners.forEach((cb) => cb(session));
}

function emitAlerts() {
  alertListeners.forEach((cb) => cb());
}

const byNewest = (a, b) => new Date(b.created_at) - new Date(a.created_at);

export const localBackend = {
  mode: "local",

  auth: {
    async getSession() {
      const db = await load();
      return sessionFor(db, db.sessionUserId);
    },

    onChange(cb) {
      authListeners.add(cb);
      return () => authListeners.delete(cb);
    },

    async signIn({ email, password }) {
      await wait();
      const db = await load();
      const user = db.users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (!user || user.password !== hash(password)) {
        return { error: { message: "That email and password don't match." } };
      }
      db.sessionUserId = user.id;
      await save(db);
      const session = sessionFor(db, user.id);
      emitAuth(session);
      return { session, error: null };
    },

    async signUp({ email, password, meta = {} }) {
      await wait();
      const db = await load();
      const normalized = email.trim().toLowerCase();
      if (db.users.some((u) => u.email.toLowerCase() === normalized)) {
        return { error: { message: "An account with this email already exists." } };
      }
      const id = uuid();
      db.users.push({ id, email: normalized, password: hash(password) });
      db.profiles[id] = {
        id,
        first_name: meta.first_name ?? "",
        last_name: meta.last_name ?? "",
        student_email: normalized,
        account_type: meta.account_type ?? "student",
      };
      db.sessionUserId = id;
      await save(db);
      const session = sessionFor(db, id);
      emitAuth(session);
      return { session, error: null };
    },

    async signOut() {
      const db = await load();
      db.sessionUserId = null;
      await save(db);
      emitAuth(null);
    },

    async resetPassword() {
      await wait();
      return {
        error: {
          message: `Password reset needs a hosted backend. In demo mode, sign in with ${DEMO_USER.email} / ${DEMO_USER.password}.`,
        },
      };
    },
  },

  profiles: {
    async get(userId) {
      const db = await load();
      return db.profiles[userId] ?? null;
    },

    async upsert(profile) {
      await wait();
      const db = await load();
      db.profiles[profile.id] = { ...db.profiles[profile.id], ...profile };
      await save(db);
      return db.profiles[profile.id];
    },
  },

  alerts: {
    async list() {
      await wait();
      const db = await load();
      return [...db.alerts].sort(byNewest);
    },

    async listByUser(userId) {
      await wait();
      const db = await load();
      return db.alerts.filter((a) => a.user_id === userId).sort(byNewest);
    },

    async get(id) {
      const db = await load();
      return db.alerts.find((a) => a.id === id) ?? null;
    },

    async create(input) {
      validateAlertInput(input);
      const { within } = isWithinCampus({ lat: input.latitude, lng: input.longitude });
      if (!within) {
        throw new BackendError("Alerts can only be posted on campus.", {
          code: "outside_campus",
        });
      }
      await wait(400);
      const db = await load();
      const alert = {
        id: uuid(),
        user_id: input.user_id,
        title: input.title.trim(),
        message: input.message.trim(),
        category: input.category,
        latitude: input.latitude,
        longitude: input.longitude,
        photo_url: input.photo_url ?? null,
        created_at: new Date().toISOString(),
        expires_at: input.expires_at,
      };
      db.alerts.unshift(alert);
      await save(db);
      emitAlerts();
      return alert;
    },

    async remove(id) {
      await wait();
      const db = await load();
      const target = db.alerts.find((a) => a.id === id);
      db.alerts = db.alerts.filter((a) => a.id !== id);
      if (target?.seed) db.removedSeedIds = [...(db.removedSeedIds ?? []), id];
      await save(db);
      emitAlerts();
    },

    subscribe(cb) {
      alertListeners.add(cb);
      return () => alertListeners.delete(cb);
    },
  },

  storage: {
    // The picked image already lives on-device (or as a data: URI on web), so just keep its URI.
    async uploadPhoto({ uri, base64, mimeType }) {
      if (uri) return uri;
      if (base64) return `data:${mimeType ?? "image/jpeg"};base64,${base64}`;
      return null;
    },
  },

  // Restores the demo alerts; accounts and profiles are kept.
  async resetAlerts() {
    const db = await load();
    db.alerts = seededAlerts();
    db.removedSeedIds = [];
    await save(db);
    emitAlerts();
  },
};
