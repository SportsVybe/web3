import { BsShieldFillCheck } from "react-icons/bs";
import { BiSearchAlt } from "react-icons/bi";
import { RiHeart2Fill } from "react-icons/ri";

type ProcessCardProps = {
  color: string;
  title: string;
  icon: React.ReactNode;
  subtitle: string;
};

const ProcessCard: React.FC<ProcessCardProps> = ({ color, title, icon, subtitle }) => (
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
            <span className="text-gradient">vybe</span> works.
          </h1>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-start items-center">
        <div data-aos="zoom-in">
          <ProcessCard
            color="bg-[#2952e3]"
            title="Connect Your Wallet and create an account"
            icon={<BsShieldFillCheck fontSize={21} className="text-white" />}
            subtitle="Locate people that love the sports just as much as you do. Be a part of your local community!!"
          />
        </div>
        <div data-aos="zoom-in">
          <ProcessCard
            color="bg-[#8984F8]"
            title="Set up preferences"
            icon={<BiSearchAlt fontSize={21} className="text-white" />}
            subtitle="10+ Sports: Football, Basketball, Baseball, Ultimate Frisbee, Tennis, Hockey and many more!"
          />
        </div>
        <div data-aos="zoom-in">
          <ProcessCard
            color="bg-[#f84550]"
            title="Get active and win Challenges!"
            icon={<RiHeart2Fill fontSize={21} className="text-white" />}
            subtitle="Connect & challenge with other users/teams, win and earn rewards from various challenges!"
          />
        </div>
      </div>
    </div>
  );
};

export default ProcessSection;
