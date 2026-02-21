import { supabase } from "../../lib/supabase";

export async function getAlertCoordinates() {
  const { data, error } = await supabase
    .from("alerts")
    .select("category, latitude, longitude");

  if (error) throw error;

  return data;
}

/** Fetch full alert rows for the Alerts tab (no map). */
export async function getAlerts() {
  const { data, error } = await supabase
    .from("alerts")
    .select("id, title, message, category, expires_at, photo_url, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
}
