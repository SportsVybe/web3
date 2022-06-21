import Image from "next/image";

export const Home = () => {
  return (
    <div>
      <div className="flex-col md:flex-row flex md:items-center md:justify-center">
        <div className="animate-fade-in-left">
          <h1 className="text-4xl md:text-7xl mb-2 md:mb-5 font-semibold font-serif ">
            <span className="text-green-500 pt-2 md:pt-10">Sports</span>Vybe
          </h1>
          <h4 className="text-md md:text-2xl text-gray-600">
            Connecting People to Recreational Sports
          </h4>
          <p className="text-lg pt-3 text-gray-600">
            Our Mission is to improve the health in our community through
            fitness and sociability.
          </p>
          <h4 className="pt-5 text-gray-600 text-md">
            For Both Web and Mobile Devices{" "}
            <span className="text-xs text-green-600 animate-pulse font-extrabold">
              * Coming Soon
            </span>
          </h4>
        </div>

        <div className="animate-fade-in-right">
          <Image
            src="/heroSecImg.png"
            alt="SportsVybe header"
            width={400}
            height={300}
          />
        </div>
      </div>

      <div>
        <h2 className="text-center text-2xl md:text-3xl font-semibold md:mt-16 mt-8">
          How <span className="text-green-500">SPORTS</span>VYBE works:
        </h2>
      </div>
      <section className=" mt-10">
        <div className="flex md:flex-row flex-col md:justify-around ">
          <div className="rounded-lg mb-7 ml-4 md:ml-0 shadow-lg bg-white w-80 hover:shadow-2xl transition ease-in-out delay-100  hover:ease-in-out ">
            <Image
              className="rounded-t-xl"
              src="https://media.istockphoto.com/photos/ball-is-connecting-us-picture-id1085308182?k=20&m=1085308182&s=612x612&w=0&h=9OA_mFvT2KiiiEKqcpi1A29ogXAFk28lKjwua3_e0bI="
              alt=""
              width={400}
              height={300}
            />
            <div className="pt-4 px-4 pb-12">
              <p className="font-bold text-base py-2">
                Connect Your Wallet and create an account
              </p>
              <p>
                Find people that love the sport just as much as you do. Be a
                part of your local community.
              </p>
            </div>
          </div>
          <div className="rounded-lg mb-7 ml-4 md:ml-0 shadow-lg bg-white w-80 hover:shadow-2xl transition ease-in-out delay-100  hover:ease-in-out">
            <Image
              className="rounded-t-xl"
              src="/Section1.jpg"
              alt=""
              width={400}
              height={300}
            />
            <div className="pt-4 px-4 pb-12">
              <p className="font-bold text-base py-2">Set up preferences</p>
              <p>
                10+ Sports: Football, Basketball, Baseball, Ultimate Frisbee,
                Hockey, Tennis, Softball, Volleyball and many more!
              </p>
            </div>
          </div>
          <div className="rounded-lg mb-7 ml-4 md:ml-0 shadow-lg bg-white w-80 hover:shadow-2xl transition ease-in-out delay-100  hover:ease-in-out">
            <Image
              className="rounded-t-xl"
              src="/AM.PNG"
              alt=""
              width={400}
              height={300}
            />
            <div className="pt-4 px-4 pb-12">
              <p className="font-bold text-base py-2">
                Get active and win Challenges!
              </p>
              <p>
                Connect & challenge with other users/teams, win and earn rewards
                from challenges!
              </p>
            </div>
          </div>
        </div>
      </section>
      <div className="md:mx-32 mb-4 mt-10 animate-fadeIn">
        <h1 className="text-left text-2xl border-b-2 inline pb-1 border-green-700">
          What is does:
        </h1>
        <p className="mt-5">
          <span className="mr-2 text-green-600">➼</span> Users can find
          individual players or be apart of a team and challenge each other to a
          IRL sports match.
        </p>
        <p className="mt-5">
          <span className="mr-2 text-green-600">➼</span> Upon completing a
          match, the players of the match (individual or team) will vote who was
          the winner. The winner of the match will take the pot.
        </p>
        <p className="mt-5">
          <span className="mr-2 text-green-600">➼</span> Using smart contracts
          we secure the wager and introduce a new type of trust protocol we’re
          calling: Proof of Sportsmanship (POS).
        </p>

        <p className="mt-5">
          <span className="mr-2 text-green-600">➼</span> The POS score ensures
          players and teams are honest when validating the winner of a match.
          The POS score starts at 100% and allows the player/team to claim 100%
          of the pot.
        </p>
        <p className="mt-5">
          <span className="mr-2 text-green-600">➼</span> When consensus is not
          met the POS will be adjusted and therefore adjusts the percentage
          returned to a user.
        </p>
      </div>
    </div>
  );
};
