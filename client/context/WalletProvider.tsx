import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState } from "react";
import { useMoralis } from "react-moralis";

const defaultState = {
  wallet: "",
  user: {} as any,
  isAuthenticated: false,
  isAuthenticating: false,
  signOutWallet: () => {},
  connectWallet: (routeToProfile = true) => {},
};

const WalletContext = createContext(defaultState);

const WalletProvider = (props: any) => {
  const { children } = props;
  const router = useRouter();
  const { authenticate, isAuthenticated, user, logout, isAuthenticating } =
    useMoralis();
  const [wallet, setWallet] = useState("");

  const connectWallet = async (routeToProfile = true) => {
    try {
      if (!isAuthenticated) {
        const account = await authenticate({
          chainId: 80001,
          signingMessage: "Welcome to SportsVybe, please sign in to continue",
        });
        if (account) {
          setWallet(account.get("ethAddress"));
          routeToProfile && router.push("/profile");
          !routeToProfile && router.reload();
        }
        if (wallet)
          console.log("connected", account, account?.get("ethAddress"));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (isAuthenticated) {
        const account = user?.get("ethAddress");
        //set the current account
        setWallet(account);
        if (wallet) console.log("connected", user, account);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const signOutWallet = () => {
    setWallet("");
    logout();
  };

  useEffect(() => {
    // if the user isAuthenticated then check if wallet is connected
    if (isAuthenticated) {
      checkIfWalletIsConnected();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        user,
        isAuthenticating,
        isAuthenticated,
        signOutWallet,
        connectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

const useWallet = () => useContext(WalletContext);

export { WalletProvider, useWallet };
