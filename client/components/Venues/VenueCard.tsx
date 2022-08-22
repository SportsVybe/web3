import { Venue } from "../../configs/types";
import { capitalizeWords, formatAddress } from "../../helper/formatter";
import { Photo } from "../Layout/Photo";

type Props = {
  venue: Venue;
};

export const VenueCard = ({ venue }: Props) => {
  return (
    <div className="flex flex-col my-4 w-full md:w-[650px] text-white w-96 ml-16 md:ml-0 justify-center card items-start p-2 rounded-lg shadow-lg bg-black transition ease-in-out delay-100  hover:ease-in-out">
      <div className="flex flex-row w-full">
        <div className="flex flex-col w-1/2 items-center justify-center p-2">
          {venue.status === 4 ? (
            <span className="p-1 text-red-300">Featured</span>
          ) : null}
          <Photo
            src={venue.photo || ""}
            alt={venue.name}
            size="sm"
            type="park"
            isLoading={false}
          />
          <span className="py-3">{capitalizeWords(venue.name)}</span>

          <span className="py-2 font-bold">Address:</span>
          <span>{formatAddress(venue.address)}</span>
        </div>
        <div className="flex flex-col w-1/2 items-center p-2">
          <div className="flex flex-col justify-center items-center">
            <span className="p-2 font-bold">Activities:</span>
            <div className="flex flex-wrap items-center">
              {venue.availableActivities &&
                venue.availableActivities.map((activity: string, i: number) => {
                  return (
                    <span className="p-1" key={i}>
                      + {capitalizeWords(activity)}
                    </span>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row w-full items-center justify-around p-2">
        <a
          href={`/teams/${venue.id}`}
          className="px-3 py-2 my-2 text-white bg-blue-600 rounded-full hover:bg-blue-800 transition ease-in-out delay-100  hover:ease-in-out"
        >
          View Venue
        </a>
      </div>
    </div>
  );
};
