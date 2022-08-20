import { useEffect, useState } from "react";
import { getAllVenues, searchVenues } from "../../../api/aws";
import { Venue } from "../../../configs/types";
import VenuesFilter from "./VenuesFilter";
import VenuesView from "./VenuesView";

export const VenuesController = () => {
  const [venues, setVenues] = useState<Venue[] | undefined>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<boolean>(false);

  const fetchVenues = async () => {
    setIsLoading(true);
    try {
      const data = await getAllVenues();
      if (!data || !data.statusCode) return [];
      if (data.statusCode === 200) return data.data;
      if (data.statusCode === 404) return [];
      if (data.statusCode === 500) setError(true);
      return [];
    } catch (error) {
      console.log(error);
    }
  };
  console.log(error);

  const fetchSearchVenues = async (
    attribute: string,
    value: string | number
  ) => {
    setIsSearching(true);
    const data = await searchVenues({ attribute, value });
    if (!data || !data.statusCode) return [];
    setVenues(data.data);
    setIsSearching(false);
    return data.data;
  };

  useEffect(() => {
    fetchVenues()
      .then(setVenues)
      .then(() => setIsLoading(false))
      .catch((error) => {
        setIsLoading(false);
        setError(error);
      });
  }, []);

  return venues && !isLoading ? (
    <>
      <VenuesFilter
        fetchSearchVenues={fetchSearchVenues}
        isSearching={isSearching}
        setIsSearching={setIsSearching}
      />
      <VenuesView venues={venues} isLoading={isLoading} />
    </>
  ) : (
    <div>
      {error
        ? "Loading...."
        : "Error! Please try another search or refresh the page"}
    </div>
  );
};
