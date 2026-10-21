// Web build of CampusMap: react-native-maps has no web target, so this renders Leaflet over
// OpenStreetMap tiles, desaturated with CSS for a quiet basemap. Same props and ref API as CampusMap.js.
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { CAMPUS_CENTER, CAMPUS_RADIUS_M } from "../../constants/campus";
import { getCategory } from "../../constants/categories";
import { fonts, useTheme } from "../../theme";
import { useLocation } from "../../context/LocationContext";

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const TILE_FILTER = {
  light: "grayscale(1) brightness(1.08) contrast(0.82)",
  dark: "grayscale(1) invert(1) brightness(0.78) contrast(1.15)",
};

// Rough Leaflet zoom for a react-native-maps latitudeDelta.
const deltaToZoom = (delta) => Math.round(Math.log2(360 / delta) * 4) / 4 - 0.25;

const CSS = `
.n-map.leaflet-container { font-family: ${fonts.regular}, system-ui, sans-serif; }
.n-map .leaflet-tile-pane { filter: var(--n-tile-filter); }
.n-map .leaflet-control-attribution { font-size: 10px; background: transparent; color: var(--n-muted); }
.n-map .leaflet-control-attribution a { color: var(--n-muted); }
.n-pin-wrap { background: none; border: 0; }
.n-pin { position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.n-pin::before { content: ""; position: absolute; width: 16px; height: 16px; border-radius: 50%; background: var(--pin);
  border: 2.5px solid #fff; box-sizing: border-box; box-shadow: 0 1px 4px rgba(0,0,0,.3);
  transition: width .32s cubic-bezier(.2,.9,.25,1.25), height .32s cubic-bezier(.2,.9,.25,1.25), border-width .2s; }
.n-pin:hover::before { width: 20px; height: 20px; }
.n-pin.is-selected::before { width: 34px; height: 34px; border-width: 3px; box-shadow: 0 3px 12px rgba(0,0,0,.3); }
.n-pin-icon { position: relative; font-family: feather; font-size: 15px; line-height: 1; color: #fff; opacity: 0; transform: scale(.4);
  transition: opacity .18s ease, transform .32s cubic-bezier(.2,.9,.25,1.25); }
.n-pin.is-selected .n-pin-icon { opacity: 1; transform: scale(1); }
.n-pin-enter { animation: n-pin-in .45s cubic-bezier(.2,.9,.25,1.2) both; }
@keyframes n-pin-in { from { opacity: 0; transform: scale(.3); } to { opacity: 1; transform: scale(1); } }
.n-user { width: 18px; height: 18px; border-radius: 50%; background: var(--n-accent); border: 3px solid #fff; box-sizing: border-box;
  box-shadow: 0 1px 4px rgba(0,0,0,.25); animation: n-user-pulse 2.4s ease-out infinite; }
@keyframes n-user-pulse { 0% { box-shadow: 0 0 0 0 var(--n-accent-soft), 0 1px 4px rgba(0,0,0,.25); }
  70% { box-shadow: 0 0 0 16px transparent, 0 1px 4px rgba(0,0,0,.25); } 100% { box-shadow: 0 0 0 0 transparent, 0 1px 4px rgba(0,0,0,.25); } }
`;

function injectCss() {
  if (document.getElementById("n-map-css")) return;
  const el = document.createElement("style");
  el.id = "n-map-css";
  el.textContent = CSS;
  document.head.appendChild(el);
}

function glyph(name) {
  const code = Feather.glyphMap?.[name];
  return code ? `&#${code};` : "";
}

function pinHtml(cat, selected) {
  return `<div class="n-pin n-pin-enter${selected ? " is-selected" : ""}" style="--pin:${cat.color}"><span class="n-pin-icon">${glyph(cat.icon)}</span></div>`;
}

export const CampusMap = React.forwardRef(function CampusMap(
  {
    alerts = [],
    selectedId,
    onSelect,
    interactive = true,
    center = CAMPUS_CENTER,
    delta = 0.018,
    showCampus = true,
    style,
  },
  ref
) {
  const container = React.useRef(null);
  const map = React.useRef(null);
  const tiles = React.useRef(null);
  const campus = React.useRef(null);
  const userMarker = React.useRef(null);
  const markers = React.useRef(new Map());
  const latest = React.useRef({ alerts, onSelect });
  latest.current = { alerts, onSelect };

  const { colors, isDark } = useTheme();
  const { coordinates } = useLocation();

  // bottomInset: px covered by UI at the bottom; the point lands centred in the space above it.
  const flyTo = React.useCallback((lat, lng, zoom, bottomInset = 0) => {
    const m = map.current;
    if (!m) return;
    const z = zoom ?? m.getZoom();
    const pt = m.project([lat, lng], z).add([0, bottomInset / 2]);
    m.flyTo(m.unproject(pt, z), z, { duration: 0.6, easeLinearity: 0.2 });
  }, []);

  React.useImperativeHandle(ref, () => ({
    focus: ({ lat, lng }, zoomDelta = 0.006, bottomInset = 0) =>
      flyTo(lat, lng, deltaToZoom(zoomDelta), bottomInset),
    showCampus: () => flyTo(CAMPUS_CENTER.lat, CAMPUS_CENTER.lng, deltaToZoom(0.022)),
  }));

  React.useEffect(() => {
    injectCss();
    const m = L.map(container.current, {
      zoomControl: false,
      attributionControl: true,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      touchZoom: interactive,
      keyboard: interactive,
      boxZoom: false,
      zoomSnap: 0.25,
      fadeAnimation: true,
      zoomAnimation: true,
    }).setView([center.lat, center.lng], deltaToZoom(delta));
    m.attributionControl.setPrefix(false);
    m.on("click", () => latest.current.onSelect?.(null));
    map.current = m;

    const resize = new ResizeObserver(() => m.invalidateSize({ pan: false }));
    resize.observe(container.current);
    return () => {
      resize.disconnect();
      markers.current.clear();
      tiles.current = campus.current = userMarker.current = null;
      m.remove();
      map.current = null;
    };
    // The map instance is created once; later prop changes are applied by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const el = container.current;
    el.style.setProperty("--n-accent", colors.accent);
    el.style.setProperty("--n-accent-soft", colors.accentSoft);
    el.style.setProperty("--n-muted", colors.textSubtle);
    el.style.setProperty("--n-tile-filter", TILE_FILTER[isDark ? "dark" : "light"]);
    el.style.background = colors.bg;

    if (!tiles.current) {
      tiles.current = L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map.current);
    }
  }, [isDark, colors]);

  React.useEffect(() => {
    campus.current?.remove();
    campus.current = showCampus
      ? L.circle([CAMPUS_CENTER.lat, CAMPUS_CENTER.lng], {
          radius: CAMPUS_RADIUS_M,
          color: colors.accent,
          weight: 1.5,
          opacity: 0.45,
          fillColor: colors.accent,
          fillOpacity: 0.035,
          interactive: false,
        }).addTo(map.current)
      : null;
  }, [showCampus, colors.accent]);

  React.useEffect(() => {
    if (!interactive || !coordinates) {
      userMarker.current?.remove();
      userMarker.current = null;
      return;
    }
    const at = [coordinates.lat, coordinates.lng];
    if (userMarker.current) {
      userMarker.current.setLatLng(at);
    } else {
      userMarker.current = L.marker(at, {
        icon: L.divIcon({ className: "n-pin-wrap", html: '<div class="n-user"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }),
        interactive: false,
        keyboard: false,
        zIndexOffset: -100,
      }).addTo(map.current);
    }
  }, [coordinates, interactive]);

  React.useEffect(() => {
    const m = map.current;
    const live = markers.current;
    const ids = new Set(alerts.map((a) => a.id));

    for (const [id, marker] of live) {
      if (!ids.has(id)) {
        marker.remove();
        live.delete(id);
      }
    }

    alerts.forEach((a) => {
      const cat = getCategory(a.category);
      const selected = a.id === selectedId;
      let marker = live.get(a.id);
      if (!marker) {
        marker = L.marker([a.latitude, a.longitude], {
          icon: L.divIcon({ className: "n-pin-wrap", html: pinHtml(cat, selected), iconSize: [44, 44], iconAnchor: [22, 22] }),
          title: a.title,
          riseOnHover: true,
          interactive,
        }).addTo(m);
        marker.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          const current = latest.current.alerts.find((x) => x.id === a.id);
          if (current) latest.current.onSelect?.(current);
        });
        live.set(a.id, marker);
      } else {
        marker.setLatLng([a.latitude, a.longitude]);
      }
      // Toggle the class rather than swapping icons so the size change animates.
      marker.getElement()?.querySelector(".n-pin")?.classList.toggle("is-selected", selected);
      marker.setZIndexOffset(selected ? 1000 : 0);
    });
  }, [alerts, selectedId, interactive]);

  return (
    <View style={[StyleSheet.absoluteFill, style]}>
      <div ref={container} className="n-map" style={{ position: "absolute", inset: 0 }} />
    </View>
  );
});
