import { FlatList, View, useWindowDimensions } from "react-native";
import { FeedPost } from "./feed-post";
import type { FeedPostData } from "@/types/feed";

type FeedListProps = {
  posts: FeedPostData[];
};

export function FeedList({ posts }: FeedListProps) {
  const { height } = useWindowDimensions();

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={{ height }}>
          <FeedPost post={item} />
        </View>
      )}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      getItemLayout={(_, index) => ({
        length: height,
        offset: height * index,
        index,
      })}
    />
  );
}
