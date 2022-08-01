import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useMoralis, useMoralisFile } from "react-moralis";
import { contractActions, sports } from "../../configs/constants";
import { useContract } from "../../context/ContractProvider";
import { useCustomMoralis } from "../../context/CustomMoralisProvider";
import Modal from "../Layout/Modal";
import { Toast } from "../Layout/Toast";

type Props = {
  user: any;
  toggleModal: Dispatch<SetStateAction<boolean>>;
  modalView: boolean;
  userObject: any;
  newProfile: boolean;
};

export const ManageProfile = ({
  user,
  toggleModal,
  modalView,
  userObject,

  newProfile = false,
}: Props) => {
  const router = useRouter();
  const { Moralis } = useMoralis();
  const { error, isUploading, saveFile } = useMoralisFile();
  const { createUserAction, fetchUser } = useCustomMoralis();
  const { createTeam, isContractLoading, contractMessage } = useContract();
  const [loading, setLoading] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState("");
  const [userUsername, setUserUsername] = useState("");
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [usernameChanged, setUsernameChanged] = useState(false);
  const [editUsername, setEditUsername] = useState(newProfile);
  const [userSportsPreferences, setUserSportsPreferences] = useState<string[]>(
    []
  );
  const [file, setFile] = useState<null | File>(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (isFormValid()) {
      let formData = {
        userAccount: Moralis.User.current(),
        userDisplayName: userDisplayName,
        username: userUsername,
        userSportsPreferences: userSportsPreferences,
        newUser: false, // activate user by default
        userPhoto: userObject.userPhoto || "",
        actionId: user.actionId || "",
      };

      try {
        if (userUsername !== user.username) {
          setUsernameChanged(true);
        }

        if (newProfile) {
          const newUserAction = await createUserAction(
            contractActions.createTeamForUser
          );
          formData.actionId = newUserAction;
          const actionId = newUserAction.id;

          // create user on chain to be challenged
          const createTeamOnChain = await createTeam(actionId);
          if (!createTeamOnChain) return;
        }
        if (file && !newProfile) {
          const fileUpload = await saveFile(user.username, file);
          formData.userPhoto = fileUpload?._url;
        }
        // update user in database
        const currentUser: any = Moralis.User.current();
        if (usernameChanged) {
          await currentUser.save({ username: userUsername });
        }
        await userObject.save(formData);
        if (!userObject.isSaving || !currentUser.isSaving) router.reload();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSportsPreferences = (sport: string, isChecked: boolean) => {
    if (isChecked) {
      setUserSportsPreferences(
        [...userSportsPreferences].filter((eaSport) => eaSport != sport)
      );
    } else {
      setUserSportsPreferences([sport, ...userSportsPreferences]);
    }
  };

  const handleFileChange = (e: any) => {
    setFile(e.target.files[0]);
  };

  const handleUsername = async (e: any) => {
    setUserUsername(e.target.value);
    if (user.username === userUsername) {
      setIsUsernameValid(true);
    } else {
      setIsUsernameValid(false);
    }
  };

  const searchUsername = async () => {
    if (editUsername || newProfile) {
      setLoading(true);
      try {
        const results: any = await fetchUser(userUsername, "username", false);
        if (results != null && results.success && results.user) {
          setIsUsernameValid(false);
          setLoading(false);
        } else {
          setLoading(false);
          setIsUsernameValid(true);
        }
      } catch (error) {
        console.error(error);
        setLoading(false);
        setIsUsernameValid(false);
      }
    }
  };

  const isFormValid = () => {
    if (newProfile) {
      if (!userUsername) {
        alert("Please fill out all fields.");
        return false;
      }
    } else if (!newProfile)
      if (
        !userUsername ||
        !userDisplayName ||
        userSportsPreferences.length < 1 ||
        !isUsernameValid
      ) {
        alert("Please fill out all fields.");
        return false;
      }
    return true;
  };

  useEffect(() => {
    if (user) {
      setUserDisplayName(user.userDisplayName || "");
      setUserUsername(user.username || "");
      setUserSportsPreferences(user.userSportsPreferences || []);
    }
  }, [user]);

  return (
    <Modal open={modalView} onClose={async () => toggleModal(false)}>
      <div className="flex flex-col border-2 border-green-100 p-4 items-center w-full">
        <div className="p-2">
          {user && newProfile ? (
            <span className="py-2 text-red-400">
              Profile Required to Earn SVT:
            </span>
          ) : (
            <div>User Profile</div>
          )}
          <span className="py-2"> {error && `Upload Error: ${error}`} </span>
        </div>
        <div className="flex flex-row w-full">
          <div className="w-full p-2">
            <div className="h-[60px] my-1 flex flex-row justify-center items-center">
              <span className="h-[60px] my-1 flex justify-end items-center">
                Username*:
              </span>
              <input
                value={userUsername}
                disabled={user.usernameLocked}
                className={`m-2 px-2 py-1 rounded disabled:bg-gray-700 disabled:text-stone-50  ${
                  isUsernameValid ? "bg-gray-300" : "bg-red-400"
                } outline-green-400`}
                onChange={(e) => handleUsername(e)}
              />
              {(editUsername || newProfile) && !user.usernameLocked ? (
                <>
                  <button
                    disabled={isUsernameValid}
                    className="mx-1"
                    onClick={() => searchUsername()}
                  >
                    Find
                  </button>
                  <button
                    disabled={
                      !isUsernameValid ||
                      user.username !== userUsername ||
                      userUsername.length === 0
                    }
                    className="mx-1"
                    onClick={() => setEditUsername(false)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  disabled={user.usernameLocked}
                  onClick={() => setEditUsername(true)}
                >
                  {user.usernameLocked ? 0 : 1} Edit Remaining
                </button>
              )}
            </div>
            {user && !newProfile && (
              <>
                <div className="h-[60px] my-1 flex flex-row justify-center items-center">
                  <span className="h-[60px] my-1 flex justify-end items-center">
                    Display Name:
                  </span>
                  <input
                    value={userDisplayName}
                    className="m-2 px-2 py-1 rounded bg-gray-300 outline-green-400"
                    onChange={(e) => setUserDisplayName(e.target.value)}
                  />
                </div>
                <div className="h-[100px] my-1 flex flex-row justify-center items-center">
                  <span className="w-[120pxß] h-[60px] my-1 flex justify-end items-center">
                    Sports Preferences:
                  </span>
                  <span className="w-[280px] h-[100px] my-1 flex flex-row justify-center items-center flex-wrap">
                    {sports.sort().map((sport, i) => {
                      const isChecked = userSportsPreferences.includes(sport);
                      return (
                        <button
                          key={i}
                          className={`m-1 px-2 py-1 rounded text-sm  ${
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
                </div>
                <div className="w-full h-[60px] my-1 flex flex-row justify-center items-center">
                  {/* {file && <Image src={file.preview} width="150" height="150" />} */}

                  <span className="h-[60px] my-1 flex justify-end items-center">
                    Picture:
                  </span>
                  <input
                    accept="image/x-png,image/gif,image/jpeg"
                    type="file"
                    onChange={(e) => handleFileChange(e)}
                    className="mx-3 px-2 py-1 rounded bg-gray-300"
                  />
                </div>
              </>
            )}
          </div>
        </div>
        {isContractLoading ? (
          <span className="my-3 px-2 py-1 ">...Minting</span>
        ) : (
          <>
            <button
              disabled={
                isUploading ||
                userObject.isSaving ||
                !userUsername ||
                !isUsernameValid
              }
              className="my-3 px-4 py-1 bg-green-300 rounded-full disabled:bg-gray-400 hover:bg-green-400"
              onClick={(e) => handleSubmit(e)}
            >
              {newProfile ? "Mint" : "Save"}
            </button>
            <button
              onClick={async () => {
                toggleModal(false);
                router.reload();
              }}
            >
              Cancel
            </button>
          </>
        )}
        {contractMessage && !isContractLoading && (
          <Toast open type={contractMessage.status}>
            {contractMessage.message}
          </Toast>
        )}
      </div>
    </Modal>
  );
};
