import { BiSearchAlt } from "react-icons/bi";
import { BsShieldFillCheck } from "react-icons/bs";
import { RiHeart2Fill } from "react-icons/ri";

type ProcessCardProps = {
  color: string;
  title: string;
  icon: React.ReactNode;
  subtitle: string;
};

const ProcessCard: React.FC<ProcessCardProps> = ({
  color,
  title,
  icon,
  subtitle,
}) => (
  <div className="flex flex-row justify-start items-center  white-glassmorphism p-3 m-2 cursor-pointer hover:shadow-xl">
    <div
      className={`w-10 h-10 rounded-full flex justify-center items-center ${color}`}
    >
      {icon}
    </div>
    <div className="ml-5 flex flex-col flex-1 ">
      <h1 className="mt-2 text-white text-lg">{title}</h1>
      <p className="mt-2 text-white text-sm md:w-9/12">{subtitle}</p>
    </div>
  </div>
);

const ProcessSection = () => {
  return (
    <div className="flex flex-col md:flex-row w-full justify-center items-center gradient-bg-process">
      <div className="flex mf:flex-row items-center justify-between md:p-20 md:py-20 py-2 px-14">
        <div className="flex-1 flex-col justify-start items-start md:w-96 w-80">
          <h1
            className="text-white text-2xl md:text-5xl sm:text-5xl py-2"
            data-aos="fade-down-right"
            data-aos-duration="2400"
          >
            How <span className="text-green-500">Sports</span>
            <span className="text-gradient">Vybe</span> works.
          </h1>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-start items-center">
        <div data-aos="zoom-in">
          <ProcessCard
            color="bg-[#2952e3]"
            title="Earn VYBES"
            icon={<BsShieldFillCheck fontSize={21} className="text-white" />}
            subtitle="Check-In to Parks, or Events, Win IRL matches, or Airdrop NFTs"
          />
        </div>
        <div data-aos="zoom-in">
          <ProcessCard
            color="bg-[#8984F8]"
            title="Spend VYBES"
            icon={<BiSearchAlt fontSize={21} className="text-white" />}
            subtitle="Challenge player or teams to IRL sports match. Visit the Marketplace"
          />
        </div>
        <div data-aos="zoom-in">
          <ProcessCard
            color="bg-[#f84550]"
            title="Positive Vybes"
            icon={<RiHeart2Fill fontSize={21} className="text-white" />}
            subtitle=" Play IRL sports, Join an enthusiastic sports community, Get active!"
          />
        </div>
      </div>
    </div>
  );
};

export default ProcessSection;
