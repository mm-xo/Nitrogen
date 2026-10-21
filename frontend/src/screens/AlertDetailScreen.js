import * as React from "react";
import { Image, Linking, Platform, ScrollView, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { backend } from "../data";
import { getCategory } from "../constants/categories";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "../context/LocationContext";
import { useNow } from "../hooks/useAlerts";
import { makeStyles, radius, space } from "../theme";
import { Badge, Button, EmptyState, IconButton, Screen, Section, Row, Text, useToast } from "../ui";
import { CategoryTile } from "../components/CategoryTile";
import { CampusMap } from "../components/map/CampusMap";
import { confirm, shareText } from "../utils/dialogs";
import { formatDateTime, formatDistance, isExpired, timeAgo, timeLeft } from "../utils/format";
import { haptics } from "../utils/haptics";

const enter = (i) => FadeInDown.delay(i * 50).duration(420);

function openInMaps({ latitude, longitude, title }) {
  const label = encodeURIComponent(title);
  const url = Platform.select({
    ios: `maps://?q=${label}&ll=${latitude},${longitude}`,
    android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`,
    default: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=18/${latitude}/${longitude}`,
  });
  Linking.openURL(url).catch(() =>
    Linking.openURL(`https://maps.google.com/?q=${latitude},${longitude}`)
  );
}

export function AlertDetailScreen() {
  const s = useStyles();
  const navigation = useNavigation();
  const { params } = useRoute();
  const toast = useToast();
  const { user } = useAuth();
  const { distanceTo } = useLocation();
  const now = useNow();

  const [alert, setAlert] = React.useState(params?.alert ?? null);
  const [missing, setMissing] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    backend.alerts
      .get(params.id)
      .then((fresh) => {
        if (!alive) return;
        if (fresh) setAlert(fresh);
        else setMissing(true);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [params.id]);

  if (!alert) {
    return (
      <Screen>
        <View style={s.topBar}>
          <IconButton icon="chevron-left" accessibilityLabel="Back" onPress={() => navigation.goBack()} />
        </View>
        {missing ? <EmptyState icon="slash" title="This alert is gone" message="It may have been removed by its author." /> : null}
      </Screen>
    );
  }

  const cat = getCategory(alert.category);
  const ended = isExpired(alert, now);
  const mine = user?.id && alert.user_id === user.id;
  const dist = formatDistance(distanceTo(alert));

  async function share() {
    const result = await shareText({
      title: alert.title,
      message: `${alert.title}\n\n${alert.message}\n\n${cat.label} · posted ${timeAgo(alert.created_at)} on Nitrogen`,
    });
    if (result === "copied") toast.show("Copied to clipboard", { tone: "info" });
  }

  async function remove() {
    const ok = await confirm({
      title: "Delete this alert?",
      message: "It will disappear from the map and feed for everyone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    setDeleting(true);
    try {
      await backend.alerts.remove(alert.id);
      haptics.success();
      toast.show("Alert deleted");
      navigation.goBack();
    } catch (e) {
      setDeleting(false);
      haptics.error();
      toast.show("Couldn't delete", { tone: "error", message: e?.message });
    }
  }

  return (
    <Screen>
      <View style={s.topBar}>
        <IconButton icon="chevron-left" accessibilityLabel="Back" onPress={() => navigation.goBack()} />
        <IconButton icon="share" accessibilityLabel="Share alert" onPress={share} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {alert.photo_url ? (
          <Animated.View entering={FadeIn.duration(400)}>
            <Image source={{ uri: alert.photo_url }} style={s.photo} resizeMode="cover" />
          </Animated.View>
        ) : null}

        <Animated.View entering={enter(0)} style={s.catRow}>
          <CategoryTile category={alert.category} size={32} />
          <Text variant="callout" color={cat.color}>
            {cat.label}
          </Text>
          <Text variant="callout" color="textSubtle">
            · {timeAgo(alert.created_at, now)}
          </Text>
        </Animated.View>

        <Animated.View entering={enter(1)}>
          <Text variant="display" style={s.title}>
            {alert.title}
          </Text>
          <View style={s.badges}>
            {ended ? (
              <Badge label="Ended" icon="slash" />
            ) : (
              <Badge label={`Live · ${timeLeft(alert.expires_at, now)}`} tone="success" icon="radio" />
            )}
            {dist ? <Badge label={`${dist} away`} icon="navigation" /> : null}
            {mine ? <Badge label="Posted by you" tone="accent" /> : null}
          </View>
        </Animated.View>

        <Animated.View entering={enter(2)}>
          <Text variant="body" color="textMuted" style={s.message}>
            {alert.message}
          </Text>
        </Animated.View>

        <Animated.View entering={enter(3)} style={s.mapCard}>
          <CampusMap
            alerts={[alert]}
            selectedId={alert.id}
            interactive={false}
            showCampus={false}
            center={{ lat: alert.latitude, lng: alert.longitude }}
            delta={0.004}
          />
        </Animated.View>

        <Animated.View entering={enter(4)}>
          <Section>
            <Row icon="clock" label={ended ? "Ended" : "Ends"} value={formatDateTime(alert.expires_at)} />
            <Row icon="calendar" label="Posted" value={formatDateTime(alert.created_at)} />
            <Row icon="map-pin" label="Open in Maps" onPress={() => openInMaps(alert)} />
          </Section>

          {mine ? (
            <Button title="Delete alert" icon="trash-2" variant="danger" onPress={remove} loading={deleting} />
          ) : null}
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  content: {
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
    paddingHorizontal: space.xl,
    paddingBottom: space.huge,
  },
  photo: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: radius.xl,
    backgroundColor: c.surfaceAlt,
    marginTop: space.sm,
    marginBottom: space.xl,
  },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginTop: space.sm,
  },
  title: {
    marginTop: space.lg,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    marginTop: space.md,
  },
  message: {
    marginTop: space.xl,
    fontSize: 16,
    lineHeight: 25,
  },
  mapCard: {
    height: 180,
    marginTop: space.xxl,
    marginBottom: space.xxl,
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surfaceAlt,
  },
}));
