import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { TeamPageController } from "../../components/Teams/SingleTeamPage/TeamPageController";

export default function TeamPage() {
  const router = useRouter();
  const getUsername = router.query.username;
  const [username, setUsername] = useState<any>(null);

  useEffect(() => {
    setUsername(getUsername);
  }, [router.isReady]);

  return (
    <div className="mb-auto">
      <Head>
        <title>Team Profile</title>
        <meta name="description" content="Team Profile" />
      </Head>
      {username ? (
        <TeamPageController username={username} />
      ) : (
        <div className="flex flex-col justify-center items-center">
          <p> No Team</p>
        </div>
      )}
    </div>
  );
}
