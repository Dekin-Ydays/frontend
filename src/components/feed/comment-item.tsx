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
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <AppText className="font-montserrat-bold text-sm">
            {item.name}
          </AppText>
          <AppText className="text-xs !text-[#bdbdbd]">{item.date}</AppText>
        </View>
        <AppText className="text-sm leading-5">{item.text}</AppText>
        <View className="flex-row items-center justify-between mt-1.5">
          <Pressable hitSlop={8} onPress={() => onReply?.(item)}>
            <AppText className="!text-secondary text-sm">Répondre</AppText>
          </Pressable>
          <View className="flex-row items-center gap-1.5">
            <Heart
              className={`size-5 ${item.liked ? "text-dangerous" : "text-lightgray"}`}
            />
            <AppText className="text-xs text-lightgray">{item.likes}</AppText>
          </View>
        </View>
      </View>
    </View>
  );
}
