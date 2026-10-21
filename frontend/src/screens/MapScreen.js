import * as React from "react";
import { ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown, SlideInDown, SlideOutDown } from "react-native-reanimated";

import { CATEGORY_LIST, getCategory } from "../constants/categories";
import { useLocation } from "../context/LocationContext";
import { useAlerts } from "../hooks/useAlerts";
import { glassBlur, makeStyles, radius, space, useTheme } from "../theme";
import { Chip, Icon, IconButton, PressableScale, Text } from "../ui";
import { CampusMap } from "../components/map/CampusMap";
import { CategoryTile } from "../components/CategoryTile";
import { Logo } from "../components/Logo";
import { TAB_BAR_HEIGHT } from "../navigation/TabBar";
import { formatDistance, timeAgo, timeLeft } from "../utils/format";
import { haptics } from "../utils/haptics";

// Height the preview card plus tab bar take up, so a focused pin stays visible above them.
const PREVIEW_SPACE = 260;

function PreviewCard({ alert, now, distance, onOpen, onClose, bottom }) {
  const s = useStyles();
  const cat = getCategory(alert.category);
  const dist = formatDistance(distance);
  return (
    <Animated.View
      entering={SlideInDown.springify().damping(20).stiffness(200)}
      exiting={SlideOutDown.duration(220)}
      style={[s.previewWrap, { bottom }]}
    >
      <View style={s.previewInner}>
      <PressableScale onPress={onOpen} scaleTo={0.98} haptic style={s.preview} accessibilityRole="button" accessibilityLabel={`Open ${alert.title}`}>
        <Animated.View key={alert.id} entering={FadeIn.duration(200)} style={s.previewRow}>
          <CategoryTile category={alert.category} size={44} />
          <View style={s.previewBody}>
            <Text variant="caption" color={cat.color}>
              {cat.label}
              <Text variant="caption" color="textSubtle">
                {"  ·  "}
                {timeAgo(alert.created_at, now)}
              </Text>
            </Text>
            <Text variant="headline" numberOfLines={2} style={s.previewTitle}>
              {alert.title}
            </Text>
            <View style={s.previewMeta}>
              <Icon name="clock" size={13} color="textSubtle" />
              <Text variant="caption" color="textMuted">
                {timeLeft(alert.expires_at, now)}
              </Text>
              {dist ? (
                <>
                  <Icon name="navigation" size={12} color="textSubtle" style={s.metaGap} />
                  <Text variant="caption" color="textMuted">
                    {dist}
                  </Text>
                </>
              ) : null}
            </View>
          </View>
          <Icon name="chevron-right" size={20} color="textSubtle" />
        </Animated.View>
      </PressableScale>
      <IconButton icon="x" size={28} variant="floating" accessibilityLabel="Close preview" onPress={onClose} style={s.previewClose} />
      </View>
    </Animated.View>
  );
}

export function MapScreen() {
  const s = useStyles();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { coordinates, distanceTo } = useLocation();
  const { alerts, now } = useAlerts({ activeOnly: true });

  const mapRef = React.useRef(null);
  const [filter, setFilter] = React.useState(null);
  const [selected, setSelected] = React.useState(null);

  const visible = React.useMemo(
    () => (filter ? alerts.filter((a) => getCategory(a.category).value === filter) : alerts),
    [alerts, filter]
  );

  // Drop the selection if its alert expires, is deleted or gets filtered out.
  React.useEffect(() => {
    if (selected && !visible.some((a) => a.id === selected.id)) setSelected(null);
  }, [visible, selected]);

  const tabBarTop = Math.max(insets.bottom, space.md) + TAB_BAR_HEIGHT;
  const previewBottom = tabBarTop + space.md;

  const select = React.useCallback((alert) => {
    setSelected(alert);
    if (alert) {
      haptics.soft();
      mapRef.current?.focus({ lat: alert.latitude, lng: alert.longitude }, 0.006, PREVIEW_SPACE);
    }
  }, []);

  const counts = React.useMemo(() => {
    const c = {};
    alerts.forEach((a) => {
      const k = getCategory(a.category).value;
      c[k] = (c[k] ?? 0) + 1;
    });
    return c;
  }, [alerts]);

  return (
    <View style={s.root}>
      <CampusMap
        ref={mapRef}
        alerts={visible}
        selectedId={selected?.id}
        onSelect={select}
      />

      <View style={[s.top, { paddingTop: insets.top + space.sm }]}>
        <Animated.View entering={FadeInDown.duration(500)} style={s.brandRow}>
          <View style={s.brandPill}>
            <Logo size="sm" />
            <View style={s.liveDot} />
            <Text variant="caption" color="textMuted">
              {alerts.length} live
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(500)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filters}
            style={s.filterScroll}
          >
            <Chip label="All" size="sm" selected={!filter} onPress={() => setFilter(null)} style={s.chipShadow} />
            {CATEGORY_LIST.filter((c) => counts[c.value]).map((c) => (
              <Chip
                key={c.value}
                label={`${c.label} ${counts[c.value]}`}
                size="sm"
                color={c.color}
                selected={filter === c.value}
                onPress={() => setFilter((f) => (f === c.value ? null : c.value))}
                style={s.chipShadow}
              />
            ))}
          </ScrollView>
        </Animated.View>
      </View>

      {!selected ? (
        <Animated.View
          entering={FadeIn}
          style={[s.fabs, { bottom: tabBarTop + space.lg }]}
        >
          {coordinates ? (
            <IconButton
              icon="navigation"
              variant="floating"
              size={44}
              accessibilityLabel="Center on my location"
              onPress={() => mapRef.current?.focus(coordinates, 0.008)}
            />
          ) : null}
          <IconButton
            icon="maximize"
            variant="floating"
            size={44}
            accessibilityLabel="Show all of campus"
            onPress={() => mapRef.current?.showCampus()}
          />
        </Animated.View>
      ) : null}

      {selected ? (
        <PreviewCard
          alert={selected}
          now={now}
          distance={distanceTo(selected)}
          bottom={previewBottom}
          onClose={() => setSelected(null)}
          onOpen={() => navigation.navigate("AlertDetail", { id: selected.id, alert: selected })}
        />
      ) : null}

      <View style={[s.fadeTop, { height: insets.top, backgroundColor: colors.bg }]} />
    </View>
  );
}

const useStyles = makeStyles((c, t) => ({
  root: {
    flex: 1,
    backgroundColor: c.bg,
  },
  top: {
    pointerEvents: "box-none",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  brandRow: {
    pointerEvents: "box-none",
    flexDirection: "row",
    paddingHorizontal: space.lg,
  },
  brandPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    height: 40,
    paddingLeft: space.sm,
    paddingRight: space.md + 2,
    borderRadius: radius.pill,
    backgroundColor: c.glass,
    ...glassBlur,
    borderWidth: 1,
    borderColor: c.border,
    ...t.shadow.md,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: space.xs,
    backgroundColor: c.success,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filters: {
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.md,
  },
  chipShadow: {
    borderRadius: radius.pill,
    ...t.shadow.sm,
  },
  fabs: {
    pointerEvents: "box-none",
    position: "absolute",
    right: space.lg,
    gap: space.sm,
  },
  previewWrap: {
    position: "absolute",
    left: space.lg,
    right: space.lg,
    alignItems: "center",
  },
  previewInner: {
    width: "100%",
    maxWidth: 420,
  },
  preview: {
    borderRadius: radius.xl,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    padding: space.lg,
    ...t.shadow.lg,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
  },
  previewBody: {
    flex: 1,
  },
  previewTitle: {
    marginTop: 2,
  },
  previewMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
    marginTop: space.sm,
  },
  metaGap: {
    marginLeft: space.sm,
  },
  previewClose: {
    position: "absolute",
    top: -10,
    right: -6,
  },
  fadeTop: {
    pointerEvents: "none",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    opacity: 0.6,
  },
}));
