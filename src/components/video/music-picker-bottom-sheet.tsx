import { useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { MusicNote } from "iconoir-react-native";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { AppInput } from "@/components/ui/inputs/app-input";
import { AppText } from "@/components/ui/app-text";
import type { MusicItem } from "@/types/video";
import { MOCK_MUSIC_LIST } from "@/mocks/videos";

/*
// Secondary components
*/
function MusicListItem({
  item,
  onSelect,
}: {
  item: MusicItem;
  onSelect: (item: MusicItem) => void;
}) {
  return (
    <Pressable
      className="flex-row items-center justify-between py-2"
      onPress={() => onSelect(item)}
    >
      <View className="flex-row items-center gap-2.5 flex-1">
        <View className="h-[46px] w-[46px] rounded-[5px] bg-white/10" />
        <View className="flex-1 ml-2.5 gap-1">
          <AppText variant="bolderBaseText" className="text-sm">
            {item.title}
          </AppText>
          <AppText variant="secondaryText">{item.artist}</AppText>
        </View>
      </View>
      <MusicNote className="size-5 text-white" />
    </Pressable>
  );
}

/*
// Props
*/
type MusicPickerBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (item: MusicItem) => void;
};

/*
// Main component
*/
export function MusicPickerBottomSheet({
  visible,
  onClose,
  onSelect,
}: MusicPickerBottomSheetProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMusic = MOCK_MUSIC_LIST.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.artist.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelect = (item: MusicItem) => {
    onSelect(item);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View className="gap-4">
        <AppInput
          placeholder="Rechercher une musique..."
          placeholderTextColor="#919191"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <FlatList
          data={filteredMusic}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View className="h-2" />}
          renderItem={({ item }) => (
            <MusicListItem item={item} onSelect={handleSelect} />
          )}
        />
      </View>
    </BottomSheet>
  );
}
