import { useWallet } from "../../../context/WalletProvider";
import { Photo } from "../../Layout/Photo";

type Props = {
  team?: any;
  member: any;
  isLoadingMembers: boolean;
  memberObject?: any;
  targetSelf?: boolean;
};

export const TeamMember = ({
  member,
  isLoadingMembers,
  memberObject = null,
  team = null,
  targetSelf = true,
}: Props) => {
  const { user } = useWallet();

  return (
    <div className="flex flex-col m-2 justify-center items-start border-2 border-gray-200 rounded-lg shadow-lg bg-white hover:shadow-2xl transition ease-in-out delay-100  hover:ease-in-out p-2">
      <div className="flex flex-row ">
        <div className="flex flex-col items-center justify-center p-2">
          <Photo
            src={member.userPhoto}
            alt={member.userDisplayName}
            size="sm"
            type="profile"
            isLoading={isLoadingMembers}
          />
          <span className="py-1"> {member.userDisplayName}</span>
          <span className="py-1 text-xs">
            {member.userWins} Wins - {member.userLosses} Losses
          </span>
          <span className="py-1 text-xs">
            {member.userPOS ? `${member.userPOS}% ` : "100%"} POS
          </span>
          <div>
            <a
              href={`/profile/${member.username}`}
              className="px-2 py-1 my-4 bg-blue-400 hover:bg-blue-700 rounded-full text-xs"
              target={targetSelf ? "_self" : "_blank"}
              rel="noreferrer"
            >
              View Player
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
