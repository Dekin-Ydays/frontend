import { View, Pressable } from "react-native";
import { AppText } from "./ui/app-text";
import { ProfilePicture } from "@/components/profile/profile-picture";

const styles = {
  container: "flex-row items-center gap-3",
  avatarContainer: "relative",
  onlineIndicator:
    "absolute bottom-0 right-0 h-3 w-3 rounded-full bg-secondary border-2 border-dark",
  textContainer: "flex-1 gap-1",
  transition: "transition-all duration-300",
} as const;

export type UserItemProps = {
  avatarUri: string;
  userName: string;
  message: string;
  isOnline?: boolean;
  onPress?: () => void;
};

export function UserItem({
  avatarUri,
  userName,
  message,
  isOnline = false,

  onPress,
}: UserItemProps) {
  return (
    <Pressable
      className={`${styles.container} ${styles.transition}`}
      onPress={onPress}
    >
      <View className={styles.avatarContainer}>
        <ProfilePicture uri={avatarUri} size={48} />
        {isOnline && <View className={styles.onlineIndicator} />}
      </View>
      <View className={styles.textContainer}>
        <AppText variant="bolderBaseText">{userName}</AppText>
        <AppText variant="secondaryText">{message}</AppText>
      </View>
    </Pressable>
  );
}
