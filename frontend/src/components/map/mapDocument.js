// Self-contained MapLibre page rendered by HtmlMap: inside a WebView on Android (Expo Go, or builds without a
// Google Maps key) and inside an iframe on web. Vector tiles come from OpenFreeMap (free, no key, no limits).
//
// Bridge: the host calls window.nitrogenMap.handle(msg); the page answers with { type: "ready" | "select" }
// through ReactNativeWebView.postMessage (native) or window.parent.postMessage (web).
import { CAMPUS_CENTER, CAMPUS_RADIUS_M } from "../../constants/campus";
import { PIN_ICONS } from "./pinIcons";

export const MAPLIBRE_VERSION = "5.24.0";
const CDN = `https://cdn.jsdelivr.net/npm/maplibre-gl@${MAPLIBRE_VERSION}/dist`;

const STYLES = {
  light: "https://tiles.openfreemap.org/styles/positron",
  dark: "https://tiles.openfreemap.org/styles/dark",
};

// Safe to inline inside <script>: no "</script>" can survive.
const json = (value) => JSON.stringify(value).replace(/</g, "\\u003c");

const CSS = `
html, body, #map { margin: 0; width: 100%; height: 100%; overflow: hidden; background: var(--bg); }
body { -webkit-tap-highlight-color: transparent; -webkit-user-select: none; user-select: none; }
.maplibregl-canvas { outline: none; }
.maplibregl-ctrl-bottom-right, .maplibregl-ctrl-bottom-left { bottom: var(--inset, 0px); transition: bottom .25s ease; }
.maplibregl-ctrl-attrib { font: 10px/1.4 -apple-system, system-ui, sans-serif; }
.maplibregl-ctrl-attrib.maplibregl-compact { background: var(--glass); color: var(--muted); }
.maplibregl-ctrl-attrib a { color: var(--muted); }
/* MapLibre owns position/transform of the marker root, so all visuals live on the inner .n-pin.
   Markers ignore input: taps are matched to the nearest pin in script (see "Tap detection"). */
.n-marker, .n-user { pointer-events: none; }
.n-pin { position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.n-pin::before { content: ""; position: absolute; width: 16px; height: 16px; border-radius: 50%; background: var(--pin);
  border: 2.5px solid #fff; box-sizing: border-box; box-shadow: 0 1px 4px rgba(0,0,0,.3);
  transition: width .32s cubic-bezier(.2,.9,.25,1.25), height .32s cubic-bezier(.2,.9,.25,1.25), border-width .2s; }
.n-pin.is-selected::before { width: 34px; height: 34px; border-width: 3px; box-shadow: 0 3px 12px rgba(0,0,0,.3); }
.n-pin svg { position: relative; width: 15px; height: 15px; fill: none; stroke: #fff; stroke-width: 2.25;
  stroke-linecap: round; stroke-linejoin: round; opacity: 0; transform: scale(.4);
  transition: opacity .18s ease, transform .32s cubic-bezier(.2,.9,.25,1.25); }
.n-pin.is-selected svg { opacity: 1; transform: scale(1); }
.n-pin-in { animation: n-pin-in .45s cubic-bezier(.2,.9,.25,1.2) both; }
@keyframes n-pin-in { from { opacity: 0; transform: scale(.3); } to { opacity: 1; transform: scale(1); } }
.n-user { width: 18px; height: 18px; border-radius: 50%; background: var(--accent); border: 3px solid #fff; box-sizing: border-box;
  box-shadow: 0 1px 4px rgba(0,0,0,.25); animation: n-user 2.4s ease-out infinite; }
@keyframes n-user { 0% { box-shadow: 0 0 0 0 var(--accent-soft), 0 1px 4px rgba(0,0,0,.25); }
  70% { box-shadow: 0 0 0 16px transparent, 0 1px 4px rgba(0,0,0,.25); } 100% { box-shadow: 0 0 0 0 transparent, 0 1px 4px rgba(0,0,0,.25); } }
.n-offline { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 24px;
  font: 13px/1.4 -apple-system, system-ui, sans-serif; color: var(--muted); text-align: center; }
`;

// Runs inside the page. Plain ES2017, no imports.
const SCRIPT = `
(function () {
  var state = { scheme: INIT.scheme, colors: INIT.colors, pins: [], selectedId: null };
  var root = document.documentElement.style;

  function post(msg) {
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    else if (window.parent !== window) window.parent.postMessage({ source: "nitrogen-map", payload: msg }, "*");
  }

  function applyColors(c) {
    root.setProperty("--bg", c.bg);
    root.setProperty("--accent", c.accent);
    root.setProperty("--accent-soft", c.accentSoft);
    root.setProperty("--muted", c.muted);
    root.setProperty("--glass", c.glass);
  }
  applyColors(INIT.colors);
  root.setProperty("--inset", INIT.controlsInset + "px");

  if (!window.maplibregl) {
    document.getElementById("map").innerHTML = '<div class="n-offline">Map unavailable — check your connection.</div>';
    window.nitrogenMap = { handle: function () {} };
    post({ type: "ready" });
    return;
  }

  var COS = Math.cos(CAMPUS.lat * Math.PI / 180);
  // react-native-maps-style latitudeDelta -> MapLibre zoom for this viewport height (512px tiles).
  function deltaToZoom(delta) {
    var h = document.getElementById("map").clientHeight || 700;
    return Math.log2((h * 360 * COS) / (512 * delta));
  }

  function circle(c, r) {
    var pts = [];
    for (var i = 0; i <= 72; i++) {
      var a = (i / 72) * Math.PI * 2;
      pts.push([c.lng + (r * Math.cos(a)) / (111320 * COS), c.lat + (r * Math.sin(a)) / 110540]);
    }
    return { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [pts] } };
  }

  var map = new maplibregl.Map({
    container: "map",
    style: STYLES[INIT.scheme],
    center: [INIT.center.lng, INIT.center.lat],
    zoom: deltaToZoom(INIT.delta),
    interactive: INIT.interactive,
    attributionControl: false,
    // Default is 3px, so the slightest finger wobble on a tap became a pan.
    clickTolerance: 6,
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
    maxPitch: 0,
    fadeDuration: 200,
  });
  // Bottom-left keeps it clear of the floating buttons on the right.
  map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
  if (INIT.interactive) map.touchZoomRotate.disableRotation();

  // Custom layers vanish on every style swap, so re-apply them whenever a style finishes loading.
  map.on("style.load", function () {
    if (map.getLayer("background")) map.setPaintProperty("background", "background-color", state.colors.bg);
    if (!INIT.showCampus) return;
    var firstLabel = (map.getStyle().layers.find(function (l) { return l.type === "symbol"; }) || {}).id;
    map.addSource("campus", { type: "geojson", data: circle(CAMPUS, CAMPUS.radius) });
    map.addLayer({ id: "campus-fill", type: "fill", source: "campus",
      paint: { "fill-color": state.colors.accent, "fill-opacity": 0.04 } }, firstLabel);
    map.addLayer({ id: "campus-line", type: "line", source: "campus",
      paint: { "line-color": state.colors.accent, "line-opacity": 0.45, "line-width": 1.5 } }, firstLabel);
  });

  // Tap detection. MapLibre treats any drift past clickTolerance as a pan and calls preventDefault()
  // on touchmove, which stops the WebView from ever firing "click" on a marker. So taps are
  // recognised from pointer events with a forgiving slop, and the nearest pin within reach wins:
  // the dots stay small but are easy to hit, and overlapping pins resolve to the closest one.
  var TAP_SLOP = 12;
  var TAP_RADIUS = 30;
  var surface = map.getCanvasContainer();
  var tap = null;

  function pinNear(e) {
    var rect = map.getContainer().getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    var best = null;
    var bestDist = TAP_RADIUS;
    state.pins.forEach(function (pin) {
      var p = map.project([pin.lng, pin.lat]);
      var d = Math.hypot(p.x - x, p.y - y);
      if (d <= bestDist) {
        best = pin;
        bestDist = d;
      }
    });
    return best;
  }

  if (INIT.interactive) {
    surface.addEventListener("pointerdown", function (e) {
      // A second finger means a pinch, never a tap.
      tap = e.isPrimary ? { id: e.pointerId, x: e.clientX, y: e.clientY, t: Date.now() } : null;
    }, true);
    surface.addEventListener("pointermove", function (e) {
      if (tap && e.pointerId === tap.id && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) > TAP_SLOP) tap = null;
      if (e.pointerType === "mouse" && e.buttons === 0) surface.style.cursor = pinNear(e) ? "pointer" : "";
    }, true);
    surface.addEventListener("pointerup", function (e) {
      var t = tap;
      tap = null;
      if (!t || e.pointerId !== t.id || Date.now() - t.t > 700) return;
      var pin = pinNear(e);
      post({ type: "select", id: pin ? pin.id : null });
    }, true);
    surface.addEventListener("pointercancel", function () { tap = null; }, true);
  }

  // The dark style references fill patterns it doesn't ship; a blank image silences the warning.
  map.on("styleimagemissing", function (e) {
    if (!map.hasImage(e.id)) map.addImage(e.id, { width: 1, height: 1, data: new Uint8Array(4) });
  });

  var markers = {};
  function pinElement(pin) {
    var el = document.createElement("div");
    el.className = "n-marker";
    el.setAttribute("aria-label", pin.title);
    el.innerHTML = '<div class="n-pin n-pin-in"><svg viewBox="0 0 24 24">' + (ICONS[pin.icon] || ICONS.bell) + "</svg></div>";
    return el;
  }

  function renderPins() {
    var keep = {};
    state.pins.forEach(function (pin) {
      keep[pin.id] = true;
      var m = markers[pin.id];
      if (!m) {
        var node = pinElement(pin);
        m = markers[pin.id] = new maplibregl.Marker({ element: node, anchor: "center" }).setLngLat([pin.lng, pin.lat]).addTo(map);
      } else {
        m.setLngLat([pin.lng, pin.lat]);
      }
      var el = m.getElement();
      var selected = pin.id === state.selectedId;
      el.style.setProperty("--pin", pin.color);
      el.firstChild.classList.toggle("is-selected", selected);
      el.style.zIndex = selected ? "2" : "1";
    });
    Object.keys(markers).forEach(function (id) {
      if (!keep[id]) { markers[id].remove(); delete markers[id]; }
    });
  }

  var userMarker = null;
  function setUser(coords) {
    if (!coords) { if (userMarker) { userMarker.remove(); userMarker = null; } return; }
    if (!userMarker) {
      var el = document.createElement("div");
      el.className = "n-user";
      userMarker = new maplibregl.Marker({ element: el, anchor: "center" });
      userMarker.setLngLat([coords.lng, coords.lat]).addTo(map);
    } else {
      userMarker.setLngLat([coords.lng, coords.lat]);
    }
  }

  window.nitrogenMap = {
    handle: function (msg) {
      switch (msg.type) {
        case "pins":
          state.pins = msg.pins;
          state.selectedId = msg.selectedId;
          renderPins();
          break;
        case "theme":
          var schemeChanged = msg.scheme !== state.scheme;
          state.scheme = msg.scheme;
          state.colors = msg.colors;
          applyColors(msg.colors);
          if (schemeChanged) map.setStyle(STYLES[msg.scheme], { diff: false });
          break;
        case "user":
          setUser(msg.coords);
          break;
        case "insets":
          root.setProperty("--inset", msg.controls + "px");
          break;
        case "focus":
          map.flyTo({ center: [msg.lng, msg.lat], zoom: deltaToZoom(msg.delta),
            padding: { top: 0, right: 0, left: 0, bottom: msg.bottomInset || 0 }, duration: 650, essential: true });
          break;
        case "campus":
          var r = CAMPUS.radius * 1.05;
          map.fitBounds([[CAMPUS.lng - r / (111320 * COS), CAMPUS.lat - r / 110540], [CAMPUS.lng + r / (111320 * COS), CAMPUS.lat + r / 110540]],
            { padding: { top: 120, bottom: 140, left: 24, right: 24 }, duration: 700 });
          break;
      }
    },
  };
  post({ type: "ready" });
})();
`;

// init: { center, delta, interactive, showCampus, scheme, colors, controlsInset }
export function buildMapHtml(init) {
  const campus = { lat: CAMPUS_CENTER.lat, lng: CAMPUS_CENTER.lng, radius: CAMPUS_RADIUS_M };
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="stylesheet" href="${CDN}/maplibre-gl.css">
<style>${CSS}</style>
</head>
<body>
<div id="map"></div>
<script src="${CDN}/maplibre-gl.js"></script>
<script>
var INIT = ${json(init)};
var STYLES = ${json(STYLES)};
var CAMPUS = ${json(campus)};
var ICONS = ${json(PIN_ICONS)};
${SCRIPT}
</script>
</body>
</html>`;
}
