const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function timeAgo(iso, now = Date.now()) {
  if (!iso) return "";
  const diff = Math.max(0, now - new Date(iso).getTime());
  if (diff < MINUTE) return "Just now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  const days = Math.floor(diff / DAY);
  return days === 1 ? "Yesterday" : `${days}d ago`;
}

function compactDuration(ms) {
  if (ms < HOUR) return `${Math.max(1, Math.round(ms / MINUTE))}m`;
  if (ms < DAY) {
    const h = Math.floor(ms / HOUR);
    const m = Math.round((ms % HOUR) / MINUTE);
    return m && h < 6 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${Math.round(ms / DAY)}d`;
}

export function isExpired(alert, now = Date.now()) {
  return !!alert?.expires_at && new Date(alert.expires_at).getTime() <= now;
}

export function timeLeft(iso, now = Date.now()) {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - now;
  if (diff <= 0) return "Ended";
  return `${compactDuration(diff)} left`;
}

export function formatDistance(meters) {
  if (meters == null || Number.isNaN(meters)) return null;
  if (meters < 50) return "Here";
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
  return `${(meters / 1000).toFixed(meters < 10_000 ? 1 : 0)} km`;
}

export function formatDuration(ms) {
  return compactDuration(Math.max(0, ms));
}

export function formatClock(date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function formatDateTime(date) {
  const d = new Date(date);
  const today = new Date();
  const tomorrow = new Date(today.getTime() + DAY);
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  if (sameDay(d, today)) return `Today, ${formatClock(d)}`;
  if (sameDay(d, tomorrow)) return `Tomorrow, ${formatClock(d)}`;
  return d.toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function displayName(profile, fallbackEmail) {
  const first = profile?.preferred_name || profile?.first_name;
  const last = profile?.last_name;
  const name = [first, last].filter(Boolean).join(" ").trim();
  if (name && name !== "User User") return name;
  return fallbackEmail ? fallbackEmail.split("@")[0] : "Student";
}

export function initials(name) {
  return (name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}
