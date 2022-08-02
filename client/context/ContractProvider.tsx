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
  setIsContractLoading: (loading: boolean) => {},
  contractMessage: { status: "", message: "" } as any,
  setContractMessage: {} as any,
  createTeam: async (actionId: string) => {
    return false;
  },
  createChallenge: async (
    actionId: string,
    userTeamId: string,
    challengeTeamId: string,
    challengeAmount: string
  ) => {
    return false;
  },
  approveAmount: async (challengeAmount: string) => {},
  acceptChallenge: async (
    actionId: string,
    challengeId: string,
    challengeTeam2Id: string,
    challengeAmount: string
  ) => {
    return false;
  },
  submitVote: async (
    actionId: string,
    challengeId: string,
    vote: string // teamId
  ) => {
    return false;
  },
  sendTeamMembershipRequest: async (
    actionId: string,
    teamId: string,
    user: string // ethAddress
  ) => {
    return false;
  },
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
      const challengeAmountWei = ethers.utils.parseEther(challengeAmount);

      const approve = await contract.approve(
        contractAddress,
        challengeAmountWei
      );

      if (approve) {
        setContractMessage({
          status: "info",
          message: `Pending ${challengeAmount} SVT approval`,
        });
        setIsContractLoading(false);
      }
      return true;
    } catch (error) {
      setIsContractLoading(false);
      if (error instanceof Error)
        setContractMessage({ status: "error", message: error.message });
      console.error(error);
      return false;
    }
  };

  const createTeam = async (actionId: string): Promise<any> => {
    setIsContractLoading(true);
    try {
      const contract = await getContract();
      await contract.functions.createTeam(actionId); // create team transaction
      setContractMessage({
        status: "info",
        message: "Team is being created on chain.",
      });
      setIsContractLoading(false);
      return true;
    } catch (error) {
      setIsContractLoading(false);
      if (error instanceof Error) {
        setContractMessage({ status: "error", message: error.message });
      } else {
        setContractMessage({ status: "error", message: "Unknown" });
      }
      console.error(error);
      return false;
    }
  };

  const createChallenge = async (
    actionId: string,
    userTeamId: string,
    challengeTeamId: string,
    challengeAmount: string
  ) => {
    setIsContractLoading(true);
    try {
      const challengeAmountWei = ethers.utils.parseEther(challengeAmount);

      // create challenge transaction
      const contract = await getContract();
      await contract.functions.createChallengePool(
        actionId,
        userTeamId,
        challengeTeamId,
        challengeAmountWei,
        {
          gasLimit: 3500000,
        }
      );
      setContractMessage({
        status: "info",
        message: "Challenge is being created on chain.",
      });
      setIsContractLoading(false);
      return true;
    } catch (error: any) {
      setIsContractLoading(false);
      if (error && error.message) {
        setContractMessage({ status: "error", message: error.message });
      } else {
        setContractMessage({ status: "error", message: "Unknown" });
      }
      console.error(error);
      return false;
    }
  };

  const acceptChallenge = async (
    actionId: string,
    challengeId: string,
    challengeTeam2Id: string,
    challengeAmount: string
  ) => {
    setIsContractLoading(true);

    try {
      const challengeAmountWei = ethers.utils.parseEther(challengeAmount);

      // create challenge transaction
      const contract = await getContract();
      await contract.functions.acceptChallengePool(
        actionId,
        challengeId,
        challengeTeam2Id,
        challengeAmountWei,
        {
          gasLimit: 3500000,
        }
      );
      setContractMessage({
        status: "info",
        message: "Challenge is being accepted on chain.",
      });
      setIsContractLoading(false);
      return true;
    } catch (error) {
      setIsContractLoading(false);
      if (error instanceof Error) {
        setContractMessage({ status: "error", message: error.message });
      } else {
        setContractMessage({ status: "error", message: "Unknown" });
      }
      console.error(error);
      return false;
    }
  };

  const submitVote = async (
    actionId: string,
    challengeId: string,
    vote: string
  ) => {
    setIsContractLoading(true);
    try {
      const contract = await getContract();
      await contract.functions.submitVote(actionId, challengeId, vote, {
        gasLimit: 3500000,
      });
      setContractMessage({
        status: "info",
        message: "Vote is being submitted on chain.",
      });
      setIsContractLoading(false);
      return true;
    } catch (error) {
      setIsContractLoading(false);
      if (error instanceof Error) {
        setContractMessage({ status: "error", message: error.message });
      } else {
        setContractMessage({ status: "error", message: "Unknown" });
      }
      console.error(error);
      return false;
    }
  };

  const sendTeamMembershipRequest = async (
    actionId: string,
    teamId: string,
    user: string
  ) => {
    setIsContractLoading(true);
    try {
      const contract = await getContract();
      await contract.functions.sendTeamMembershipRequest(
        actionId,
        teamId,
        user
      );
      setContractMessage({
        status: "info",
        message: "Membership Request is being processed on chain.",
      });
      setIsContractLoading(false);
      return true;
    } catch (error) {
      setIsContractLoading(false);
      if (error instanceof Error) {
        setContractMessage({ status: "error", message: error.message });
      } else {
        setContractMessage({ status: "error", message: "Unknown" });
      }
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
        submitVote,
        sendTeamMembershipRequest,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};

const useContract = () => useContext(ContractContext);

export { ContractProvider, useContract };
