import { useEffect, useState } from "react";
import { GetUserChallenges } from "../../configs/types";
import { useCustomMoralis } from "../../context/CustomMoralisProvider";
import ChallengesPage from "./ChallengesPage";

export const ChallengesController = () => {
  const { cloudFunction } = useCustomMoralis();
  const [challenges, setChallenges] = useState<GetUserChallenges>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchChallenges = async () => {
    setIsLoading(true);
    const challenges = await cloudFunction("getUserChallenges", {});
    if (!challenges.success) setError(error || "Error fetching challenges");
    return challenges;
  };

  useEffect(() => {
    fetchChallenges()
      .then(setChallenges)
      .then(() => setIsLoading(false))
      .catch(setError);
  }, []);

  return challenges && challenges.success ? (
    <ChallengesPage
      active={challenges?.active}
      created={challenges?.created}
      complete={challenges?.complete}
    />
  ) : (
    <div>
      <span className="text-1xl text-white">Loading...</span>
    </div>
  );
};
