import type { AppProps } from "next/app";
import "../styles/globals.css";

import { MoralisProvider } from "react-moralis";
import { moralis } from "../configs/configs";
import { ContractProvider } from "../context/ContractProvider";
import { WalletProvider } from "../context/WalletProvider";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MoralisProvider appId={moralis.MORALIS_APP_ID} serverUrl={moralis.MORALIS_SERVER_URL}>
      <WalletProvider>
        <ContractProvider>
          <Component {...pageProps} />
        </ContractProvider>
      </WalletProvider>
    </MoralisProvider>
  );
}

export default MyApp;
