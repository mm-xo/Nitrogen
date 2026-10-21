import * as React from "react";
import { StyleSheet, View } from "react-native";

import { CAMPUS_CENTER } from "../../constants/campus";
import { getCategory } from "../../constants/categories";
import { useLocation } from "../../context/LocationContext";
import { useTheme } from "../../theme";
import { buildMapHtml } from "./mapDocument";
import { MapFrame } from "./MapFrame";

const pageColors = (c) => ({
  bg: c.bg,
  accent: c.accent,
  accentSoft: c.accentSoft,
  muted: c.textSubtle,
  glass: c.glass,
});

// MapLibre + OpenFreeMap map with the same props and ref API as NativeMap.
export const HtmlMap = React.forwardRef(function HtmlMap(
  {
    alerts = [],
    selectedId,
    onSelect,
    interactive = true,
    center = CAMPUS_CENTER,
    delta = 0.018,
    showCampus = true,
    controlsInset = 0,
    style,
  },
  ref
) {
  const frame = React.useRef(null);
  const { colors, scheme } = useTheme();
  const { coordinates } = useLocation();
  const [ready, setReady] = React.useState(false);
  const latest = React.useRef({ alerts, onSelect });
  latest.current = { alerts, onSelect };

  // Built once. Later changes travel over the bridge so the page never reloads.
  const [html] = React.useState(() =>
    buildMapHtml({ center, delta, interactive, showCampus, scheme, colors: pageColors(colors), controlsInset })
  );

  const send = React.useCallback((msg) => frame.current?.post(msg), []);

  React.useImperativeHandle(ref, () => ({
    focus: (point, zoomDelta = 0.006, bottomInset = 0) =>
      send({ type: "focus", lat: point.lat, lng: point.lng, delta: zoomDelta, bottomInset }),
    showCampus: () => send({ type: "campus" }),
  }));

  const pins = React.useMemo(
    () =>
      alerts.map((a) => {
        const cat = getCategory(a.category);
        return { id: a.id, lat: a.latitude, lng: a.longitude, color: cat.color, icon: cat.icon, title: a.title };
      }),
    [alerts]
  );

  React.useEffect(() => {
    if (ready) send({ type: "pins", pins, selectedId: selectedId ?? null });
  }, [ready, pins, selectedId, send]);

  React.useEffect(() => {
    if (ready) send({ type: "theme", scheme, colors: pageColors(colors) });
  }, [ready, scheme, colors, send]);

  React.useEffect(() => {
    if (ready) send({ type: "user", coords: interactive ? coordinates : null });
  }, [ready, interactive, coordinates, send]);

  React.useEffect(() => {
    if (ready) send({ type: "insets", controls: controlsInset });
  }, [ready, controlsInset, send]);

  const onMessage = React.useCallback((msg) => {
    if (msg.type === "ready") {
      setReady(true);
    } else if (msg.type === "select") {
      const alert = msg.id ? latest.current.alerts.find((a) => a.id === msg.id) : null;
      latest.current.onSelect?.(alert ?? null);
    }
  }, []);

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: colors.bg },
        // A static map must not swallow the scroll gestures of the screen around it.
        !interactive && styles.passThrough,
        style,
      ]}
    >
      <MapFrame ref={frame} html={html} onMessage={onMessage} />
    </View>
  );
});

const styles = StyleSheet.create({
  passThrough: {
    pointerEvents: "none",
  },
});
