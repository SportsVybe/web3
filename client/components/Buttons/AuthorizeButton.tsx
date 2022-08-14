import { ethers } from "ethers";
import { useContract } from "../../context/ContractProvider";
import { useWallet } from "../../context/WalletProvider";

export interface IAuthorizeButtonProps {
  amount: number;
}

const defaultProps: IAuthorizeButtonProps = {
  amount: 0,
};

AuthorizeButton.defaultProps = defaultProps;

export default function AuthorizeButton({ amount }: IAuthorizeButtonProps) {
  const { approveAmount, isContractLoading } = useContract();
  const { user, isAuthenticated } = useWallet();
  const handleTokenApproval = async () => {
    await approveAmount(String(amount));
  };

  const userApprovedAmount =
    isAuthenticated &&
    user &&
    user.attributes &&
    user.attributes.approvedSTVAmount &&
    ethers.utils.formatEther(user.attributes.approvedSTVAmount);

  const userHasApprovedSVT =
    isAuthenticated &&
    user &&
    user.attributes &&
    user.attributes.hasApprovedSVT;

  return !userHasApprovedSVT ||
    Number(userApprovedAmount) < amount ||
    !userApprovedAmount ||
    Number(userApprovedAmount) === 0 ? (
    <button
      className="my-3 px-2 py-1 bg-red-600 text-white rounded-full disabled:bg-slate-300"
      onClick={() => handleTokenApproval()}
      disabled={isContractLoading || amount === 0 || !amount}
    >
      Increase SVT Approval
    </button>
  ) : (
    <div className="my-3 px-2 py-1">
      You have approved {userApprovedAmount} SVT
    </div>
  );
}
