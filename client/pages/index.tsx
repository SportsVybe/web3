import type { NextPage } from "next";
import Head from "next/head";
import { Home } from "../components/Home";

const Index: NextPage = () => {
  return (
    <div className="mb-auto">
      <Head>
        <title>Polygon Hackathon</title>
        <meta name="description" content="2022 Polygon Hackathon" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Home />
    </div>
  );
};

export default Index;
