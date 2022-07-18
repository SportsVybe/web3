import { useContract } from "../../context/ContractProvider";

export interface IAuthorizeButtonProps {
  amount: number;
  user?: any;
}

const defaultProps: IAuthorizeButtonProps = {
  amount: 5,
  user: {
    hasApprovedSVT: false,
    approvalAmount: 0,
  },
};

AuthorizeButton.defaultProps = defaultProps;

export default function AuthorizeButton({
  amount,
  user,
}: IAuthorizeButtonProps) {
  const { approveAmount, isContractLoading } = useContract();

  const handleTokenApproval = async () => {
    //console.log("Allow to spend, "+ amount);
    await approveAmount(String(amount));
  };
  return !user.hasApprovedSVT || user.approvalAmount < amount ? (
    <button
      className="my-3 px-2 py-1 bg-red-600 text-white rounded-full disabled:bg-slate-300"
      onClick={() => handleTokenApproval()}
      disabled={isContractLoading}
    >
      Allow the SportVybe Protocol to use your SVT Token
    </button>
  ) : (
    <div>You have approved {user.approvalAmount} SVT</div>
  );
}
