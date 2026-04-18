import { Image, Pressable, View } from "react-native";
import { AppText } from "@/components/ui/app-text";

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
      className={`relative flex-1 overflow-hidden bg-white/5 ${className ?? ""}`}
    >
      <Image source={{ uri: imageUri }} className="aspect-square w-full" />
      <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-black/0 p-4">
        <AppText numberOfLines={1}>{title}</AppText>
      </View>
    </Pressable>
  );
}
