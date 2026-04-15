import { View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { ProfilePicture } from "@/components/profile/profile-picture";

/*
// Tailwind styles
*/
const styles = {
  // Received
  receivedContainer: "flex-col",
  receivedHeader: "flex-row items-center mb-1.5",
  // Sent
  sentContainer: "flex-col items-end",
  sentRow: "flex-row justify-end",
  // Bubble
  bubble: "rounded-full px-3 py-2 self-start",
  bubbleOwn: "bg-secondary",
  bubbleOther: "bg-primary",
  bubbleText: "!text-dark text-sm",
  // Timestamp
  timestamp: "text-xs",
} as const;

/*
// Main component
*/
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
      <View className={styles.sentContainer}>
        {timestamp ? (
          <AppText variant="secondaryText" className={styles.timestamp}>
            {timestamp}
          </AppText>
        ) : null}
        <View className={styles.sentRow}>
          <View className={`${styles.bubble} ${styles.bubbleOwn}`}>
            <AppText className={styles.bubbleText}>{text}</AppText>
          </View>
        </View>
      </View>
    );
  }

  // Received — first in group: avatar + timestamp header row, then bubble directly
  if (showAvatar && avatarUri) {
    return (
      <View className={styles.receivedContainer}>
        <View className={styles.receivedHeader}>
          <ProfilePicture uri={avatarUri} size={32} />
          <View className="flex-1" />
          {timestamp ? (
            <AppText variant="secondaryText" className={styles.timestamp}>
              {timestamp}
            </AppText>
          ) : null}
        </View>
        <View className={`${styles.bubble} ${styles.bubbleOther}`}>
          <AppText className={styles.bubbleText}>{text}</AppText>
        </View>
      </View>
    );
  }

  // Received — continuation (no avatar)
  return (
    <View className={`${styles.bubble} ${styles.bubbleOther}`}>
      <AppText className={styles.bubbleText}>{text}</AppText>
    </View>
  );
}
