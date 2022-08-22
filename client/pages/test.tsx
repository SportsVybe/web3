import { API } from "aws-amplify";
import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";
import { Venue } from "../configs/types";

const Test = () => {
  const router = useRouter();

  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [parks, setParks] = useState<Venue[]>([]);
  const [formattedParks, setFormattedParks] = useState<Venue[]>([]);
  const [comparedParks, setComparedParks] = useState<Venue[]>([]);
  const [dataFromAWS, setDataFromAWS] = useState<Venue[]>([]);

  const getMDCParks = async () => {
    const url =
      "https://gisweb.miamidade.gov/arcgis/rest/services/Parks/MD_Parks305/MapServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json";
    try {
      const response = await axios.get(url);
      setParks(response.data.features);
      console.log(parks);
    } catch (error) {
      setError(error);
    }
  };

  interface Attribute {
    key: string;
    value: string;
  }

  const getAvailableActivities = (attributes: Attribute) => {
    const activities: string[] = [];
    Object.entries(attributes).forEach(([key, value]) => {
      if (value == "Yes") {
        return activities.push(key.toLowerCase());
      }
    });
    return activities;
  };

  const formatParks = (parks: Venue[]) => {
    const formattedParks = parks.map((park: any) => {
      const { attributes, geometry } = park;
      const activities = getAvailableActivities(attributes);
      const name = attributes.NAME;
      return {
        id: String(attributes.ID || attributes.OBJECTID),
        name: name ? name.toLowerCase() : "Unknown",
        coordinates: { longitude: geometry.x, latitude: geometry.y },
        address: {
          street: attributes.ADDRESS || null,
          city: attributes.CITY || null,
          state: "FL",
          zip: attributes.ZIPCODE || null,
          country: "USA",
        },
        photo: "",
        phone: attributes.PHONE || null,
        website: attributes.PARKURL || null,
        availableActivities: activities,
        status: name ? 1 : 0,
        dadeParkObjectId: attributes.OBJECTID || null,
        claimed: false,
      };
    });
    setFormattedParks(formattedParks);
    console.log(formattedParks);
    // return formattedParks;
  };

  async function getAllDataFromAWS() {
    const apiName = "web3api";
    const path = "/venues";
    const myInit = {
      response: false,
    };
    const { data } = await API.get(apiName, path, myInit);
    setDataFromAWS(data);
    console.log(data);
  }

  function getDataById(id: string) {
    const apiName = "web3api";
    const path = `/venues/${id}`;
    const myInit = {
      response: false,
    };

    return API.get(apiName, path, myInit);
  }

  function postData(venue: Venue) {
    const apiName = "web3api";
    const path = "/venues";
    const myInit = {
      response: false,
      body: venue,
    };

    return API.post(apiName, path, myInit);
  }

  const addToAWS = async (venues: Venue[]) => {
    try {
      venues.forEach(async (venue: Venue, index: number) => {
        setTimeout(async () => {
          const response = await postData(venue);
          console.log(new Date().toISOString(), response);
        }, index * 1000);
        if (index === venues.length - 1) {
          clearTimeout();
          console.log("done");
        }
      });
    } catch (error) {
      setError(error);
    }
  };

  const testGet = async () => {
    const results = await getAllDataFromAWS();
    console.log(results);
  };
  const testGetById = async (id: string) => {
    const results = await getDataById(id);
    console.log(results);
  };
  const testPost = async () => {
    const venue = {
      id: "10",
      name: "test",
      coordinates: { longitude: 0, latitude: 0 },
      availableActivities: ["test"],
      status: 0,
      claimed: false,
      address: {
        street: "test",
        city: "test",
        state: "fl",
        zip: "test",
        country: "usa",
      },
    };
    const results = await postData(venue);
    console.log(results);
  };

  const compareArrays = (a: Venue[], b: Venue[]) => {
    const compared = a.filter((item) => {
      return !b.find((item2) => item2.name === item.name);
    });

    console.log(compared);
    setComparedParks(compared);
  };

  return (
    <>
      <div className="flex flex-row justify-around items-center p-2">
        <button
          className="px-2 py-1 mx-2 bg-green-200 rounded"
          onClick={() =>
            console.log(
              "formattedParks",
              formattedParks,
              "dataFromAWS",
              dataFromAWS,
              "comparedParks",
              comparedParks
            )
          }
        >
          State
        </button>
        <button
          className="px-2 py-1 mx-2 bg-green-200 rounded"
          onClick={() => compareArrays(formattedParks, dataFromAWS)}
        >
          Compare
        </button>
        <button
          className="px-2 py-1 mx-2 bg-green-200 rounded"
          onClick={() => testGet()}
        >
          Get All
        </button>
      </div>

      <div className="flex flex-row justify-around items-center p-2">
        <button
          className="px-2 py-1 mx-2 bg-green-200 rounded"
          onClick={getMDCParks}
        >
          Get MDC Parks
        </button>
        <button
          className="px-2 py-1 mx-2 bg-green-200 rounded"
          onClick={() => formatParks(parks)}
        >
          Format
        </button>
        <button
          className="px-2 py-1 mx-2 bg-green-200 rounded"
          onClick={() => addToAWS(formattedParks)}
        >
          Add to AWS
        </button>

        <button onClick={() => getUserBalance()}>Balance</button>
      </div>
    </>
  );
};

export default Test;
