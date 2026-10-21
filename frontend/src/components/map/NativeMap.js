import * as React from "react";
import { Platform, StyleSheet, View } from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Feather } from "@expo/vector-icons";

import { CAMPUS_CENTER, CAMPUS_RADIUS_M } from "../../constants/campus";
import { getCategory, withAlpha } from "../../constants/categories";
import { useTheme } from "../../theme";
import { darkMapStyle, lightMapStyle } from "./mapStyles";
import { MARKER_PRESS_WINDOW, nearestPinId } from "./mapTaps";

// Apple Maps on iOS; Google Maps on Android (only used in builds that ship a Maps API key, see mapEngine.js).
const provider = Platform.OS === "android" ? PROVIDER_GOOGLE : undefined;
const toRegion = ({ lat, lng }, delta) => ({
  latitude: lat,
  longitude: lng,
  latitudeDelta: delta,
  longitudeDelta: delta,
});

// Custom marker views are rasterised; only let them re-render briefly after a change.
function Pin({ alert, selected, onPress }) {
  const cat = getCategory(alert.category);
  const [track, setTrack] = React.useState(true);

  React.useEffect(() => {
    setTrack(true);
    const t = setTimeout(() => setTrack(false), 600);
    return () => clearTimeout(t);
  }, [selected]);

  return (
    <Marker
      coordinate={{ latitude: alert.latitude, longitude: alert.longitude }}
      onPress={(e) => {
        e.stopPropagation?.();
        onPress?.(alert);
      }}
      tracksViewChanges={track}
      anchor={{ x: 0.5, y: 0.5 }}
      zIndex={selected ? 10 : 1}
      accessibilityLabel={alert.title}
    >
      <View style={styles.pinBox}>
        <View
          style={[
            selected ? styles.pinSelected : styles.pin,
            { backgroundColor: cat.color },
          ]}
        >
          {selected ? <Feather name={cat.icon} size={15} color="#fff" /> : null}
        </View>
      </View>
    </Marker>
  );
}

export const NativeMap = React.forwardRef(function NativeMap(
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
  const mapRef = React.useRef(null);
  const height = React.useRef(0);
  const lastMarkerPress = React.useRef(0);
  const latest = React.useRef({ alerts, onSelect });
  latest.current = { alerts, onSelect };
  const { colors, isDark, scheme } = useTheme();

  const pressMarker = React.useCallback((alert) => {
    lastMarkerPress.current = Date.now();
    latest.current.onSelect?.(alert);
  }, []);

  // Under the new architecture the map's onPress always reports action "press", even for a tap that
  // landed on a marker, and on iOS it arrives after the marker's own onPress. So a recent marker
  // press wins; any other tap on iOS selects the nearest pin within reach, and only a tap on empty
  // map deselects.
  const pressMap = React.useCallback(async (e) => {
    const { action, position } = e.nativeEvent ?? {};
    if (action === "marker-press" || Date.now() - lastMarkerPress.current < MARKER_PRESS_WINDOW) return;
    const { alerts: list, onSelect: select } = latest.current;
    if (Platform.OS === "ios" && position && mapRef.current) {
      const points = await Promise.all(
        list.map((a) =>
          mapRef.current
            .pointForCoordinate({ latitude: a.latitude, longitude: a.longitude })
            .then((p) => ({ id: a.id, x: p.x, y: p.y }), () => null)
        )
      );
      const id = nearestPinId(position, points.filter(Boolean));
      if (id) {
        pressMarker(list.find((a) => a.id === id));
        return;
      }
    }
    select?.(null);
  }, [pressMarker]);

  React.useImperativeHandle(ref, () => ({
    // bottomInset: px covered by UI at the bottom; the point lands centred in the space above it.
    // mapPadding already reserves controlsInset, so only the remainder needs a manual shift.
    focus: (point, zoomDelta = 0.006, bottomInset = 0) => {
      const visible = height.current - controlsInset;
      const extra = Math.max(0, bottomInset - controlsInset);
      const shift = visible > 0 ? (extra / 2 / visible) * zoomDelta : 0;
      mapRef.current?.animateToRegion(toRegion({ lat: point.lat - shift, lng: point.lng }, zoomDelta), 450);
    },
    showCampus: () => mapRef.current?.animateToRegion(toRegion(CAMPUS_CENTER, 0.022), 500),
  }));

  return (
    <MapView
      ref={mapRef}
      provider={provider}
      style={[StyleSheet.absoluteFill, style]}
      initialRegion={toRegion(center, delta)}
      customMapStyle={isDark ? darkMapStyle : lightMapStyle}
      mapType={Platform.OS === "ios" ? "mutedStandard" : "standard"}
      userInterfaceStyle={scheme}
      // Keeps the Apple legal link / Google logo clear of the floating tab bar.
      mapPadding={{ top: 0, left: 0, right: 0, bottom: controlsInset }}
      showsUserLocation={interactive}
      showsMyLocationButton={false}
      showsCompass={false}
      showsPointsOfInterests={false}
      showsBuildings={false}
      toolbarEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
      scrollEnabled={interactive}
      zoomEnabled={interactive}
      onLayout={(e) => {
        height.current = e.nativeEvent.layout.height;
      }}
      onPress={pressMap}
    >
      {showCampus ? (
        <Circle
          center={{ latitude: CAMPUS_CENTER.lat, longitude: CAMPUS_CENTER.lng }}
          radius={CAMPUS_RADIUS_M}
          strokeColor={withAlpha(colors.accent, 0.45)}
          strokeWidth={1.5}
          fillColor={withAlpha(colors.accent, 0.04)}
        />
      ) : null}
      {alerts.map((a) => (
        <Pin key={a.id} alert={a} selected={a.id === selectedId} onPress={pressMarker} />
      ))}
    </MapView>
  );
});

const styles = StyleSheet.create({
  // No shadows here: markers are rasterised, and a shadow leaves a visible box behind the pin on Android.
  pinBox: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  pin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: "#fff",
  },
  pinSelected: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
