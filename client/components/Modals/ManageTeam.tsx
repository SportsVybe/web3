import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useState } from "react";
import { useMoralis, useMoralisFile, useNewMoralisObject } from "react-moralis";
import { contractActions, sports } from "../../configs/constants";
import { useContract } from "../../context/ContractProvider";
import { useCustomMoralis } from "../../context/CustomMoralisProvider";
import { capitalizeWord } from "../../helper/formatter";
import Modal from "../Layout/Modal";
import { Toast } from "../Layout/Toast";

type Props = {
  user: any;
  team?: any;
  toggleModal: Dispatch<SetStateAction<boolean>>;
  modalView: boolean;
  createNewTeam?: boolean;
  teamObject?: any;
};

export const ManageTeam = ({
  user,
  team = false,
  toggleModal,
  modalView,
  createNewTeam = false,
  teamObject = null,
}: Props) => {
  const router = useRouter();
  const { Moralis } = useMoralis();
  const { saveFile } = useMoralisFile();
  const getTeamsDB = useNewMoralisObject("teams");
  const { createUserAction } = useCustomMoralis();
  const { createTeam, isContractLoading, contractMessage } = useContract();

  const [teamName, setTeamName] = useState(
    (team && team.get("teamName")) || ""
  );
  const [teamSportsPreferences, setTeamSportsPreferences] = useState(
    (team && team.get("teamSportsPreferences")) || []
  );
  const [isTeamActive, setIsTeamActive] = useState(
    (team && team.get("isTeamActive")) || false
  );
  const [teamDescription, setTeamDescription] = useState(
    (team && team.get("teamDescription")) || ""
  );

  const [file, setFile] = useState(null);
  const toggleClass = " transform translate-x-6 bg-green-300";

  const teamFormData = {
    id: team && team.id,
    teamName: teamName,
    teamSportsPreferences: teamSportsPreferences,
    teamOwner: (team && team.get("teamOwner")) || Moralis.User.current() || "",
    teamMembers: (team && team.get("teamMembers")) || [user.username] || [],
    teamAdmin: (team && team.get("teamAdmin")) || user.username || "",
    teamDescription: teamDescription,
    isTeamActive: isTeamActive,
    teamWins: (team && team.get("teamWins")) || 0,
    teamWinnings: (team && team.get("teamWinnings")) || 0,
    teamLosses: (team && team.get("teamLosses")) || 0,
    teamPOS: (team && team.get("teamPOS")) || 100,
    teamId: (team && team.get("teamId")) || "",
    teamPhoto: (team && team.get("teamPhoto")) || "",
    teamUsername: (team && team.get("teamUsername")) || "",
    teamChainId: (team && team.get("teamChainId")) || "",
    actionId: (team && team.get("actionId")) || "",
  };

  const handleSubmit = async (e: any) => {
    if (isFormValid()) {
      // create team username
      const teamUsername = teamName.split(" ").join("-").toLowerCase();

      try {
        if (createNewTeam) {
          teamFormData.teamUsername = teamUsername;

          // create team on chain
          const action = await createUserAction(contractActions.createTeam);
          const actionId = action.id;
          teamFormData.actionId = action;
          const createTeamOnChain = await createTeam(actionId);

          // create new team to database...
          if (!isContractLoading && createTeamOnChain) {
            await getTeamsDB.save(teamFormData);
          } else if (!createTeamOnChain && !isContractLoading) {
            await action.save({ actionStatus: false });
          }
          if (getTeamsDB.error) console.log(getTeamsDB.error.message);
        }

        // update team in database
        if (teamObject && !createNewTeam) {
          if (file) {
            const fileUpload = await saveFile(teamUsername, file);
            teamFormData.teamPhoto = fileUpload?._url;
          }
          teamFormData.id = teamObject.id;
          await teamObject.save(teamFormData);
        }

        // reload page after saving
        if (
          (!getTeamsDB.isSaving && !isContractLoading) ||
          (teamObject && !teamObject.isSaving)
        )
          router.reload();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSportsPreferences = (sport: string, isChecked: boolean) => {
    if (isChecked) {
      setTeamSportsPreferences(
        [...teamSportsPreferences].filter((eaSport) => eaSport != sport)
      );
    } else {
      setTeamSportsPreferences([sport, ...teamSportsPreferences]);
    }
  };

  const handleFileChange = (e: any) => {
    setFile(e.target.files[0]);
  };

  const isFormValid = () => {
    if (
      !teamName ||
      (!createNewTeam && (!teamDescription || !teamSportsPreferences.length))
    ) {
      alert("Please fill out required fields.");
      return false;
    }
    return true;
  };

  return (
    <Modal open={modalView} onClose={async () => toggleModal(false)}>
      <div className="flex flex-col border-2 border-green-100 p-4 items-center">
        <div className="p-3">
          {createNewTeam ? "Create Team" : "Manage Team"}
        </div>
        {isContractLoading ? (
          <span className="my-3 px-2 py-1 ">...Minting</span>
        ) : (
          <div className="flex flex-col w-full justify-center items-center">
            <div className="p-2 flex flex-col md:flex-row items-center">
              <span className="md:pr-1 w-[130px] md:text-right">
                Team Name*:
              </span>
              <input
                value={teamName}
                className="m-2 px-2 py-1 rounded bg-gray-300 outline-green-400"
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>
            {!createNewTeam && (
              <>
                <div className="p-2 flex flex-col md:flex-row items-center">
                  <span className="pr-1 w-[130px] md:text-right">
                    Description*:
                  </span>
                  <textarea
                    id="teamDescription"
                    className="m-2 px-2 py-1 rounded bg-gray-300 outline-green-400"
                    placeholder="Enter team description..."
                    rows={3}
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                  />
                </div>
                <div className="p-2 flex flex-col md:flex-row items-center">
                  <span className="md:pr-1 w-[160px] md:text-right">
                    Sports Preferences*:
                  </span>
                  <span className="h-[100px] my-1 flex justify-start items-center flex-wrap">
                    {sports.sort().map((sport, i) => {
                      const isChecked = teamSportsPreferences.includes(sport);
                      return (
                        <button
                          key={i}
                          className={`m-2 px-2 py-1 rounded text-sm  ${
                            isChecked ? "bg-green-100" : "bg-gray-300"
                          }`}
                          onClick={() =>
                            handleSportsPreferences(sport, isChecked)
                          }
                        >
                          {capitalizeWord(sport)}
                        </button>
                      );
                    })}
                  </span>
                </div>
                <div className="p-2 flex flex-col md:flex-row items-center">
                  <span className="pr-1 w-[130px] md:text-right">
                    Team Photo:
                  </span>
                  {/* {file && <Image src={file.preview} width="150" height="150" />} */}
                  <input
                    accept="image/x-png,image/gif,image/jpeg"
                    type="file"
                    onChange={(e) => handleFileChange(e)}
                    className="m-2 px-2 py-1 rounded bg-gray-300 outline-green-400"
                  />
                </div>

                <div className="p-2 flex flex-row w-[130px] ">
                  <span className="pr-1 text-right">
                    <label className="">
                      {isTeamActive ? "Active" : "Inactive"}
                    </label>
                    <span className="px-2 py-1">
                      {team && team.get("teamChainId") && (
                        <div
                          className={`md:w-14 md:h-7 w-12 h-6 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer`}
                          onClick={() => {
                            setIsTeamActive(!isTeamActive);
                          }}
                        >
                          <div
                            className={
                              "bg-white md:w-6 md:h-6 h-5 w-5 rounded-full shadow-md transform" +
                              (isTeamActive ? toggleClass : null)
                            }
                          ></div>
                        </div>
                      )}
                    </span>
                  </span>
                </div>
              </>
            )}
            <button
              disabled={isContractLoading}
              className="my-3 px-2 py-1 bg-green-300 rounded-full disabled:bg-slate-300"
              onClick={(e) => handleSubmit(e)}
            >
              {createNewTeam ? "Create Team" : "Update Team"}
            </button>
            {contractMessage && !isContractLoading && (
              <Toast
                open={contractMessage !== "" && contractMessage.message !== ""}
                type={contractMessage.status}
              >
                {contractMessage.message}
              </Toast>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
