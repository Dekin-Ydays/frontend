import { View } from "react-native";
import { ProfileTabButton } from "@/components/profile/profile-tab-button";
import type { ProfileTab, ProfileTabKey } from "@/types/profile";

type ProfileTabsProps = {
  tabs: ProfileTab[];
  activeTab: ProfileTabKey;
  onChangeTab: (tab: ProfileTabKey) => void;
};

export function ProfileTabs({
  tabs,
  activeTab,
  onChangeTab,
}: ProfileTabsProps) {
  return (
    <View className="flex-row items-center gap-3 p-4 bg-dark">
      {tabs.map((tab) => (
        <ProfileTabButton
          key={tab.key}
          label={tab.label}
          isActive={activeTab === tab.key}
          onPress={() => onChangeTab(tab.key)}
        />
      ))}
    </View>
  );
}
