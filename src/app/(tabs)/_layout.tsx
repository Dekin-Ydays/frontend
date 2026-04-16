import "@/global.css";
import React from "react";
import { Tabs } from "expo-router";
import { BottomMenu } from "@/components/nav/bottom-menu";
import { TopHeader } from "@/components/nav/top-header";
import { TopFeed } from "@/components/nav/top-feed";
import { BottomBarProvider } from "@/components/nav/bottom-bar-context";
import { MOCK_AVATARS } from "@/mocks/avatars";

const USER_AVATAR_URI = MOCK_AVATARS[0];

export default function TabLayout() {
  return (
    <BottomBarProvider>
      <Tabs
        screenOptions={({ route }) => ({
          headerTransparent: true,
          header: () => {
            if (route.name === "search")
              return <TopHeader title="RECHERCHE" avatarUri={USER_AVATAR_URI} />;
            if (route.name === "research-dances")
              return <TopHeader backButton />;
            // (feed), (messages), (profile), (video) handle their own headers
            return null;
          },
        })}
        tabBar={(props) => <BottomMenu {...props} />}
      >
        <Tabs.Screen name="(feed)" options={{ title: "Home", headerShown: false }} />
        <Tabs.Screen name="(messages)" options={{ title: "Messages", headerShown: false }} />
        <Tabs.Screen name="(profile)" options={{ title: "Profil", headerShown: false }} />
        <Tabs.Screen name="search" options={{ title: "Recherche" }} />
        <Tabs.Screen name="send" options={{ href: null }} />
        <Tabs.Screen name="(video)" options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="research-dances" options={{ href: null }} />
      </Tabs>
    </BottomBarProvider>
  );
}
