export const ALERT_LIMITS = {
  titleMin: 3,
  titleMax: 100,
  messageMin: 10,
  messageMax: 1000,
};

// Errors the UI knows how to place next to a field instead of showing a generic failure.
export class BackendError extends Error {
  constructor(message, { code = "unknown", field = null } = {}) {
    super(message);
    this.code = code;
    this.field = field;
  }
}

export function validateAlertInput({ title, message, category }) {
  const t = (title ?? "").trim();
  const m = (message ?? "").trim();
  if (t.length < ALERT_LIMITS.titleMin || t.length > ALERT_LIMITS.titleMax) {
    throw new BackendError(
      `Title must be ${ALERT_LIMITS.titleMin}–${ALERT_LIMITS.titleMax} characters`,
      { code: "invalid", field: "title" }
    );
  }
  if (m.length < ALERT_LIMITS.messageMin || m.length > ALERT_LIMITS.messageMax) {
    throw new BackendError(
      `Description must be ${ALERT_LIMITS.messageMin}–${ALERT_LIMITS.messageMax} characters`,
      { code: "invalid", field: "message" }
    );
  }
  if (!category) {
    throw new BackendError("Pick a category", { code: "invalid", field: "category" });
  }
}
