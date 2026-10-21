import * as React from "react";
import { Platform, StyleSheet, View } from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Feather } from "@expo/vector-icons";

import { CAMPUS_CENTER, CAMPUS_RADIUS_M } from "../../constants/campus";
import { getCategory, withAlpha } from "../../constants/categories";
import { useTheme } from "../../theme";
import { darkMapStyle, lightMapStyle } from "./mapStyles";

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
  const mapRef = React.useRef(null);
  const height = React.useRef(0);
  const { colors, isDark, scheme } = useTheme();

  React.useImperativeHandle(ref, () => ({
    // bottomInset: px covered by UI at the bottom; the point lands centred in the space above it.
    focus: (point, zoomDelta = 0.006, bottomInset = 0) => {
      const shift = height.current ? (bottomInset / 2 / height.current) * zoomDelta : 0;
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
      userInterfaceStyle={scheme}
      showsUserLocation={interactive}
      showsMyLocationButton={false}
      showsCompass={false}
      showsPointsOfInterest={false}
      showsBuildings={false}
      toolbarEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
      scrollEnabled={interactive}
      zoomEnabled={interactive}
      onLayout={(e) => {
        height.current = e.nativeEvent.layout.height;
      }}
      onPress={(e) => {
        if (e.nativeEvent?.action !== "marker-press") onSelect?.(null);
      }}
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
        <Pin key={a.id} alert={a} selected={a.id === selectedId} onPress={onSelect} />
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
