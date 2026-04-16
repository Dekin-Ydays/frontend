import "@/global.css";
import React from "react";
import { Tabs } from "expo-router";
import { BottomMenu } from "@/components/nav/bottom-menu";
import { BottomBarProvider } from "@/components/nav/bottom-bar-context";

/**
 * 4 onglets principaux visibles dans la bottom bar.
 * Les pages annexes sont accessibles via des boutons (href: null).
 */
export default function TabLayout() {
  return (
    <BottomBarProvider>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <BottomMenu {...props} />}
      >
        {/* ── Onglets principaux ── */}
        <Tabs.Screen name="feed" options={{ title: "Home" }} />
        <Tabs.Screen name="messages" options={{ title: "Messages" }} />
        <Tabs.Screen name="profile" options={{ title: "Profil" }} />
        <Tabs.Screen name="search" options={{ title: "Recherche" }} />

        {/* ── Pages annexes (pas de tab button) ── */}
        <Tabs.Screen name="video" options={{ href: null }} />
        <Tabs.Screen name="share" options={{ href: null }} />
      </Tabs>
    </BottomBarProvider>
  );
}
