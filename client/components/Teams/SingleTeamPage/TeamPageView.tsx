import { useState } from "react";
import { Team } from "../../../configs/types";
import { useWallet } from "../../../context/WalletProvider";
import { capitalizeWord } from "../../../helper/formatter";
import { Photo } from "../../Layout/Photo";
import { ManageChallenge } from "../../Modals/ManageChallenge";
import { ManageTeam } from "../../Modals/ManageTeam";
import { ManageTeamMembers } from "../../Modals/ManageTeamMembers";
import { TeamMembersController } from "../TeamMembers/TeamMembersController";

type Props = {
  team: Team;
  teamIsLoading: boolean;
};

export default function TeamPage({ team, teamIsLoading }: Props) {
  console.log("team", team);
  const { user, isAuthenticated, isAuthenticating, connectWallet } =
    useWallet();
  const [manageChallengeModal, toggleManageChallengeModal] = useState(false);
  const [manageTeamModal, toggleManageTeamModal] = useState(false);
  const [manageTeamMembersModal, toggleManageTeamMembersModal] =
    useState(false);

  let isTeamMember = false;
  let isAdmin = false;

  if (user && team && !teamIsLoading) {
    const { username } = user.attributes ? user.attributes : "";
    isTeamMember =
      (team &&
        team.get("teamMembers") &&
        team
          .get("teamMembers")
          .find((member: string) => member === username)) ||
      false;
    isAdmin = team.get("teamAdmin") === username || false;
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="py-4">
        <h1>Team Profiles</h1>
      </div>

      <div className="flex flex-col w-full lg:w-[650px]">
        <div className="flex my-4 md:w-full text-white w-96 ml-16 md:ml-0 justify-center card items-start p-2 rounded-lg shadow-lg bg-black transition ease-in-out delay-100  hover:ease-in-out p-2">
          <div className="flex flex-row my-4 w-full justify-center items-center">
            <div className="flex flex-col w-1/2 items-center justify-center">
              <Photo
                src={team.get("teamPhoto")}
                alt={team.get("teamName")}
                size="lg"
                type="team"
                isLoading={teamIsLoading}
              />
            </div>
            <div className="flex flex-col w-1/2">
              <span>
                Team name: {team.get("teamName") ? team.get("teamName") : "--"}
              </span>
              <span>
                Member Since:{" "}
                {team.get("createdAt")
                  ? team.get("createdAt").toLocaleDateString("en-US", {
                      year: "numeric",
                    })
                  : "--"}
              </span>
              <span className=" break-words">
                Description: {team.get("teamDescription")}
              </span>
            </div>
          </div>
        </div>
        <div className="w-96 md:w-full flex md:self-center items-center ml-16 md:ml-0 justify-center">
          {user && !isTeamMember && (
            <button
              onClick={() => toggleManageChallengeModal(!manageChallengeModal)}
              className="px-4 py-3 my-4 w-96 md:w-full bg-green-200 rounded-full text-black hover:bg-green-400"
            >
              Challenge Team
            </button>
          )}
          {user && isTeamMember && !isAdmin && (
            <button
              className="px-4 py-3 my-4 w-96 md:w-full bg-red-200 rounded-full text-black hover:bg-red-400"
              onClick={() => alert("Leave")}
            >
              Leave Team
            </button>
          )}
          {user && isTeamMember && isAdmin && (
            <button
              className="px-4 py-3 my-4 w-96 md:w-full bg-yellow-200 rounded-full text-black hover:bg-yellow-400"
              onClick={() => toggleManageTeamModal(!manageTeamModal)}
            >
              Manage Team
            </button>
          )}
          {!user && (
            <button
              disabled={isAuthenticating}
              className="rounded-full bg-green-200 px-4 py-3 text-black my-4 w-96 md:w-full disabled:bg-gray-400 hover:bg-green-400 "
              onClick={() => connectWallet(false)}
            >
              Connect Wallet to Challenge
            </button>
          )}
        </div>
        <div className="flex my-4 md:w-full text-white w-96 ml-16 md:ml-0 justify-center card items-start p-2 rounded-lg shadow-lg bg-black transition ease-in-out delay-100  hover:ease-in-out p-2">
          <div className="flex flex-col w-1/2 items-center p-2">
            <div className="flex flex-col justify-center items-center">
              <span className="p-2 font-bold">Record:</span>
              <span>
                {team.get("teamWins")} Wins - {team.get("teamLosses")} Losses
              </span>
            </div>
            <div className="flex flex-col justify-center items-center">
              <span className="p-2 font-bold">Winnings:</span>
              <span>{team.get("teamWinnings")} VYBES</span>
            </div>
          </div>
          <div className="flex flex-col w-1/2 items-center p-2">
            <div className="flex flex-col justify-center items-center">
              <span className="p-2 font-bold">Sportsmanship:</span>
              <span>
                {team.get("teamPOS") ? `${team.get("teamPOS")}% ` : "100%"}
              </span>
            </div>
            <div className="flex flex-col justify-center items-center">
              <span className="p-2 font-bold">Sport Preferences:</span>
              <ul>
                {team.get("teamSportsPreferences") &&
                  team
                    .get("teamSportsPreferences")
                    .map((sport: string, i: number) => {
                      return <li key={i}>{capitalizeWord(sport)}</li>;
                    })}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex my-4 md:w-full text-white w-96 ml-16 md:ml-0 justify-center card items-start p-2 rounded-lg shadow-lg bg-black transition ease-in-out delay-100  hover:ease-in-out p-2">
          <div className="flex flex-col w-full justify-center py-3 items-center">
            <div className="flex flex-row w-full justify-center py-3 items-center">
              <h1>Member(s) </h1>
              {isAuthenticated && isAdmin && (
                <button
                  className="px-2 py-1 w-[240px] mx-4 bg-green-200 text-black rounded-full hover:bg-green-400"
                  onClick={() =>
                    toggleManageTeamMembersModal(!manageTeamMembersModal)
                  }
                >
                  Invite Players
                </button>
              )}
            </div>
            {!teamIsLoading && (
              <TeamMembersController
                members={team.get("teamMembers")}
                team={team}
                teamIsLoading={teamIsLoading}
              />
            )}
          </div>
        </div>
      </div>

      {user && !isTeamMember && !teamIsLoading && (
        <ManageChallenge
          user={user}
          challengeTeam={team}
          challengeTeamId={team.get("teamChainId")}
          toggleModal={toggleManageChallengeModal}
          modalView={manageChallengeModal}
          createNewChallenge={true}
        />
      )}
      {user && isAdmin && !teamIsLoading && (
        <>
          <ManageTeam
            user={user}
            team={team}
            teamObject={team}
            toggleModal={toggleManageTeamModal}
            modalView={manageTeamModal}
          />
          <ManageTeamMembers
            user={user}
            team={team}
            teamObject={team}
            teamIsLoading={teamIsLoading}
            members={team.get("teamMembers")}
            toggleModal={toggleManageTeamMembersModal}
            modalView={manageTeamMembersModal}
          />
        </>
      )}
    </div>
  );
}
