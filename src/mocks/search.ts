import type { SearchDanceItem, SearchFilter, SearchProfileItem } from "@/types/search";
import { MOCK_AVATARS } from "./avatars";

export const SEARCH_FILTERS: SearchFilter[] = ["Profils", "Danses", "Autre"];

export const MOCK_SEARCH_PROFILES: SearchProfileItem[] = [
  { id: "1", avatarUri: MOCK_AVATARS[0], userName: "Jean-Baptiste Sainte-Beuve", stats: "7 suivis | 19 followers" },
  { id: "2", avatarUri: MOCK_AVATARS[1], userName: "Maxou le fou", stats: "77 suivis | 1 followers" },
  { id: "3", avatarUri: MOCK_AVATARS[2], userName: "Quantix", stats: "4 suivis | 1997 followers" },
  { id: "4", avatarUri: MOCK_AVATARS[0], userName: "adri1.cr", stats: "12 suivis | 58 followers" },
  { id: "5", avatarUri: MOCK_AVATARS[1], userName: "Jean-Baptiste Sainte-Beuve", stats: "7 suivis | 19 followers" },
  { id: "6", avatarUri: MOCK_AVATARS[2], userName: "Maxou le fou", stats: "77 suivis | 1 followers" },
  { id: "7", avatarUri: MOCK_AVATARS[0], userName: "Quantix", stats: "4 suivis | 1997 followers" },
  { id: "8", avatarUri: MOCK_AVATARS[1], userName: "adri1.cr", stats: "12 suivis | 58 followers" },
  { id: "9", avatarUri: MOCK_AVATARS[2], userName: "Jean-Baptiste Sainte-Beuve", stats: "7 suivis | 19 followers" },
];

export const MOCK_DANCES: SearchDanceItem[] = [
  {
    id: "1",
    title: "Hip-Hop Basics",
    imageUri: "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "2",
    title: "Salsa Cubana",
    imageUri: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "3",
    title: "Contemporary",
    imageUri: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "4",
    title: "Breaking",
    imageUri: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "5",
    title: "Waacking",
    imageUri: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "6",
    title: "Locking",
    imageUri: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=400&q=80",
  },
];
