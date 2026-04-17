import { Pressable, View } from "react-native";
import { Heart } from "iconoir-react-native";
import type { CommentData } from "@/types/comment";
import { AppText } from "@/components/ui/app-text";
import { ProfilePicture } from "@/components/profile/profile-picture";

type CommentItemProps = {
  item: CommentData;
  onReply?: (comment: CommentData) => void;
};

export function CommentItem({ item, onReply }: CommentItemProps) {
  return (
    <View className="flex-row gap-3">
      <ProfilePicture uri={item.avatarUri} size={42} />
      <View className="flex-1 gap-1">
        <AppText variant="bolderBaseText">{item.name}</AppText>
        <AppText variant="secondaryText">{item.date}</AppText>
        <AppText className="leading-5">{item.text}</AppText>
        <View className="flex-row items-center justify-between mt-1.5">
          <Pressable hitSlop={8} onPress={() => onReply?.(item)}>
            <AppText className="!text-secondary">Répondre</AppText>
          </Pressable>
          <View className="flex-row items-center gap-1">
            <Heart
              className={`size-5 ${item.liked ? "text-dangerous" : "text-lightgray"}`}
            />
            <AppText variant="secondaryText">{item.likes}</AppText>
          </View>
        </View>
        s
      </View>
    </View>
  );
}
