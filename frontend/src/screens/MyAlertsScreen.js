import * as React from "react";
import { RefreshControl, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  FadeInDown,
  FadeOut,
  interpolate,
  LinearTransition,
  useAnimatedStyle,
} from "react-native-reanimated";

import { useAuth } from "../context/AuthContext";
import { useLocation } from "../context/LocationContext";
import { useAlerts } from "../hooks/useAlerts";
import { makeStyles, radius, space, useTheme } from "../theme";
import {
  AlertCardSkeleton,
  Button,
  EmptyState,
  Icon,
  LargeHeader,
  PressableScale,
  Screen,
  SegmentedControl,
  Text,
  useToast,
} from "../ui";
import { AlertCard } from "../components/AlertCard";
import { useTabBarSpace } from "../navigation/TabBar";
import { confirm } from "../utils/dialogs";
import { isExpired } from "../utils/format";
import { haptics } from "../utils/haptics";

const ACTION_WIDTH = 84;

function DeleteAction({ drag, onPress }) {
  const s = useStyles();
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(-drag.value, [0, ACTION_WIDTH * 0.6], [0, 1], "clamp"),
    transform: [{ scale: interpolate(-drag.value, [0, ACTION_WIDTH], [0.6, 1], "clamp") }],
  }));
  return (
    <View style={s.actionSlot}>
      <Animated.View style={style}>
        <PressableScale onPress={onPress} style={s.action} accessibilityRole="button" accessibilityLabel="Delete alert">
          <Icon name="trash-2" size={20} color="danger" />
          <Text variant="caption" color="danger">
            Delete
          </Text>
        </PressableScale>
      </Animated.View>
    </View>
  );
}

export function MyAlertsScreen() {
  const s = useStyles();
  const navigation = useNavigation();
  const toast = useToast();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { distanceTo } = useLocation();
  const { alerts, status, error, refreshing, refresh, retry, remove, now } = useAlerts({ userId: user?.id });
  const bottomSpace = useTabBarSpace();
  const [tab, setTab] = React.useState("live");
  // A drag that ends over the card would otherwise also count as a tap (notably on web).
  const lastSwipe = React.useRef(0);
  const markSwipe = () => {
    lastSwipe.current = Date.now();
  };

  const live = alerts.filter((a) => !isExpired(a, now));
  const ended = alerts.filter((a) => isExpired(a, now));
  const data = tab === "live" ? live : ended;

  async function handleDelete(alert, close) {
    const ok = await confirm({
      title: "Delete this alert?",
      message: `“${alert.title}” will be removed for everyone.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) {
      close?.();
      return;
    }
    try {
      await remove(alert.id);
      haptics.success();
      toast.show("Alert deleted");
    } catch (e) {
      haptics.error();
      toast.show("Couldn't delete", { tone: "error", message: e?.message });
    }
  }

  const header = (
    <View>
      <LargeHeader
        title="Your alerts"
        subtitle={status === "ready" ? `${live.length} live · ${ended.length} ended` : " "}
      />
      <SegmentedControl
        value={tab}
        onChange={setTab}
        style={s.segment}
        options={[
          { value: "live", label: `Live${live.length ? ` ${live.length}` : ""}` },
          { value: "ended", label: `Ended${ended.length ? ` ${ended.length}` : ""}` },
        ]}
      />
      {status === "ready" && data.length > 0 ? (
        <Text variant="caption" color="textSubtle" style={s.hint}>
          Swipe left on an alert to delete it.
        </Text>
      ) : null}
    </View>
  );

  let empty = null;
  if (status === "loading") {
    empty = (
      <View style={s.pad}>
        {[0, 1].map((i) => (
          <AlertCardSkeleton key={i} />
        ))}
      </View>
    );
  } else if (status === "error") {
    empty = (
      <EmptyState
        icon="wifi-off"
        title="Couldn't load your alerts"
        message={error}
        action={<Button title="Try again" variant="secondary" size="md" full={false} onPress={retry} />}
      />
    );
  } else if (tab === "live") {
    empty = (
      <EmptyState
        icon="radio"
        title="Nothing live from you"
        message="Seen free food, a closed path or a lost wallet? Share it with campus."
        action={<Button title="Post an alert" icon="plus" size="md" full={false} onPress={() => navigation.navigate("CreateAlert")} />}
      />
    );
  } else {
    empty = <EmptyState icon="archive" title="No ended alerts" message="Alerts you've posted show up here once they expire." />;
  }

  return (
    <Screen>
      <Animated.FlatList
        data={status === "ready" ? data : []}
        keyExtractor={(a) => a.id}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        contentContainerStyle={[s.content, { paddingBottom: bottomSpace }]}
        itemLayoutAnimation={LinearTransition.springify().damping(22)}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.textSubtle} colors={[colors.accent]} progressBackgroundColor={colors.surface} />
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(Math.min(index, 6) * 45).duration(380)}
            exiting={FadeOut.duration(200)}
            style={s.item}
          >
            <ReanimatedSwipeable
              friction={1.6}
              rightThreshold={ACTION_WIDTH / 2}
              overshootRight={false}
              onSwipeableWillOpen={() => haptics.soft()}
              onSwipeableOpenStartDrag={markSwipe}
              onSwipeableCloseStartDrag={markSwipe}
              renderRightActions={(_progress, drag, swipeable) => (
                <DeleteAction drag={drag} onPress={() => handleDelete(item, () => swipeable.close())} />
              )}
            >
              <AlertCard
                alert={item}
                now={now}
                distance={distanceTo(item)}
                onPress={() => {
                  if (Date.now() - lastSwipe.current < 500) return;
                  navigation.navigate("AlertDetail", { id: item.id, alert: item });
                }}
              />
            </ReanimatedSwipeable>
          </Animated.View>
        )}
      />
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  content: {
    flexGrow: 1,
  },
  segment: {
    marginHorizontal: space.xl,
    marginTop: space.xs,
    marginBottom: space.md,
  },
  hint: {
    marginHorizontal: space.xl,
    marginBottom: space.md,
  },
  pad: {
    paddingHorizontal: space.xl,
    paddingTop: space.sm,
  },
  item: {
    paddingHorizontal: space.xl,
    marginBottom: space.md,
  },
  actionSlot: {
    width: ACTION_WIDTH,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  action: {
    width: ACTION_WIDTH - space.md,
    height: 72,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: space.xs,
    backgroundColor: c.dangerSoft,
  },
}));
