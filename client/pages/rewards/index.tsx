import { RewardsController } from "../../components/Rewards/RewardsPage/RewardsController";
import { useWallet } from "../../context/WalletProvider";

export default function RewardsPage() {
  const { wallet, user, isAuthenticating, connectWallet } = useWallet();
  return (
    <div className="mb-auto text-white">
      <div className="flex flex-col justify-center items-center">
        <div className="pb-4">
          <h1 className="md:text-xl md:mb-8">Rewards Page</h1>
          <p className="mb-8">View all rewards!</p>
        </div>
        {wallet && user && !isAuthenticating ? (
          <RewardsController
            user={user}
            wallet={wallet}
            isAuthenticating={isAuthenticating}
          />
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
