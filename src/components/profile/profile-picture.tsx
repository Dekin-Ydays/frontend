import { Pressable, Image, View } from "react-native";
import { Plus } from "iconoir-react-native";
import { Icon } from "@/components/ui/app-icon";



/*
// Main component
*/
type ProfilePictureProps = {
  uri: string;
  size?: number;
  showAddButton?: boolean;
  onPressAdd?: () => void;
};

export function ProfilePicture({
  uri,
  size = 72,
  showAddButton = false,
  onPressAdd,
}: ProfilePictureProps) {
  return (
    <View className="relative" style={{ width: size, height: size }}>
      <Image
        source={{ uri }}
        className="bg-white/10"
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />

      {showAddButton ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ajouter une photo de profil"
          onPress={onPressAdd}
          className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full border-2 border-dark bg-primary"
        >
          <Icon icon={Plus} size="sm" color="#0E0E0E" />
        </Pressable>
      ) : null}
    </View>
  );
}
