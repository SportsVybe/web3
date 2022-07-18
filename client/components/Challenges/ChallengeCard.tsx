import Moralis from "moralis/types";
import { useEffect, useState } from "react";
import { useMoralisQuery } from "react-moralis";
import { useContract } from "../../context/ContractProvider";
import { Photo } from "../Layout/Photo";
import { Toast } from "../Layout/Toast";
import { ManageEvent } from "../Modals/ManageEvent";
// import { ManageChallenge } from "./ChallengeModal";

type Props = {
  challenge: any;
  type: "created" | "against";
  isAuthenticated: boolean;
};

export const ChallengeCard = ({ challenge, type, isAuthenticated }: Props) => {
  const [team1, setTeam1] = useState<Moralis.Object<Moralis.Attributes>>();
  const [team2, setTeam2] = useState<Moralis.Object<Moralis.Attributes>>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [manageEventModal, toggleManageEventModal] = useState(false);

  const { acceptChallenge, isContractLoading, contractMessage } = useContract();

  const handleAccept = async () => {
    try {
      // create challenge on chain
      const acceptChallengeOnChain = await acceptChallenge(
        challenge.challengeChainId,
        challenge.challengeTeam2,
        challenge.challengeAmount
      );
      console.log("acceptChallengeOnChain", acceptChallengeOnChain);

      // update challengeStatus
    } catch (error) {
      console.error(error);
    }
  };

  const getChallengesTeam1 = useMoralisQuery(
    "teams",
    (query) => query.equalTo("teamChainId", challenge.challengeTeam1),
    [],
    {
      autoFetch: false,
    }
  );

  const getChallengesTeam2 = useMoralisQuery(
    "teams",
    (query) => query.equalTo("teamChainId", challenge.challengeTeam2),
    [],
    {
      autoFetch: false,
    }
  );

  const getChallengeStatus = () => {
    let status = "Pending";
    if (challenge.isCompleted && challenge.isClosed && challenge.isAccepted) {
      status = "Completed";
    }
    if (challenge.isClosed && !challenge.isCompleted) {
      status = "Closed";
    }
    if (!challenge.isClosed && !challenge.isCompleted && challenge.isAccepted) {
      status = "Accepted";
    }
    return status;
  };

  useEffect(() => {
    const createdLoading = getChallengesTeam1.isLoading;
    const againstLoading = getChallengesTeam2.isLoading;
    setIsLoading(createdLoading || againstLoading);
  }, [getChallengesTeam1, getChallengesTeam2]);

  useEffect(() => {
    getChallengesTeam1.fetch();
    setTeam1(getChallengesTeam1.data[0]);
    getChallengesTeam2.fetch();
    setTeam2(getChallengesTeam2.data[0]);
  }, [isLoading]);

  return (
    <div className="flex flex-col my-4 w-full md:w-[420px] md:ml-0 justify-center items-start border-2 border-gray-200 p-2 m-1 rounded-lg shadow-lg bg-white hover:shadow-2xl transition ease-in-out delay-100 hover:ease-in-out">
      <div className="flex flex-row w-full">
        {isLoading && team1 == undefined && team2 == undefined ? (
          <>Loading...</>
        ) : (
          <>
            <div className="flex flex-col w-1/2 items-center justify-center p-2">
              <Photo
                src={team1 && team1.attributes && team1.attributes.teamPhoto}
                alt={team1 && team1.attributes && team1.attributes.teamName}
                size="sm"
                type="team"
                isLoading={isLoading}
              />
              <span>
                {team1 && team1.attributes && team1.attributes.teamName}
              </span>
              <span>
                {team1 && team1.attributes && team1.attributes.teamPOS
                  ? `${team1.attributes.teamPOS}%`
                  : "100%"}{" "}
                POS
              </span>
              <span>
                {team1 &&
                  team1.attributes &&
                  `${team1.attributes.teamWins} Wins - ${team1.attributes.teamLosses} Losses
                                `}
              </span>
            </div>
            <div className="flex flex-col w-1/2 items-center p-2">
              <Photo
                src={team2 && team2.attributes && team2.attributes.teamPhoto}
                alt={team2 && team2.attributes && team2.attributes.teamName}
                size="sm"
                type="team"
                isLoading={isLoading}
              />
              <span>
                {team2 && team2.attributes && team2.attributes.teamName}
              </span>
              <span>
                {team2 && team2.attributes && team2.attributes.teamPOS
                  ? `${team2.attributes.teamPOS}%`
                  : "100%"}{" "}
                POS
              </span>{" "}
              <span>
                {team2 &&
                  team2.attributes &&
                  `${team2.attributes.teamWins} Wins - ${team2.attributes.teamLosses} Losses
                                `}
              </span>
            </div>
          </>
        )}
      </div>
      <div className="flex flex-col w-full p-2">
        <span> Status: {getChallengeStatus()}</span>
        <span>
          {" "}
          Amount: {challenge.challengeAmount} SVT{" "}
          <span className=" text-gray-400 italic text-xs">Est. $10(?)</span>
        </span>
        <span>
          {" "}
          {challenge.challengeMessage && (
            <>Message: {challenge.challengeMessage}</>
          )}
        </span>
      </div>
      <div className="flex flex-row w-full items-center justify-around p-2">
        {type == "against" && (
          <>
            {isContractLoading ? (
              <>Minting...</>
            ) : isAuthenticated && challenge.isAccepted ? (
              <button
                className="px-2 py-1 w-[120px] mx-4 bg-green-200 rounded-full hover:bg-green-400"
                onClick={() => toggleManageEventModal(!manageEventModal)}
              >
                Create Event
              </button>
            ) : (
              <>
                <button
                  onClick={handleAccept}
                  className="px-2 py-1 m-4 bg-green-200 rounded-full hover:bg-green-400 "
                >
                  Accept
                </button>
                <button className="px-2 py-1 m-4 bg-red-200 rounded-full">
                  Deny
                </button>
              </>
            )}

            <a
              href={`/teams/${team1 && team1.id}`}
              className="px-2 py-1 m-4 text-white bg-blue-600 rounded-full hover:bg-blue-800 transition ease-in-out delay-100  hover:ease-in-out"
            >
              View Challenger
            </a>
          </>
        )}
        {type == "created" && (
          <a
            href={`/teams/${team2 && team2.id}`}
            className="px-2 py-1 m-4 text-white bg-blue-600 rounded-full hover:bg-blue-800 transition ease-in-out delay-100  hover:ease-in-out"
          >
            View Opponent
          </a>
        )}
      </div>
      {contractMessage && !isContractLoading && (
        <Toast type={contractMessage.status}>{contractMessage.message}</Toast>
      )}

      <ManageEvent
        toggleModal={toggleManageEventModal}
        modalView={manageEventModal}
        createNewEvent={true}
      />
    </div>
  );
};
