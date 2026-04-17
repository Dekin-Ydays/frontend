import { useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { Heart, ChatLines, ShareIos, MusicNote } from "iconoir-react-native";
import { AppText } from "@/components/ui/app-text";
import { ProfilePicture } from "@/components/profile/profile-picture";
import { RoundedButton } from "@/components/ui/buttons/rounded-button";
import { Icon } from "@/components/ui/app-icon";
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
      <Icon icon={icon} size="lg" color="#FFFFFF" />
      <AppText className="text-sm text-white font-montserrat-semibold">{count}</AppText>
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
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={{ uri: post.imageUri }}
        style={[StyleSheet.absoluteFill, styles.image]}
        resizeMode="cover"
      />

      {/* Gradient fade over the bottom half */}
      <View
        className="absolute left-0 right-0 bottom-0 h-2/3 bg-gradient-to-b from-black/0 via-black/40 to-black/90 rounded-b-[20px]"
        pointerEvents="none"
      />

      {/* Main Content Area - Flex layout to push things bottom */}
      <View className="flex-1 justify-end pb-28">
        <View 
          className="px-5 w-full" 
          style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}
        >
          {/* Left Side: Info */}
          <View className="flex-1 mr-4 gap-3">
            <View className="flex-row items-center gap-2.5">
              <ProfilePicture uri={post.avatarUri} size={46} />
              <View className="flex-1 gap-1">
                <AppText className="font-montserrat-bold text-sm text-white">
                  {post.title}
                </AppText>
                <View className="flex-row items-center gap-1">
                  <Icon icon={MusicNote} size="sm" color="#bdbdbd" />
                  <AppText className="text-xs text-[#bdbdbd]">
                    {post.musicName}
                  </AppText>
                </View>
              </View>
              <RoundedButton variant="secondary" label="Suivre" />
            </View>
            <AppText className="text-sm text-white">{post.description}</AppText>
          </View>

          {/* Right Side: Actions */}
          <View className="items-center gap-5">
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
        </View>
      </View>

      {/* Progress bar just above the bottom menu */}
      <View
        className="absolute left-0 right-0 bottom-24 items-center"
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0E0E0E" },
  image: { borderRadius: 20 },
});
