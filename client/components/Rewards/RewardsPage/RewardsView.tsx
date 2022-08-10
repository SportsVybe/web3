import { useState } from "react";
import { RewardCard } from "../RewardsCard";
import { Reward } from "./RewardsController";

type Props = {
  available: Reward[] | [];
  claimed: Reward[] | [];
};

export const RewardsView = (props: Props) => {
  const { available, claimed } = props;
  const [activeTab, setActiveTab] = useState("available");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  return (
    <div>
      <div className="flex flex-row justify-center items-center mb-5 pb-4 border-b-2 border-gray-600">
        <div
          className={`flex cursor-pointer flex-col md:w-[240px] w-[130px] items-center justify-center hover:bg-green-300 rounded-lg p-2 ${
            activeTab == "available" && "bg-green-500 hover:bg-green-700"
          }`}
          onClick={() => setActiveTab("available")}
        >
          {available && available.length} Available
        </div>
        <div
          className={`flex cursor-pointer flex-col md:w-[240px] w-[130px] items-center justify-center hover:bg-green-300 rounded-lg p-2 mx-4 ${
            activeTab == "claimed" && "bg-green-500 hover:bg-green-700"
          }`}
          onClick={() => setActiveTab("claimed")}
        >
          {claimed && claimed.length} Claimed
        </div>
      </div>
      {activeTab === "available" && (
        <div className="flex flex-col justify-center items-center">
          {available.length > 0 && activeTab === "available" ? (
            <div className="flex flex-col justify-center items-center">
              <div className="flex flex-col justify-center items-center">
                {available.map((reward) => (
                  <RewardCard key={reward.id} reward={reward} />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center">
              <h1 className="text-xl">No available Rewards</h1>
            </div>
          )}
        </div>
      )}
      {activeTab === "claimed" && (
        <div className="flex flex-col justify-center items-center">
          {claimed.length > 0 && activeTab === "claimed" ? (
            <div className="flex flex-col justify-center items-center">
              <div className="flex flex-col justify-center items-center">
                {claimed.map((reward) => (
                  <RewardCard key={reward.id} reward={reward} />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center">
              <h1 className="text-xl">No claimed Rewards</h1>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
