import { FeedList } from "@/components/feed/feed-list";
import { MOCK_FOR_YOU_POSTS } from "@/mocks/feed";

export default function ForYouScreen() {
  return <FeedList posts={MOCK_FOR_YOU_POSTS} />;
}
