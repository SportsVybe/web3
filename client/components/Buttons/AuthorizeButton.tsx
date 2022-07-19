import { ethers } from "ethers";
import { useContract } from "../../context/ContractProvider";

export interface IAuthorizeButtonProps {
  amount: number;
  user: any;
}

const defaultProps: IAuthorizeButtonProps = {
  amount: 1,
  user: {
    attributes: {
      hasApprovedSVT: false,
      approvedSTVAmount: 0,
    },
  },
};

AuthorizeButton.defaultProps = defaultProps;

export default function AuthorizeButton({
  amount,
  user,
}: IAuthorizeButtonProps) {
  const { approveAmount, isContractLoading } = useContract();
  const { attributes } = user;
  const handleTokenApproval = async () => {
    //console.log("Allow to spend, "+ amount);
    await approveAmount(String(amount));
  };
  let approvedAmount = 0;
  if (attributes) {
    approvedAmount = Number(
      ethers.utils.formatEther(attributes.approvedSTVAmount)
    );
  }
  return (attributes && !attributes.hasApprovedSVT) ||
    approvedAmount < amount ? (
    <button
      className="my-3 px-2 py-1 bg-red-600 text-white rounded-full disabled:bg-slate-300"
      onClick={() => handleTokenApproval()}
      disabled={isContractLoading}
    >
      Increase SVT Approval
    </button>
  ) : (
    <div>You have approved {approvedAmount} SVT</div>
  );
}
