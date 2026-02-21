import { supabase } from "../../lib/supabase";

export async function getAlertCoordinates() {
  const { data, error } = await supabase
    .from("alerts")
    .select("category, latitude, longitude");

  if (error) throw error;

  return data; 
}
