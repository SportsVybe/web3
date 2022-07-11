import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMoralisQuery } from "react-moralis";

export default function EventsPage() {
  const router = useRouter();
  const eventObjectId = router.query.eventObjectId;
  const { fetch, isFetching, data } = useMoralisQuery(
    "events",
    (query) => query.equalTo("objectId", eventObjectId),
    [],
    {
      autoFetch: false,
    }
  );

  useEffect(() => {
    objectIdQuery();
    console.log(data);

    return () => {
      // cleanup
    };
  }, [router.isReady]);

  const objectIdQuery = () => {
    fetch({
      onSuccess: (event) => {
        // The object was retrieved successfully.
        console.log("event", event);
        if (event.length > 0)
          console.log("event attributes", event[0].attributes);
        return event;
      },
      onError: (error) => {
        console.error(error);
        // The object was not retrieved successfully.
        // error is a Moralis.Error with an error code and message.
      },
    });
  };

  return (
    <div>
      <button onClick={objectIdQuery}>Call The Code</button>
      {isFetching && <div>Loading...</div>}
      {/* {attributes && <div>{attributes.eventInfo}</div>} */}
    </div>
  );
}
