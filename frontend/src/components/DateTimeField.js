import * as React from "react";
import { Platform } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

import { makeStyles, radius, space, useTheme } from "../theme";
import { Icon, PressableScale, Text } from "../ui";
import { formatDateTime } from "../utils/format";

// iOS gets the native compact picker; Android has no combined date+time mode, so it chains both dialogs.
export function DateTimeField({ value, onChange, minimumDate }) {
  const s = useStyles();
  const { scheme, colors } = useTheme();

  if (Platform.OS === "ios") {
    return (
      <DateTimePicker
        value={value}
        mode="datetime"
        display="compact"
        minimumDate={minimumDate}
        themeVariant={scheme}
        accentColor={colors.accent}
        onChange={(_, date) => date && onChange(date)}
        style={s.ios}
      />
    );
  }

  const openAndroid = () => {
    DateTimePickerAndroid.open({
      value,
      mode: "date",
      minimumDate,
      onChange: (event, date) => {
        if (event.type !== "set" || !date) return;
        DateTimePickerAndroid.open({
          value: date,
          mode: "time",
          onChange: (e2, time) => {
            if (e2.type !== "set" || !time) return;
            const next = new Date(date);
            next.setHours(time.getHours(), time.getMinutes(), 0, 0);
            onChange(next);
          },
        });
      },
    });
  };

  return (
    <PressableScale onPress={openAndroid} haptic style={s.field} accessibilityRole="button">
      <Icon name="calendar" size={16} color="textMuted" />
      <Text variant="bodyMedium" style={s.value}>
        {formatDateTime(value)}
      </Text>
      <Icon name="chevron-down" size={16} color="textSubtle" />
    </PressableScale>
  );
}

const useStyles = makeStyles((c) => ({
  ios: {
    alignSelf: "flex-start",
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    height: 46,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    backgroundColor: c.surfaceAlt,
  },
  value: {
    flex: 1,
  },
}));
