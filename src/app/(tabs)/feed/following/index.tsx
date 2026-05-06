import { FeedList } from "@/components/feed/feed-list";
import { MOCK_FOLLOWING_POSTS } from "@/mocks/feed";

export default function FollowingScreen() {
  return <FeedList posts={MOCK_FOLLOWING_POSTS} />;
}
