import { View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { ProfilePicture } from "@/components/profile/profile-picture";


export type ChatBubbleProps = {
  text: string;
  isOwn: boolean;
  avatarUri?: string;
  showAvatar?: boolean;
  timestamp?: string;
};

export function ChatBubble({
  text,
  isOwn,
  avatarUri,
  showAvatar = false,
  timestamp,
}: ChatBubbleProps) {
  if (isOwn) {
    return (
      <View className="flex-col items-end">
        {timestamp ? (
          <AppText variant="secondaryText" className="text-xs">
            {timestamp}
          </AppText>
        ) : null}
        <View className="flex-row justify-end">
          <View className={`rounded-full px-3 py-2 self-start bg-secondary`}>
            <AppText className="!text-dark text-sm">{text}</AppText>
          </View>
        </View>
      </View>
    );
  }

  // Received — first in group: avatar + timestamp header row, then bubble directly
  if (showAvatar && avatarUri) {
    return (
      <View className="flex-col">
        <View className="flex-row items-center mb-1.5">
          <ProfilePicture uri={avatarUri} size={32} />
          <View className="flex-1" />
          {timestamp ? (
            <AppText variant="secondaryText" className="text-xs">
              {timestamp}
            </AppText>
          ) : null}
        </View>
        <View className={`rounded-full px-3 py-2 self-start bg-primary`}>
          <AppText className="!text-dark text-sm">{text}</AppText>
        </View>
      </View>
    );
  }

  // Received — continuation (no avatar)
  return (
    <View className={`rounded-full px-3 py-2 self-start bg-primary`}>
      <AppText className="!text-dark text-sm">{text}</AppText>
    </View>
  );
}
