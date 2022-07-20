import { ethers } from "ethers";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useMoralisQuery, useNewMoralisObject } from "react-moralis";
import { contractActions } from "../../configs/constants";
import { useContract } from "../../context/ContractProvider";
import { useCustomMoralis } from "../../context/CustomMoralisProvider";
import AuthorizeButton from "../Buttons/AuthorizeButton";
import Modal from "../Layout/Modal";
import { Toast } from "../Layout/Toast";

type Props = {
  userTeamId?: string;
  challengeTeamId: string;
  team: any;
  user: any;
  challenge?: any | boolean;
  toggleModal: Dispatch<SetStateAction<boolean>>;
  modalView: boolean;
  createNewChallenge: boolean;
  challengeObject?: any | null;
};

export const ManageChallenge = ({
  userTeamId = "",
  challengeTeamId = "",
  team,
  user,
  challenge = false,
  toggleModal,
  modalView,
  createNewChallenge = false,
  challengeObject = null,
}: Props) => {
  const getChallengesDB = useNewMoralisObject("challenges");
  const { createUserAction } = useCustomMoralis();
  const { createChallenge, isContractLoading, contractMessage } = useContract();
  const router = useRouter();
  const [userTeams, setUserTeams] = useState([]);

  const [challengeSports, setChallengeSports] = useState(
    challenge.challengeSports || ""
  );
  const [challengeAmount, setChallengeAmount] = useState(
    challenge.challengeAmount || "0"
  );
  const [challengeMessage, setChallengeMessage] = useState(
    challenge.challengeMessage || ""
  );
  const [challengeTeam1, setChallengeTeam1] = useState(userTeamId || "");
  const [challengeTeam2, setChallengeTeam2] = useState(challengeTeamId || "");
  const [challengeTeam2Admin, setChallengeTeam2Admin] = useState(
    team.teamAdmin || ""
  );

  const userApprovedAmount =
    user &&
    user.attributes &&
    user.attributes.approvedSTVAmount &&
    ethers.utils.formatEther(user.attributes.approvedSTVAmount);

  const userHasApprovedSVT =
    user && user.attributes && user.attributes.hasApprovedSVT;

  const challengeFormData = {
    id: challenge.id || "",
    challengeTeam1: challengeTeam1,
    challengeTeam2: challengeTeam2,
    challengeAmount: challengeAmount,
    challengeMessage: challengeMessage,
    challengeSport: challengeSports,
    challengeTeam1Admin: user.get("username"),
    challengeTeam2Admin: challengeTeam2Admin,
    challengeChainId: challenge.challengeChainId || "",
    actionId: challenge.actionId || "",
  };

  const handleSubmit = async () => {
    console.log("challenge form data", challengeFormData);
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
            challengeTeam1,
            challengeTeam2,
            challengeAmount
          );

          console.log("createChallengeOnChain", createChallengeOnChain);

          // create new challenge to database...
          if (!isContractLoading && createChallengeOnChain)
            await getChallengesDB.save(challengeFormData);
          if (getChallengesDB.error) console.log(getChallengesDB.error.message);
        }

        // update challenge in database
        if (challengeObject && !createNewChallenge) {
          challengeFormData.id = challengeObject.id;
          await challengeObject.save(challengeFormData);
        }

        // reload page after saving
        if (
          (!getChallengesDB.isSaving &&
            !isContractLoading &&
            !contractMessage) ||
          (challengeObject && !challengeObject.isSaving)
        )
          router.push("/challenges");
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

  const isFormValid = () => {
    if (
      !challengeTeam1 ||
      !challengeTeam2 ||
      !challengeAmount ||
      !challengeSports
    ) {
      alert("Please fill out required fields.");
      return false;
    }
    return true;
  };

  const getTeamsByUsername = useMoralisQuery(
    "teams",
    (query) => query.equalTo("teamAdmin", user.get("username")),
    [],
    {
      autoFetch: true,
    }
  );

  useEffect(() => {
    const getTeams = getTeamsByUsername.fetch();
    getTeams.then((teams: any) => {
      setUserTeams(teams);
    });
  }, [user]);

  return (
    <Modal open={modalView} onClose={async () => toggleModal(false)}>
      <div className="flex flex-col border-2 border-green-100 p-4 items-center">
        <div>
          {" "}
          {createNewChallenge
            ? `Create Challenge Against ${team.teamName}`
            : `Manage Challenge`}
        </div>

        {/* {challengeError && <span className="py-2">Challenge Update Error:{challengeError}</span>} */}
        {/* {error && <span className="py-2">Upload Error: {error}</span>} */}
        {isContractLoading && !contractMessage ? (
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
                    onChange={(e) => setChallengeTeam1(e.target.value)}
                  >
                    <option value="">Select Team</option>
                    {userTeams &&
                      userTeams.map((team: any, i: number) => (
                        <option
                          key={i}
                          value={team.attributes.teamChainId}
                          defaultChecked={
                            challengeTeam1 == team.attributes.teamChainId
                          }
                        >
                          {team.attributes.teamName}
                        </option>
                      ))}
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
                  {team.teamSportsPreferences &&
                    team.teamSportsPreferences
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

            <AuthorizeButton
              amount={challengeAmount}
              userHasApprovedSVT={userHasApprovedSVT}
              userApprovedAmount={userApprovedAmount}
            />

            <button
              disabled={
                isContractLoading ||
                Number(userApprovedAmount) < challengeAmount ||
                !userApprovedAmount
              }
              className="my-3 px-2 py-1 bg-green-300 rounded-full disabled:bg-slate-300"
              onClick={() => handleSubmit()}
            >
              {createNewChallenge ? "Create Challenge" : "Update Challenge"}
            </button>
            {contractMessage && !isContractLoading && (
              <Toast type={contractMessage.status}>
                {contractMessage.message}
              </Toast>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
