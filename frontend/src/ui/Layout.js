import * as React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { makeStyles, motion, radius, space, useTheme } from "../theme";
import { Text } from "./Text";
import { Icon } from "./Icon";
import { PressableScale } from "./PressableScale";

export function Screen({ children, edges = ["top"], style }) {
  const s = useStyles();
  return (
    <SafeAreaView edges={edges} style={[s.screen, style]}>
      {children}
    </SafeAreaView>
  );
}

// Large left-aligned title used at the top of each tab.
export function LargeHeader({ title, subtitle, right, style }) {
  const s = useStyles();
  return (
    <View style={[s.header, style]}>
      <View style={s.headerText}>
        <Text variant="display" accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="footnote" color="textMuted" style={s.headerSubtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function IconButton({ icon, onPress, accessibilityLabel, variant = "plain", size = 40, color = "text", style }) {
  const s = useStyles();
  return (
    <PressableScale
      onPress={onPress}
      haptic
      scaleTo={0.9}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        s.iconButton,
        { width: size, height: size, borderRadius: size / 2 },
        variant === "floating" && s.iconButtonFloating,
        variant === "tinted" && s.iconButtonTinted,
        style,
      ]}
    >
      <Icon name={icon} size={Math.round(size * 0.45)} color={color} />
    </PressableScale>
  );
}

export function Card({ children, style, padded = true }) {
  const s = useStyles();
  return <View style={[s.card, padded && s.cardPadded, style]}>{children}</View>;
}

export function Badge({ label, tone = "neutral", icon, style }) {
  const { colors } = useTheme();
  const s = useStyles();
  const tones = {
    neutral: [colors.surfaceAlt, colors.textMuted],
    accent: [colors.accentSoft, colors.accent],
    success: [colors.successSoft, colors.success],
    danger: [colors.dangerSoft, colors.danger],
    warning: [colors.warningSoft, colors.warning],
  };
  const [bg, fg] = tones[tone];
  return (
    <View style={[s.badge, { backgroundColor: bg }, style]}>
      {icon ? <Icon name={icon} size={12} color={fg} /> : null}
      <Text variant="caption" color={fg}>
        {label}
      </Text>
    </View>
  );
}

export function EmptyState({ icon = "inbox", title, message, action }) {
  const s = useStyles();
  return (
    <Animated.View entering={FadeInDown.duration(motion.slow)} style={s.empty}>
      <View style={s.emptyIcon}>
        <Icon name={icon} size={24} color="textMuted" />
      </View>
      <Text variant="headline" center>
        {title}
      </Text>
      {message ? (
        <Text variant="footnote" color="textMuted" center style={s.emptyMessage}>
          {message}
        </Text>
      ) : null}
      {action ? <View style={s.emptyAction}>{action}</View> : null}
    </Animated.View>
  );
}

export function Avatar({ name, size = 56 }) {
  const s = useStyles();
  const letters = (name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
  return (
    <Animated.View
      entering={FadeIn.duration(motion.base)}
      style={[s.avatar, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text variant={size > 48 ? "title" : "headline"} color="accent">
        {letters}
      </Text>
    </Animated.View>
  );
}

// Inset grouped list, iOS-settings style.
export function Section({ title, children, footer, style }) {
  const s = useStyles();
  const rows = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={[s.section, style]}>
      {title ? (
        <Text variant="overline" color="textSubtle" style={s.sectionTitle}>
          {title}
        </Text>
      ) : null}
      <View style={s.sectionCard}>
        {rows.map((row, i) => (
          <React.Fragment key={i}>
            {i > 0 ? <View style={s.separator} /> : null}
            {row}
          </React.Fragment>
        ))}
      </View>
      {footer ? (
        <Text variant="caption" color="textSubtle" style={s.sectionFooter}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
}

export function Row({ icon, label, value, onPress, destructive, chevron = !!onPress, right }) {
  const s = useStyles();
  const content = (
    <View style={s.row}>
      {icon ? (
        <View style={[s.rowIcon, destructive && s.rowIconDanger]}>
          <Icon name={icon} size={16} color={destructive ? "danger" : "textMuted"} />
        </View>
      ) : null}
      <Text
        variant="bodyMedium"
        color={destructive ? "danger" : "text"}
        style={value == null ? s.rowLabelFill : s.rowLabel}
      >
        {label}
      </Text>
      {value != null ? (
        <Text variant="body" color="textMuted" numberOfLines={1} style={s.rowValue}>
          {value}
        </Text>
      ) : null}
      {right}
      {chevron ? <Icon name="chevron-right" size={18} color="textSubtle" /> : null}
    </View>
  );
  if (!onPress) return content;
  return (
    <PressableScale onPress={onPress} haptic scaleTo={0.985} accessibilityRole="button">
      {content}
    </PressableScale>
  );
}

const useStyles = makeStyles((c, t) => ({
  screen: {
    flex: 1,
    backgroundColor: c.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    paddingBottom: space.md,
  },
  headerText: {
    flex: 1,
  },
  headerSubtitle: {
    marginTop: space.xs,
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonFloating: {
    backgroundColor: c.glass,
    borderWidth: 1,
    borderColor: c.border,
    ...t.shadow.md,
  },
  iconButtonTinted: {
    backgroundColor: c.surfaceAlt,
  },
  card: {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.border,
  },
  cardPadded: {
    padding: space.lg,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: space.xs,
    paddingHorizontal: space.sm,
    height: 22,
    borderRadius: radius.pill,
  },
  empty: {
    alignItems: "center",
    paddingHorizontal: space.xxxl,
    paddingVertical: space.huge,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.surfaceAlt,
    marginBottom: space.lg,
  },
  emptyMessage: {
    marginTop: space.xs + 2,
    maxWidth: 280,
  },
  emptyAction: {
    marginTop: space.xl,
  },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.accentSoft,
  },
  section: {
    marginBottom: space.xxl,
  },
  sectionTitle: {
    marginLeft: space.xs,
    marginBottom: space.sm,
  },
  sectionCard: {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.border,
    overflow: "hidden",
  },
  sectionFooter: {
    marginTop: space.sm,
    marginHorizontal: space.xs,
  },
  separator: {
    height: 1,
    backgroundColor: c.border,
    marginLeft: space.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    gap: space.md,
  },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.surfaceAlt,
  },
  rowIconDanger: {
    backgroundColor: c.dangerSoft,
  },
  rowLabel: {
    flexShrink: 0,
  },
  rowLabelFill: {
    flex: 1,
  },
  rowValue: {
    flex: 1,
    textAlign: "right",
  },
}));
