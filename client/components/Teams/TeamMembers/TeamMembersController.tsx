import { useEffect, useState } from "react";
import { useMoralisQuery } from "react-moralis";
import { TeamMember } from "./TeamMemberView";

type Props = {
  team: any;
  members: any;
  teamIsLoading: boolean;
  wallet?: boolean | string;
};

export const TeamMembersController = ({
  members,
  team,
  teamIsLoading,
  wallet = false,
}: Props) => {
  const [teamMembers, setTeamsMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTeamMembers = useMoralisQuery(
    "users",
    (query) => query.containedIn("username", members),
    [],
    {
      autoFetch: false,
    }
  );

  useEffect(() => {
    const isLoadingMembers = fetchTeamMembers.isLoading;
    setIsLoading(isLoadingMembers);
  }, [fetchTeamMembers]);

  useEffect(() => {
    const getTeamMembers = fetchTeamMembers.fetch();
    getTeamMembers
      .then((members: any) => {
        setTeamsMembers(members);
        setIsLoading(fetchTeamMembers.isLoading);
      })
      .catch((err) => {
        console.log("err", err);
      });
  }, [teamIsLoading]);

  return (
    <div className="flex flex-wrap">
      {teamMembers &&
        teamMembers.map((member: any, i: number) => {
          return (
            <TeamMember
              key={i}
              member={member.attributes}
              isLoadingMembers={isLoading}
              memberObject={member}
              team={team}
            />
          );
        })}
    </div>
  );
};
