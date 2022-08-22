import Link from "next/link";
import { useState } from "react";
import { Team } from "../../configs/types";
import { useWallet } from "../../context/WalletProvider";
import { capitalizeWord } from "../../helper/formatter";
import { Photo } from "../Layout/Photo";
import { ManageProfile } from "../Modals/ManageProfile";
import { ManageTeam } from "../Modals/ManageTeam";
import { TeamCard } from "../Teams/TeamCard";

type Props = {
  userData: any;
  teams: Team[];
  isCurrentUser: boolean;
  isLoading: boolean;
  wallet: any;
  userObject: any;
  userCounts?: { rewards?: number; invites?: number; challenges?: number };
};

export default function Profile({
  userData,
  teams,
  isCurrentUser = false,
  isLoading,
  wallet,
  userObject,
  userCounts,
}: Props) {
  const {
    user,
    isAuthenticated,
    connectWallet,
    isAuthenticating,
    userTokenBalance,
  } = useWallet();
  const [editProfileModal, toggleEditProfileModal] = useState(false);
  const [manageTeamModal, toggleManageTeamModal] = useState(false);

  return (
    <div
      className="flex flex-col justify-center items-center text-white "
      id="overflow"
    >
      <div className="py-4">
        <h1 className="text-bold text-xl ">Player Profile:</h1>
      </div>
      <div className="flex flex-col w-full lg:w-[650px]">
        <div className="flex flex-col my-4 md:w-full text-white ml-16 w-96 md:ml-0 justify-center card items-start p-2 rounded-lg shadow-lg bg-black transition ease-in-out delay-100  hover:ease-in-out">
          <div className="flex flex-row my-4 w-full justify-center items-center">
            <div className="flex flex-col w-1/2 items-center justify-center ml-2">
              <Photo
                isLoading={isLoading}
                src={userData.userPhoto}
                alt={userData.userDisplayName}
                size="lg"
                type="profile"
              />
            </div>
            <div className="flex flex-col w-1/2 ml-4 md:ml-0">
              <span className="py-3">
                Username: {userData.username ? userData.username : "--"}
              </span>
              <span className="py-3">
                Display Name:{" "}
                {userData.userDisplayName ? userData.userDisplayName : "--"}
              </span>
              <span className="py-3">
                Member Since:{" "}
                {userData.createdAt
                  ? userData.createdAt.toLocaleDateString("en-US", {
                      year: "numeric",
                    })
                  : "--"}
              </span>
            </div>
          </div>
          <div className="md:ml-14">
            {wallet && (
              <p className="py-3 font-bold overflow-ellipsis  md:mt-5 mt-0">
                {" "}
                Wallet: {wallet}
              </p>
            )}
          </div>
        </div>
        <div className="w-96 flex md:w-full md:self-center items-center ml-16 md:ml-0 justify-center">
          {wallet ? (
            <button
              onClick={() => toggleEditProfileModal(true)}
              className="px-4 py-3 my-4 w-96 md:w-full rounded-full text-black bg-green-400 hover:bg-green-700 w-72"
            >
              {userData.newUser ? "Complete Profile" : "Edit Profile"}
            </button>
          ) : (
            <>
              {isAuthenticated && (
                <button
                  onClick={() => alert("Challenge Player Coming Soon")}
                  className="px-4 py-3 my-4 w-96 md:w-full rounded-full text-black bg-green-500 hover:bg-green-700"
                >
                  Challenge Player
                </button>
              )}
              {!isAuthenticated && (
                <button
                  disabled={isAuthenticating}
                  className="rounded-full px-4 py-3 my-4 w-96 md:w-full disabled:bg-gray-400 bg-green-500 hover:bg-green-700"
                  onClick={() => connectWallet(false)}
                >
                  Connect Wallet to Challenge
                </button>
              )}
            </>
          )}
        </div>
        {isCurrentUser && (
          <div className="flex my-4 md:w-full text-white w-96 ml-16 md:ml-0 justify-center card items-start p-2 rounded-lg shadow-lg bg-black transition ease-in-out delay-100  hover:ease-in-out p-2">
            <div className="flex flex-col w-1/4 items-center p-2">
              <div className="flex flex-col justify-center items-center">
                <span className="p-2 font-bold">Balance:</span>
                <span>{userTokenBalance} VYBES</span>
              </div>
            </div>
            <div className="flex flex-row w-3/4 items-center justify-around p-2">
              <Link href="/rewards" className=" cursor-pointer ">
                <div className="flex flex-col justify-center items-center">
                  <span className="p-2 font-bold">Rewards:</span>
                  <span>{userCounts?.rewards || 0}</span>
                </div>
              </Link>
              <Link href="/challenges" className=" cursor-pointer ">
                <div className="flex flex-col justify-center items-center">
                  <span className="p-2 font-bold">Challenges:</span>
                  <span>{userCounts?.challenges || 0}</span>
                </div>
              </Link>
              <Link href="/invites" className=" cursor-pointer ">
                <div className="flex flex-col justify-center items-center">
                  <span className="p-2 font-bold">Invites:</span>
                  <span>{userCounts?.invites || 0}</span>
                </div>
              </Link>
            </div>
          </div>
        )}

        <div className="flex my-4 md:w-full text-white w-96 ml-16 md:ml-0 justify-center card items-start p-2 rounded-lg shadow-lg bg-black transition ease-in-out delay-100  hover:ease-in-out p-2">
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
                      return <li key={i}>{capitalizeWord(sport)}</li>;
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
                className="px-2 py-1 w-[120px] mx-4 bg-green-200 rounded-full text-black hover:bg-green-400"
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
                return <TeamCard team={team} key={i} />;
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
