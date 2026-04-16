import { useState } from "react";
import { Image, Pressable, useWindowDimensions, View } from "react-native";
import { Heart, ChatLines, ShareIos, MusicNote } from "iconoir-react-native";
import { AppText } from "@/components/ui/app-text";
import { ProfilePicture } from "@/components/profile/profile-picture";
import { RoundedButton } from "@/components/ui/rounded-button";
import { Icon } from "@/components/ui/icon";
import type { AppIconComponent } from "@/components/ui/icon";
import { CommentsBottomSheet } from "./comments-bottom-sheet";
import { ShareBottomSheet } from "@/components/ui/share-bottom-sheet";
import type { FeedPostData } from "@/types/feed";
export type { FeedPostData };

/*
// Tailwind styles
*/
const styles = {
  post: "flex-1 bg-dark",
  videoImage: "absolute left-0 right-0 top-0 rounded-[20px]",
  videoGradient: "absolute left-0 right-0 bg-gradient-to-b from-black/0 to-black/20 rounded-b-[20px]",
  actions: "absolute right-5 items-center gap-[15px]",
  actionButton: "items-center gap-[5px]",
  info: "absolute left-5 right-5 gap-2.5",
  userRow: "flex-row items-center gap-2.5",
  userInfo: "flex-1 gap-[5px]",
  musicRow: "flex-row items-center gap-[5px]",
  progressContainer: "absolute left-0 right-0 items-center",
  progressTrack: "h-[2px] w-full rounded-full bg-white/20",
  progressFill: "absolute top-0 left-0 h-[2px] rounded-full bg-white/60",
} as const;

/*
// Proportional ratios from Figma (reference screen: 852px tall)
*/
const FIGMA_H = 852;
// Image goes from y=0 to y=752
const VIDEO_H_RATIO = 752 / FIGMA_H;
// Gradient starts at y=422 (midpoint)
const GRADIENT_TOP_RATIO = 422 / FIGMA_H;
// Actions start at y=422+20=442
const ACTIONS_TOP_RATIO = 442 / FIGMA_H;
// User info starts at y=422+237=659
const INFO_TOP_RATIO = 659 / FIGMA_H;
// Progress bars are at y=752 (bottom edge of video)
const PROGRESS_TOP_RATIO = 752 / FIGMA_H;

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
    <Pressable className={styles.actionButton} onPress={onPress}>
      <Icon icon={icon} size={32} color="#FFFFFF" />
      <AppText className="text-sm">{count}</AppText>
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
  const { height } = useWindowDimensions();
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);

  const videoHeight = height * VIDEO_H_RATIO;
  const gradientTop = height * GRADIENT_TOP_RATIO;
  const actionsTop = height * ACTIONS_TOP_RATIO;
  const infoTop = height * INFO_TOP_RATIO;
  const progressTop = height * PROGRESS_TOP_RATIO;

  return (
    <View className={styles.post}>
      {/* Background video/image — rounded card, not full bleed */}
      <Image
        source={{ uri: post.imageUri }}
        className={styles.videoImage}
        style={{ height: videoHeight }}
        resizeMode="cover"
      />

      {/* Subtle gradient at bottom of the video area */}
      <View
        className={styles.videoGradient}
        style={{ top: gradientTop, height: videoHeight - gradientTop }}
        pointerEvents="none"
      />

      {/* Right-side action buttons */}
      <View className={styles.actions} style={{ top: actionsTop }}>
        <ActionButton icon={Heart} count={post.likeCount} />
        <ActionButton
          icon={ChatLines}
          count={post.commentCount}
          onPress={() => setCommentsVisible(true)}
        />
        <ActionButton icon={ShareIos} count={post.shareCount} onPress={() => setShareVisible(true)} />
      </View>

      {/* Bottom info: user row + description */}
      <View className={styles.info} style={{ top: infoTop }}>
        {/* User row */}
        <View className={styles.userRow}>
          <ProfilePicture uri={post.avatarUri} size={46} />
          <View className={styles.userInfo}>
            <AppText className="font-montserrat-bold text-sm">
              {post.title}
            </AppText>
            <View className={styles.musicRow}>
              <Icon icon={MusicNote} size={18} color="#bdbdbd" />
              <AppText className="text-xs !text-[#bdbdbd]">
                {post.musicName}
              </AppText>
            </View>
          </View>
          <RoundedButton variant="secondary" label="Suivre" />
        </View>

        {/* Description */}
        <AppText className="text-sm">{post.description}</AppText>
      </View>

      {/* Progress bars (video timeline) */}
      <View
        className={styles.progressContainer}
        style={{ top: progressTop }}
        pointerEvents="none"
      >
        <View style={{ width: 268 }}>
          <View className={styles.progressTrack} />
          <View className={styles.progressFill} style={{ width: 194 }} />
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
