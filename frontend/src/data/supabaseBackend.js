import { decode } from "base64-arraybuffer";

import { supabase } from "../../lib/supabase";
import { BackendError, validateAlertInput } from "./errors";
import { withTimeout } from "../utils/promiseUtils";

const ALERT_COLUMNS =
  "id, user_id, title, message, category, latitude, longitude, expires_at, photo_url, created_at";

// Turn Postgres CHECK-constraint failures into errors the form can attach to a field.
function toBackendError(error) {
  const msg = (error?.message || "").toLowerCase();
  if (/longitude_check|latitude_check|outside|campus|bounds/.test(msg)) {
    return new BackendError("Alerts can only be posted on campus.", { code: "outside_campus" });
  }
  if (msg.includes("title_check") || (msg.includes("title") && msg.includes("length"))) {
    return new BackendError("Title must be 3–100 characters", { code: "invalid", field: "title" });
  }
  if (msg.includes("message_check") || (msg.includes("message") && msg.includes("length"))) {
    return new BackendError("Description must be 10–1000 characters", {
      code: "invalid",
      field: "message",
    });
  }
  if (msg.includes("category_check")) {
    return new BackendError("Invalid category", { code: "invalid", field: "category" });
  }
  return new BackendError(error?.message || "Something went wrong.");
}

function durationHours(expiresAtIso) {
  const hours = Math.round((new Date(expiresAtIso) - Date.now()) / 3_600_000);
  return Math.min(Math.max(1, hours), 32767);
}

export const supabaseBackend = {
  mode: "supabase",

  auth: {
    async getSession() {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    },

    onChange(cb) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session));
      return () => data.subscription.unsubscribe();
    },

    async signIn({ email, password }) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      return { session: data?.session ?? null, error };
    },

    async signUp({ email, password, meta }) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: meta },
      });
      return { session: data?.session ?? null, error };
    },

    async signOut() {
      await supabase.auth.signOut();
    },

    async resetPassword(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      return { error };
    },
  },

  profiles: {
    async get(userId) {
      const { data, error } = await withTimeout(
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        15000,
        "Profile load timed out. Check your connection."
      );
      if (error) throw error;
      return data;
    },

    async upsert(profile) {
      const { data, error } = await supabase
        .from("profiles")
        .upsert(profile, { onConflict: "id" })
        .select()
        .maybeSingle();
      if (error) throw error;
      return data ?? profile;
    },
  },

  alerts: {
    async list() {
      const { data, error } = await supabase
        .from("alerts")
        .select(ALERT_COLUMNS)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },

    async listByUser(userId) {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("alerts")
        .select(ALERT_COLUMNS)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },

    async get(id) {
      const { data, error } = await supabase
        .from("alerts")
        .select(ALERT_COLUMNS)
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },

    async create(input) {
      validateAlertInput(input);
      const { data, error } = await withTimeout(
        supabase
          .from("alerts")
          .insert({
            user_id: input.user_id,
            title: input.title.trim(),
            message: input.message.trim(),
            category: input.category,
            latitude: input.latitude,
            longitude: input.longitude,
            expires_at: input.expires_at,
            alert_duration_hours: durationHours(input.expires_at),
            photo_url: input.photo_url ?? null,
            is_future_event: false,
          })
          .select(ALERT_COLUMNS)
          .maybeSingle(),
        15000,
        "Could not create alert. Check your connection."
      );
      if (error) throw toBackendError(error);
      return data;
    },

    async remove(id) {
      const { error } = await supabase.from("alerts").delete().eq("id", id);
      if (error) throw error;
    },

    subscribe(cb) {
      const channel = supabase
        .channel(`alerts-${Math.random().toString(36).slice(2)}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, () => cb())
        .subscribe();
      return () => supabase.removeChannel(channel);
    },
  },

  storage: {
    async uploadPhoto({ uri, base64, mimeType, userId }) {
      if (!base64) return null;
      const ext = (mimeType?.split("/")[1] || (uri || "").split(".").pop() || "jpg").toLowerCase();
      const fileName = `${userId}-${Date.now()}.${ext}`;
      const { data, error } = await withTimeout(
        supabase.storage.from("alert-photos").upload(fileName, decode(base64), {
          contentType: mimeType || `image/${ext}`,
          upsert: false,
        }),
        20000,
        "Photo upload timed out"
      );
      if (error) throw error;
      return supabase.storage.from("alert-photos").getPublicUrl(data.path).data?.publicUrl ?? null;
    },
  },
};
