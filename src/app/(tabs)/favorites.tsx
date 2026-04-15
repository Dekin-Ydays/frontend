import { FeedPost, type FeedPostData } from "@/components/feed/feed-post";

const post: FeedPostData = {
  imageUri:
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  avatarUri:
    "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=200&q=80",
  userName: "Maxou le fou",
  title: "Je teste mon nouveau style",
  musicName: "Don't Stop Me Now",
  description: "Nouveau style, nouvelle énergie 💥",
  likeCount: "8.4k",
  commentCount: "321",
  shareCount: "560",
};

export default function FavoritesScreen() {
  return <FeedPost post={post} />;
}
