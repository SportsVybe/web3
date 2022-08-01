import Moralis from "moralis/types";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useState } from "react";
import { useNewMoralisObject } from "react-moralis";
import { contractActions } from "../../configs/constants";
import { useContract } from "../../context/ContractProvider";
import { useCustomMoralis } from "../../context/CustomMoralisProvider";
import Modal from "../Layout/Modal";
import { Photo } from "../Layout/Photo";
import { Toast } from "../Layout/Toast";

type Props = {
  challengeTeam1?: Moralis.Object<Moralis.Attributes>;
  challengeTeam2?: Moralis.Object<Moralis.Attributes>;
  challenge: any;
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
  const getVotesDB = useNewMoralisObject("votes");
  const { createUserAction } = useCustomMoralis();
  const { submitVote, isContractLoading, contractMessage } = useContract();

  const [selectedTeam, setVoteTeamId] =
    useState<Moralis.Object<Moralis.Attributes>>();

  const selectedTeamCSS = "border-2 border-green-100";

  const voteFormData = {
    selectedTeam: selectedTeam,
    challengeId: challenge,
    actionId: {},
  };

  const handleSubmit = async () => {
    console.log("vote form data", voteFormData);
    if (isFormValid()) {
      try {
        const newUserAction = await createUserAction(
          contractActions.submitVote
        );
        voteFormData.actionId = newUserAction;
        const actionId = newUserAction.id;

        const challengeId = challenge.attributes.challengeChainId;
        const selectedTeamChainId = selectedTeam?.attributes.teamChainId;

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
        }
        if (getVotesDB.error) console.log(getVotesDB.error.message);

        // reload page after saving
        if (!getVotesDB.isSaving && !isContractLoading && !contractMessage) {
          router.push("/challenges");
        }
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
      alert("Please fill out required fields.");
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
            challenge.attributes.challengeChainId}
        </div>

        {isContractLoading && !contractMessage ? (
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
                        src={
                          challengeTeam1 &&
                          challengeTeam1.attributes &&
                          challengeTeam1.attributes.teamPhoto
                        }
                        alt={
                          challengeTeam1 &&
                          challengeTeam1.attributes &&
                          challengeTeam1.attributes.teamName
                        }
                        size="sm"
                        type="team"
                        isLoading={isLoading}
                      />
                      <span className="p-2">
                        {challengeTeam1 &&
                          challengeTeam1.attributes &&
                          challengeTeam1.attributes.teamName}
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
                        src={
                          challengeTeam2 &&
                          challengeTeam2.attributes &&
                          challengeTeam2.attributes.teamPhoto
                        }
                        alt={
                          challengeTeam2 &&
                          challengeTeam2.attributes &&
                          challengeTeam2.attributes.teamName
                        }
                        size="sm"
                        type="team"
                        isLoading={isLoading}
                      />
                      <span className="p-2">
                        {challengeTeam2 &&
                          challengeTeam2.attributes &&
                          challengeTeam2.attributes.teamName}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              disabled={isContractLoading}
              className="my-3 px-2 py-1 bg-green-300 rounded-full disabled:bg-slate-300"
              onClick={() => handleSubmit()}
            >
              Submit Vote
            </button>
            {contractMessage && !isContractLoading && (
              <Toast
                open={contractMessage && !isContractLoading}
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
