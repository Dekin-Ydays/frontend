import { Pressable, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { ProfilePicture } from "@/components/profile/profile-picture";


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
      className="flex-row items-center gap-3"
    >
      <View className="relative">
        <ProfilePicture uri={avatarUri} size={48} />
        {isOnline ? <View className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-secondary border-2 border-dark" /> : null}
      </View>

      <View className="flex-1">
        <AppText
          variant="bolderBaseText"
          className="text-white"
          numberOfLines={1}
        >
          {userName}
        </AppText>
        <AppText
          variant="secondaryText"
          className="mt-0.5 text-lightgray"
          numberOfLines={1}
        >
          {messagePreview}
        </AppText>
      </View>
    </Pressable>
  );
}
