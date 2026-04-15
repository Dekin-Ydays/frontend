import { FeedPost, type FeedPostData } from "@/components/feed/feed-post";

const post: FeedPostData = {
  imageUri:
    "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=900&q=80",
  avatarUri:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  userName: "Jean-Baptiste",
  title: "DPR IAN concert...",
  musicName: "Ballistic",
  description: "DPR IAN en concert c'était incroyable 🔥",
  likeCount: "12k",
  commentCount: "843",
  shareCount: "2k",
};

export default function FollowingScreen() {
  return <FeedPost post={post} />;
}
