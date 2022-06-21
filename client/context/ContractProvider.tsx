import { ethers } from "ethers";
import { createContext, useContext, useState } from "react";
import {
  contractABI,
  contractAddress,
  tokenContractABI,
  tokenContractAddress,
} from "../configs/configs";

const ethereum = typeof window !== "undefined" && (window as any).ethereum;

const defaultState = {
  isContractLoading: false,
  setIsContractLoading: {},
  contractMessage: {},
  setContractMessage: {} as any,
  createTeam: async () => {},
  createChallenge: async (
    userTeamId: string,
    challengeTeamId: string,
    challengeAmount: string
  ) => {},
  approveAmount: async (challengeAmount: string) => {},
  acceptChallenge: async (
    challengeId: string,
    challengeTeam2Id: string,
    challengeAmount: string
  ) => {},
};

const ContractContext = createContext(defaultState);

const ContractProvider = ({ children }: { children: any }) => {
  const [isContractLoading, setIsContractLoading] = useState(false);
  const [contractMessage, setContractMessage] = useState({});

  const getContract = async () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    return contract;
  };

  const getTokenContract = async () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(tokenContractAddress, tokenContractABI, signer);
  };

  const approveAmount = async (challengeAmount: string): Promise<any> => {
    setIsContractLoading(true);
    try {
      const contract = await getTokenContract();
      console.log(contract);
      const challengeAmountWei = ethers.utils.parseEther(challengeAmount);

      contract.approve(contractAddress, challengeAmountWei);

      setContractMessage({
        statusColor: "green",
        message: `${challengeAmountWei}SVT Approved for spending`,
      });
      setIsContractLoading(false);
      return true;
    } catch (error) {
      setIsContractLoading(false);
      if (error instanceof Error)
        setContractMessage({ statusColor: "red", message: error.message });
      console.log(error);
      return false;
    }
  };

  const createTeam = async (): Promise<any> => {
    setIsContractLoading(true);
    try {
      const contract = await getContract();

      const teamId = contract.functions
        .createTeam() // create team transaction
        .then((tx) => tx.wait()) // wait for transaction to be mined
        .then((tx) => {
          setIsContractLoading(false);
          setContractMessage({
            statusColor: "green",
            message: "Successfully created team on chain!",
          });
          return tx.events[0].args[0].toString(); // return teamId as string
        });
      return teamId;
    } catch (error) {
      setIsContractLoading(false);
      if (error instanceof Error)
        setContractMessage({ statusColor: "red", message: error.message });
      console.log(error);
      return false;
    }
  };

  const createChallenge = async (
    userTeamId: string,
    challengeTeamId: string,
    challengeAmount: string
  ) => {
    setIsContractLoading(true);

    try {
      const challengeAmountWei = ethers.utils.parseEther(challengeAmount);

      // create challenge transaction
      const contract = await getContract();

      const challengeId = contract.functions
        .createChallengePool(userTeamId, challengeTeamId, challengeAmountWei, {
          gasLimit: 3500000,
        })
        .then((tx) => tx.wait()) // wait for transaction to be mined
        .then((tx) => {
          setIsContractLoading(false);
          setContractMessage({
            statusColor: "green",
            message: "Successfully created challenge on chain!",
          });
          return tx.events[1].args.challenge_id.toString(); // return challengeId as string
        })
        .catch((error) => {
          setIsContractLoading(false);
          setContractMessage({ statusColor: "red", message: error.message });
          console.error(error);
          return false;
        });
      return challengeId;
    } catch (error) {
      setIsContractLoading(false);
      if (error instanceof Error)
        setContractMessage({ statusColor: "red", message: error.message });
      console.error(error);
      return false;
    }
  };

  const acceptChallenge = async (
    challengeId: string,
    challengeTeam2Id: string,
    challengeAmount: string
  ) => {
    setIsContractLoading(true);

    try {
      const challengeAmountWei = ethers.utils.parseEther(challengeAmount);

      // create challenge transaction
      const contract = await getContract();

      const challengeAccepted = contract.functions
        .acceptChallenge(challengeId, challengeTeam2Id, {
          value: challengeAmountWei,
          gasLimit: 3500000,
        })
        .then((tx) => tx.wait()) // wait for transaction to be mined
        .then((tx) => {
          console.log(tx);
          setIsContractLoading(false);
          setContractMessage({
            statusColor: "green",
            message: "Successfully created challenge on chain!",
          });
          return tx.events[1].args.challenge_id.toString(); // return challengeId as string
        })
        .catch((error) => {
          setIsContractLoading(false);
          setContractMessage({ statusColor: "red", message: error.message });
          console.error(error);
          return false;
        });
      return challengeAccepted;
    } catch (error) {
      setIsContractLoading(false);
      if (error instanceof Error)
        setContractMessage({ statusColor: "red", message: error.message });
      console.error(error);
      return false;
    }
  };

  return (
    <ContractContext.Provider
      value={{
        createTeam,
        createChallenge,
        isContractLoading,
        contractMessage,
        approveAmount,
        setContractMessage,
        setIsContractLoading,
        acceptChallenge,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};

const useContract = () => useContext(ContractContext);

export { ContractProvider, useContract };
