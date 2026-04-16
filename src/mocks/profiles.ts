import type { ProfilePost, ProfileTab } from "@/types/profile";

const POST_IMAGE =
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80";

export const MOCK_POSTS: ProfilePost[] = [
  { id: "1", title: "DPR IAN concert...", category: "performances", imageUri: POST_IMAGE },
  { id: "2", title: "Je teste mon...", category: "realisations", imageUri: POST_IMAGE },
  { id: "3", title: "Stray kids les goats...", category: "favorites", imageUri: POST_IMAGE },
  { id: "4", title: "DPR IAN concert...", category: "performances", imageUri: POST_IMAGE },
  { id: "5", title: "Nouvelle danse de...", category: "realisations", imageUri: POST_IMAGE },
  { id: "6", title: "DPR IAN concert...", category: "favorites", imageUri: POST_IMAGE },
];

export const PROFILE_TABS: ProfileTab[] = [
  { key: "performances", label: "Performances" },
  { key: "realisations", label: "Réalisations" },
  { key: "favorites", label: "Mes favoris" },
];

/** Tabs du profil d'un autre utilisateur (sans l'onglet favoris) */
export const OTHER_PROFILE_TABS: ProfileTab[] = [
  { key: "performances", label: "Performances" },
  { key: "realisations", label: "Réalisations" },
];
