import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useNewMoralisObject } from "react-moralis";
import { contractActions } from "../../configs/constants";
import { Challenge, GetUserTeamsResponse, Team } from "../../configs/types";
import { useContract } from "../../context/ContractProvider";
import { useCustomMoralis } from "../../context/CustomMoralisProvider";
import { capitalizeWord } from "../../helper/formatter";
import AuthorizeButton from "../Buttons/AuthorizeButton";
import Modal from "../Layout/Modal";
import { Toast } from "../Layout/Toast";

type Props = {
  challengeTeam: Team | null;
  challengeTeamId: string;
  user: any;
  userTeam?: Team | null;
  userTeamId?: string;
  challenge?: any | boolean;
  createNewChallenge: boolean;
  toggleModal: Dispatch<SetStateAction<boolean>>;
  modalView: boolean;
};

export const ManageChallenge = ({
  challengeTeam,
  challengeTeamId = "",
  user,
  userTeam = null,
  userTeamId = "",
  challenge = false,
  createNewChallenge = false,
  toggleModal,
  modalView,
}: Props) => {
  const getChallengesDB = useNewMoralisObject("challenges");
  const { createUserAction, cloudFunction } = useCustomMoralis();
  const { createChallenge, isContractLoading, contractMessage } = useContract();
  const router = useRouter();
  const [userTeams, setUserTeams] = useState<GetUserTeamsResponse>();
  const [error, setError] = useState("");

  const [challengeSports, setChallengeSports] = useState(
    (challenge && challenge.get("challengeSports")) || ""
  );
  const [challengeAmount, setChallengeAmount] = useState(
    (challenge && challenge.get("challengeAmount")) || "0"
  );
  const [challengeMessage, setChallengeMessage] = useState(
    (challenge && challenge.get("challengeMessage")) || ""
  );
  const [challengeTeam1, setChallengeTeam1] = useState(userTeam);
  const [challengeTeam1_chainId, setChallengeTeam1_chainId] = useState(
    userTeamId || ""
  );

  const challengeFormData: Challenge = {
    id: challenge.id || "",
    challengeChainId: (challenge && challenge.get("challengeChainId")) || "",
    actionId: (challenge && challenge.get("actionId")) || "",
    challengeAmount: challengeAmount,
    challengeMessage: challengeMessage,
    challengeSport: challengeSports,
    challengeTeam1: challengeTeam1,
    challengeTeam1_chainId: challengeTeam1_chainId,
    challengeTeam1Admin: user.get("username"),
    challengeTeam1Count:
      (challengeTeam1 &&
        challengeTeam1.get("teamMembers") &&
        challengeTeam1.get("teamMembers").length) ||
      0,
    challengeTeam1TeamMembers:
      (challengeTeam1 && challengeTeam1.get("teamMembers")) || [],
    challengeTeam2: challengeTeam,
    challengeTeam2_chainId: challengeTeamId || "",
    challengeTeam2Admin:
      (challengeTeam && challengeTeam.get("teamAdmin")) || "",
    challengeTeam2Count:
      (challengeTeam &&
        challengeTeam.get("teamMembers") &&
        challengeTeam.get("teamMembers").length) ||
      0,
    challengeTeam2TeamMembers:
      (challengeTeam && challengeTeam.get("teamMembers")) || [],
  };

  const handleSubmit = async () => {
    if (isFormValid()) {
      try {
        if (createNewChallenge) {
          const action = await createUserAction(
            contractActions.createChallenge
          );
          const actionId = action.id;
          challengeFormData.actionId = action;
          // create challenge on chain
          const createChallengeOnChain = await createChallenge(
            actionId,
            challengeTeam1_chainId,
            challengeTeamId,
            challengeAmount
          );

          // create new challenge to database...
          if (!isContractLoading && createChallengeOnChain) {
            await getChallengesDB.save(challengeFormData);
            router.push("/challenges");
          } else if (!isContractLoading && !createChallengeOnChain) {
            await action.save({ actionStatus: false });
          }
          if (getChallengesDB.error) console.log(getChallengesDB.error.message);
        }

        // update challenge in database
        if (challenge && !createNewChallenge) {
          challengeFormData.id = challenge.id;
          await challenge.save(challengeFormData);
          router.push("/challenges");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSports = (sport: string, isChecked: boolean) => {
    if (isChecked) {
      setChallengeSports("");
    } else {
      setChallengeSports(sport);
    }
  };

  const handleSelectTeam = (teamChainId: string) => {
    if (!teamChainId) {
      setChallengeTeam1(null);
      return;
    }
    const selectedTeam = userTeams?.teamOwnerActiveTeams.find(
      (team) => team.get("teamChainId") === teamChainId
    );
    setChallengeTeam1(selectedTeam || null);
    setChallengeTeam1_chainId(teamChainId);
  };

  const isFormValid = () => {
    if (!challengeTeam1 || !challengeAmount || !challengeSports) {
      alert("Please fill out required fields.");
      return false;
    }
    if (
      challengeFormData.challengeTeam1Count !=
      challengeFormData.challengeTeam2Count
    ) {
      alert(
        `Teams must have the same number of members. \n Selected Team: ${challengeFormData.challengeTeam1Count} vs Challenged Team: ${challengeFormData.challengeTeam2Count}`
      );
      return false;
    }
    return true;
  };

  const fetchUserTeams = async () => {
    const userTeams = await cloudFunction("getUserTeams", {});
    if (!userTeams.success) setError(error || "Error fetching user teams");
    return userTeams;
  };

  useEffect(() => {
    if (modalView) {
      fetchUserTeams().then(setUserTeams).catch(setError);
    }
  }, [modalView]);

  return (
    <Modal open={modalView} onClose={async () => toggleModal(false)}>
      <div className="flex flex-col border-2 border-green-100 p-4 items-center">
        <div className="p-3">
          {createNewChallenge
            ? `Create Challenge Against ${
                challengeTeam && challengeTeam.get("teamName")
              }`
            : `Manage Challenge`}
        </div>
        {isContractLoading ? (
          <span className="my-3 px-2 py-1 ">...Minting</span>
        ) : (
          <>
            <div className="flex flex-col w-full justify-center items-center">
              <div className="p-2 flex flex-col md:flex-row items-center">
                <span className="md:pr-1 w-[130px] md:text-right">
                  Choose Team*:
                </span>
                <select
                  className="w-full md:w-[130px] md:pr-1"
                  required
                  onChange={(e) => handleSelectTeam(e.target.value)}
                >
                  <option value="">Select Team</option>
                  {userTeams &&
                    userTeams.teamOwnerActiveTeams.map(
                      (team: any, i: number) => (
                        <option
                          key={i}
                          value={team.get("teamChainId")}
                          defaultChecked={
                            challengeTeam1_chainId == team.get("teamChainId")
                          }
                        >
                          {team.get("teamName")}
                        </option>
                      )
                    )}
                </select>
              </div>
              <div className="p-2 flex flex-col md:flex-row items-center">
                <span className="pr-1 w-[130px] md:text-right">Amount*:</span>
                <input
                  required
                  value={challengeAmount}
                  className="m-2 px-2 py-1 rounded bg-gray-300"
                  onChange={(e) => setChallengeAmount(e.target.value)}
                  type="number"
                  min={0}
                />
              </div>
              <div className="p-2 flex flex-col md:flex-row items-center">
                <span className="pr-1 w-[130px] md:text-right">Sports*:</span>
                <span className="h-[60px] my-1 flex justify-start items-center flex-wrap">
                  {challengeTeam &&
                    challengeTeam.get("teamSportsPreferences") &&
                    challengeTeam
                      .get("teamSportsPreferences")
                      .sort()
                      .map((sport: string, i: number) => {
                        const isChecked = challengeSports.includes(sport);
                        return (
                          <button
                            key={i}
                            className={`m-2 px-2 py-1 rounded text-sm  ${
                              isChecked ? "bg-green-100" : "bg-gray-300"
                            }`}
                            onClick={() => handleSports(sport, isChecked)}
                          >
                            {capitalizeWord(sport)}
                          </button>
                        );
                      })}
                </span>
              </div>
              <div className="p-2 flex flex-col md:flex-row items-center">
                <span className="pr-1 w-[130px] md:text-right">Message:</span>
                <textarea
                  id="challengeMessage"
                  className="m-2 px-2 py-1 rounded bg-gray-300"
                  placeholder="Enter challenge description..."
                  rows={3}
                  value={challengeMessage}
                  onChange={(e) => setChallengeMessage(e.target.value)}
                />
              </div>
            </div>

            <AuthorizeButton amount={challengeAmount} />

            <button
              disabled={isContractLoading || challengeAmount == "0"}
              className="my-3 px-2 py-1 bg-green-300 rounded-full disabled:bg-slate-300"
              onClick={() => handleSubmit()}
            >
              {createNewChallenge ? "Create Challenge" : "Update Challenge"}
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
