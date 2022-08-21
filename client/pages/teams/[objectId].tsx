import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { TeamPageController } from "../../components/Teams/SingleTeamPage/TeamPageController";

export default function TeamPage() {
  const router = useRouter();
  const getObjectId = router.query.objectId;
  const [objectId, setObjectId] = useState<any>(null);

  useEffect(() => {
    setObjectId(getObjectId);
  }, [router.isReady]);

  return (
    <div className="mb-auto">
      <Head>
        <title>Team Profile</title>
        <meta name="description" content="Team Profile" />
      </Head>
      {objectId ? (
        <TeamPageController objectId={objectId} />
      ) : (
        <div className="flex flex-col justify-center items-center">
          <p> No Team</p>
        </div>
      )}
    </div>
  );
}
