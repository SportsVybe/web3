import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState } from "react";
import { useChain, useMoralis } from "react-moralis";

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
  const {
    authenticate,
    isAuthenticated,
    user,
    logout,
    isAuthenticating,
    isWeb3Enabled,
    Moralis,
    enableWeb3,
  } = useMoralis();
  const router = useRouter();
  const { switchNetwork, chain } = useChain();
  const [wallet, setWallet] = useState("");

  const connectWallet = async (routeToProfile = true) => {
    try {
      if (!isAuthenticated) {
        const account = await authenticate({
          // provider: "walletconnect",
          chainId: 80001,
          signingMessage: "Welcome to SportsVybe, please sign in to continue",
          mobileLinks: [
            "rainbow",
            "metamask",
            "argent",
            "trust",
            "imtoken",
            "pillar",
          ],
        });
        if (account) {
          setWallet(account.get("ethAddress"));
          routeToProfile && router.push("/profile");
          !routeToProfile && router.reload();
        }
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
      }
    } catch (error) {
      console.error(error);
    }
  };

  const signOutWallet = () => {
    setWallet("");
    logout();
    return router.push("/");
  };

  const monitorNetwork = async (chainId: any) => {
    try {
      if (isWeb3Enabled) {
        if (chainId != "0x13881") {
          if (
            window.confirm(
              "You're on the wrong network! Click OK to switch to Polygon Mumbai!"
            )
          ) {
            Moralis.enableWeb3().then(() => {
              switchNetwork("0x13881");
            });
            return true;
          } else {
            signOutWallet().then(() => {
              alert(
                "Please try again! Being on the wrong network can result in loss of funds due to failed transaction!"
              );
            });
            return false;
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const monitorAccount = async (account: any) => {
    try {
      if (isWeb3Enabled) {
        if (wallet) {
          console.log(account, wallet);
          if (account != wallet) {
            signOutWallet().then(() => {
              alert(
                "You changed your account in your wallet app. Please login again with the new account."
              );
            });
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const networkEmitter = Moralis.onChainChanged((chain) => {
      monitorNetwork(chain);
    });

    const accountEmitter = Moralis.onAccountChanged((account) => {
      monitorAccount(account);
    });

    return () => {
      accountEmitter().removeAllListeners();
      networkEmitter().removeAllListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled, chain, user]);

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
