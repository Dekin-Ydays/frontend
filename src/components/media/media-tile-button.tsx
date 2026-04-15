import { Image, Pressable, View } from "react-native";
import { AppText } from "@/components/ui/app-text";

/*
// Tailwind styles
*/
const styles = {
  base: "relative overflow-hidden bg-white/5",
  image: "aspect-square w-full",
  overlay:
    "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-black/0 p-4",
} as const;

/*
// Main component
*/
type MediaTileButtonProps = {
  imageUri: string;
  title: string;
  onPress?: () => void;
  className?: string;
  accessibilityLabel?: string;
};

export function MediaTileButton({
  imageUri,
  title,
  onPress,
  className,
  accessibilityLabel,
}: MediaTileButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      disabled={!onPress}
      className={`${styles.base} ${className ?? ""}`}
    >
      <Image source={{ uri: imageUri }} className={styles.image} />
      <View className={styles.overlay}>
        <AppText numberOfLines={1}>{title}</AppText>
      </View>
    </Pressable>
  );
}
