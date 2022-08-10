import Moralis from "moralis/types";
import { useEffect, useState } from "react";
import { useCustomMoralis } from "../../../context/CustomMoralisProvider";
import { RewardsView } from "./RewardsView";

type Props = {
  user: Moralis.User;
  isAuthenticating: boolean;
  wallet: string;
};

type Response = {
  available: Reward[] | [];
  claimed: Reward[] | [];
  success: boolean;
  error: string | null;
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

const sampleData: Response = {
  available: [
    {
      id: "1",
      action_id: "dssyrddf",
      amount: "2500000000000000000000",
      challenge_id: "902",
      createdAt: "date",
      confirmed: false,
      isClaimed: false,
      reward_id: "0",
      transaction_hash: "0xaasdfasdf",
      updatedAt: "date",
      user: "address",
      team_id: "3",
    },
    {
      id: "1",
      action_id: "dr334ssdf",
      amount: "600000000000000000000",
      challenge_id: "902",
      createdAt: "date",
      confirmed: true,
      isClaimed: false,
      reward_id: "1",
      transaction_hash: "0xasdfadfasdf012sdf",
      updatedAt: "date",
      user: "address",
      team_id: "3",
    },
  ],
  claimed: [
    {
      id: "1",
      action_id: "dssyrddf",
      amount: "100000000000000000",
      challenge_id: "902",
      createdAt: "date",
      confirmed: true,
      isClaimed: true,
      reward_id: "0",
      transaction_hash: "0xaasdfasdf",
      updatedAt: "date",
      user: "address",
      team_id: "3",
    },
    {
      id: "1",
      action_id: "dr334ssdf",
      amount: "100000000000000000",
      challenge_id: "902",
      createdAt: "date",
      confirmed: true,
      isClaimed: true,
      reward_id: "1",
      transaction_hash: "0xasdfadfasdf012sdf",
      updatedAt: "date",
      user: "address",
      team_id: "3",
    },
  ],
  success: true,
  error: null,
};

export const RewardsController = (props: Props) => {
  const { cloudFunction } = useCustomMoralis();
  const [rewards, setRewards] = useState<Response>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRewards = async () => {
    setIsLoading(true);
    const rewards = await cloudFunction("getUserRewards", {});
    if (!rewards.success) setError(error || "Error fetching rewards");
    return rewards;
  };

  useEffect(() => {
    fetchRewards()
      .then(setRewards)
      .then(() => setIsLoading(false))
      .catch(setError);
  }, []);

  return sampleData && sampleData.success ? (
    <RewardsView
      available={sampleData.available}
      claimed={sampleData.claimed}
    />
  ) : (
    <div>
      <span className="text-1xl text-white">Loading...</span>
    </div>
  );
};
