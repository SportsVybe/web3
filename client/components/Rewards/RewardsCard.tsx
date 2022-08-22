import { ethers } from "ethers";
import Router from "next/router";
import { BiCheck, BiCheckDouble } from "react-icons/bi";
import { FaMoneyBillWave } from "react-icons/fa";
import { contractActions } from "../../configs/constants";
import { Reward } from "../../configs/types";
import { useContract } from "../../context/ContractProvider";
import { useCustomMoralis } from "../../context/CustomMoralisProvider";
import { Toast } from "../Layout/Toast";

type RewardCardProps = {
  reward: Reward | any;
};

export const RewardCard = ({ reward }: RewardCardProps) => {
  const { claimReward, contractMessage, isContractLoading } = useContract();
  const { createUserAction } = useCustomMoralis();

  const claimRewardHandler = async () => {
    const action = await createUserAction(contractActions.claimReward);
    const actionId = action.id;
    const claimRewardOnChain = await claimReward(
      actionId,
      reward.get("action_id"),
      reward.get("reward_id"),
      reward.get("challenge_id")
    );
    console.log("claimRewardOnChain", claimRewardOnChain);
    if (claimRewardOnChain) {
      reward.save({ isClaimed: true, claimConfirmed: false });
      Router.reload();
    } else {
      action.save({ actionStatus: false });
    }
  };

  return (
    <div className="md:w-[400px] w-full flex flex-row border border-green-300 justify-around items-center m-3 rounded-md p-3">
      <div className="w-[70px] flex justify-center items-center">
        <FaMoneyBillWave size={28} />
      </div>
      <div className="w-[250px] flex flex-col">
        <div className="text-xl flex flex-col">
          <span className="py-1">
            {reward &&
              reward.get("amount") &&
              `${ethers.utils.formatEther(reward.get("amount"))} SVT`}
          </span>
          <span className="text-sm">
            Status:
            {reward.get("confirmed")
              ? !reward.get("isClaimed")
                ? " Ready to Claim"
                : reward.get("isClaimed") && reward.get("claimConfirmed")
                ? " Claimed"
                : " Processing Claim..."
              : " Processing..."}
          </span>
        </div>
      </div>
      <div className="w-[100px] flex flex-wrap justify-center">
        {!reward.get("isClaimed") && reward.get("confirmed") ? (
          <button
            disabled={
              isContractLoading ||
              !reward.get("confirmed") ||
              reward.get("isClaimed")
            }
            className="px-2 py-1 bg-green-300 text-black rounded-full m-1"
            onClick={() => claimRewardHandler()}
          >
            Claim
          </button>
        ) : reward.get("isClaimed") && reward.get("claimConfirmed") ? (
          <BiCheckDouble size={36} />
        ) : (
          <BiCheck size={36} />
        )}
      </div>

      {contractMessage && !isContractLoading && (
        <Toast
          open={contractMessage !== "" && contractMessage.message !== ""}
          type={contractMessage.status}
        >
          {contractMessage.message}
        </Toast>
      )}
    </div>
  );
};
