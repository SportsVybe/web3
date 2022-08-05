import { useRouter } from "next/router";
import { contractActions } from "../../../configs/constants";
import { useContract } from "../../../context/ContractProvider";
import { useCustomMoralis } from "../../../context/CustomMoralisProvider";
import { Photo } from "../../Layout/Photo";
import { Toast } from "../../Layout/Toast";
import { Invite } from "./InvitesController";

type Props = {
  invite: Invite;
  isSent?: boolean;
  isAccepted?: boolean;
  isPending?: boolean;
};

export const InviteCard = ({
  invite,
  isAccepted,
  isPending,
  isSent,
}: Props) => {
  const router = useRouter();
  const team = invite.get("team");
  const sentUser = invite.get("sentUser");
  const acceptUser = invite.get("acceptUser");

  const { acceptTeamMembershipRequest, isContractLoading, contractMessage } =
    useContract();
  const { createUserAction } = useCustomMoralis();

  const photo = isSent
    ? acceptUser && acceptUser.get("userPhoto")
    : team && team.get("teamPhoto");
  const photoType = isSent ? "profile" : "team";
  const name = isSent
    ? acceptUser && acceptUser.get("username")
    : team && team.get("teamName");
  const POS = isSent
    ? acceptUser && acceptUser.get("userPOS")
    : team && team.get("teamPOS");
  const wins = isSent
    ? acceptUser && acceptUser.get("userWins")
    : team && team.get("teamWins");
  const losses = isSent
    ? acceptUser && acceptUser.get("userLosses")
    : team && team.get("teamLosses");
  const sportsPreferences = isSent
    ? acceptUser && acceptUser.get("userSportsPreferences")
    : team && team.get("teamSportsPreferences");

  const handleSubmit = async (e: any) => {
    const acceptRequestData = {
      acceptActionId: {},
    };
    try {
      // accept request on chain
      const action = await createUserAction(
        contractActions.acceptTeamMembershipRequest
      );
      const actionId = action.id;
      acceptRequestData.acceptActionId = action;
      const acceptTeamMembershipRequestOnChain =
        await acceptTeamMembershipRequest(actionId, team.get("teamChainId"));

      // create record database...
      if (!isContractLoading && acceptTeamMembershipRequestOnChain) {
        await invite.save(acceptRequestData);
        await team.save({
          status: "minting",
          teamMembers: [...team.get("teamMembers"), acceptUser.get("username")],
        });
      } else if (!isContractLoading && !acceptTeamMembershipRequestOnChain) {
        await action.save({ actionStatus: false });
      }

      // reload page after saving
      if (
        !isContractLoading &&
        !invite.isSaving &&
        !team.isSaving &&
        acceptTeamMembershipRequestOnChain
      ) {
        router.reload();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col m-4 w-full md:w-96 md:ml-0 justify-center items-start border-2 border-gray-200 p-2 rounded-lg shadow-lg bg-white hover:shadow-2xl transition ease-in-out delay-100  hover:ease-in-out">
      <div className="flex flex-row w-full">
        <div className="flex flex-col w-1/2 items-center justify-center p-2">
          <Photo
            src={photo}
            alt={name}
            size="sm"
            type={photoType}
            isLoading={false}
          />
          <span>{team.get("teamName")}</span>
          <span>{`${POS}%`} POS</span>
        </div>
        <div className="flex flex-col w-1/2 items-center p-2">
          <div className="flex flex-col justify-center items-center">
            <span className="p-2 font-bold">Record:</span>
            <span>
              {wins} Wins - {losses} Losses
            </span>
            <span className="p-2 font-bold">Sport Preferences:</span>
            <ul>
              {sportsPreferences &&
                sportsPreferences.map((sport: string, i: number) => {
                  return <li key={i}>{sport.toUpperCase()}</li>;
                })}
            </ul>
          </div>
        </div>
      </div>
      <div className="flex flex-row w-full items-center justify-around p-2">
        {isPending && invite.get("status") !== "minting" ? (
          <>
            <button
              disabled={isContractLoading}
              className="px-2 py-1 my-2 bg-green-200 rounded-full hover:bg-green-400 "
              onClick={(e) => handleSubmit(e)}
            >
              Accept
            </button>
            <button
              className="px-2 py-1 my-2 bg-red-200 rounded-full hover:bg-red-400 "
              onClick={() => alert("Reject Invite")}
            >
              Reject
            </button>
          </>
        ) : (
          invite.get("status") === "minting" && (
            <span className="p-2 font-bold">Minting...</span>
          )
        )}
        {isAccepted ||
          (isSent && (
            <span>
              Status:
              <span className="px-2">{invite.get("status").toUpperCase()}</span>
            </span>
          ))}
        <a
          href={`/teams/${team.id}`}
          className="px-2 py-1 my-2 text-white bg-blue-600 rounded-full hover:bg-blue-800 transition ease-in-out delay-100  hover:ease-in-out"
        >
          View Team
        </a>
      </div>
      {contractMessage && !isContractLoading && (
        <Toast open type={contractMessage.status}>
          {contractMessage.message}
        </Toast>
      )}
    </div>
  );
};
