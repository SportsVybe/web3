import Link from "next/link";
import { forwardRef, useState } from "react";
import { useWallet } from "../../context/WalletProvider";

export default function Navbar() {
  const {
    connectWallet,
    wallet,
    signOutWallet,
    isAuthenticating,
    isAuthenticated,
  } = useWallet();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="md:px-8 md:flex md:justify-between md:items-center md:pt-4 ">
      <div className="flex justify-between px-4">
        <div className="p-2 cursor-pointer">
          <ImageRef href="/">
            <img
              src="https://main.d2hn7maiky4r02.amplifyapp.com/header_logo.png"
              alt="SportsVybe Logo"
              className="logo-image"
            />
          </ImageRef>
        </div>
        <div className="md:hidden p-2 mt-1">
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="block text-green-600"
          >
            {isOpen ? (
              <h1 className="text-3xl text-bold text-green-600">✖</h1>
            ) : (
              <svg
                className="h-6 w-6 fill-current text-green-600"
                viewBox="0 0 100 80"
              >
                <rect width="100" height="20"></rect>
                <rect y="30" width="100" height="20"></rect>
                <rect y="60" width="100" height="20"></rect>
              </svg>
            )}
          </button>
        </div>
      </div>
      <div
        className={`px-4 pt-2 pb-4 md:pb-0 md:flex md:p-0 ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <div className="md:flex list-none flex-row justify-between items-center flex-initial">
          {!wallet && (
            <>
              <div className="block rounded px-2 py-1 mx-4 mb-3 md:mb-0 cursor-pointer hover:text-green-600 text-white md:text-md nav-item">
                <Link href="/" className="px-2">
                  Home
                </Link>
              </div>
            </>
          )}

          <div className="block rounded px-2 py-1 mx-4 mb-3 md:mb-0 cursor-pointer hover:text-green-600 text-white md:text-md nav-item">
            <Link href="/aboutus" className="px-2">
              About
            </Link>
          </div>
          <div className="block rounded px-2 py-1 mx-4 mb-3 md:mb-0 cursor-pointer hover:text-green-600 text-white md:text-md nav-item">
            <Link href="/venues" className="px-2">
              Venues
            </Link>
          </div>
          <div className="block rounded px-2 py-1 mx-4 mb-3 md:mb-0 cursor-pointer hover:text-green-600 text-white md:text-md nav-item">
            <Link href="/teams" className="px-2">
              Teams
            </Link>
          </div>
          <div className="block rounded px-2 py-1 mx-4 mb-3 md:mb-0 cursor-pointer hover:text-green-600 text-white md:text-md nav-item">
            <Link href="/events" className="px-2">
              Events
            </Link>
          </div>
          {isAuthenticated && (
            <>
              <hr className="md:w-[20px] w-full" />
              <div className="block rounded px-2 py-1 mx-4 mb-3 md:mb-0 cursor-pointer hover:text-green-600 text-white md:text-md nav-item">
                <Link href="/profile" className="px-2">
                  My Profile
                </Link>
              </div>
              <div className="block rounded px-2 py-1 mx-4 mb-3 md:mb-0 cursor-pointer hover:text-green-600 text-white md:text-md nav-item">
                <Link href="/invites" className="px-2">
                  My Invites
                </Link>
              </div>
              <div className="block rounded px-2 py-1 mx-4 mb-3 md:mb-0 cursor-pointer hover:text-green-600 text-white md:text-md nav-item">
                <Link href="/rewards" className="px-2">
                  My Rewards
                </Link>
              </div>
              <div className="block rounded px-2 py-1 mx-4 mb-3 md:mb-0 cursor-pointer hover:text-green-600 text-white md:text-md nav-item">
                <Link href="/challenges" className="px-2">
                  My Challenges
                </Link>
              </div>
            </>
          )}
        </div>
        <div className="px-4">
          {wallet ? (
            <button
              disabled={isAuthenticating}
              className="block rounded-full cursor-pointer px-6 py-2  mx-2 bg-green-400  disabled:bg-gray-400 hover:bg-green-600 button "
              onClick={() => signOutWallet()}
            >
              Disconnect {wallet.substring(0, 5)}
            </button>
          ) : (
            <button
              disabled={isAuthenticating}
              className="block rounded-full cursor-pointer px-6 py-2  mx-2 bg-green-400 text-bold   disabled:bg-gray-400 hover:bg-green-600 button"
              onClick={() => connectWallet()}
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

type Props = {
  href: string;
  children: JSX.Element;
};

// eslint-disable-next-line react/display-name
const ImageRef = forwardRef<HTMLAnchorElement, Props>(
  ({ href, children }, ref) => {
    return (
      <a href={href} ref={ref}>
        {children}
      </a>
    );
  }
);
