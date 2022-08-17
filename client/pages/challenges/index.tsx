import { ChallengesController } from "../../components/Challenges/ChallengesController";
import { useWallet } from "../../context/WalletProvider";

export default function ChallengesPage() {
  const { wallet, user, isAuthenticating, connectWallet } = useWallet();
  return (
    <div className="mb-auto">
      <div className="flex flex-col justify-center items-center">
        <div className="pb-4">
          <p className="mb-8">
            View different Challenges created by you and from other individuals
            and teams!
          </p>
        </div>
        {wallet && user && !isAuthenticating ? (
          <ChallengesController />
        ) : (
          <div className="flex flex-col justify-center items-center">
            <p> No User Signed in</p>
            <button
              disabled={isAuthenticating}
              className="rounded-full bg-green-200 px-2 py-1 m-4 disabled:bg-gray-400"
              onClick={() => connectWallet(false)}
            >
              Connect Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
