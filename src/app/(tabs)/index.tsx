import { FeedPost, type FeedPostData } from "@/components/feed/feed-post";

const post: FeedPostData = {
  imageUri:
    "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=900&q=80",
  avatarUri:
    "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?auto=format&fit=crop&w=200&q=80",
  userName: "Stray kids les goats",
  title: "Stray kids les goats...",
  musicName: "In the dark",
  description: "Stray kids les goats...",
  likeCount: "45k",
  commentCount: "45k",
  shareCount: "45k",
};

export default function HomeScreen() {
  return <FeedPost post={post} />;
}
