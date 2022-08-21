import { API } from "aws-amplify";
import {
  GetAllVenuesResponse,
  Venue,
  VenueSearchParams,
} from "../../configs/types";

export const getAllVenues = async (): Promise<GetAllVenuesResponse> => {
  const apiName = "web3api";
  const path = "/venues/featured";
  const myInit = {
    response: false,
  };
  const response = await API.get(apiName, path, myInit);
  return response;
};

export const searchVenues = async (
  params: VenueSearchParams
): Promise<GetAllVenuesResponse> => {
  const apiName = "web3api";
  const path = "/venues/search";
  const myInit = {
    response: false,
    body: params,
  };
  const response = await API.post(apiName, path, myInit);
  return response;
};

export const getVenue = async (id: string): Promise<Venue> => {
  const apiName = "web3api";
  const path = `/venues/${id}`;
  const myInit = {
    response: false,
  };
  const response = await API.get(apiName, path, myInit);
  return response;
};

export const createVenue = async (venue: Venue): Promise<Venue> => {
  const apiName = "web3api";
  const path = "/venues";
  const myInit = {
    body: venue,
    response: true,
  };
  const response = await API.post(apiName, path, myInit);
  return response;
};

export const updateVenue = async (venue: Venue): Promise<Venue> => {
  const apiName = "web3api";
  const path = `/venues/${venue.id}`;
  const myInit = {
    body: venue,
    response: true,
  };
  const response = await API.put(apiName, path, myInit);
  return response;
};

export const deleteVenue = async (id: string): Promise<Venue> => {
  const apiName = "web3api";
  const path = `/venues/${id}`;
  const myInit = {
    body: { status: 3 },
    response: true,
  };
  const response = await API.put(apiName, path, myInit);
  return response;
};

export const getAllVenuesByActivity = async (
  activity: string
): Promise<Venue[]> => {
  const apiName = "web3api";
  const path = `/venues`;
  const myInit = {
    response: true,
    queryStringParameters: {
      availableActivities: activity,
    },
  };
  const response = await API.get(apiName, path, myInit);
  return response;
};
