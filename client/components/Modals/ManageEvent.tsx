import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNewMoralisObject } from "react-moralis";
import { Challenge, Event, Team } from "../../configs/types";
import Modal from "../Layout/Modal";

type Props = {
  toggleModal: Dispatch<SetStateAction<boolean>>;
  modalView: boolean;
  createNewEvent?: boolean;
  event?: Event;
  challenge: Challenge | any;
  team1: Team;
  team2: Team;
};

export const ManageEvent = ({
  event,
  toggleModal,
  modalView,
  createNewEvent = false,
  challenge,
  team1,
  team2,
}: Props) => {
  const getEventsDB = useNewMoralisObject("events");
  const router = useRouter();

  const [team1Name, setTeam1Name] = useState(team1.get("teamName"));
  const [team2Name, setTeam2Name] = useState(team2.get("teamName"));
  const [eventName, setEventName] = useState(
    event?.eventName || `${team1Name} vs ${team2Name}`
  );
  // console.log(team1, team2);
  const [eventDate, setEventDate] = useState(event?.eventDate || new Date());
  const [eventSport, setEventSport] = useState(
    event?.eventSport || challenge.get("challengeSport") || ""
  );
  const [eventLocation, setEventLocation] = useState(
    event?.eventLocation || ""
  );
  const [eventPrizePool, setEventPrizePool] = useState<number>(
    event?.eventPrizePool || challenge.get("challengeAmount") || 0
  );

  const handleSubmit = async (e: any) => {
    const teamFormData = {
      eventName: eventName,
      eventDate: eventDate,
      eventPrizePool: eventPrizePool,
      eventSport: eventSport,
      eventLocation: eventLocation,
      eventTeam1: team1,
      eventTeam2: team2,
      challenge: challenge,
      status: event?.status || 0, // 0 = pending, 1 = confirmed, 2 = cancelled, 3 = complete
    };

    try {
      // save event to database... this will create a new event if it doesn't exist
      if (createNewEvent) {
        const event = await getEventsDB.save(teamFormData);
        await challenge.save({ challengeEvent: event });
      }
      // if (!getEventsDB.isSaving || !challenge.isSaving) router.reload();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal open={modalView} onClose={async () => toggleModal(false)}>
      <div className="flex flex-col border-2 border-green-100 p-4 items-center">
        <div> {createNewEvent ? "Create Event" : "Manage Event"}</div>

        <div className="p-2 flex flex-col md:flex-row items-center">
          <span className="md:pr-1 w-[130px] md:text-right">Event Name:</span>
          <input
            id="eventName"
            value={eventName}
            className="md:mx-3 px-2 py-1 rounded bg-gray-300 text-black"
            onChange={(e) => setEventName(e.target.value)}
          />
        </div>
        <div className="p-2 flex flex-col md:flex-row items-center">
          <span className="pr-1 w-[130px] md:text-right">Event Date:</span>
          <DatePicker
            className="mx-3 px-2 py-1 rounded bg-gray-300 text-black"
            selected={eventDate}
            onChange={(date: Date) => setEventDate(date)}
          />
        </div>
        <div className="p-2 flex flex-col md:flex-row items-center">
          <span className="pr-1 w-[130px] md:text-right">Event Location:</span>
          <input
            id="eventLocation"
            className="mx-3 px-2 py-1 rounded bg-gray-300 text-black"
            placeholder="Enter Event Location..."
            value={eventLocation}
            onChange={(e) => setEventLocation(e.target.value)}
          />
        </div>

        <div className="p-2">
          <span className="pr-1 w-[130px] text-right">Sports: </span>
          <span className="mx-3 px-2 py-1">{eventSport}</span>
        </div>

        <div className="p-2">
          <span className="pr-1 w-[130px] text-right">Prize Pool: </span>
          <span className="mx-3 px-2 py-1">{eventPrizePool} SVT</span>
        </div>
        <div className="p-2 text-red">Coming Soon!</div>
        <button
          className="my-3 px-2 py-1 bg-green-300 text-black rounded-full disabled:bg-gray-400"
          disabled={true}
          onClick={(e) => handleSubmit(e)}
        >
          {createNewEvent ? "Create Event" : "Update Event"}
        </button>
      </div>
    </Modal>
  );
};
