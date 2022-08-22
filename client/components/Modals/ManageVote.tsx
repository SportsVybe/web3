import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useState } from "react";
import { useMoralis, useNewMoralisObject } from "react-moralis";
import { contractActions } from "../../configs/constants";
import { Challenge, Team } from "../../configs/types";
import { useContract } from "../../context/ContractProvider";
import { useCustomMoralis } from "../../context/CustomMoralisProvider";
import Modal from "../Layout/Modal";
import { Photo } from "../Layout/Photo";
import { Toast } from "../Layout/Toast";

type Props = {
  challengeTeam1: Team;
  challengeTeam2: Team;
  challenge: Challenge | any;
  toggleModal: Dispatch<SetStateAction<boolean>>;
  modalView: boolean;
  isLoading: boolean;
};

export const ManageVote = ({
  challengeTeam1,
  challengeTeam2,
  challenge,
  toggleModal,
  modalView,
  isLoading,
}: Props) => {
  const router = useRouter();
  const { user } = useMoralis();
  const getVotesDB = useNewMoralisObject("votes");
  const { createUserAction } = useCustomMoralis();
  const { submitVote, isContractLoading, contractMessage } = useContract();

  const [selectedTeam, setVoteTeamId] = useState<Team>();

  const selectedTeamCSS = "border-2 border-green-100";

  const voteFormData = {
    selectedTeam: selectedTeam,
    challengeId: challenge,
    voter: user,
    actionId: {},
  };

  const [submittedVotes, setSubmittedVotes] = useState<any>(
    challenge.get("submittedVotes") || []
  );

  const handleSubmit = async () => {
    if (isFormValid()) {
      try {
        const action = await createUserAction(contractActions.submitVote);
        voteFormData.actionId = action;
        const actionId = action.id;

        const challengeId = challenge.get("challengeChainId");
        const selectedTeamChainId = selectedTeam?.get("teamChainId");

        // create challenge on chain
        const submitVoteOnChain = await submitVote(
          actionId,
          challengeId,
          selectedTeamChainId
        );

        console.log("submitVoteOnChain", submitVoteOnChain);

        // submit vote to database...
        if (!isContractLoading && submitVoteOnChain) {
          await getVotesDB.save(voteFormData);
          await challenge.save({
            submittedVotes: [user?.get("username"), ...submittedVotes],
          });
          // reload page after saving
          router.reload();
        } else if (!isContractLoading && !submitVoteOnChain) {
          await action.save({ actionStatus: false });
        }
        if (getVotesDB.error) console.log(getVotesDB.error.message);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const isFormValid = () => {
    if (
      !voteFormData.selectedTeam ||
      !voteFormData.challengeId ||
      !selectedTeam
    ) {
      alert("Please select a team to vote!");
      return false;
    }
    return true;
  };

  return (
    <Modal open={modalView} onClose={async () => toggleModal(false)}>
      <div className="flex flex-col border-2 border-green-100 p-4 items-center">
        <div>
          Submit Vote for Challenge #
          {challenge &&
            challenge.attributes &&
            challenge.get("challengeChainId")}
        </div>

        {isContractLoading ? (
          <span className="my-3 px-2 py-1 ">...Minting</span>
        ) : (
          <>
            <div className="flex flex-col w-full justify-center items-center">
              <span className="h-[60px] my-1 flex justify-end items-center">
                Choose a Team*:
              </span>
              <div className="flex flex-row w-full">
                {isLoading &&
                challengeTeam1 == undefined &&
                challengeTeam2 == undefined ? (
                  <>Loading...</>
                ) : (
                  <>
                    <div
                      className={`flex flex-col w-1/2 items-center justify-center p-2 ${
                        selectedTeam?.get("teamChainId") ===
                          challengeTeam1?.get("teamChainId") && selectedTeamCSS
                      }`}
                      onClick={() => setVoteTeamId(challengeTeam1)}
                    >
                      <Photo
                        src={challengeTeam1 && challengeTeam1.get("teamPhoto")}
                        alt={challengeTeam1 && challengeTeam1.get("teamName")}
                        size="sm"
                        type="team"
                        isLoading={isLoading}
                      />
                      <span className="p-2">
                        {challengeTeam1 && challengeTeam1.get("teamName")}
                      </span>
                    </div>
                    <div
                      className={`flex flex-col w-1/2 items-center justify-center p-2 ${
                        selectedTeam?.get("teamChainId") ===
                          challengeTeam2?.get("teamChainId") && selectedTeamCSS
                      }`}
                      onClick={() => setVoteTeamId(challengeTeam2)}
                    >
                      <Photo
                        src={challengeTeam2 && challengeTeam2.get("teamPhoto")}
                        alt={challengeTeam2 && challengeTeam2.get("teamName")}
                        size="sm"
                        type="team"
                        isLoading={isLoading}
                      />
                      <span className="p-2">
                        {challengeTeam2 && challengeTeam2.get("teamName")}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              disabled={isContractLoading}
              className="my-3 px-2 py-1 bg-green-300 text-black rounded-full disabled:bg-slate-300"
              onClick={() => handleSubmit()}
            >
              Submit Vote
            </button>
            {contractMessage && !isContractLoading && (
              <Toast
                open={contractMessage !== "" && contractMessage.message !== ""}
                type={contractMessage.status}
              >
                {contractMessage.message}
              </Toast>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
