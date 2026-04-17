import "@/global.css";
import React from "react";
import { Tabs } from "expo-router";
import { BottomMenu } from "@/components/nav/bottom-menu";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomMenu {...props} />}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="feed" options={{ title: "Home" }} />
      <Tabs.Screen name="messages" options={{ title: "Messages" }} />
      <Tabs.Screen name="profile" options={{ title: "Profil" }} />
      <Tabs.Screen name="search" options={{ title: "Recherche" }} />
    </Tabs>
  );
}
