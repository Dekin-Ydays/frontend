import { useState } from "react";
import { FlatList, View, LayoutChangeEvent } from "react-native";
import { FeedPost } from "./feed-post";
import type { FeedPostData } from "@/types/feed";

type FeedListProps = {
  posts: FeedPostData[];
};

export function FeedList({ posts }: FeedListProps) {
  const [containerHeight, setContainerHeight] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerHeight(event.nativeEvent.layout.height);
  };

  return (
    <View className="flex-1 bg-dark" onLayout={handleLayout}>
      {containerHeight > 0 && (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ height: containerHeight }}>
              <FeedPost post={item} />
            </View>
          )}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          getItemLayout={(_, index) => ({
            length: containerHeight,
            offset: containerHeight * index,
            index,
          })}
        />
      )}
    </View>
  );
}
