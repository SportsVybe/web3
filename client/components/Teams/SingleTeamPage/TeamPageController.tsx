import { useEffect, useState } from "react";
import { Team } from "../../../configs/types";
import { useCustomMoralis } from "../../../context/CustomMoralisProvider";
import TeamPage from "./TeamPageView";

type Props = {
  objectId: string;
};

export const TeamPageController = ({ objectId }: Props) => {
  const [team, setTeam] = useState<Team>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const { cloudFunction } = useCustomMoralis();

  const fetchTeamByObjectId = async () => {
    setIsLoading(true);
    const data = await cloudFunction("getTeamByAttribute", {
      attribute: "objectId",
      value: objectId,
      activeStatus: "all",
    });
    if (data.success) {
      if (!data.data.length) setError(true);
      if (data.data.length > 0) return data.data[0];
    }
  };

  useEffect(() => {
    fetchTeamByObjectId()
      .then(setTeam)
      .then(() => setIsLoading(false))
      .catch(setError);
  }, []);

  return team && !isLoading ? (
    <TeamPage team={team} teamIsLoading={isLoading} />
  ) : (
    <>
      {!error
        ? "Loading...."
        : "Error! Please try another team or refresh the page"}
    </>
  );
};
