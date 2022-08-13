import { ethers } from "ethers";
import { FaMoneyBillWave } from "react-icons/fa";
import { Reward } from "./RewardsPage/RewardsController";

type RewardCardProps = {
  reward: Reward;
};

export const RewardCard = ({ reward }: RewardCardProps) => {
  return (
    <div className="md:w-[400px] w-full flex flex-row border border-green-300 justify-around items-center m-3 rounded-md p-3">
      <div className="w-[70px] flex justify-center items-center">
        <FaMoneyBillWave size={28} />
      </div>
      <div className="w-[250px] flex flex-col">
        <div className="text-xl flex flex-col">
          <span className="py-1">
            {reward &&
              reward.amount &&
              `${ethers.utils.formatEther(reward.amount)} SVT`}
          </span>
          <span className="text-sm">
            Status:{" "}
            {reward.confirmed
              ? !reward.isClaimed
                ? "Confirmed"
                : reward.isClaimed && "Claimed"
              : "Processing"}
          </span>
        </div>
      </div>
      <div className="w-[100px] flex flex-wrap justify-center">
        {!reward.isClaimed && reward.confirmed && (
          <button className="px-2 py-1 bg-green-300 rounded-full m-1">
            Claim
          </button>
        )}
        <button className="px-2 border-green-300 border rounded-md m-1">
          View
        </button>
      </div>
    </div>
  );
};
