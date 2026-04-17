import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { ProfilePicture } from "@/components/profile/profile-picture";

const styles = {
  container: "flex-row items-center gap-3",
  avatarContainer: "relative",
  onlineIndicator:
    "absolute bottom-0 right-0 h-3 w-3 rounded-full bg-secondary border-2 border-dark",
  textContainer: "flex-1",
  title: "text-white",
  subtitle: "mt-0.5 text-lightgray",
} as const;

export type MessageListItemProps = {
  avatarUri: string;
  userName: string;
  messagePreview: string;
  isOnline?: boolean;
  onPress?: () => void;
};

export function MessageListItem({
  avatarUri,
  userName,
  messagePreview,
  isOnline = false,
  onPress,
}: MessageListItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ouvrir la conversation avec ${userName}`}
      onPress={onPress}
      className={styles.container}
    >
      <View className={styles.avatarContainer}>
        <ProfilePicture uri={avatarUri} size={48} />
        {isOnline ? <View className={styles.onlineIndicator} /> : null}
      </View>

      <View className={styles.textContainer}>
        <AppText
          variant="bolderBaseText"
          className={styles.title}
          numberOfLines={1}
        >
          {userName}
        </AppText>
        <AppText
          variant="secondaryText"
          className={styles.subtitle}
          numberOfLines={1}
        >
          {messagePreview}
        </AppText>
      </View>
    </Pressable>
  );
}
