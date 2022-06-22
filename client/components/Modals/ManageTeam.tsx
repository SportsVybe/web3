import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useState } from "react";
import { useMoralisFile, useNewMoralisObject } from "react-moralis";
import { sports } from "../../configs/constants";
import { useContract } from "../../context/ContractProvider";
import Modal from "../Layout/Modal";
import { Toast } from "../Layout/Toast";

type Props = {
  user: any;
  team: any;
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
  const getTeamsDB = useNewMoralisObject("teams");
  const { error, isUploading, saveFile } = useMoralisFile();
  const { createTeam, isContractLoading, contractMessage } = useContract();
  const router = useRouter();

  const [teamName, setTeamName] = useState(team.teamName || "");
  const [teamSportsPreferences, setTeamSportsPreferences] = useState(
    team.teamSportsPreferences || []
  );
  const [isTeamActive, setIsTeamActive] = useState(team.isTeamActive || false);
  const [teamDescription, setTeamDescription] = useState(
    team.teamDescription || ""
  );

  const [file, setFile] = useState(null);
  const toggleClass = " transform translate-x-6 bg-green-300";

  const teamFormData = {
    id: team.id,
    teamName: teamName,
    teamSportsPreferences: teamSportsPreferences,
    teamAdmin: team.teamAdmin || user.username || "",
    teamMembers: team.teamMembers || [user.username] || [],
    teamDescription: teamDescription,
    isTeamActive: isTeamActive,
    teamWins: team.teamWins || 0,
    teamWinnings: team.teamWinnings || 0,
    teamLosses: team.teamLosses || 0,
    teamPOS: team.teamPOS || 100,
    teamId: team.teamId || "",
    teamPhoto: team.teamPhoto || "",
    teamUsername: team.teamUsername || "",
    teamChainId: team.teamChainId || "",
  };

  const handleSubmit = async (e: any) => {
    // create team username
    const teamUsername = teamName.split(" ").join("-").toLowerCase();

    try {
      if (file) {
        const fileUpload = await saveFile(teamUsername, file);
        teamFormData.teamPhoto = fileUpload?._url;
      }

      if (createNewTeam) {
        teamFormData.teamUsername = teamUsername;
        // create team on chain
        const createTeamOnChain = await createTeam();
        console.log("createTeamOnChain", createTeamOnChain);

        // update teamId from chain
        teamFormData.teamChainId = createTeamOnChain;

        // create new team to database...
        if (!isContractLoading) await getTeamsDB.save(teamFormData);
        if (getTeamsDB.error) console.log(getTeamsDB.error.message);
      }

      // update team in database
      if (teamObject && !createNewTeam) {
        teamFormData.id = teamObject.id;
        await teamObject.save(teamFormData);
      }

      // reload page after saving
      if (
        (!getTeamsDB.isSaving && !isContractLoading && !contractMessage) ||
        !teamObject.isSaving
      )
        router.reload();
    } catch (error) {
      console.error(error);
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

  return (
    <Modal open={modalView} onClose={async () => toggleModal(false)}>
      <div className="flex flex-col border-2 border-green-100 p-4 items-center">
        <div> {createNewTeam ? "Create Team" : "Manage Team"}</div>

        {/* {teamError && <span className="py-2">Team Update Error:{teamError}</span>} */}
        {/* {error && <span className="py-2">Upload Error: {error}</span>} */}
        {isContractLoading && !contractMessage ? (
          <span className="my-3 px-2 py-1 ">...Minting</span>
        ) : (
          <>
            <div className="flex flex-row w-full">
              <div className="w-1/2 p-2">
                <span className="h-[60px] my-1 flex justify-end items-center">
                  Team Name:
                </span>

                <span className="h-[60px] my-1 flex justify-end items-center">
                  Description:
                </span>

                <span className="h-[120px] my-1 flex justify-end items-center">
                  Sports Preferences:
                </span>

                <span className="h-[60px] my-1 flex justify-end items-center">
                  Team Photo:
                </span>
              </div>
              <div className="w-1/2 p-2">
                <span className="h-[60px] my-1 flex justify-start items-center">
                  <input
                    value={teamName}
                    className="m-2 px-2 py-1 rounded bg-gray-300 outline-green-400"
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </span>
                <span className="h-[60px] my-1 flex justify-start items-center">
                  <textarea
                    id="teamDescription"
                    className="m-2 px-2 py-1 rounded bg-gray-300 outline-green-400"
                    placeholder="Enter team description..."
                    rows={3}
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                  />
                </span>
                <span className="h-[120px] my-1 flex justify-start items-center flex-wrap">
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
                        {sport}
                      </button>
                    );
                  })}
                </span>
                <span className="h-[60px] my-1 flex justify-start items-center">
                  {/* {file && <Image src={file.preview} width="150" height="150" />} */}
                  <input
                    accept="image/x-png,image/gif,image/jpeg"
                    type="file"
                    onChange={(e) => handleFileChange(e)}
                    className="m-2 px-2 py-1 rounded bg-gray-300 outline-green-400"
                  />
                </span>
              </div>
            </div>

            <div className="p-2">
              <div className="flex flex-row justify-center">
                <label className="mx-3">
                  {isTeamActive ? "Active" : "Inactive"}
                </label>
                <div
                  className="md:w-14 md:h-7 w-12 h-6 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer"
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
              </div>
            </div>

            <button
              disabled={isContractLoading}
              className="my-3 px-2 py-1 bg-green-300 rounded-full disabled:bg-slate-300"
              onClick={(e) => handleSubmit(e)}
            >
              {createNewTeam ? "Create Team" : "Update Team"}
            </button>
            {contractMessage && !isContractLoading && (
              <Toast type={contractMessage.statusColor}>
                {contractMessage.message}
              </Toast>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
