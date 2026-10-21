import * as React from "react";

import { fonts, radius, space, useTheme } from "../theme";

const pad = (n) => String(n).padStart(2, "0");
const toLocalInput = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

// The community picker has no web build, so use the browser's own datetime input.
export function DateTimeField({ value, onChange, minimumDate }) {
  const { colors, scheme } = useTheme();
  return (
    <input
      type="datetime-local"
      value={toLocalInput(value)}
      min={minimumDate ? toLocalInput(minimumDate) : undefined}
      onChange={(e) => {
        const next = new Date(e.target.value);
        if (!Number.isNaN(next.getTime())) onChange(next);
      }}
      style={{
        height: 46,
        padding: `0 ${space.lg}px`,
        border: "none",
        outline: "none",
        borderRadius: radius.md,
        background: colors.surfaceAlt,
        color: colors.text,
        colorScheme: scheme,
        fontFamily: fonts.medium,
        fontSize: 15,
      }}
    />
  );
}
