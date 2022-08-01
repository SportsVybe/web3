import { useContract } from "../../context/ContractProvider";

export interface IAuthorizeButtonProps {
  amount: number;
  userHasApprovedSVT: boolean;
  userApprovedAmount: number;
}

const defaultProps: IAuthorizeButtonProps = {
  amount: 0,
  userApprovedAmount: 0,
  userHasApprovedSVT: false,
};

AuthorizeButton.defaultProps = defaultProps;

export default function AuthorizeButton({
  amount,
  userHasApprovedSVT,
  userApprovedAmount,
}: IAuthorizeButtonProps) {
  const { approveAmount, isContractLoading } = useContract();
  const handleTokenApproval = async () => {
    await approveAmount(String(amount));
  };

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
    <div>You have approved {userApprovedAmount} SVT</div>
  );
}
