import { FeedList } from "@/components/feed/feed-list";
import { MOCK_FAVORITES_POSTS } from "@/mocks/feed";

export default function FavoritesScreen() {
  return <FeedList posts={MOCK_FAVORITES_POSTS} />;
}
