import * as React from "react";
import { Image, View } from "react-native";

import { getCategory } from "../constants/categories";
import { makeStyles, radius, space } from "../theme";
import { Badge, Icon, PressableScale, Text } from "../ui";
import { formatDistance, isExpired, timeAgo, timeLeft } from "../utils/format";
import { CategoryTile } from "./CategoryTile";

export const AlertCard = React.memo(function AlertCard({ alert, now, distance, onPress, right }) {
  const s = useStyles();
  const cat = getCategory(alert.category);
  const ended = isExpired(alert, now);
  const dist = formatDistance(distance);

  return (
    <PressableScale
      onPress={onPress}
      haptic
      scaleTo={0.985}
      accessibilityRole="button"
      accessibilityLabel={`${cat.label}: ${alert.title}`}
      style={[s.card, ended && s.ended]}
    >
      <CategoryTile category={alert.category} />
      <View style={s.body}>
        <View style={s.overline}>
          <Text variant="caption" color={cat.color}>
            {cat.label}
          </Text>
          <Text variant="caption" color="textSubtle">
            · {timeAgo(alert.created_at, now)}
          </Text>
        </View>
        <Text variant="headline" numberOfLines={2}>
          {alert.title}
        </Text>
        <Text variant="footnote" color="textMuted" numberOfLines={2} style={s.message}>
          {alert.message}
        </Text>
        <View style={s.meta}>
          {ended ? (
            <Badge label="Ended" />
          ) : (
            <View style={s.metaItem}>
              <Icon name="clock" size={13} color="textSubtle" />
              <Text variant="caption" color="textMuted">
                {timeLeft(alert.expires_at, now)}
              </Text>
            </View>
          )}
          {dist ? (
            <View style={s.metaItem}>
              <Icon name="navigation" size={12} color="textSubtle" />
              <Text variant="caption" color="textMuted">
                {dist}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      {alert.photo_url ? <Image source={{ uri: alert.photo_url }} style={s.thumb} /> : null}
      {right}
    </PressableScale>
  );
});

const useStyles = makeStyles((c) => ({
  card: {
    flexDirection: "row",
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  ended: {
    opacity: 0.6,
  },
  body: {
    flex: 1,
  },
  overline: {
    flexDirection: "row",
    gap: space.xs,
    marginBottom: space.xxs + 1,
  },
  message: {
    marginTop: space.xxs + 1,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    marginTop: space.sm + 2,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: c.surfaceAlt,
  },
}));
