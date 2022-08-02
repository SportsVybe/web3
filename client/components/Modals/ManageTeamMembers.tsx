import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useMoralis, useNewMoralisObject } from "react-moralis";
import { contractActions } from "../../configs/constants";
import { useContract } from "../../context/ContractProvider";
import { useCustomMoralis } from "../../context/CustomMoralisProvider";
import Modal from "../Layout/Modal";
import { Toast } from "../Layout/Toast";
import { TeamMember } from "../Teams/TeamMembers/TeamMemberView";

type Props = {
  user: any;
  team?: any;
  toggleModal: Dispatch<SetStateAction<boolean>>;
  modalView: boolean;
  teamIsLoading: boolean;
  teamObject: any;
  members?: any[];
};

export const ManageTeamMembers = ({
  team = false,
  toggleModal,
  modalView,
  teamIsLoading = false,
  teamObject = {},
  members = [],
}: Props) => {
  const router = useRouter();
  const { Moralis } = useMoralis();
  const { createUserAction, getAllObjects, fetchUser } = useCustomMoralis();
  const { sendTeamMembershipRequest, isContractLoading, contractMessage } =
    useContract();

  const getDB = useNewMoralisObject("db_TeamMembershipRequests");
  const [username, setUsername] = useState("");
  const [address, setAddress] = useState("");
  const [userEthAddress, setUserEthAddress] = useState("");
  const [user, setUser] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  const sendRequestData = {
    sentUser: Moralis.User.current(),
    acceptUser: user,
    team: teamObject,
    sentActionId: {},
    acceptActionId: null,
    status: "pending",
    sentOnChain: false,
    acceptOnChain: false,
  };

  const handleSubmit = async (e: any) => {
    if (isFormValid()) {
      try {
        // send request on chain
        const action = await createUserAction(
          contractActions.sendTeamMembershipRequest
        );
        const actionId = action.id;
        sendRequestData.sentActionId = action;
        const createTeamMembershipRequestOnChain =
          await sendTeamMembershipRequest(
            actionId,
            team.teamChainId,
            userEthAddress
          );

        // create record database...
        if (!isContractLoading && createTeamMembershipRequestOnChain) {
          await getDB.save(sendRequestData);
          await teamObject.save({
            teamInvitesPending: teamObject.teamInvitesPending + 1,
          });
        } else if (!isContractLoading && !createTeamMembershipRequestOnChain) {
          await action.save({ actionStatus: false });
        }

        // reload page after saving
        if (
          !isContractLoading &&
          !getDB.isSaving &&
          createTeamMembershipRequestOnChain
        ) {
          router.reload();
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const isFormValid = () => {
    if (
      (!username && address.length <= 6) ||
      (!address && username.length < 3) ||
      !userEthAddress
    ) {
      alert("Please fill out required fields.");
      return false;
    }
    return true;
  };

  const getUser = async () => {
    setLoading(true);
    try {
      const results: any = await fetchUser(username, "username", true);
      if (results != null && results.success) {
        setUser(results.user);
        setUserEthAddress(results.ethAddress);
        setLoading(false);
      } else {
        resetTeamMember();
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const resetTeamMember = (clear: boolean = false) => {
    setUser([]);
    setLoading(false);
    if (clear) {
      setUsername("");
      setAddress("");
    }
  };

  useEffect(() => {
    console.log(user);
  }, [user]);

  return (
    <Modal open={modalView} onClose={async () => toggleModal(false)}>
      <div className="flex flex-col border-2 border-green-100 p-4 items-center">
        <div>Invite Player</div>

        {isContractLoading ? (
          <span className="my-3 px-2 py-1 ">...Minting</span>
        ) : (
          <>
            <div className="flex flex-col w-full items-center">
              <div className="h-[60px] my-1 flex flex-row justify-center items-center">
                <span className="h-[60px] my-1 flex justify-end items-center">
                  Username*:
                </span>
                <input
                  disabled={address.length > 0}
                  value={username}
                  className="m-2 px-2 py-1 rounded disabled:bg-gray-700 bg-gray-300 outline-green-400"
                  onChange={(e) => setUsername(e.target.value)}
                />
                <button
                  className="m-1"
                  disabled={user.length !== 0}
                  onClick={() => getUser()}
                >
                  Search
                </button>
                <button
                  className="m-1 my-3 px-2 py-1 bg-gray-300 rounded-full"
                  onClick={() => resetTeamMember(true)}
                >
                  Clear
                </button>
              </div>
              <span>OR</span>
              <div className="h-[60px] my-1 flex flex-row justify-center items-center">
                <span className="h-[60px] my-1 flex justify-end items-center">
                  Address*:
                </span>
                <input
                  value={address}
                  disabled={username.length > 0}
                  className="m-2 px-2 py-1 rounded disabled:bg-gray-700 bg-gray-300 outline-green-400"
                  onChange={(e) => setAddress(e.target.value)}
                />
                <button onClick={() => alert("Mobile Only")}>Scan</button>
                <button
                  className="m-1 my-3 px-2 py-1 bg-gray-300 rounded-full"
                  onClick={() => resetTeamMember(true)}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="flex flex-row justify-center ">
              <button
                disabled={isContractLoading || !user || user.length === 0}
                className="m-3 px-2 py-1 bg-green-300 rounded-full disabled:bg-slate-300"
                onClick={(e) => handleSubmit(e)}
              >
                Send Request
              </button>

              <button
                className="m-3 px-2 py-1 bg-gray-300 rounded-full"
                onClick={() => resetTeamMember(true)}
              >
                Reset
              </button>
            </div>
            <div>
              {loading
                ? "Searching....."
                : user
                ? user.length !== 0 && (
                    <>
                      <TeamMember
                        member={user.attributes}
                        isLoadingMembers={teamIsLoading}
                        team={team}
                        targetSelf={false}
                      />
                    </>
                  )
                : "No Members Found"}
            </div>
            {contractMessage && !isContractLoading && (
              <Toast open type={contractMessage.status}>
                {contractMessage.message}
              </Toast>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
