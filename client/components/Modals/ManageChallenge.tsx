import Moralis from "moralis/types";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useNewMoralisObject } from "react-moralis";
import { contractActions } from "../../configs/constants";
import { Challenge, Team } from "../../configs/types";
import { useContract } from "../../context/ContractProvider";
import { useCustomMoralis } from "../../context/CustomMoralisProvider";
import AuthorizeButton from "../Buttons/AuthorizeButton";
import Modal from "../Layout/Modal";
import { Toast } from "../Layout/Toast";

type Props = {
  challengeTeam: Moralis.Object | null;
  challengeTeamId: string;
  user: any;
  userTeam?: Moralis.Object | null;
  userTeamId?: string;
  challenge?: any | boolean;
  createNewChallenge: boolean;
  toggleModal: Dispatch<SetStateAction<boolean>>;
  modalView: boolean;
};

type Response = {
  teamOwnerTeams: Team[] | [];
  teamOwnerActiveTeams: Team[] | [];
  teamMemberTeams: Team[] | [];
  success: boolean;
  error: string | null;
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
  const [userTeams, setUserTeams] = useState<Response>();
  const [isLoading, setIsLoading] = useState(true);
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
  const [challengeTeam2_chainId, setChallengeTeam2_chainId] = useState(
    challengeTeamId || ""
  );
  const [challengeTeam2Admin, setChallengeTeam2Admin] = useState(
    (challengeTeam && challengeTeam.get("teamAdmin")) || ""
  );

  const challengeFormData: Challenge = {
    id: challenge.id || "",
    challengeTeam1: challengeTeam1,
    challengeTeam2: challengeTeam,
    challengeTeam1_chainId: challengeTeam1_chainId,
    challengeTeam2_chainId: challengeTeamId || "",
    challengeAmount: challengeAmount,
    challengeMessage: challengeMessage,
    challengeSport: challengeSports,
    challengeTeam1Admin: user.get("username"),
    challengeTeam2Admin: challengeTeam2Admin,
    challengeChainId: (challenge && challenge.get("challengeChainId")) || "",
    challengeTeam1Count:
      (challengeTeam &&
        challengeTeam.get("teamMembers") &&
        challengeTeam.get("teamMembers").length) ||
      0,
    challengeTeam2Count: 0,
    actionId: (challenge && challenge.get("actionId")) || "",
  };

  const handleSubmit = async () => {
    // if (isFormValid()) {
    try {
      if (createNewChallenge) {
        const action = await createUserAction(contractActions.createChallenge);
        const actionId = action.id;
        challengeFormData.actionId = action;
        // create challenge on chain
        const createChallengeOnChain = false; //await createChallenge(
        //   actionId,
        //   challengeTeam1_chainId,
        //   challengeTeamId,
        //   challengeAmount
        // );

        console.log("createChallengeOnChain", createChallengeOnChain);
        console.log("challengeFormData", challengeFormData);

        // create new challenge to database...
        if (!isContractLoading && createChallengeOnChain) {
          // await getChallengesDB.save(challengeFormData);
        } else if (!isContractLoading && !createChallengeOnChain) {
          await action.save({ actionStatus: false });
        }
        if (getChallengesDB.error) console.log(getChallengesDB.error.message);
      }

      // update challenge in database
      if (challenge && !createNewChallenge) {
        challengeFormData.id = challenge.id;
        await challenge.save(challengeFormData);
      }

      // reload page after saving
      if (
        (!getChallengesDB.isSaving && !isContractLoading && !contractMessage) ||
        (challenge && !challenge.get("isSaving"))
      ) {
        // router.push("/challenges");
      }
    } catch (error) {
      console.error(error);
    }
    // }
  };

  const handleSports = (sport: string, isChecked: boolean) => {
    if (isChecked) {
      setChallengeSports("");
    } else {
      setChallengeSports(sport);
    }
  };

  const handleSelectTeam = (teamChainId: string) => {
    // setChallengeTeam1(team);
    setChallengeTeam1_chainId(teamChainId);
  };

  const isFormValid = () => {
    if (!challengeTeam1 || !challengeAmount || !challengeSports) {
      alert("Please fill out required fields.");
      return false;
    }
    return true;
  };

  const fetchUserTeams = async () => {
    setIsLoading(true);
    const userTeams = await cloudFunction("getUserTeams", {});
    if (!userTeams.success) setError(error || "Error fetching user teams");
    return userTeams;
  };

  useEffect(() => {
    if (modalView) {
      fetchUserTeams()
        .then(setUserTeams)
        .then(() => setIsLoading(false))
        .catch(setError);
    }
  }, [modalView]);

  return (
    <Modal open={modalView} onClose={async () => toggleModal(false)}>
      <div className="flex flex-col border-2 border-green-100 p-4 items-center">
        <div>
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
            <div className="flex flex-row w-full">
              <div className="w-1/2 p-2">
                <span className="h-[60px] my-1 flex justify-end items-center">
                  Choose Team*:
                </span>
                <span className="h-[60px] my-1 flex justify-end items-center">
                  Amount*:
                </span>

                <span className="h-[60px] my-1 flex justify-end items-center">
                  Message:
                </span>

                <span className="h-[120px] my-1 flex justify-end items-center">
                  Sports*:
                </span>
              </div>
              <div className="w-1/2 p-2">
                <span className="h-[60px] my-1 flex justify-start items-center">
                  <select
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
                </span>
                <span className="h-[60px] my-1 flex justify-start items-center">
                  <input
                    required
                    value={challengeAmount}
                    className="m-2 px-2 py-1 rounded bg-gray-300"
                    onChange={(e) => setChallengeAmount(e.target.value)}
                    type="number"
                    min={0}
                  />
                </span>
                <span className="h-[60px] my-1 flex justify-start items-center">
                  <textarea
                    id="challengeMessage"
                    className="m-2 px-2 py-1 rounded bg-gray-300"
                    placeholder="Enter challenge description..."
                    rows={3}
                    value={challengeMessage}
                    onChange={(e) => setChallengeMessage(e.target.value)}
                  />
                </span>
                <span className="h-[120px] my-1 flex justify-start items-center flex-wrap">
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
                            {sport}
                          </button>
                        );
                      })}
                </span>
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
