import * as React from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown, LinearTransition } from "react-native-reanimated";

import { CAMPUS_NAME } from "../constants/campus";
import { CATEGORY_LIST, getCategory } from "../constants/categories";
import { useLocation } from "../context/LocationContext";
import { useAlerts } from "../hooks/useAlerts";
import { makeStyles, space, useTheme } from "../theme";
import {
  AlertCardSkeleton,
  Button,
  Chip,
  EmptyState,
  Icon,
  LargeHeader,
  PressableScale,
  Screen,
  Text,
} from "../ui";
import { AlertCard } from "../components/AlertCard";
import { useTabBarSpace } from "../navigation/TabBar";
import { haptics } from "../utils/haptics";

const SORTS = [
  { value: "latest", label: "Latest", icon: "clock" },
  { value: "ending", label: "Ending soon", icon: "watch" },
  { value: "nearest", label: "Nearest", icon: "navigation" },
];

const sorters = {
  latest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
  ending: (a, b) => new Date(a.expires_at) - new Date(b.expires_at),
};

export function FeedScreen() {
  const s = useStyles();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { coordinates, distanceTo } = useLocation();
  const { alerts, status, error, refreshing, refresh, retry, now } = useAlerts({ activeOnly: true });
  const bottomSpace = useTabBarSpace();

  const [filter, setFilter] = React.useState(null);
  const [sort, setSort] = React.useState("latest");

  const sortOptions = coordinates ? SORTS : SORTS.filter((o) => o.value !== "nearest");
  const activeSort = sortOptions.find((o) => o.value === sort) ?? sortOptions[0];

  const data = React.useMemo(() => {
    const list = filter ? alerts.filter((a) => getCategory(a.category).value === filter) : [...alerts];
    if (activeSort.value === "nearest") {
      return list.sort((a, b) => (distanceTo(a) ?? Infinity) - (distanceTo(b) ?? Infinity));
    }
    return list.sort(sorters[activeSort.value]);
  }, [alerts, filter, activeSort.value, distanceTo]);

  const counts = React.useMemo(() => {
    const c = {};
    alerts.forEach((a) => {
      const k = getCategory(a.category).value;
      c[k] = (c[k] ?? 0) + 1;
    });
    return c;
  }, [alerts]);

  const cycleSort = () => {
    haptics.tap();
    const i = sortOptions.findIndex((o) => o.value === activeSort.value);
    setSort(sortOptions[(i + 1) % sortOptions.length].value);
  };

  const openCreate = () => navigation.navigate("CreateAlert");

  const header = (
    <View>
      <LargeHeader
        title="Feed"
        subtitle={
          status === "ready"
            ? `${alerts.length} live ${alerts.length === 1 ? "alert" : "alerts"} · ${CAMPUS_NAME}`
            : CAMPUS_NAME
        }
        right={
          <PressableScale onPress={cycleSort} style={s.sort} haptic={false} accessibilityRole="button" accessibilityLabel={`Sort: ${activeSort.label}`}>
            <Icon name={activeSort.icon} size={14} color="textMuted" />
            <Text variant="callout" color="textMuted">
              {activeSort.label}
            </Text>
          </PressableScale>
        }
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
        <Chip label="All" selected={!filter} onPress={() => setFilter(null)} />
        {CATEGORY_LIST.map((c) => (
          <Chip
            key={c.value}
            label={counts[c.value] ? `${c.label} ${counts[c.value]}` : c.label}
            icon={c.icon}
            color={c.color}
            selected={filter === c.value}
            onPress={() => setFilter((f) => (f === c.value ? null : c.value))}
          />
        ))}
      </ScrollView>
    </View>
  );

  let body = null;
  if (status === "loading") {
    body = (
      <View style={s.list}>
        {[0, 1, 2, 3].map((i) => (
          <AlertCardSkeleton key={i} />
        ))}
      </View>
    );
  } else if (status === "error") {
    body = (
      <EmptyState
        icon="wifi-off"
        title="Couldn't load the feed"
        message={error}
        action={<Button title="Try again" variant="secondary" size="md" full={false} onPress={retry} />}
      />
    );
  } else if (data.length === 0) {
    body = filter ? (
      <EmptyState
        icon={getCategory(filter).icon}
        title={`No ${getCategory(filter).label.toLowerCase()} alerts`}
        message="Nothing live in this category right now."
        action={<Button title="Show everything" variant="secondary" size="md" full={false} onPress={() => setFilter(null)} />}
      />
    ) : (
      <EmptyState
        icon="sun"
        title="All quiet on campus"
        message="No live alerts right now. Spotted something? Let people know."
        action={<Button title="Post an alert" icon="plus" size="md" full={false} onPress={openCreate} />}
      />
    );
  }

  return (
    <Screen>
      <Animated.FlatList
        data={body ? [] : data}
        keyExtractor={(a) => a.id}
        ListHeaderComponent={header}
        ListEmptyComponent={body}
        contentContainerStyle={[s.content, { paddingBottom: bottomSpace }]}
        itemLayoutAnimation={LinearTransition.springify().damping(22)}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 45).duration(420)} style={s.item}>
            <AlertCard
              alert={item}
              now={now}
              distance={distanceTo(item)}
              onPress={() => navigation.navigate("AlertDetail", { id: item.id, alert: item })}
            />
          </Animated.View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.textSubtle} colors={[colors.accent]} progressBackgroundColor={colors.surface} />
        }
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  content: {
    flexGrow: 1,
  },
  sort: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs + 2,
    height: 32,
    paddingHorizontal: space.md,
    marginBottom: space.xs,
    borderRadius: 16,
    backgroundColor: c.surfaceAlt,
  },
  filters: {
    gap: space.sm,
    paddingHorizontal: space.xl,
    paddingTop: space.sm,
    paddingBottom: space.lg,
  },
  list: {
    paddingHorizontal: space.xl,
  },
  item: {
    paddingHorizontal: space.xl,
    marginBottom: space.md,
  },
}));
