import Moralis from "moralis/types";

export type User = {
  id: string;
  username: string;
  userDisplayName: string;
  userPhoto: string;
  userPOS: number;
  userWins: number;
  userLosses: number;
  get: (key: string) => any;
  save: (key: {}) => any;
  isSaving: boolean;
};

export type Action = {
  id: string;
  actionId: string;
  contractAction: string;
  save: ({}: {}) => Promise<void>;
};
export type Team = {
  id: string;
  teamChainId: string;
  teamName: string;
  teamUserName: string;
  teamDescription: string;
  teamPhoto: string;
  teamPOS: string;
  teamWinnings: string;
  teamWins: number;
  teamLosses: number;
  teamMembers: string[];
  teamInvitesPending: number;
  teamSportsPreferences: string[];
  teamAdmin: string;
  isTeamActive: boolean;
  createdAt: string;
  updatedAt: string;
  teamOwner: User;
  teamMembersList: User[];
  get: (key: string) => any;
  save: (key: {}) => any;
  isSaving: boolean;
};

export type Challenge = {
  id: string;
  challengeChainId: string;
  challengeAmount: number;
  challengeMessage: string;
  challengeSport: string[];
  actionId: Action;
  challengeTeam1: Team | Moralis.Object<Moralis.Attributes> | null;
  challengeTeam2: Team | Moralis.Object<Moralis.Attributes> | null;
  challengeTeam1_chainId: string;
  challengeTeam2_chainId: string;
  challengeTeam1Admin: User;
  challengeTeam2Admin: User;
  challengeTeam1Count: number;
  challengeTeam2Count: number;
  challengeTeam1TeamMembers: string[];
  challengeTeam2TeamMembers: string[];
  createdAt?: string;
  updatedAt?: string;
  get?: (key: string) => any;
  save?: (key: {}) => any;
  isSaving?: boolean;
};

export type Event = {
  id: string;
  eventName: string;
  eventDate: Date;
  eventPrizePool: string;
  eventSport: string;
  eventLocation: string;
  eventTeam1: Team;
  eventTeam2: Team;
  challenge: Challenge;
  status: 0 | 1 | 2 | 3; // 0 - pending, 1 - confirmed, 2 - canceled, 3 - ended
  createdAt?: string;
  updatedAt?: string;
  get?: (key: string) => any;
  save?: (key: {}) => any;
  isSaving?: boolean;
};

export type Invite = {
  id: string;
  acceptOnChain: boolean;
  sentOnChain: boolean;
  status: string;
  createdAt: string;
  sentUser: User;
  acceptUser: User;
  team: Team;
  get: (key: string) => any;
  save: (key: {}) => any;
  isSaving: boolean;
};

export type Reward = {
  id: string;
  action_id: string;
  amount: string;
  challenge_id: string;
  createdAt: string;
  confirmed: boolean;
  isClaimed: boolean;
  reward_id: string;
  transaction_hash: string;
  updatedAt: string;
  user: string;
  team_id: string;
  get?: (key: string) => any;
  save?: (key: {}) => any;
  isSaving?: boolean;
};

export type GetUserTeamsResponse = {
  teamOwnerTeams: Team[] | [];
  teamOwnerActiveTeams: Team[] | [];
  teamMemberTeams: Team[] | [];
  success: boolean;
  error: string | null;
};

export type GetTeamResponse = {
  team: Team | [];
  teamMembers: User[] | [];
  success: boolean;
  error: string | null;
};

export type GetUserInvites = {
  accepted: Invite[] | [];
  pending: Invite[] | [];
  sent: Invite[] | [];
  success: boolean;
  error: string | null;
};

export type GetUserChallenges = {
  active: Challenge[] | [];
  created: Challenge[] | [];
  complete: Challenge[] | [];
  success: boolean;
  error: string | null;
};
