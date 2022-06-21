import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ProfileController } from "../../components/Profile/ProfileController";

export default function PlayerPage() {
  const router = useRouter();
  const getUsername: any = router.query.username;
  const [username, setUsername] = useState(null);

  useEffect(() => {
    setUsername(getUsername);
  }, [router.isReady]);

  return (
    <div className="mb-auto">
      <Head>
        <title>Player Profile</title>
        <meta name="description" content="Player Profile" />
      </Head>
      {username ? (
        <ProfileController username={username} isCurrentUser={false} />
      ) : (
        <div className="flex flex-col justify-center items-center">
          <p>No Username</p>
        </div>
      )}
    </div>
  );
}
