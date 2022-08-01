import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useMoralis, useNewMoralisObject } from "react-moralis";
import { useCustomMoralis } from "../../context/CustomMoralisProvider";
import Profile from "./ProfileView";

type Props = {
  user?: any;
  wallet?: string | boolean;
  isCurrentUser: boolean;
  isAuthenticating?: boolean;
};

export const ProfileController = ({
  user,
  wallet = false,
  isCurrentUser = false,
}: Props) => {
  const router = useRouter();
  const { Moralis } = useMoralis();
  const createNewUser = useNewMoralisObject("users");
  const { fetchUser, getAllObjects, getAllPossibleObjects } =
    useCustomMoralis();
  const [userData, setUserData] = useState<any>({});
  const [teams, setTeams] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userObject, setUserObject] = useState({});
  const [username, setUsername] = useState(user && user);
  let newUser = {};
  if (isCurrentUser) {
    newUser = {
      userAccount: Moralis.User.current(),
      userWins: 0,
      userWinnings: 0,
      userLosses: 0,
      userStatus: 0,
      newUser: true,
      userPOS: 0,
    };
  }
  const getUser = async () => {
    try {
      const userValue = isCurrentUser ? user.id : user;
      const userMethod = isCurrentUser ? "objectId" : "username";
      const results: any = await fetchUser(userValue, userMethod, false);
      console.log(userValue, userMethod, results.user.attributes);

      if (results != null && results.length != 0) {
        setUserData(results.user.attributes);
        setUserObject(results.user);
        setUsername(results.user.attributes);
        setIsLoading(false);
        if (results && username) {
          const teamMembers = await getAllPossibleObjects(
            "teams",
            "teamMembers",
            username
          );
          if (teamMembers != null && teamMembers.length != 0) {
            setIsLoading(false);
            setTeams(teamMembers);
          }
        }
      } else if (results.length == 0 && results == null) {
        createNewUser.save(newUser, {
          onSuccess: (user: any) => {
            setUserData(user.attributes);
            router.reload();
          },
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) {
      getUser();
    }
  }, []);

  return (
    <Profile
      userData={userData}
      isCurrentUser={isCurrentUser}
      teams={teams}
      isLoading={isLoading}
      wallet={wallet}
      userObject={userObject}
    />
  );
};
