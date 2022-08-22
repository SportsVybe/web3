import abi from "./abi.json";
import vtoken from "./vtoken.json";

export const moralis = {
  MORALIS_APP_ID: process.env.NEXT_PUBLIC_MORALIS_APP_ID ?? "",
  MORALIS_SERVER_URL: process.env.NEXT_PUBLIC_MORALIS_SERVER_URL ?? "",
  MORALIS_API_KEY: process.env.NEXT_PUBLIC_MORALIS_API_KEY ?? "",
};

export const contractABI = abi.abi;

export const tokenContractABI = vtoken.abi;

export const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "";

export const tokenContractAddress =
  process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS ?? "";
