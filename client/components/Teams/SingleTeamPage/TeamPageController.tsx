import { useEffect, useState } from "react";
import { useMoralisQuery } from "react-moralis";
import TeamPage from "./TeamPageView";

type Props = {
  username: string;
  wallet?: boolean | string;
};

export const TeamPageController = ({ username, wallet = false }: Props) => {
  const [teamData, setTeamData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [teamObject, setTeamObject] = useState({});

  const getTeamByUsername = useMoralisQuery(
    "teams",
    (query) => query.equalTo("objectId", username),
    [],
    {
      autoFetch: false,
    }
  );

  useEffect(() => {
    const getTeam = getTeamByUsername.fetch();
    getTeam
      .then((team: any) => {
        setTeamData(team[0].attributes);
        setTeamObject(team[0]);
      })
      .then(() => setIsLoading(false))
      .catch((err) => {
        console.log("err", err);
      });
  }, []);

  return (
    <TeamPage
      team={teamData}
      teamIsLoading={isLoading}
      teamObject={teamObject}
    />
  );
};
