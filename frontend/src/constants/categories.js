export const CATEGORY_LIST = [
  { value: "food", db: "Food", label: "Food", icon: "food" },
  { value: "safety", db: "Safety", label: "Safety", icon: "alert-circle" },
  { value: "social", db: "Social", label: "Social", icon: "account-group" },
  { value: "academic", db: "Academic", label: "Academic", icon: "school" },
  { value: "sports", db: "Sports", label: "Sports", icon: "basketball" },
  { value: "lostfound", db: "LostFound", label: "Lost & Found", icon: "magnify" },
  { value: "events", db: "Events", label: "Events", icon: "bullhorn" },
];

export const DB_CATEGORY_MAP = Object.fromEntries(
  CATEGORY_LIST.map((c) => [c.value, c.db])
);

export const CATEGORY_LABELS = Object.fromEntries(
  CATEGORY_LIST.map((c) => [c.db, c.label])
);

export const CATEGORY_ICONS = Object.fromEntries(
  CATEGORY_LIST.map((c) => [c.db, c.icon])
);

export const CATEGORY_COLORS = {
  food: "#FF9500",
  safety: "#FF3B30",
  social: "#5856D6",
  academic: "#007AFF",
  sports: "#34C759",
  lostfound: "#AF52DE",
  events: "#00C7BE",
};

export const CATEGORY_OPTIONS = CATEGORY_LIST.map(({ value, label, icon }) => ({
  value,
  label,
  icon,
}));
