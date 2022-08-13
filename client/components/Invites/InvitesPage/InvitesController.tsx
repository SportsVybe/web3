import Moralis from "moralis/types";
import { useEffect, useState } from "react";
import { Invite } from "../../../configs/types";
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
      <span className="text-1xl text-white">Loading...</span>
    </div>
  );
};
