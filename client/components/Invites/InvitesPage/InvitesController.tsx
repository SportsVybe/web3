import Moralis from "moralis/types";
import { useEffect, useState } from "react";
import { useCustomMoralis } from "../../../context/CustomMoralisProvider";
import { InvitesView } from "./InvitesView";

type Props = {
  user: Moralis.User;
  isAuthenticating: boolean;
  wallet: string;
};

type Response = {
  accepted: Invite[] | [];
  pending: Invite[] | [];
  sent: Invite[] | [];
  success: boolean;
  error: string | null;
};

export type Invite = {
  id: string;
  acceptOnChain: boolean;
  sentOnChain: boolean;
  status: string;
  createdAt: string;
  sentUser: {
    id: string;
    username: string;
    userDisplayName: string;
    userPhoto: string;
    userPOS: number;
    userWins: number;
    userLosses: number;
  };
  acceptUser: {
    id: string;
    username: string;
    userDisplayName: string;
    userPhoto: string;
    POS: number;
    userWins: number;
    userLosses: number;
  };
  team: {
    id: string;
    teamName: string;
    teamPhoto: string;
    teamPOS: number;
    teamWins: number;
    teamLosses: number;
    teamMembers: string[];
    teamSportsPreferences: string[];
    teamAdmin: string;
  };
  get: (key: string) => any;
  save: (key: {}) => any;
  isSaving: boolean;
};

export const InvitesController = (props: Props) => {
  const { cloudFunction } = useCustomMoralis();
  const [invites, setInvites] = useState<Response>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInvites = async () => {
    setIsLoading(true);
    const invites = await cloudFunction("getUserInvites", {});
    if (!invites.success) setError(error || "Error fetching invites");
    return invites;
  };

  useEffect(() => {
    fetchInvites()
      .then(setInvites)
      .then(() => setIsLoading(false))
      .catch(setError);
  }, []);

  return invites && invites.success ? (
    <InvitesView
      pending={invites.pending}
      accepted={invites.accepted}
      sent={invites.sent}
    />
  ) : (
    <div>
      <span className="text-1xl">Loading...</span>
    </div>
  );
};
