import * as React from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { glassBlur, makeStyles, motion, space } from "../theme";
import { Icon, PressableScale } from "../ui";
import { haptics } from "../utils/haptics";

export const TAB_BAR_HEIGHT = 64;
const INDICATOR_W = 52;
const INDICATOR_H = 40;

const ICONS = {
  Map: "map",
  Feed: "zap",
  Mine: "layers",
  Profile: "user",
};

const LABELS = {
  Map: "Map",
  Feed: "Feed",
  Mine: "Your alerts",
  Profile: "Profile",
};

// Bottom padding a scrolling tab screen needs so its last item clears the floating bar.
export function useTabBarSpace() {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, space.md) + TAB_BAR_HEIGHT + space.xxl;
}

export function TabBar({ state, navigation }) {
  const s = useStyles();
  const insets = useSafeAreaInsets();
  const [layouts, setLayouts] = React.useState({});
  const x = useSharedValue(-INDICATOR_W);
  const ready = React.useRef(false);

  const active = layouts[state.index];
  React.useEffect(() => {
    if (!active) return;
    const target = active.x + (active.width - INDICATOR_W) / 2;
    // Jump into place the first time, glide afterwards.
    x.value = ready.current ? withSpring(target, motion.spring) : target;
    ready.current = true;
  }, [active, x]);

  const indicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  const middle = Math.ceil(state.routes.length / 2);

  const renderTab = (route, index) => {
    const focused = state.index === index;
    return (
      <Pressable
        key={route.key}
        style={s.tab}
        onLayout={(e) => {
          const { x: lx, width } = e.nativeEvent.layout;
          setLayouts((prev) => ({ ...prev, [index]: { x: lx, width } }));
        }}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={LABELS[route.name] ?? route.name}
        onPress={() => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            haptics.tap();
            navigation.navigate(route.name);
          }
        }}
      >
        <Icon name={ICONS[route.name] ?? "circle"} size={21} color={focused ? "text" : "textSubtle"} />
      </Pressable>
    );
  };

  return (
    <View style={[s.host, { bottom: Math.max(insets.bottom, space.md) }]}>
      <View style={s.bar} accessibilityRole="tablist">
        <Animated.View style={[s.indicator, indicatorStyle]} />
        {state.routes.slice(0, middle).map((r, i) => renderTab(r, i))}
        <View style={s.createSlot}>
          <PressableScale
            haptic
            scaleTo={0.9}
            onPress={() => navigation.navigate("CreateAlert")}
            style={s.create}
            accessibilityRole="button"
            accessibilityLabel="New alert"
          >
            <Icon name="plus" size={22} color="onAccent" />
          </PressableScale>
        </View>
        {state.routes.slice(middle).map((r, i) => renderTab(r, i + middle))}
      </View>
    </View>
  );
}

const useStyles = makeStyles((c, t) => ({
  host: {
    pointerEvents: "box-none",
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    height: TAB_BAR_HEIGHT,
    width: "88%",
    maxWidth: 380,
    paddingHorizontal: space.sm,
    borderRadius: TAB_BAR_HEIGHT / 2,
    backgroundColor: c.glass,
    ...glassBlur,
    borderWidth: 1,
    borderColor: c.border,
    ...t.shadow.lg,
  },
  indicator: {
    position: "absolute",
    left: 0,
    top: (TAB_BAR_HEIGHT - 2 - INDICATOR_H) / 2,
    width: INDICATOR_W,
    height: INDICATOR_H,
    borderRadius: INDICATOR_H / 2,
    backgroundColor: c.surfaceAlt,
  },
  tab: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  createSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  create: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.accent,
    boxShadow: `0px 6px 16px ${t.isDark ? "rgba(0,0,0,0.5)" : "rgba(59,91,253,0.35)"}`,
  },
}));
