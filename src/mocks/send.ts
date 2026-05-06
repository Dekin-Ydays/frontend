import { MOCK_AVATARS } from "./avatars";

export type ShareUser = {
  id: string;
  avatarUri: string;
  userName: string;
};

export const MOCK_SHARE_USERS: ShareUser[] = [
  { id: "1", avatarUri: MOCK_AVATARS[0], userName: "Jean-Baptiste Sainte-Beuve" },
  { id: "2", avatarUri: MOCK_AVATARS[1], userName: "adri1.cr" },
  { id: "3", avatarUri: MOCK_AVATARS[2], userName: "Quantix" },
  { id: "4", avatarUri: MOCK_AVATARS[0], userName: "Maxou le fou" },
  { id: "5", avatarUri: MOCK_AVATARS[1], userName: "Jean-Baptiste Sainte-Beuve" },
  { id: "6", avatarUri: MOCK_AVATARS[2], userName: "adri1.cr" },
];
