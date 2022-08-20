import Image from "next/image";
import ProcessSection from "./ProcessSection";

export const Home = () => {
  return (
    <div className="scroll-smooth">
      <div className="flex-col md:flex-row flex md:items-center md:justify-around overflow-x-hidden">
        <div className="animate-fade-in-left">
          <h1 className="text-4xl md:text-9xl mb-2 md:mb-5 ">
            <span className="text-green-500 pt-2 md:pt-10">Sports</span>
            <span className="text-white">Vybe</span>
          </h1>
          <h4 className="text-md md:text-2xl text-gray-400">
            Connecting People to Recreational Sports
          </h4>
          <p className="text-lg py-3 pb-4 word-gradient">
            Our Mission is to improve the health in our community <br />
            through fitness and sociability.
          </p>
        </div>

        <div className="animate-fade-in-right floater md:">
          <Image
            src="/hero-image-2.png"
            alt="SportsVybe header"
            width={500}
            height={500}
            className="image"
          />
        </div>
      </div>

      <div
        className="md:pt-32 pt-8 md:flex-row flex flex-col md:justify-center"
        data-aos="fade-up"
        data-aos-easing="linear"
        data-aos-duration="1600"
      >
        <div className="flex md:mr-20 justify-around">
          <img
            className="md:h-16 md:w-auto h-auto w-28 md:mr-20"
            alt=""
            src="/polygon_logo.png"
          />
          <img
            className="md:h-20 md:w-auto h-12 w-28"
            alt=""
            src="/chainlink_logo.png"
          />
        </div>
        <div className="flex justify-around mt-8 md:mt-0">
          <img
            className="md:h-20 md:w-auto h-12 w-24 md:mr-20"
            alt=""
            src="/aws-logo.png"
          />
          <img
            className="md:h-20 md:w-auto h-12 w-28"
            alt=""
            src="/moralis_logo.png"
          />
        </div>
      </div>

      <div className="md:mt-36 mt-20" />
      <ProcessSection />
      <div className="md:mx-24 mb-4 md:pt-24 pt-10 text-white gradient-bg-description">
        <h1 className="text-left inline pb-1 border-green-700 text-white md:text-4xl text-2xl py-2 my-4">
          What is does:
        </h1>
        <div className="md:text-[18px] text-sm">
          <p
            className="mt-4"
            data-aos="fade-up"
            data-aos-easing="linear"
            data-aos-duration="1000"
          >
            <span className="mr-2 text-green-600">➼</span> Users can find
            individual players or be apart of a team and challenge each other to
            a IRL sports match.
          </p>
          <p
            className="mt-8"
            data-aos="fade-up"
            data-aos-easing="linear"
            data-aos-duration="1000"
          >
            <span className="mr-2 text-green-600">➼</span> Upon completing a
            match, the players of the match (individual or team) will vote who
            was the winner. The winner of the match will take the pot.
          </p>
          <p
            className="mt-8"
            data-aos="fade-up"
            data-aos-easing="linear"
            data-aos-duration="1000"
          >
            <span className="mr-2 text-green-600">➼</span> Using smart contracts
            we secure the wager and introduce a new type of trust protocol we’re
            calling: Proof of Sportsmanship (POS).
          </p>

          <p
            className="mt-8"
            data-aos="fade-up"
            data-aos-easing="linear"
            data-aos-duration="1000"
          >
            <span className="mr-2 text-green-600">➼</span> The POS score ensures
            players and teams are honest when validating the winner of a match.
            The POS score starts at 100% and allows the player/team to claim
            100% of the pot.
          </p>
          <p
            className="mt-8"
            data-aos="fade-up"
            data-aos-easing="linear"
            data-aos-duration="1000"
          >
            <span className="mr-2 text-green-600">➼</span> When consensus is not
            met the POS will be adjusted and therefore adjusts the percentage
            returned to a user.
          </p>
        </div>
      </div>
    </div>
  );
};
