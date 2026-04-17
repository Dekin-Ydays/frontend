import { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { Heart, ChatLines, ShareIos, MusicNote } from "iconoir-react-native";
import { AppText } from "@/components/ui/app-text";
import { ProfilePicture } from "@/components/profile/profile-picture";
import { RoundedButton } from "@/components/ui/buttons/rounded-button";
import { AppIcon } from "@/components/ui/app-icon";
import type { AppIconComponent } from "@/components/ui/app-icon";
import { CommentsBottomSheet } from "./comments-bottom-sheet";
import { ShareBottomSheet } from "@/components/feed/share-bottom-sheet";
import type { FeedPostData } from "@/types/feed";
export type { FeedPostData };

/*
// Secondary components
*/
type ActionButtonProps = {
  icon: AppIconComponent;
  count: string;
  onPress?: () => void;
};

function ActionButton({ icon, count, onPress }: ActionButtonProps) {
  return (
    <Pressable className="items-center gap-1" onPress={onPress}>
      <AppIcon icon={icon} size="lg" color="#FFFFFF" />
      <AppText className="text-sm text-white font-montserrat-semibold">
        {count}
      </AppText>
    </Pressable>
  );
}

/*
// Main component
*/
type FeedPostProps = {
  post: FeedPostData;
};

export function FeedPost({ post }: FeedPostProps) {
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);

  return (
    <View className="flex-1 justify-end mb-24">
      {/* Background Image */}
      <Image
        source={{ uri: post.imageUri }}
        className="absolute inset-0 rounded-3xl"
        resizeMode="cover"
      />

      {/* Overlay with actions and info */}
      <View className="flex-column justify-end p-4 gap-4 bg-gradient-to-t from-black/80 to-transparent rounded-3xl">
        {/* Right Actions */}
        <View className="items-end gap-5">
          <ActionButton icon={Heart} count={post.likeCount} />
          <ActionButton
            icon={ChatLines}
            count={post.commentCount}
            onPress={() => setCommentsVisible(true)}
          />
          <ActionButton
            icon={ShareIos}
            count={post.shareCount}
            onPress={() => setShareVisible(true)}
          />
        </View>

        {/* Bottom Infos */}
        <View className="flex-1 gap-4">
          <View className="flex-row items-center gap-4">
            <ProfilePicture uri={post.avatarUri} size={46} />
            <View className="flex-1 gap-1">
              <AppText className="font-montserrat-bold text-sm text-white">
                {post.title}
              </AppText>
              <View className="flex-row items-center gap-1">
                <AppIcon icon={MusicNote} size="sm" color="#bdbdbd" />
                <AppText className="text-xs text-[#bdbdbd]">
                  {post.musicName}
                </AppText>
              </View>
            </View>
            <RoundedButton variant="primary-alt" label="Danser" />
          </View>
          <AppText className="text-sm text-white">{post.description}</AppText>
        </View>
      </View>

      {/* Progress bar just above the bottom menu */}
      <View
        className="absolute left-0 right-0 items-center"
        pointerEvents="none"
      >
        <View className="w-[268px]">
          <View className="h-[2px] w-full rounded-full bg-white/20" />
          <View className="absolute top-0 left-0 h-[2px] w-[194px] rounded-full bg-white/60" />
        </View>
      </View>

      <ShareBottomSheet
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
      />
      <CommentsBottomSheet
        visible={commentsVisible}
        onClose={() => setCommentsVisible(false)}
      />
    </View>
  );
}
