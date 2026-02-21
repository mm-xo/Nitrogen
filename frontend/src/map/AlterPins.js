import { supabase } from "../../lib/supabase";

export async function getAlertCoordinates() {
  const { data, error } = await supabase
    .from("alerts")
    .select("id, category, latitude, longitude");

  if (error) throw error;

  return data;
}

export async function getAlerts() {
  const { data, error } = await supabase
    .from("alerts")
    .select("id, title, message, category, expires_at, photo_url, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
}

export async function getMyAlerts(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("alerts")
    .select("id, title, message, category, expires_at, photo_url, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
}

export async function deleteAlert(alertId) {
  const { error } = await supabase.from("alerts").delete().eq("id", alertId);

  if (error) throw error;
}
