import { useState } from "react";
import { useWallet } from "../../context/WalletProvider";
import { Photo } from "../Layout/Photo";
import { ManageChallenge } from "../Modals/ManageChallenge";
import { ManageTeam } from "../Modals/ManageTeam";

type Props = {
  team: any;
  teamObject: any | null;
};

export const TeamCard = ({ team, teamObject = null }: Props) => {
  const { user } = useWallet();
  const [manageTeamModal, toggleManageTeamModal] = useState(false);
  const [manageChallengeModal, toggleManageChallengeModal] = useState(false);
  let isTeamMember = false;
  let isAdmin = false;

  if (user) {
    const { username } = user.attributes ? user.attributes : "";
    isTeamMember =
      (user && team.teamMembers.find((member: any) => member === username)) ||
      false;
    isAdmin = team.teamAdmin === username || false;
  }

  return (
    <div className="flex flex-col my-4 md:w-full w-96 ml-16 md:ml-0 justify-center items-start border-2 border-gray-200 p-2 rounded-lg shadow-lg bg-white hover:shadow-2xl transition ease-in-out delay-100  hover:ease-in-out">
      <div className="flex flex-row w-full">
        <div className="flex flex-col w-1/2 items-center justify-center p-2">
          <Photo
            src={team.teamPhoto}
            alt={team.teamDisplayName}
            size="sm"
            type="team"
            isLoading={false}
          />
          <span>{team.teamName}</span>
          <span>{team.teamPOS ? `${team.teamPOS}%` : "100%"} POS</span>
        </div>
        <div className="flex flex-col w-1/2 items-center p-2">
          <div className="flex flex-col justify-center items-center">
            <span className="p-2 font-bold">Record:</span>
            <span>
              {team.teamWins} Wins - {team.teamLosses} Losses
            </span>
            <span className="p-2 font-bold">Sport Preferences:</span>
            <ul>
              {team.teamSportsPreferences &&
                team.teamSportsPreferences.map((sport: string, i: number) => {
                  return <li key={i}>{sport.toUpperCase()}</li>;
                })}
            </ul>
          </div>
        </div>
      </div>
      <div className="flex flex-row w-full items-center justify-around p-2">
        {user && !isTeamMember && (
          <button
            className="px-2 py-1 my-2 bg-green-200 rounded-full hover:bg-green-400 "
            onClick={() => toggleManageChallengeModal(!manageChallengeModal)}
          >
            Challenge Team
          </button>
        )}
        {user && isTeamMember && !isAdmin && (
          <button
            className="px-2 py-1 my-2 bg-red-200 rounded-full"
            onClick={() => alert("Leave Team")}
          >
            Leave Team
          </button>
        )}
        {user && isAdmin && (
          <button
            className="px-2 py-1 my-2 bg-yellow-200 rounded-full"
            onClick={() => toggleManageTeamModal(!manageTeamModal)}
          >
            Manage Team
          </button>
        )}
        <a
          href={`/teams/${teamObject.id}`}
          className="px-2 py-1 my-2 text-white bg-blue-600 rounded-full hover:bg-blue-800 transition ease-in-out delay-100  hover:ease-in-out"
        >
          View Team
        </a>
      </div>
      {user && isAdmin && (
        <ManageTeam
          user={user}
          team={team}
          teamObject={teamObject}
          toggleModal={toggleManageTeamModal}
          modalView={manageTeamModal}
        />
      )}
      {user && !isTeamMember && (
        <ManageChallenge
          user={user}
          team={team}
          challengeTeamId={team.teamChainId}
          toggleModal={toggleManageChallengeModal}
          modalView={manageChallengeModal}
          createNewChallenge={true}
        />
      )}
    </div>
  );
};
