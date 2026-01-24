import "@/global.css";
import React from "react";
import { Tabs } from "expo-router";

import { BottomMenu } from "@/components/bottom-menu";
import { View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomMenu {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="messages" options={{ title: "Messages" }} />
      <Tabs.Screen name="profile" options={{ title: "Profil" }} />
      <Tabs.Screen name="search" options={{ title: "Recherche" }} />
    </Tabs>
  );
}
