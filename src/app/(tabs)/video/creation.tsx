import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Cancel, MusicNote, RefreshDouble } from "iconoir-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/app-text";
import { AppInput } from "@/components/ui/app-input";
import { Icon } from "@/components/ui/icon";
import { useBottomBar } from "@/components/nav/bottom-bar-context";
import type { MusicItem } from "@/types/video";
import { MOCK_MUSIC_LIST, MOCK_THUMBNAIL_URI } from "@/mocks/videos";

/*
// Tailwind styles
*/
const styles = {
  screen: "flex-1 bg-dark",
  header:
    "absolute top-0 left-0 right-0 h-[100px] bg-gradient-to-b from-black/80 to-black/0 flex-row items-center justify-between px-5",
  headerLeft: "flex-row items-center gap-5",
  musicPill:
    "flex-row items-center gap-1.5 h-8 px-5 rounded-full bg-white/10",
  bottomBar:
    "absolute bottom-0 left-0 right-0 h-[100px] bg-gradient-to-b from-black/0 to-black/80 flex-row items-center justify-between px-5",
  thumbnailBorder: "rounded-full border-2 border-white overflow-hidden",
  recordButton:
    "h-[60px] w-[60px] rounded-full bg-[#E84545] items-center justify-center",
  recordInner: "h-[48px] w-[48px] rounded-full bg-[#E84545]",
  flipButton:
    "h-[60px] w-[60px] rounded-full bg-white/10 border border-white/5 items-center justify-center",
  overlay: "flex-1 justify-end bg-black/50",
  backdrop: "absolute inset-0",
  sheet:
    "bg-[rgba(14,14,14,0.95)] rounded-t-[40px] px-5 pt-5 pb-6 gap-5 max-h-[60%]",
  handle: "self-center w-10 h-1.5 bg-white/40 rounded-full mb-1",
  musicItem: "flex-row items-center justify-between py-2",
  musicCover: "h-[46px] w-[46px] rounded-[5px] bg-white/10",
  musicInfo: "flex-1 ml-2.5 gap-y-1",
} as const;


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
    <Pressable className={styles.musicItem} onPress={() => onSelect(item)}>
      <View className="flex-row items-center gap-2.5 flex-1">
        <View className={styles.musicCover} />
        <View className={styles.musicInfo}>
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
// Main component
*/
export default function VideoCreationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { hide, show } = useBottomBar();
  const [musicModalVisible, setMusicModalVisible] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<MusicItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    hide();
    return show;
  }, [hide, show]);

  const filteredMusic = MOCK_MUSIC_LIST.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.artist.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelectMusic = (item: MusicItem) => {
    setSelectedMusic(item);
    setMusicModalVisible(false);
  };

  return (
    <View className={styles.screen}>
      <View className="flex-1 bg-[#1a1a1a]" />

      <View className={styles.header} style={{ paddingTop: insets.top }}>
        <View className={styles.headerLeft}>
          <Pressable onPress={() => router.back()}>
            <Icon icon={Cancel} size={32} color="#FFFFFF" />
          </Pressable>
          <AppText variant="title">NOUVELLE VIDEO</AppText>
        </View>
        <Pressable
          className={styles.musicPill}
          onPress={() => setMusicModalVisible(true)}
        >
          <Icon icon={MusicNote} size={18} color="#FFFFFF" />
          <AppText className="text-sm">
            {selectedMusic ? selectedMusic.title : "Musique"}
          </AppText>
        </Pressable>
      </View>

      <View
        className={styles.bottomBar}
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View className={`${styles.thumbnailBorder} h-[60px] w-[60px]`}>
          <Image
            source={{ uri: MOCK_THUMBNAIL_URI }}
            className="h-full w-full"
            resizeMode="cover"
          />
        </View>

        <Pressable
          className={styles.recordButton}
          onPress={() => router.push("/(tabs)/video/form")}
        >
          <View className={styles.recordInner} />
        </Pressable>

        <Pressable className={styles.flipButton}>
          <Icon icon={RefreshDouble} size={32} color="#FFFFFF" />
        </Pressable>
      </View>

      <Modal
        visible={musicModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMusicModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className={styles.overlay}
        >
          <Pressable
            className={styles.backdrop}
            onPress={() => setMusicModalVisible(false)}
          />
          <View className={styles.sheet}>
            <View className={styles.handle} />
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
                <MusicListItem item={item} onSelect={handleSelectMusic} />
              )}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
