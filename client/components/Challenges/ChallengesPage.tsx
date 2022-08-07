import { useState } from "react";
import { ChallengeCard } from "./ChallengeCard";

type Props = {
  createdChallenges: any[];
  againstChallenges: any[];
  isLoading: boolean;
  isAuthenticated: boolean;
};

export default function ChallengesPage({
  isAuthenticated = false,
  createdChallenges,
  againstChallenges,
  isLoading = false,
}: Props) {
  const [activeTab, setActiveTab] = useState("against");

  return (
    <div className="w-full flex flex-col justify-center items-center text-white">
      <h1 className="mb-3">Challenges Page</h1>

      <div className="flex flex-col w-full">
        <div className="flex flex-row">
          <div
            onClick={() => setActiveTab("created")}
            className={`flex cursor-pointer flex-col w-1/2 items-center justify-center p-2 ${
              activeTab == "created" && "bg-green-200"
            }`}
          >
            Challenges Created
          </div>
          <div
            onClick={() => setActiveTab("against")}
            className={`flex cursor-pointer text-black flex-col w-1/2 items-center justify-center p-2 ${
              activeTab == "against" && "bg-green-200"
            }`}
          >
            Challenges Against
          </div>
        </div>
        <div className="flex flex-wrap justify-center">
          {activeTab === "created" &&
            createdChallenges &&
            createdChallenges.map((challenge, i) => (
              <ChallengeCard
                isAuthenticated={isAuthenticated}
                type="created"
                key={i}
                challengeObject={challenge}
                challenge={challenge.attributes}
              />
            ))}
          {activeTab === "against" &&
            againstChallenges &&
            againstChallenges.map((challenge, i) => (
              <ChallengeCard
                isAuthenticated={isAuthenticated}
                type="against"
                key={i}
                challengeObject={challenge}
                challenge={challenge.attributes}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
