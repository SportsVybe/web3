import Moralis from "moralis/types";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useMoralisQuery } from "react-moralis";
import { contractActions } from "../../configs/constants";
import { useContract } from "../../context/ContractProvider";
import { useCustomMoralis } from "../../context/CustomMoralisProvider";
import { Photo } from "../Layout/Photo";
import { Toast } from "../Layout/Toast";
import { ManageEvent } from "../Modals/ManageEvent";
import { ManageVote } from "../Modals/ManageVote";
// import { ManageChallenge } from "./ManageChallenge";

type Props = {
  challenge: any;
  type: "created" | "against";
  isAuthenticated: boolean;
  challengeObject?: any | null;
};

export const ChallengeCard = ({
  challenge,
  type,
  isAuthenticated,
  challengeObject = null,
}: Props) => {
  const router = useRouter();
  const { createUserAction } = useCustomMoralis();
  const { acceptChallenge, isContractLoading, contractMessage } = useContract();
  const [team1, setTeam1] = useState<Moralis.Object<Moralis.Attributes>>();
  const [team2, setTeam2] = useState<Moralis.Object<Moralis.Attributes>>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [manageEventModal, toggleManageEventModal] = useState(false);
  const [manageVoteModal, toggleManageVoteModal] = useState(false);

  const challengeFormData = {
    challengerActionId: challenge.challengerActionId || "",
    challengeTeam2count:
      (team2 &&
        team2.attributes &&
        team2.attributes.teamMembers &&
        team2.attributes.teamMembers.count) ||
      0,
  };

  const handleAccept = async () => {
    try {
      const action = await createUserAction(contractActions.acceptChallenge);
      const actionId = action.id;
      challengeFormData.challengerActionId = action;

      // accept challenge on chain
      const acceptChallengeOnChain = await acceptChallenge(
        actionId,
        challenge.challengeChainId,
        challenge.challengeTeam2,
        challenge.challengeAmount
      );
      console.log("acceptChallengeOnChain", acceptChallengeOnChain);

      // update challenge in database
      if (!isContractLoading && challengeObject && acceptChallengeOnChain) {
        await challengeObject.save(challengeFormData);
        if (challengeObject.error) console.log(challengeObject.error.message);
      } else if (!isContractLoading && !acceptChallengeOnChain) {
        await action.save({ actionStatus: false });
      }
      // reload page after saving
      if (!challengeObject.isSaving && !isContractLoading && !contractMessage) {
        router.push("/challenges");
      }
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
    let status = "Minting on chain...";
    if (
      challenge.isCompleted &&
      challenge.isClosed &&
      challenge.isAcceptedOnChain
    ) {
      status = "Completed";
    }
    if (
      !challenge.isCompleted &&
      !challenge.isClosed &&
      !challenge.isAcceptedOnChain &&
      challenge.challengeChainId &&
      !challenge.challengerActionId
    ) {
      status = "Pending challenger approval";
    }
    if (
      !challenge.isCompleted &&
      !challenge.isClosed &&
      !challenge.isAcceptedOnChain &&
      challenge.challengeChainId &&
      challenge.challengerActionId
    ) {
      status = "Minting challenger approval...";
    }
    if (challenge.isClosed && !challenge.isCompleted) {
      status = "Closed";
    }
    if (
      !challenge.isClosed &&
      !challenge.isCompleted &&
      challenge.isAcceptedOnChain
    ) {
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
          <div className="flex flex-row w-full items-center">
            <div className="flex flex-col w-1/2 items-center justify-center p-2">
              <Photo
                src={team1 && team1.attributes && team1.attributes.teamPhoto}
                alt={team1 && team1.attributes && team1.attributes.teamName}
                size="sm"
                type="team"
                isLoading={isLoading}
              />
              <span>
                {team1 && team1.attributes && team1.attributes.teamName}-
                {challenge && challenge.challengeChainId}
              </span>
              <span>
                {team1 && team1.attributes && team1.attributes.teamPOS
                  ? `${team1.attributes.teamPOS}%`
                  : "100%"}
                POS
              </span>
              <span>
                {team1 &&
                  team1.attributes &&
                  `${team1.attributes.teamWins} Wins - ${team1.attributes.teamLosses} Losses`}
              </span>
            </div>
            <span>VS</span>
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
                  : "100%"}
                POS
              </span>
              <span>
                {team2 &&
                  team2.attributes &&
                  `${team2.attributes.teamWins} Wins - ${team2.attributes.teamLosses} Losses`}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="m-auto">
        <div className="flex flex-col w-full p-2">
          <span> Status: {getChallengeStatus()}</span>
          <span>
            Prize Pool: {challenge.challengeAmount} SVT
            <span className="ml-2 text-gray-400 italic text-xs">
              Est. $10(?)
            </span>
          </span>
          <span>
            {challenge.challengeMessage && (
              <>Message: {challenge.challengeMessage}</>
            )}
          </span>
        </div>
      </div>
      <div className="flex flex-row w-full items-center justify-around p-2">
        {type == "against" && (
          <>
            {isContractLoading ? (
              <>Minting...</>
            ) : isAuthenticated && challenge.isAcceptedOnChain ? (
              <>
                <button
                  className="px-2 py-1 w-[120px] mx-4 bg-green-200 rounded-full hover:bg-green-400"
                  onClick={() => toggleManageEventModal(!manageEventModal)}
                >
                  Create Event
                </button>
                <button
                  className="px-2 py-1 w-[120px] mx-4 bg-green-200 rounded-full hover:bg-green-400"
                  onClick={() => toggleManageVoteModal(!manageVoteModal)}
                >
                  Vote
                </button>
              </>
            ) : (
              challenge.challengeChainId &&
              !challenge.challengerActionId && (
                <>
                  <button
                    onClick={handleAccept}
                    className="px-2 py-1 w-[120px] m-4 bg-green-200 rounded-full hover:bg-green-400 "
                  >
                    Accept
                  </button>
                  <button className="px-2 py-1 w-[120px] m-4 bg-red-200 rounded-full">
                    Deny (pending)
                  </button>
                </>
              )
            )}

            <a
              href={`/teams/${team1 && team1.id}`}
              className="px-2 py-1 w-[120px] m-4 text-white bg-blue-600 rounded-full hover:bg-blue-800 transition ease-in-out delay-100  hover:ease-in-out"
            >
              View Challenger
            </a>
          </>
        )}
        {type == "created" && (
          <>
            {isContractLoading ? (
              <>Minting...</>
            ) : isAuthenticated && challenge.isAcceptedOnChain ? (
              <>
                <button
                  className="px-2 py-1 w-[120px] mx-4 bg-green-200 rounded-full hover:bg-green-400"
                  onClick={() => toggleManageEventModal(!manageEventModal)}
                >
                  Create Event
                </button>
                <button
                  className="px-2 py-1 w-[120px] mx-4 bg-green-200 rounded-full hover:bg-green-400"
                  onClick={() => toggleManageVoteModal(!manageVoteModal)}
                >
                  Vote
                </button>
              </>
            ) : (
              challenge.challengeChainId &&
              !challenge.challengerActionId && (
                <>
                  <button className="px-2 py-1 w-[120px] m-4 bg-red-200 rounded-full">
                    Cancel (pending)
                  </button>
                </>
              )
            )}
            <a
              href={`/teams/${team2 && team2.id}`}
              className="px-2 py-1 w-[120px] m-4 text-center text-white bg-blue-600 rounded-full hover:bg-blue-800 transition ease-in-out delay-100 hover:ease-in-out"
            >
              View Opponent
            </a>
          </>
        )}
      </div>
      {contractMessage && !isContractLoading && (
        <Toast open type={contractMessage.status}>
          {contractMessage.message}
        </Toast>
      )}

      <ManageEvent
        challenge={challenge}
        team1={team1}
        team2={team2}
        toggleModal={toggleManageEventModal}
        modalView={manageEventModal}
        createNewEvent={true}
      />
      <ManageVote
        challenge={challengeObject}
        challengeTeam1={team1}
        challengeTeam2={team2}
        isLoading={isLoading}
        toggleModal={toggleManageVoteModal}
        modalView={manageVoteModal}
      />
    </div>
  );
};
