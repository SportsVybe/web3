import { useState } from "react";
import { Challenge } from "../../configs/types";
import { ChallengeCard } from "./ChallengeCard";

type Props = {
  active: Challenge[] | [];
  created: Challenge[] | [];
  complete: Challenge[] | [];
};

export default function ChallengesPage(props: Props) {
  const { active, complete, created } = props;
  const [activeTab, setActiveTab] = useState("active");
  return (
    <div>
      <div className="flex flex-row justify-center items-center mb-5 pb-4 border-b-2 border-gray-600">
        <div
          className={`flex cursor-pointer flex-col md:w-[240px] w-[130px] items-center justify-center hover:bg-green-300 rounded-lg p-2 ${
            activeTab == "active" && "bg-green-500 hover:bg-green-700"
          }`}
          onClick={() => setActiveTab("active")}
        >
          {active && active.length} Active
        </div>
        <div
          className={`flex cursor-pointer flex-col md:w-[240px] w-[130px] items-center justify-center hover:bg-green-300 rounded-lg p-2 mx-4 ${
            activeTab == "complete" && "bg-green-500 hover:bg-green-700"
          }`}
          onClick={() => setActiveTab("complete")}
        >
          {complete && complete.length} Complete
        </div>
        <div
          className={`flex cursor-pointer flex-col md:w-[240px] w-[130px] items-center justify-center hover:bg-green-300 rounded-lg p-2 ${
            activeTab == "created" && "bg-green-500 hover:bg-green-700"
          }`}
          onClick={() => setActiveTab("created")}
        >
          {created && created.length} Created
        </div>
      </div>
      {activeTab === "active" && (
        <div className="flex flex-col justify-center items-center">
          {active.length > 0 && activeTab === "active" ? (
            <div className="flex flex-col justify-center items-center">
              <div className="flex flex-wrap justify-center items-center">
                {active.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    type="active"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center">
              <h1 className="text-xl">No active challenges</h1>
            </div>
          )}
        </div>
      )}
      {activeTab === "complete" && (
        <div className="flex flex-col justify-center items-center">
          {complete.length > 0 && activeTab === "complete" ? (
            <div className="flex flex-col justify-center items-center">
              <div className="flex flex-wrap justify-center items-center">
                {complete.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    type="complete"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center">
              <h1 className="text-xl">No complete challenges</h1>
            </div>
          )}
        </div>
      )}
      {activeTab === "created" && (
        <div className="flex flex-col justify-center items-center">
          {created.length > 0 && activeTab === "created" ? (
            <div className="flex flex-col justify-center items-center">
              <div className="flex flex-wrap justify-center items-center">
                {created.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    type="created"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center">
              <h1 className="text-xl">No created challenges</h1>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
