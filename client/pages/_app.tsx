import type { AppProps } from "next/app";
import "../styles/globals.css";

import { MoralisProvider } from "react-moralis";
import Layout from "../components/Layout/Layout";
import { moralis } from "../configs/configs";
import { ContractProvider } from "../context/ContractProvider";
import { CustomMoralisProvider } from "../context/CustomMoralisProvider";
import { WalletProvider } from "../context/WalletProvider";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MoralisProvider
      appId={moralis.MORALIS_APP_ID}
      serverUrl={moralis.MORALIS_SERVER_URL}
    >
      <CustomMoralisProvider>
        <WalletProvider>
          <ContractProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ContractProvider>
        </WalletProvider>
      </CustomMoralisProvider>
    </MoralisProvider>
  );
}

export default MyApp;
