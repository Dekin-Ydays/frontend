import type { CommentData } from "@/types/comment";
import { MOCK_AVATARS } from "./avatars";

export const MOCK_COMMENTS: CommentData[] = [
  {
    id: "1",
    avatarUri: MOCK_AVATARS[0],
    name: "Jean-Baptiste Sainte-Beuve",
    date: "11/07/2026",
    text: "J'ai apprécié la danse mais bon tjr pas à mon niveau quoi...",
    likes: "45k",
    liked: true,
  },
  {
    id: "2",
    avatarUri: MOCK_AVATARS[2],
    name: "Quantix",
    date: "21/08/2023",
    text: "C quoi ça de la danse ??",
    likes: "10",
  },
  {
    id: "3",
    avatarUri: MOCK_AVATARS[0],
    name: "Jean-Baptiste Sainte-Beuve",
    date: "11/07/2026",
    text: "J'ai apprécié la danse mais bon tjr pas à mon niveau quoi...",
    likes: "45k",
    liked: true,
  },
  {
    id: "4",
    avatarUri: MOCK_AVATARS[2],
    name: "Quantix",
    date: "21/08/2023",
    text: "C quoi ça de la danse ??",
    likes: "10",
  },
];
