import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CATEGORY_ICONS } from "../constants/icons";
import { COLORS } from "../themes/colors";

export default function CategoryIcon({ category, size = 24 }) {
  return (
    <MaterialCommunityIcons
      name={CATEGORY_ICONS[category]}
      size={size}
      color={COLORS.primary}
    />
  );
}