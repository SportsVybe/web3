import { useEffect, useState } from "react";
import { Team } from "../../../configs/types";
import { useCustomMoralis } from "../../../context/CustomMoralisProvider";
import TeamsFilter from "./TeamsFilter";
import TeamsView from "./TeamsView";

export const TeamsController = () => {
  const [teams, setTeams] = useState<Team[] | []>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const { cloudFunction } = useCustomMoralis();
  const fetchTeams = async () => {
    setIsLoading(true);
    const data = await cloudFunction("getTeamByAttribute", {
      attribute: "isTeamActive",
      value: true,
      activeStatus: true,
    });
    if (data.success) {
      return data.data;
    }
  };

  const fetchSearchTeams = async (
    attribute: string,
    value: string | number | boolean
  ) => {
    setIsSearching(true);
    const data = await cloudFunction("getTeamByAttribute", {
      attribute: attribute,
      value: value,
      activeStatus: true,
    });
    if (!data || !data.statusCode) setTeams([]);
    if (data.statusCode === 200) setTeams(data.data);
    if (data.statusCode === 404) setTeams([]);
    if (data.statusCode === 500) setError(true);
    setTeams([]);
    setIsSearching(false);
  };

  useEffect(() => {
    fetchTeams()
      .then(setTeams)
      .then(() => setIsLoading(false))
      .catch(setError);
  }, []);

  return teams && !isLoading ? (
    <>
      <TeamsFilter
        fetchSearchTeams={fetchSearchTeams}
        isSearching={isSearching}
        setIsSearching={setIsSearching}
      />
      <TeamsView data={teams} isLoading={isLoading} />
    </>
  ) : (
    <div>
      {!error
        ? "Loading...."
        : "Error! Please try another search or      refresh the page"}
    </div>
  );
};
