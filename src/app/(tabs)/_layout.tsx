import "@/global.css";
import React from "react";
import { Tabs } from "expo-router";
import { BottomMenu } from "@/components/nav/bottom-menu";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomMenu {...props} />}
    />
  );
}
