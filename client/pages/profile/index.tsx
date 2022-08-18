import Head from "next/head";
import { ProfileController } from "../../components/Profile/ProfileController";
import { useWallet } from "../../context/WalletProvider";

export default function ProfilePage() {
  const { wallet, user, isAuthenticating, connectWallet } = useWallet();

  return (
    <div className="mb-auto" id="overflow">
      <Head>
        <title>Player Profile</title>
        <meta name="description" content="Player Profile" />
      </Head>
      {wallet && user && !isAuthenticating ? (
        <ProfileController
          user={user}
          isAuthenticating={isAuthenticating}
          wallet={wallet}
          isCurrentUser={true}
        />
      ) : (
        <div className="flex flex-col justify-center items-center">
          <p> No User Signed in</p>
          <button
            disabled={isAuthenticating}
            className="rounded-full bg-green-200 px-2 py-1 m-4 disabled:bg-gray-400"
            onClick={() => connectWallet()}
          >
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  );
}
