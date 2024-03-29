/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";

export default function AboutUs() {
  return (
    <div className="text-white">
      <div className="md:mx-32 mb-4 mt-10">
        <h1 className="text-left text-2xl border-b-2 inline pb-1 border-green-700">
          Project Inspiration:
        </h1>
        <p className="mt-5 ">
          The inspiration came from wanted to find a way to connect people to
          recreational sports. Playing sports in a universal language and our
          platform will give enthusiasts a unique way to earn while being
          active. StepN - (https://www.stepn.com) brought to the community a
          "Run to Earn" concept that exploded in popularity. Our goal is to be
          the first "Play Sports to Earn" and allow an easy entry into web3. We
          believe the best innovations with the new technology will incorporate
          web3 elements without saying web3 or blockchain.
        </p>
      </div>

      <div className="md:mx-32 mb-4 mt-10">
        <h1 className="text-left text-2xl border-b-2 inline pb-1 border-green-700">
          Future Plans after the Hackathon:
        </h1>
        <p className="mt-5">
          We plan to build the concept into a mobile application using react
          native. We are looking to partner with various local communities in
          the Miami, Florida area to bring sports leagues to the platform.
          <h3> Exciting road-map items include: </h3>
          <ul>
            <li>A marketplace to spend VYBES</li>
            <li>Sponsored NFT Airdrops to challenges or events</li>
            <li>Allow teams to create NFTs for team members</li>
          </ul>
          <a
            href="https://www.twitter.com/SportsVybe"
            target="_blank"
            rel="noreferrer"
            className="py-3 underline text-blue-400 mt-5"
          >
            Follow us on Twitter @sportsvybe
          </a>
        </p>
      </div>

      <div className="my-5 md:my-20 flex justify-center">
        <p className="text-center md:text-3xl text-xl  border-b-2 inline pb-1 border-green-700">
          Meet the Team
        </p>
      </div>
      <div className="flex md:flex-row flex-col justify-around items-center md:mb-48 mb-10">
        <div className="mb-4">
          <div className="card rounded-full mb-8" data-aos="zoom-in">
            <img
              src="/images/about/avrahm.png"
              alt="Avrahm-image"
              className="rounded-full object-contain border-2 profile-image"
            />
          </div>
          <p className="text-center italic text-xl">
            Avrahm Kleinholz
            <br />
            <a
              target="_blank"
              href="https://github.com/avrahm"
              rel="noreferrer"
            >
              GitHub @avrahm
            </a>
            <br />
            <span className="text-indigo-500">
              <a
                target="_blank"
                href="https://opensea.io/assets/0x25ed58c027921e14d86380ea2646e3a1b5c55a8b/4047/"
                rel="noreferrer"
              >
                Developer Dao #4047
              </a>
            </span>
          </p>
        </div>
        <div className="mb-4">
          <div className=" card rounded-full mb-8" data-aos="zoom-in">
            <img
              src="/images/about/david.png"
              alt="David-image"
              className="rounded-full object-contain border-2 profile-image"
            />
          </div>
          <p className="text-center italic text-xl">
            Olaboye David Tobi
            <br />
            <a
              target="_blank"
              href="https://github.com/dtobi59"
              rel="noreferrer"
            >
              GitHub @dtobi59
            </a>
          </p>
        </div>
        <div className="mb-4">
          <div className="card rounded-full mb-8" data-aos="zoom-in">
            <img
              src="/images/about/jaymes.png"
              alt="Jaymes-image"
              className="rounded-full object-contain profile-image"
            />
          </div>
          <p className="text-center italic text-xl">
            Clement James Jnr
            <br />
            <a
              target="_blank"
              href="https://github.com/jaymesC"
              rel="noreferrer"
            >
              GitHub @jaymesC
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
