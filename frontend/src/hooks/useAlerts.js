import * as React from "react";
import { useFocusEffect } from "@react-navigation/native";

import { backend } from "../data";
import { isExpired } from "../utils/format";

// Re-renders every `intervalMs` so relative times ("5m ago", "1h left") stay fresh.
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

// Alert list that reloads on focus and on backend change events.
// Pass `userId` to scope it to one author; `activeOnly` hides expired alerts.
export function useAlerts({ userId, activeOnly = false } = {}) {
  const [alerts, setAlerts] = React.useState([]);
  const [status, setStatus] = React.useState("loading");
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState(null);
  const now = useNow();
  const alive = React.useRef(true);

  React.useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const load = React.useCallback(
    async (mode = "silent") => {
      if (mode === "refresh") setRefreshing(true);
      try {
        const rows =
          userId !== undefined ? await backend.alerts.listByUser(userId) : await backend.alerts.list();
        if (!alive.current) return;
        setAlerts(rows);
        setError(null);
        setStatus("ready");
      } catch (e) {
        if (!alive.current) return;
        setError(e?.message ?? "Couldn't load alerts.");
        setStatus((s) => (s === "ready" ? s : "error"));
      } finally {
        if (alive.current) setRefreshing(false);
      }
    },
    [userId]
  );

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [load])
  );

  React.useEffect(() => backend.alerts.subscribe(() => load()), [load]);

  const remove = React.useCallback(
    async (id) => {
      setAlerts((list) => list.filter((a) => a.id !== id));
      try {
        await backend.alerts.remove(id);
      } catch (e) {
        load();
        throw e;
      }
    },
    [load]
  );

  const visible = React.useMemo(
    () => (activeOnly ? alerts.filter((a) => !isExpired(a, now)) : alerts),
    [alerts, activeOnly, now]
  );

  return {
    alerts: visible,
    status,
    error,
    refreshing,
    now,
    refresh: () => load("refresh"),
    retry: () => {
      setStatus("loading");
      load();
    },
    remove,
  };
}
