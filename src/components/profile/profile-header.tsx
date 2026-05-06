import { View } from "react-native";
import { ChatBubble, EditPencil } from "iconoir-react-native";
import { AppText } from "@/components/ui/app-text";
import { RoundedButton } from "@/components/ui/buttons/rounded-button";
import { ProfilePicture } from "@/components/profile/profile-picture";

type ProfileHeaderProps = {
  avatarUri: string;
  name: string;
  stats: string;
  isOwnProfile?: boolean;
  onPressAdd?: () => void;
  onMessage?: () => void;
};

export function ProfileHeader({
  avatarUri,
  name,
  stats,
  isOwnProfile = false,
  onPressAdd,
  onMessage,
}: ProfileHeaderProps) {
  return (
    <View className="gap-6 p-4">
      <View className="flex-row items-center gap-4">
        <ProfilePicture
          uri={avatarUri}
          size={96}
          showAddButton={isOwnProfile}
          onPressAdd={onPressAdd}
        />
        <View className="flex-1 gap-2">
          <AppText variant="bolderLargeText">{name}</AppText>
          <AppText variant="secondaryText">{stats}</AppText>
        </View>
      </View>

      {!isOwnProfile && (
        <View className="flex-row items-center gap-2.5">
          <RoundedButton
            variant="primary"
            label="S'abonner"
            Icon={EditPencil}
          />
          <RoundedButton
            variant="secondary"
            label="Ecrire"
            Icon={ChatBubble}
            onPress={onMessage}
          />
        </View>
      )}
    </View>
  );
}
