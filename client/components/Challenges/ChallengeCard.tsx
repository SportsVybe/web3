import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { contractActions } from "../../configs/constants";
import { Event, Team } from "../../configs/types";
import { useContract } from "../../context/ContractProvider";
import { useCustomMoralis } from "../../context/CustomMoralisProvider";
import { Photo } from "../Layout/Photo";
import { Toast } from "../Layout/Toast";
import { ManageEvent } from "../Modals/ManageEvent";
import { ManageVote } from "../Modals/ManageVote";
// import { ManageChallenge } from "./ManageChallenge";

type Props = {
  challenge: any;
  type: "active" | "complete" | "created";
  isLoading?: boolean;
};

export const ChallengeCard = ({
  challenge,
  type,
  isLoading = false,
}: Props) => {
  const router = useRouter();
  const { user } = useMoralis();
  const { createUserAction } = useCustomMoralis();
  const { acceptChallenge, isContractLoading, contractMessage } = useContract();
  const [manageEventModal, toggleManageEventModal] = useState(false);
  const [manageVoteModal, toggleManageVoteModal] = useState(false);

  const [team1, setTeam1] = useState<Team>(challenge.get("challengeTeam1"));
  const [team2, setTeam2] = useState<Team>(challenge.get("challengeTeam2"));

  const [status, setStatus] = useState<string>("...");

  const [event, setEvent] = useState<Event>(
    challenge.get("challengeEvent") || undefined
  );

  let isChallengeTeam1Admin = false;
  let isChallengeTeam2Admin = false;
  let isChallengeTeamMember = false;
  let hasUserVote = false;
  const challengeFormData = {
    challengerActionId: challenge.get("challengerActionId") || "",
    challengeTeam2count:
      (team2 && team2.get("teamMembers") && team2.get("teamMembers").count) ||
      0,
    challengeTeam2TeamMembers: (team2 && team2.get("teamMembers")) || [],
  };

  if (user) {
    isChallengeTeam1Admin =
      user.get("username") === challenge.get("challengeTeam1Admin");
    isChallengeTeam2Admin =
      user.get("username") === challenge.get("challengeTeam2Admin");
    isChallengeTeamMember =
      challenge
        .get("challengeTeam1TeamMembers")
        .includes(user.get("username")) ||
      challenge.get("challengeTeam2TeamMembers").includes(user.get("username"));
    hasUserVote =
      (challenge.get("submittedVotes") &&
        challenge.get("submittedVotes").includes(user.get("username"))) ||
      false;
  }

  const handleAccept = async () => {
    try {
      const action = await createUserAction(contractActions.acceptChallenge);
      const actionId = action.id;
      challengeFormData.challengerActionId = action;

      // accept challenge on chain
      const acceptChallengeOnChain = await acceptChallenge(
        actionId,
        challenge.get("challengeChainId"),
        challenge.get("challengeTeam2_chainId"),
        challenge.get("challengeAmount")
      );
      console.log("acceptChallengeOnChain", acceptChallengeOnChain);

      // update challenge in database
      if (!isContractLoading && challenge && acceptChallengeOnChain) {
        await challenge.save(challengeFormData);
        router.push("/challenges");
        if (challenge.error) console.log(challenge.error.message);
      } else if (!isContractLoading && !acceptChallengeOnChain) {
        await action.save({ actionStatus: false });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getChallengeStatus = () => {
    if (
      challenge.get("challengeChainId") == "" &&
      !challenge.get("isCompleted") &&
      !challenge.get("isClosed") &&
      !challenge.get("isAcceptedOnChain") &&
      challenge.get("challengerActionId") == undefined
    ) {
      setStatus("Minting on chain...");
    } else if (
      challenge.get("challengeChainId") != "" &&
      !challenge.get("isCompleted") &&
      !challenge.get("isClosed") &&
      !challenge.get("isAcceptedOnChain") &&
      challenge.get("challengerActionId") == undefined
    ) {
      setStatus("Pending Challenger");
    } else if (
      challenge.get("isCompleted") &&
      challenge.get("isClosed") &&
      challenge.get("isAcceptedOnChain")
    ) {
      setStatus("Completed");
    } else if (
      !challenge.get("isCompleted") &&
      !challenge.get("isClosed") &&
      !challenge.get("isAcceptedOnChain") &&
      challenge.get("challengeChainId") &&
      challenge.get("challengerActionId")
    ) {
      setStatus("Minting Challenger Action...");
    } else if (challenge.get("isClosed") && !challenge.get("isCompleted")) {
      setStatus("Closed");
    } else if (
      !challenge.get("isClosed") &&
      !challenge.get("isCompleted") &&
      challenge.get("isAcceptedOnChain")
    ) {
      setStatus("Accepted");
    } else {
      setStatus("Error");
    }
  };

  useEffect(() => {
    getChallengeStatus();
  }),
    [challenge];

  return (
    <div className="flex flex-col my-4 w-full text-white md:w-[650px] md:ml-0 justify-center card items-start p-2 rounded-lg shadow-lg bg-black transition ease-in-out delay-100  hover:ease-in-out">
      <div className="flex flex-row w-full">
        <div className="flex flex-row w-full items-center">
          <div className="w-1/2 items-center justify-center p-2">
            <a
              href={`/teams/${team1 && team1.id}`}
              className=" transition ease-in-out delay-100  hover:ease-in-out"
            >
              <div className="flex flex-col items-center justify-center ">
                <Photo
                  src={team1 && team1.get("teamPhoto")}
                  alt={team1 && team1.get("teamName")}
                  size="sm"
                  type="team"
                  isLoading={isLoading}
                />
                <span>{team1 && team1.get("teamName")}</span>
                <span>
                  {team1 && team1.get("teamPOS")
                    ? `${team1.get("teamPOS")}%`
                    : "100%"}
                  POS
                </span>
                <span>
                  {team1 &&
                    `${team1.get("teamWins")} Wins - ${team1.get(
                      "teamLosses"
                    )} Losses`}
                </span>
              </div>
            </a>
          </div>
          <span>VS</span>
          <div className="w-1/2 items-center justify-center p-2">
            <a
              href={`/teams/${team2 && team2.id}`}
              className=" transition ease-in-out delay-100  hover:ease-in-out"
            >
              <div className="flex flex-col items-center justify-center ">
                <Photo
                  src={team2 && team2.get("teamPhoto")}
                  alt={team2 && team2.get("teamName")}
                  size="sm"
                  type="team"
                  isLoading={isLoading}
                />
                <span>{team2 && team2.get("teamName")}</span>
                <span>
                  {team2 && team2.get("teamPOS")
                    ? `${team2.get("teamPOS")}%`
                    : "100%"}
                  POS
                </span>
                <span>
                  {team2 &&
                    `${team2.get("teamWins")} Wins - ${team2.get(
                      "teamLosses"
                    )} Losses`}
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>
      <div className="m-auto">
        <div className="flex flex-col w-full p-2">
          <span>
            Challenge ID: {challenge.get("challengeChainId") || "Pending"}
          </span>
          <span> Status: {status}</span>
          <span>
            Prize Pool: {challenge.get("challengeAmount")} SVT
            <span className="ml-2 text-gray-400 italic text-xs">
              Est. $10(?)
            </span>
          </span>
          <span>
            {challenge.get("challengeMessage") && (
              <>Message: {challenge.get("challengeMessage")}</>
            )}
          </span>
        </div>
      </div>
      <div className="flex flex-row w-full items-center justify-around p-2">
        {isContractLoading ? (
          <>Minting...</>
        ) : (
          <ChallengeButtons
            type={type}
            status={status}
            isChallengeTeam1Admin={isChallengeTeam1Admin}
            isChallengeTeam2Admin={isChallengeTeam2Admin}
            isChallengeTeamMember={isChallengeTeamMember}
            hasUserVote={hasUserVote}
            toggleManageEventModal={toggleManageEventModal}
            toggleManageVoteModal={toggleManageVoteModal}
            manageEventModal={manageEventModal}
            manageVoteModal={manageVoteModal}
            handleAccept={handleAccept}
            event={event}
          />
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

      <ManageEvent
        challenge={challenge}
        team1={team1}
        team2={team2}
        toggleModal={toggleManageEventModal}
        modalView={manageEventModal}
        createNewEvent={true}
      />
      <ManageVote
        challenge={challenge}
        challengeTeam1={team1}
        challengeTeam2={team2}
        isLoading={isLoading}
        toggleModal={toggleManageVoteModal}
        modalView={manageVoteModal}
      />
    </div>
  );
};

type ChallengeButtonsProps = {
  type: "active" | "complete" | "created";
  status: string;
  isChallengeTeam1Admin: boolean;
  isChallengeTeam2Admin: boolean;
  isChallengeTeamMember: boolean;
  hasUserVote: boolean;
  toggleManageEventModal: any;
  manageEventModal: boolean;
  toggleManageVoteModal: any;
  manageVoteModal: boolean;
  handleAccept: any;
  event: Event | any;
};
const ChallengeButtons = ({
  type,
  status,
  isChallengeTeam1Admin,
  isChallengeTeam2Admin,
  isChallengeTeamMember,
  hasUserVote,
  toggleManageEventModal,
  manageEventModal,
  toggleManageVoteModal,
  manageVoteModal,
  handleAccept,
  event,
}: ChallengeButtonsProps) => {
  return (
    <>
      {/* Create event if admin and challenge accepted */}
      {type === "active" &&
        status === "Accepted" &&
        (isChallengeTeam1Admin || isChallengeTeam2Admin) &&
        !event && (
          <button
            className="px-2 py-1 w-[120px] mx-4 bg-green-200 rounded-full text-black hover:bg-green-400"
            onClick={() => toggleManageEventModal(!manageEventModal)}
          >
            Create Event
          </button>
        )}
      {type === "active" &&
        status === "Accepted" &&
        (isChallengeTeam1Admin || isChallengeTeam2Admin) &&
        event && (
          <a href={`/events/${event.id}`} className="px-2 py-1">
            View Event
          </a>
        )}
      {/* Allow vote if a challenge team member and challenge accepted */}
      {type === "active" &&
        status === "Accepted" &&
        isChallengeTeamMember &&
        !hasUserVote && (
          <button
            className="px-2 py-1 w-[120px] mx-4 bg-green-200 rounded-full text-black hover:bg-green-400"
            onClick={() => toggleManageVoteModal(!manageVoteModal)}
          >
            Vote
          </button>
        )}
      {/* allow challenge team 2 admin to accept or deny if the challenge is on chain */}
      {type === "active" &&
        status === "Pending Challenger" &&
        isChallengeTeam2Admin && (
          <>
            <button
              onClick={handleAccept}
              className="px-2 py-1 w-[120px] m-4 bg-green-200 rounded-full text-black hover:bg-green-400 "
            >
              Accept
            </button>
            <button className="px-2 py-1 w-[120px] m-4 bg-red-200 text-black rounded-full">
              Deny (pending)
            </button>
          </>
        )}

      {/* allow challenge 1 admin to cancel if the challenge has not been accepted*/}

      {(type === "active" || type === "created") &&
        status === "Pending Challenger" &&
        isChallengeTeam1Admin && (
          <button className="px-2 py-1 w-[120px] m-4 bg-red-200 text-black rounded-full">
            Cancel (pending)
          </button>
        )}
    </>
  );
};
