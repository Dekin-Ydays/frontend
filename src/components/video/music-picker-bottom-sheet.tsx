import { useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { MusicNote } from "iconoir-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { AppInput } from "@/components/ui/app-input";
import { AppText } from "@/components/ui/app-text";
import { Icon } from "@/components/ui/icon";
import type { MusicItem } from "@/types/video";
import { MOCK_MUSIC_LIST } from "@/mocks/videos";

/*
// Styles
*/
// styles inlined below

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
        <View className="flex-1 ml-2.5 gap-y-1">
          <AppText variant="bolderBaseText" className="text-sm">
            {item.title}
          </AppText>
          <AppText variant="secondaryText">{item.artist}</AppText>
        </View>
      </View>
      <Icon icon={MusicNote} size={18} color="#FFFFFF" />
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
  const insets = useSafeAreaInsets();
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
      <View
        className="bg-[rgba(14,14,14,0.97)] rounded-t-[40px] overflow-hidden px-5 pb-6 gap-5"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
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
