import { View, Pressable } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { ProfilePicture } from "@/components/profile/profile-picture";



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
      className={`flex-row items-center gap-3 transition-all duration-300`}
      onPress={onPress}
    >
      <View className="relative">
        <ProfilePicture uri={avatarUri} size={48} />
        {isOnline && <View className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-secondary border-2 border-dark" />}
      </View>
      <View className="flex-1 gap-1">
        <AppText variant="bolderBaseText">{userName}</AppText>
        <AppText variant="secondaryText">{message}</AppText>
      </View>
    </Pressable>
  );
}
