import { useState } from "react";
import { useWallet } from "../../context/WalletProvider";
import { Photo } from "../Layout/Photo";
import { ManageProfile } from "../Modals/ManageProfile";
import { ManageTeam } from "../Modals/ManageTeam";
import { TeamCard } from "../Teams/TeamCard";

type Props = {
  userData: any;
  teams: any;
  isCurrentUser: boolean;
  isLoading: boolean;
  wallet: any;
  userObject: any;
};

export default function Profile({
  userData,
  teams,
  isCurrentUser = false,
  isLoading,
  wallet,
  userObject,
}: Props) {
  const { user, isAuthenticated, connectWallet, isAuthenticating } =
    useWallet();
  const [editProfileModal, toggleEditProfileModal] = useState(false);
  const [manageTeamModal, toggleManageTeamModal] = useState(false);

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="py-4">
        <h1>PLAYER PROFILE:</h1>
      </div>
      <div className="flex flex-col w-[480px] lg:w-[600px]">
        <div className="flex flex-col w-full justify-center items-center border-gray-200 p-2 rounded-lg shadow-lg bg-white hover:shadow-2xl transition ease-in-out delay-100  hover:ease-in-outp-5">
          <div className="flex flex-row my-4 w-full justify-center items-center">
            <div className="flex flex-col w-1/2 items-center justify-center">
              <Photo
                isLoading={isLoading}
                src={userData.userPhoto}
                alt={userData.userDisplayName}
                size="lg"
                type="profile"
              />
            </div>
            <div className="flex flex-col w-1/2">
              <span>
                Username: {userData.username ? userData.username : "--"}
              </span>
              <span>
                Display Name:{" "}
                {userData.userDisplayName ? userData.userDisplayName : "--"}
              </span>
              <span>
                Member Since
                {userData.createdAt
                  ? userData.createdAt.toLocaleDateString("en-US", {
                      year: "numeric",
                    })
                  : "--"}
              </span>
            </div>
          </div>
          {wallet && <p> Wallet: {wallet}</p>}
        </div>
        <div className="w-full">
          {wallet ? (
            <button
              onClick={() => toggleEditProfileModal(true)}
              className="px-4 py-3 my-4 w-full bg-green-200 rounded-full hover:bg-green-400"
            >
              {userData.newUser ? "Complete Profile" : "Edit Profile"}
            </button>
          ) : (
            <>
              {isAuthenticated && (
                <button
                  onClick={() => alert("Challenge")}
                  className="px-4 py-3 my-4  w-full bg-green-200 rounded-full hover:bg-green-400 "
                >
                  Challenge Player
                </button>
              )}
              {!isAuthenticated && (
                <button
                  disabled={isAuthenticating}
                  className="rounded-full bg-green-200 px-4 py-3 my-4  w-full disabled:bg-gray-400 hover:bg-green-400 "
                  onClick={() => connectWallet(false)}
                >
                  Connect Wallet to Challenge
                </button>
              )}
            </>
          )}
        </div>
        <div className="flex flex-row my-4 justify-center items-start border-2 border-gray-200 rounded-lg shadow-lg bg-white hover:shadow-2xl transition ease-in-out delay-100  hover:ease-in-out p-2">
          <div className="flex flex-col w-1/2 items-center p-2">
            <div className="flex flex-col justify-center items-center">
              <span className="p-2 font-bold">Record:</span>
              <span>
                {userData.userWins} Wins - {userData.userLosses} Losses
              </span>
            </div>
            <div className="flex flex-col justify-center items-center">
              <span className="p-2 font-bold">Winnings:</span>
              <span>{userData.userWinnings} VYBES</span>
            </div>
          </div>
          <div className="flex flex-col w-1/2 items-center p-2">
            <div className="flex flex-col justify-center items-center">
              <span className="p-2 font-bold">Sportsmanship:</span>
              <span>{userData.userPOS ? `${userData.userPOS}% ` : "100%"}</span>
            </div>
            <div className="flex flex-col justify-center items-center">
              <span className="p-2 font-bold">Sport Preferences:</span>
              <ul>
                {userData.userSportsPreferences &&
                  userData.userSportsPreferences.map(
                    (sport: string, i: number) => {
                      return <li key={i}>{sport.toUpperCase()}</li>;
                    }
                  )}
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-col my-4 w-full justify-around items-center  p-2">
          <div className="flex flex-row w-full justify-center py-3 items-center">
            <h1>Team(s) </h1>
            {isAuthenticated && isCurrentUser && userData.createTeamsAvailable && (
              <button
                className="px-2 py-1 w-[120px] mx-4 bg-green-200 rounded-full hover:bg-green-400"
                onClick={() => toggleManageTeamModal(!manageTeamModal)}
              >
                Create Team
              </button>
            )}
          </div>
          <div className="w-full">
            {teams && !isLoading ? (
              teams.length > 0 &&
              teams.map((team: any, i: number) => {
                return (
                  <TeamCard team={team.attributes} teamObject={team} key={i} />
                );
              })
            ) : (
              <h1>No Teams</h1>
            )}
          </div>
        </div>
      </div>

      <ManageProfile
        user={userData}
        toggleModal={toggleEditProfileModal}
        modalView={editProfileModal}
        userObject={userObject}
        newProfile={userData.newUser}
      />

      <ManageTeam
        user={userData}
        toggleModal={toggleManageTeamModal}
        modalView={manageTeamModal}
        createNewTeam={true}
      />
    </div>
  );
}
