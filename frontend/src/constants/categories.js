// `db` is the value stored in alerts.category; `icon` is a Feather glyph.
export const CATEGORY_LIST = [
  { value: "food", db: "Food", label: "Food", icon: "coffee", color: "#E8930C" },
  { value: "safety", db: "Safety", label: "Safety", icon: "alert-triangle", color: "#E5484D" },
  { value: "social", db: "Social", label: "Social", icon: "users", color: "#8E4EC6" },
  { value: "academic", db: "Academic", label: "Academic", icon: "book-open", color: "#3B5BFD" },
  { value: "sports", db: "Sports", label: "Sports", icon: "activity", color: "#2E9E6A" },
  { value: "lostfound", db: "LostFound", label: "Lost & Found", icon: "search", color: "#D6409F" },
  { value: "events", db: "Events", label: "Events", icon: "calendar", color: "#0D9DB8" },
];

const FALLBACK = { value: "other", db: "Other", label: "Other", icon: "bell", color: "#8B8D98" };

const byDb = Object.fromEntries(CATEGORY_LIST.map((c) => [c.db.toLowerCase(), c]));
const byValue = Object.fromEntries(CATEGORY_LIST.map((c) => [c.value, c]));

// Accepts either the DB value ("LostFound") or the UI value ("lostfound").
export function getCategory(key) {
  if (!key) return FALLBACK;
  const k = String(key).toLowerCase();
  return byValue[k] ?? byDb[k] ?? FALLBACK;
}

// Legacy lookups for screens not yet moved to getCategory(); removed once they are.
const LEGACY_ICONS = {
  Food: "food",
  Safety: "alert-circle",
  Social: "account-group",
  Academic: "school",
  Sports: "basketball",
  LostFound: "magnify",
  Events: "bullhorn",
};
export const CATEGORY_LABELS = Object.fromEntries(CATEGORY_LIST.map((c) => [c.db, c.label]));
export const CATEGORY_ICONS = LEGACY_ICONS;
export const CATEGORY_COLORS = Object.fromEntries(CATEGORY_LIST.map((c) => [c.value, c.color]));

export function withAlpha(hex, alpha) {
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${a}`;
}
