/**
 * Alert categories matching DB constraint alerts_category_check:
 * Food, Safety, Social, Academic, Sports, LostFound, Events
 */

export const CATEGORY_LIST = [
  { value: "food", db: "Food", label: "Food", icon: "food" },
  { value: "safety", db: "Safety", label: "Safety", icon: "alert-circle" },
  { value: "social", db: "Social", label: "Social", icon: "account-group" },
  { value: "academic", db: "Academic", label: "Academic", icon: "school" },
  { value: "sports", db: "Sports", label: "Sports", icon: "basketball" },
  { value: "lostfound", db: "LostFound", label: "Lost & Found", icon: "magnify" },
  { value: "events", db: "Events", label: "Events", icon: "bullhorn" },
];

/** Form value (lowercase) -> DB value */
export const DB_CATEGORY_MAP = Object.fromEntries(
  CATEGORY_LIST.map((c) => [c.value, c.db])
);

/** DB value -> display label */
export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORY_LIST.map((c) => [c.db, c.label])
);

/** DB value -> MaterialCommunityIcons name */
export const CATEGORY_ICONS = Object.fromEntries(
  CATEGORY_LIST.map((c) => [c.db, c.icon])
);

/** Lowercase category key -> hex color for map pins */
export const CATEGORY_COLORS = {
  food: "#FF9500",       // orange
  safety: "#FF3B30",     // red
  social: "#5856D6",     // purple
  academic: "#007AFF",    // blue
  sports: "#34C759",     // green
  lostfound: "#AF52DE",  // violet
  events: "#00C7BE",     // teal
};

/** For CreateAlertScreen picker: { value, label, icon } */
export const CATEGORY_OPTIONS = CATEGORY_LIST.map(({ value, label, icon }) => ({
  value,
  label,
  icon,
}));
