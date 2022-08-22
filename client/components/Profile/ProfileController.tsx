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
  const { fetchUser, getAllObjects, getAllPossibleObjects, cloudFunction } =
    useCustomMoralis();
  const [userData, setUserData] = useState<any>({});
  const [teams, setTeams] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserCountsLoading, setIsUserCountsLoading] = useState(false);
  const [userCounts, setUserCounts] = useState({});
  const [userObject, setUserObject] = useState({
    rewards: 0,
    invites: 0,
    challenges: 0,
  });
  const [username, setUsername] = useState("");
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

      if (results != null && results.length != 0) {
        setUserData(results.user.attributes);
        setUserObject(results.user);
        setUsername(results.user.attributes.username);
        setIsLoading(false);
        if (results && username) {
          await getTeams();
        }
      } else if (!results || results.length == 0 || results == null) {
        console.log("No user found");

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

  const getTeams = async () => {
    try {
      if (username && username.length != 0 && username != null) {
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
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUserInvites = async () => {
    await cloudFunction("getUserInvites", {})
      .then((invites) => {
        setUserCounts({ ...userCounts, invites: invites.pending.length });
      })
      .catch((error) => {
        console.error("Error fetching invites");
      });
  };

  const fetchUserRewards = async () => {
    await cloudFunction("getUserRewards", {})
      .then((rewards) => {
        setUserCounts({ ...userCounts, rewards: rewards.available.length });
      })
      .catch((error) => {
        console.error("Error fetching rewards");
      });
  };

  const fetchUserChallenges = async () => {
    await cloudFunction("getUserChallenges", {})
      .then((challenges) => {
        setUserCounts({ ...userCounts, challenges: challenges.active.length });
      })
      .catch((error) => {
        console.error("Error fetching challenges");
      });
  };

  useEffect(() => {
    if (user) {
      getUser();
      getTeams();
    }
    if (isCurrentUser) {
      fetchUserInvites();
      fetchUserRewards();
      fetchUserChallenges();
    }
    return () => {
      setIsLoading(true);
    };
  }, []);

  useEffect(() => {
    if (username) {
      getTeams();
    }
    return () => {
      setTeams([]);
    };
  }, [username]);

  return (
    <Profile
      userData={userData}
      isCurrentUser={isCurrentUser}
      teams={teams}
      isLoading={isLoading}
      wallet={wallet}
      userObject={userObject}
      userCounts={userCounts}
    />
  );
};
