import { VenueCard } from "../VenueCard";

import { Venue } from "../../../configs/types";

type Props = {
  venues: Venue[];
  isLoading: boolean;
};

export default function VenuesView({ venues, isLoading }: Props) {
  return (
    <div className="flex flex-col w-[480px] lg:w-[600px]">
      {venues && !isLoading && venues.length > 0 ? (
        venues.map((venue, i) => {
          return <VenueCard venue={venue} key={venue.id} />;
        })
      ) : (
        <h1>No venue(s) found. Try another search</h1>
      )}
    </div>
  );
}
